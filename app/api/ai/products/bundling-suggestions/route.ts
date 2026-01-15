import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface BundlingSuggestionsRequest extends BaseAIRequest {
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    complementary?: string[];
  }>;
  objectives?: string[];
}

interface BundlingSuggestionsResponse {
  bundles: Array<{
    products: string[];
    name: string;
    totalValue: number;
    discount?: number;
    rationale: string;
    targetAudience?: string;
  }>;
  recommendations: string[];
}

const fallbackBundles: BundlingSuggestionsResponse = {
  bundles: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: BundlingSuggestionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackBundles, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Product Bundling Specialist',
      mission: 'Suggest optimal product bundles',
      context: {
        products: body.products,
        objectives: body.objectives || [],
      },
      instructions: [
        'Identify complementary products',
        'Create attractive bundles',
        'Calculate value and discounts',
        'Target specific audiences',
        'Provide rationale',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          bundles: 'array of {products, name, totalValue, discount, rationale, targetAudience}',
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<BundlingSuggestionsResponse>(result.text, fallbackBundles);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating bundling suggestions:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate bundling suggestions',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackBundles, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
