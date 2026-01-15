import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildLeadIntelligenceContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type LeadData,
  type BaseAIRequest,
} from '@/lib/ai';

interface LeadScoringRequest extends BaseAIRequest {
  leadData: LeadData;
  historicalData?: Array<{
    leadId: number;
    converted: boolean;
    conversionTime: number;
    value: number;
  }>;
  scoringFactors?: string[];
}

interface LeadScoringResponse {
  overallScore: number;
  categoryScores: {
    engagement: number;
    fit: number;
    timing: number;
    value: number;
  };
  scoreBreakdown: Array<{
    factor: string;
    score: number;
    weight: number;
    reasoning: string;
  }>;
  recommendations: string[];
  confidence: number;
}

const fallbackScoring: LeadScoringResponse = {
  overallScore: 50,
  categoryScores: {
    engagement: 50,
    fit: 50,
    timing: 50,
    value: 50,
  },
  scoreBreakdown: [
    {
      factor: 'Initial Assessment',
      score: 50,
      weight: 1.0,
      reasoning: 'Based on available lead information',
    },
  ],
  recommendations: [
    'Gather more information about the lead',
    'Engage with personalized content',
    'Schedule a discovery call',
  ],
  confidence: 60,
};

export async function POST(request: NextRequest) {
  try {
    const body: LeadScoringRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackScoring, true, body.dataHash));
    }

    const leadContext = buildLeadIntelligenceContext(body.leadData);
    const saContext = buildSouthAfricanContext({
      industry: body.leadData.industry,
      businessSize: body.leadData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Lead Scoring Specialist with expertise in predictive lead analysis',
      mission: 'Calculate comprehensive lead score with detailed breakdown and recommendations',
      context: {
        leadData: body.leadData,
        historicalData: body.historicalData || [],
        scoringFactors: body.scoringFactors || ['engagement', 'fit', 'timing', 'value'],
      },
      instructions: [
        'Analyze lead across multiple dimensions: engagement, fit, timing, and value',
        'Calculate scores for each category (0-100)',
        'Provide weighted overall score',
        'Break down scoring factors with reasoning',
        'Identify areas for improvement',
        'Provide actionable recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          overallScore: 'number (0-100)',
          categoryScores: {
            engagement: 'number (0-100)',
            fit: 'number (0-100)',
            timing: 'number (0-100)',
            value: 'number (0-100)',
          },
          scoreBreakdown: 'array of {factor, score, weight, reasoning}',
          recommendations: 'array of strings',
          confidence: 'number (0-100)',
        },
      },
    });

    const fullPrompt = leadContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<LeadScoringResponse>(result.text, fallbackScoring);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error scoring lead:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to score lead',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackScoring, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
