import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface SentimentAnalysisRequest extends BaseAIRequest {
  text: string | string[];
  context?: string;
}

interface SentimentAnalysisResponse {
  sentiment: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  score: number;
  emotions: Array<{
    emotion: string;
    intensity: number;
  }>;
  keyPhrases: Array<{
    phrase: string;
    sentiment: string;
    importance: number;
  }>;
  summary: string;
  recommendations?: string[];
}

const fallbackSentiment: SentimentAnalysisResponse = {
  sentiment: 'neutral',
  score: 0,
  emotions: [],
  keyPhrases: [],
  summary: '',
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: SentimentAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackSentiment, true, body.dataHash));
    }

    const texts = Array.isArray(body.text) ? body.text : [body.text];

    const prompt = aiService.buildPrompt({
      role: 'an AI Sentiment Analysis Specialist',
      mission: 'Analyze sentiment and emotions in text',
      context: {
        texts,
        context: body.context,
      },
      instructions: [
        'Determine overall sentiment (very_positive to very_negative)',
        'Calculate sentiment score (-1 to 1)',
        'Identify emotions and their intensity',
        'Extract key phrases with sentiment',
        'Provide summary and recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          sentiment: 'string (very_positive|positive|neutral|negative|very_negative)',
          score: 'number (-1 to 1)',
          emotions: 'array of {emotion, intensity}',
          keyPhrases: 'array of {phrase, sentiment, importance}',
          summary: 'string',
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<SentimentAnalysisResponse>(result.text, fallbackSentiment);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing sentiment:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze sentiment',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackSentiment, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
