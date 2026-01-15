import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ProductDescriptionsRequest extends BaseAIRequest {
  product: {
    name: string;
    category: string;
    features: string[];
    benefits?: string[];
    targetAudience?: string;
  };
  format?: 'short' | 'medium' | 'long';
  tone?: string;
}

interface ProductDescriptionsResponse {
  descriptions: {
    short: string;
    medium: string;
    long: string;
  };
  keyPoints: string[];
  seo: {
    keywords: string[];
    metaDescription: string;
  };
}

const fallbackDescriptions: ProductDescriptionsResponse = {
  descriptions: {
    short: '',
    medium: '',
    long: '',
  },
  keyPoints: [],
  seo: {
    keywords: [],
    metaDescription: '',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: ProductDescriptionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackDescriptions, true, body.dataHash));
    }

    const saContext = buildSouthAfricanContext({
      includeCulturalContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Product Description Writer',
      mission: 'Create compelling product descriptions',
      context: {
        product: body.product,
        format: body.format || 'medium',
        tone: body.tone || 'professional',
      },
      instructions: [
        'Create multiple length variations',
        'Highlight key features and benefits',
        'Optimize for SEO',
        'Use engaging language',
        'Consider target audience',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          descriptions: {
            short: 'string',
            medium: 'string',
            long: 'string',
          },
          keyPoints: 'array of strings',
          seo: {
            keywords: 'array of strings',
            metaDescription: 'string',
          },
        },
      },
    });

    const fullPrompt = saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ProductDescriptionsResponse>(result.text, fallbackDescriptions);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating product descriptions:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate product descriptions',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackDescriptions, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
