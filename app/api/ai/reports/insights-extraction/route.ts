import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface InsightsExtractionRequest extends BaseAIRequest {
  data: Record<string, any> | Array<any>;
  focus?: string[];
}

interface InsightsExtractionResponse {
  insights: Array<{
    insight: string;
    category: string;
    significance: 'high' | 'medium' | 'low';
    evidence: string[];
    recommendation?: string;
  }>;
  patterns: Array<{
    pattern: string;
    description: string;
    frequency: number;
  }>;
  correlations: Array<{
    variables: string[];
    relationship: string;
    strength: number;
  }>;
}

const fallbackInsights: InsightsExtractionResponse = {
  insights: [],
  patterns: [],
  correlations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: InsightsExtractionRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackInsights, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Data Insights Analyst',
      mission: 'Extract actionable insights from data',
      context: {
        data: body.data,
        focus: body.focus || [],
      },
      instructions: [
        'Identify key insights',
        'Categorize insights',
        'Assess significance',
        'Find patterns',
        'Discover correlations',
        'Provide evidence and recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          insights: 'array of {insight, category, significance, evidence, recommendation}',
          patterns: 'array of {pattern, description, frequency}',
          correlations: 'array of {variables, relationship, strength}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<InsightsExtractionResponse>(result.text, fallbackInsights);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error extracting insights:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to extract insights',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackInsights, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
