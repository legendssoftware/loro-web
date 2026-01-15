import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface WinLossAnalysisRequest extends BaseAIRequest {
  deals: Array<{
    id: string;
    outcome: 'won' | 'lost';
    value: number;
    stage: string;
    reason?: string;
    competitor?: string;
    factors?: string[];
  }>;
  timeFrame?: string;
}

interface WinLossAnalysisResponse {
  summary: {
    winRate: number;
    lossRate: number;
    totalWon: number;
    totalLost: number;
    averageDealSize: {
      won: number;
      lost: number;
    };
  };
  winFactors: Array<{
    factor: string;
    frequency: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  lossReasons: Array<{
    reason: string;
    frequency: number;
    category: string;
    recommendations: string[];
  }>;
  competitorAnalysis: Array<{
    competitor: string;
    wins: number;
    losses: number;
    winRate: number;
    strengths: string[];
    weaknesses: string[];
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>;
}

const fallbackAnalysis: WinLossAnalysisResponse = {
  summary: {
    winRate: 0,
    lossRate: 0,
    totalWon: 0,
    totalLost: 0,
    averageDealSize: {
      won: 0,
      lost: 0,
    },
  },
  winFactors: [],
  lossReasons: [],
  competitorAnalysis: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: WinLossAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnalysis, true, body.dataHash));
    }

    const saContext = buildSouthAfricanContext({
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Performance Analyst specializing in win-loss analysis',
      mission: 'Analyze won and lost deals to identify patterns and improvement opportunities',
      context: {
        deals: body.deals,
        timeFrame: body.timeFrame,
      },
      instructions: [
        'Calculate win/loss rates and metrics',
        'Identify common factors in won deals',
        'Analyze loss reasons and categorize them',
        'Perform competitor analysis',
        'Compare average deal sizes',
        'Provide actionable recommendations to improve win rate',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          summary: {
            winRate: 'number',
            lossRate: 'number',
            totalWon: 'number',
            totalLost: 'number',
            averageDealSize: {
              won: 'number',
              lost: 'number',
            },
          },
          winFactors: 'array of {factor, frequency, impact}',
          lossReasons: 'array of {reason, frequency, category, recommendations}',
          competitorAnalysis: 'array of {competitor, wins, losses, winRate, strengths, weaknesses}',
          recommendations: 'array of {action, priority, expectedImpact}',
        },
      },
    });

    const fullPrompt = saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<WinLossAnalysisResponse>(result.text, fallbackAnalysis);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing win-loss:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze win-loss data',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnalysis, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
