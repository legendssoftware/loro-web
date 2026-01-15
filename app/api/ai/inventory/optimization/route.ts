import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface InventoryOptimizationRequest extends BaseAIRequest {
  inventory: Array<{
    productId: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    cost: number;
    turnover: number;
  }>;
  objectives?: string[];
  constraints?: Record<string, any>;
}

interface InventoryOptimizationResponse {
  optimization: Array<{
    productId: string;
    currentLevel: number;
    optimalLevel: number;
    adjustment: number;
    impact: string;
  }>;
  benefits: {
    costReduction: number;
    stockoutReduction: number;
    efficiency: number;
  };
  recommendations: string[];
}

const fallbackOptimization: InventoryOptimizationResponse = {
  optimization: [],
  benefits: {
    costReduction: 0,
    stockoutReduction: 0,
    efficiency: 0,
  },
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: InventoryOptimizationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackOptimization, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Inventory Optimization Specialist',
      mission: 'Optimize inventory levels for efficiency',
      context: {
        inventory: body.inventory,
        objectives: body.objectives || [],
        constraints: body.constraints || {},
      },
      instructions: [
        'Calculate optimal stock levels',
        'Balance cost and availability',
        'Optimize turnover',
        'Calculate benefits',
        'Provide recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          optimization: 'array of {productId, currentLevel, optimalLevel, adjustment, impact}',
          benefits: {
            costReduction: 'number',
            stockoutReduction: 'number',
            efficiency: 'number',
          },
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<InventoryOptimizationResponse>(result.text, fallbackOptimization);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error optimizing inventory:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to optimize inventory',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackOptimization, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
