import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TrendAnalysisRequest extends BaseAIRequest {
  data: Array<Record<string, any>>;
  metrics: string[];
  timeField: string;
  period?: string;
}

interface TrendAnalysisResponse {
  trends: Array<{
    metric: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    rate: number;
    description: string;
    forecast?: {
      nextPeriod: number;
      confidence: number;
    };
  }>;
  patterns: Array<{
    pattern: string;
    description: string;
    impact: string;
  }>;
  recommendations: string[];
}

const fallbackTrends: TrendAnalysisResponse = {
  trends: [],
  patterns: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: TrendAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackTrends, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Trend Analysis Specialist',
      mission: 'Analyze trends and patterns in time-series data',
      context: {
        data: body.data,
        metrics: body.metrics,
        timeField: body.timeField,
        period: body.period,
      },
      instructions: [
        'Identify trends for each metric',
        'Calculate trend rates',
        'Detect patterns',
        'Forecast future values',
        'Provide recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          trends: 'array of {metric, trend, rate, description, forecast}',
          patterns: 'array of {pattern, description, impact}',
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<TrendAnalysisResponse>(result.text, fallbackTrends);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing trends:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze trends',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackTrends, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
