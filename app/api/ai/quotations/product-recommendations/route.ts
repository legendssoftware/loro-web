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

interface ProductRecommendationsRequest extends BaseAIRequest {
  clientData: ClientData;
  requirements?: string[];
  currentProducts?: string[];
  availableProducts: Array<{
    name: string;
    description: string;
    category: string;
    price: number;
    features: string[];
  }>;
  budget?: number;
}

interface ProductRecommendationsResponse {
  recommendations: Array<{
    product: string;
    matchScore: number;
    rationale: string;
    benefits: string[];
    value: number;
    alternatives?: string[];
  }>;
  bundles: Array<{
    products: string[];
    totalValue: number;
    discount?: number;
    rationale: string;
  }>;
  considerations: string[];
}

const fallbackRecommendations: ProductRecommendationsResponse = {
  recommendations: [],
  bundles: [],
  considerations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ProductRecommendationsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackRecommendations, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Product Recommendation Specialist',
      mission: 'Recommend products that best match client needs',
      context: {
        clientData: body.clientData,
        requirements: body.requirements || [],
        currentProducts: body.currentProducts || [],
        availableProducts: body.availableProducts,
        budget: body.budget,
      },
      instructions: [
        'Match products to client requirements and industry',
        'Calculate match scores',
        'Identify product bundles',
        'Consider budget constraints',
        'Provide rationale for recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          recommendations: 'array of {product, matchScore, rationale, benefits, value, alternatives}',
          bundles: 'array of {products, totalValue, discount, rationale}',
          considerations: 'array of strings',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<ProductRecommendationsResponse>(result.text, fallbackRecommendations);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating product recommendations:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate product recommendations',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackRecommendations, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
