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

interface WinProbabilityRequest extends BaseAIRequest {
  quotation: {
    id: string;
    value: number;
    products: string[];
    terms: Record<string, any>;
    sentDate: string;
  };
  clientData: ClientData;
  signals?: Array<{
    type: string;
    date: string;
    strength: 'strong' | 'medium' | 'weak';
    description: string;
  }>;
  history?: Array<{
    quotationId: string;
    outcome: 'won' | 'lost';
    factors: string[];
  }>;
}

interface WinProbabilityResponse {
  probability: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    strength: number;
    description: string;
  }>;
  signals: Array<{
    signal: string;
    interpretation: string;
    impact: number;
  }>;
  recommendations: Array<{
    action: string;
    expectedImpact: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

const fallbackProbability: WinProbabilityResponse = {
  probability: 50,
  confidence: 50,
  factors: [],
  signals: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: WinProbabilityRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackProbability, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Win Probability Analyst',
      mission: 'Calculate win probability for quotation based on multiple factors',
      context: {
        quotation: body.quotation,
        clientData: body.clientData,
        signals: body.signals || [],
        history: body.history || [],
      },
      instructions: [
        'Analyze all factors affecting win probability',
        'Calculate overall probability (0-100)',
        'Assess confidence level',
        'Interpret signals and their impact',
        'Provide recommendations to improve probability',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          probability: 'number (0-100)',
          confidence: 'number (0-100)',
          factors: 'array of {factor, impact, strength, description}',
          signals: 'array of {signal, interpretation, impact}',
          recommendations: 'array of {action, expectedImpact, priority}',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<WinProbabilityResponse>(result.text, fallbackProbability);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error calculating win probability:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to calculate win probability',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackProbability, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
