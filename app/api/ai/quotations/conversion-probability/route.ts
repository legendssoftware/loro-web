import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildClientContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type ClientData,
  type BaseAIRequest,
} from '@/lib/ai';

interface ConversionProbabilityRequest extends BaseAIRequest {
  quotation: {
    value: number;
    products: string[];
    terms: Record<string, any>;
  };
  clientData: ClientData;
  history?: Array<{
    quotationId: string;
    value: number;
    outcome: 'won' | 'lost';
    factors?: string[];
  }>;
}

interface ConversionProbabilityResponse {
  probability: number;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    description: string;
  }>;
  scenarios: Array<{
    scenario: string;
    probability: number;
    conditions: string[];
  }>;
  recommendations: Array<{
    action: string;
    impact: string;
    expectedIncrease: number;
  }>;
}

const fallbackProbability: ConversionProbabilityResponse = {
  probability: 50,
  factors: [],
  scenarios: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ConversionProbabilityRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackProbability, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Conversion Probability Analyst',
      mission: 'Calculate quotation conversion probability and identify improvement opportunities',
      context: {
        quotation: body.quotation,
        clientData: body.clientData,
        history: body.history || [],
      },
      instructions: [
        'Analyze factors affecting conversion',
        'Calculate overall probability (0-100)',
        'Create scenarios with different probabilities',
        'Identify actions to improve probability',
        'Consider historical patterns',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          probability: 'number (0-100)',
          factors: 'array of {factor, impact, weight, description}',
          scenarios: 'array of {scenario, probability, conditions}',
          recommendations: 'array of {action, impact, expectedIncrease}',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ConversionProbabilityResponse>(result.text, fallbackProbability);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error calculating conversion probability:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to calculate conversion probability',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackProbability, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
