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

interface HealthAnalysisRequest extends BaseAIRequest {
  clientData: ClientData;
  metrics?: {
    engagementScore?: number;
    supportTickets?: number;
    lastPurchaseDate?: string;
    purchaseFrequency?: number;
    totalSpent?: number;
    contractRenewalDate?: string;
  };
  historicalData?: Array<{
    date: string;
    interaction: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
  }>;
}

interface HealthAnalysisResponse {
  healthScore: number;
  status: 'healthy' | 'at-risk' | 'critical';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;
    description: string;
  }>;
  churnRisk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    reasons: string[];
  };
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
  actionPlan: string[];
}

const fallbackAnalysis: HealthAnalysisResponse = {
  healthScore: 70,
  status: 'healthy',
  factors: [
    {
      factor: 'Overall Engagement',
      impact: 'positive',
      score: 70,
      description: 'Client shows moderate engagement',
    },
  ],
  churnRisk: {
    level: 'low',
    probability: 20,
    reasons: ['Regular interactions', 'Satisfactory engagement'],
  },
  recommendations: [
    {
      action: 'Maintain regular communication',
      priority: 'medium',
      impact: 'Sustain relationship',
    },
  ],
  actionPlan: ['Continue current engagement strategy'],
};

export async function POST(request: NextRequest) {
  try {
    const body: HealthAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnalysis, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Client Health Analyst specializing in customer success and retention',
      mission: 'Analyze client health and identify churn risks',
      context: {
        clientData: body.clientData,
        metrics: body.metrics || {},
        historicalData: body.historicalData || [],
      },
      instructions: [
        'Calculate overall health score (0-100)',
        'Determine health status (healthy/at-risk/critical)',
        'Analyze contributing factors',
        'Assess churn risk with probability',
        'Identify specific risk factors',
        'Provide prioritized recommendations',
        'Create actionable improvement plan',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          healthScore: 'number (0-100)',
          status: 'string (healthy|at-risk|critical)',
          factors: 'array of {factor, impact, score, description}',
          churnRisk: {
            level: 'string (low|medium|high|critical)',
            probability: 'number (0-100)',
            reasons: 'array of strings',
          },
          recommendations: 'array of {action, priority, impact}',
          actionPlan: 'array of strings',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<HealthAnalysisResponse>(result.text, fallbackAnalysis);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing client health:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze client health',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnalysis, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
