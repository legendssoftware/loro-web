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

interface PricingStrategyRequest extends BaseAIRequest {
  clientData: ClientData;
  products: Array<{
    name: string;
    basePrice: number;
    cost: number;
    category?: string;
  }>;
  marketData?: {
    competitorPrices?: Record<string, number>;
    marketAverage?: number;
  };
  objectives?: string[];
}

interface PricingStrategyResponse {
  strategies: Array<{
    strategy: string;
    description: string;
    pricing: Record<string, number>;
    margin: number;
    rationale: string;
    pros: string[];
    cons: string[];
  }>;
  recommended: {
    strategy: string;
    pricing: Record<string, number>;
    expectedValue: number;
    confidence: number;
  };
  recommendations: string[];
}

const fallbackStrategy: PricingStrategyResponse = {
  strategies: [],
  recommended: {
    strategy: 'Value-based pricing',
    pricing: {},
    expectedValue: 0,
    confidence: 50,
  },
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: PricingStrategyRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackStrategy, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Pricing Strategist specializing in competitive pricing and value optimization',
      mission: 'Develop optimal pricing strategies for quotation',
      context: {
        clientData: body.clientData,
        products: body.products,
        marketData: body.marketData || {},
        objectives: body.objectives || [],
      },
      instructions: [
        'Analyze market positioning and competitor pricing',
        'Develop multiple pricing strategies',
        'Calculate margins and expected value',
        'Consider client relationship and value',
        'Recommend best strategy with rationale',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          strategies: 'array of {strategy, description, pricing, margin, rationale, pros, cons}',
          recommended: {
            strategy: 'string',
            pricing: 'object with product names as keys',
            expectedValue: 'number',
            confidence: 'number',
          },
          recommendations: 'array of strings',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<PricingStrategyResponse>(result.text, fallbackStrategy);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating pricing strategy:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate pricing strategy',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackStrategy, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
