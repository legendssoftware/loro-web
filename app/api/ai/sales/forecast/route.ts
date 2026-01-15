import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildTargetContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
  type TargetData,
} from '@/lib/ai';

interface SalesForecastRequest extends BaseAIRequest {
  pipelineData: Array<{
    stage: string;
    deals: Array<{
      id: string;
      value: number;
      probability: number;
      expectedCloseDate: string;
    }>;
  }>;
  historicalData?: Array<{
    period: string;
    actual: number;
    forecast: number;
  }>;
  targetData?: TargetData[];
  forecastPeriod?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface SalesForecastResponse {
  forecast: {
    period: string;
    conservative: number;
    realistic: number;
    optimistic: number;
    probability: number;
  }[];
  summary: {
    totalForecast: number;
    confidence: number;
    variance: number;
  };
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  scenarios: Array<{
    scenario: string;
    probability: number;
    forecast: number;
    assumptions: string[];
  }>;
  recommendations: string[];
}

const fallbackForecast: SalesForecastResponse = {
  forecast: [
    {
      period: 'Next period',
      conservative: 0,
      realistic: 0,
      optimistic: 0,
      probability: 50,
    },
  ],
  summary: {
    totalForecast: 0,
    confidence: 50,
    variance: 0,
  },
  factors: [],
  scenarios: [],
  recommendations: ['Monitor pipeline closely', 'Focus on high-probability deals'],
};

export async function POST(request: NextRequest) {
  try {
    const body: SalesForecastRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackForecast, true, body.dataHash));
    }

    const targetContext = buildTargetContext(body.targetData);
    const saContext = buildSouthAfricanContext({
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Forecasting Specialist with expertise in predictive analytics',
      mission: 'Generate accurate sales forecast with multiple scenarios',
      context: {
        pipelineData: body.pipelineData,
        historicalData: body.historicalData || [],
        targetData: body.targetData || [],
        forecastPeriod: body.forecastPeriod || 'monthly',
      },
      instructions: [
        'Analyze pipeline data and historical performance',
        'Generate conservative, realistic, and optimistic forecasts',
        'Calculate confidence levels and variance',
        'Identify factors affecting forecast',
        'Create multiple scenarios with probabilities',
        'Compare forecast against targets',
        'Provide recommendations for improving forecast accuracy',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          forecast: 'array of {period, conservative, realistic, optimistic, probability}',
          summary: {
            totalForecast: 'number',
            confidence: 'number (0-100)',
            variance: 'number',
          },
          factors: 'array of {factor, impact, description}',
          scenarios: 'array of {scenario, probability, forecast, assumptions}',
          recommendations: 'array of strings',
        },
      },
    });

    const fullPrompt = targetContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<SalesForecastResponse>(result.text, fallbackForecast);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating forecast:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate forecast',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackForecast, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
