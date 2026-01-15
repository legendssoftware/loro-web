import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface PredictionsRequest extends BaseAIRequest {
  historicalData: Array<Record<string, any>>;
  metrics: string[];
  timeField: string;
  forecastPeriods: number;
}

interface PredictionsResponse {
  predictions: Array<{
    metric: string;
    period: string;
    predicted: number;
    confidence: number;
    range: {
      low: number;
      high: number;
    };
  }>;
  assumptions: string[];
  risks: Array<{
    risk: string;
    impact: string;
    probability: number;
  }>;
}

const fallbackPredictions: PredictionsResponse = {
  predictions: [],
  assumptions: [],
  risks: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: PredictionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPredictions, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Predictive Analytics Specialist',
      mission: 'Generate predictions from historical data',
      context: {
        historicalData: body.historicalData,
        metrics: body.metrics,
        timeField: body.timeField,
        forecastPeriods: body.forecastPeriods,
      },
      instructions: [
        'Analyze historical patterns',
        'Generate predictions for each period',
        'Calculate confidence intervals',
        'Identify assumptions',
        'Assess risks',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          predictions: 'array of {metric, period, predicted, confidence, range}',
          assumptions: 'array of strings',
          risks: 'array of {risk, impact, probability}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<PredictionsResponse>(result.text, fallbackPredictions);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating predictions:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate predictions',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPredictions, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
