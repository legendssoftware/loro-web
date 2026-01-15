import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TerritoryOptimizationRequest extends BaseAIRequest {
  territories: Array<{
    id: string;
    name: string;
    repId: string;
    repName: string;
    accounts: number;
    opportunities: number;
    revenue: number;
    potential: number;
    geography?: string;
  }>;
  constraints?: {
    maxTerritories?: number;
    minAccountsPerRep?: number;
    maxAccountsPerRep?: number;
  };
}

interface TerritoryOptimizationResponse {
  currentState: {
    imbalance: number;
    issues: string[];
  };
  recommendations: Array<{
    action: string;
    territory: string;
    rep: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  optimizedTerritories: Array<{
    territory: string;
    rep: string;
    accounts: number;
    potential: number;
    rationale: string;
  }>;
  metrics: {
    balanceScore: number;
    efficiencyGain: number;
    revenueImpact: number;
  };
}

const fallbackOptimization: TerritoryOptimizationResponse = {
  currentState: {
    imbalance: 0,
    issues: [],
  },
  recommendations: [],
  optimizedTerritories: [],
  metrics: {
    balanceScore: 0,
    efficiencyGain: 0,
    revenueImpact: 0,
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: TerritoryOptimizationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackOptimization, true, body.dataHash));
    }

    const saContext = buildSouthAfricanContext({
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Territory Optimization Specialist',
      mission: 'Optimize sales territory allocation for maximum efficiency and revenue',
      context: {
        territories: body.territories,
        constraints: body.constraints || {},
      },
      instructions: [
        'Analyze current territory balance and identify imbalances',
        'Recommend territory adjustments',
        'Optimize account distribution across reps',
        'Consider geography and potential',
        'Calculate efficiency gains and revenue impact',
        'Provide balanced territory assignments',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          currentState: {
            imbalance: 'number',
            issues: 'array of strings',
          },
          recommendations: 'array of {action, territory, rep, impact, priority}',
          optimizedTerritories: 'array of {territory, rep, accounts, potential, rationale}',
          metrics: {
            balanceScore: 'number (0-100)',
            efficiencyGain: 'number',
            revenueImpact: 'number',
          },
        },
      },
    });

    const fullPrompt = saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<TerritoryOptimizationResponse>(result.text, fallbackOptimization);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error optimizing territories:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to optimize territories',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackOptimization, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
