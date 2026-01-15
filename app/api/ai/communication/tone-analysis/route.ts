import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ToneAnalysisRequest extends BaseAIRequest {
  messages: Array<{
    text: string;
    sender: string;
    date?: string;
  }>;
  context?: string;
}

interface ToneAnalysisResponse {
  analysis: Array<{
    message: string;
    tone: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    characteristics: string[];
  }>;
  overall: {
    dominantTone: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    trends: string[];
  };
  recommendations: string[];
}

const fallbackAnalysis: ToneAnalysisResponse = {
  analysis: [],
  overall: {
    dominantTone: 'neutral',
    sentiment: 'neutral',
    trends: [],
  },
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ToneAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnalysis, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Communication Tone Analyst',
      mission: 'Analyze tone and sentiment in communication messages',
      context: {
        messages: body.messages,
        context: body.context,
      },
      instructions: [
        'Analyze tone for each message',
        'Determine sentiment (positive/neutral/negative)',
        'Identify communication characteristics',
        'Assess overall tone and trends',
        'Provide recommendations for improvement',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          analysis: 'array of {message, tone, sentiment, confidence, characteristics}',
          overall: {
            dominantTone: 'string',
            sentiment: 'string',
            trends: 'array of strings',
          },
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ToneAnalysisResponse>(result.text, fallbackAnalysis);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing tone:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze tone',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnalysis, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
