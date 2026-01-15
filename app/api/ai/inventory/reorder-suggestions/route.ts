import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ReorderSuggestionsRequest extends BaseAIRequest {
  inventory: Array<{
    productId: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    leadTime: number;
    demandRate?: number;
  }>;
  constraints?: {
    budget?: number;
    storage?: number;
  };
}

interface ReorderSuggestionsResponse {
  suggestions: Array<{
    productId: string;
    reorderQuantity: number;
    urgency: 'critical' | 'high' | 'medium' | 'low';
    rationale: string;
    expectedStockout?: string;
  }>;
  summary: {
    totalValue: number;
    criticalItems: number;
    recommendations: string[];
  };
}

const fallbackSuggestions: ReorderSuggestionsResponse = {
  suggestions: [],
  summary: {
    totalValue: 0,
    criticalItems: 0,
    recommendations: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: ReorderSuggestionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackSuggestions, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Inventory Management Specialist',
      mission: 'Suggest optimal reorder quantities',
      context: {
        inventory: body.inventory,
        constraints: body.constraints || {},
      },
      instructions: [
        'Calculate reorder quantities',
        'Assess urgency levels',
        'Consider lead times and demand',
        'Optimize within constraints',
        'Identify critical items',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          suggestions: 'array of {productId, reorderQuantity, urgency, rationale, expectedStockout}',
          summary: {
            totalValue: 'number',
            criticalItems: 'number',
            recommendations: 'array of strings',
          },
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ReorderSuggestionsResponse>(result.text, fallbackSuggestions);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating reorder suggestions:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate reorder suggestions',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackSuggestions, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
