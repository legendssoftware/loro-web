import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface DemandForecastingRequest extends BaseAIRequest {
  historicalData: Array<{
    date: string;
    productId: string;
    quantity: number;
  }>;
  products: string[];
  forecastPeriods: number;
  factors?: Record<string, any>;
}

interface DemandForecastingResponse {
  forecasts: Array<{
    productId: string;
    period: string;
    forecast: number;
    confidence: number;
    range: {
      low: number;
      high: number;
    };
  }>;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

const fallbackForecast: DemandForecastingResponse = {
  forecasts: [],
  factors: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: DemandForecastingRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackForecast, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Demand Forecasting Specialist',
      mission: 'Forecast product demand based on historical data',
      context: {
        historicalData: body.historicalData,
        products: body.products,
        forecastPeriods: body.forecastPeriods,
        factors: body.factors || {},
      },
      instructions: [
        'Analyze historical demand patterns',
        'Generate forecasts for each product',
        'Calculate confidence intervals',
        'Identify influencing factors',
        'Provide recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          forecasts: 'array of {productId, period, forecast, confidence, range}',
          factors: 'array of {factor, impact, description}',
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<DemandForecastingResponse>(result.text, fallbackForecast);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error forecasting demand:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to forecast demand',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackForecast, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
