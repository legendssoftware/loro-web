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

interface LeadQualificationRequest extends BaseAIRequest {
  leadData: LeadData;
  conversationNotes?: string[];
  previousInteractions?: Array<{
    date: string;
    type: string;
    summary: string;
  }>;
}

interface QualificationResponse {
  qualificationScore: number;
  qualificationLevel: 'hot' | 'warm' | 'cold';
  bantScore: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
  recommendedActions: string[];
  riskFactors: string[];
  nextSteps: string[];
  confidence: number;
}

const fallbackQualification: QualificationResponse = {
  qualificationScore: 50,
  qualificationLevel: 'warm',
  bantScore: {
    budget: 50,
    authority: 50,
    need: 50,
    timeline: 50,
  },
  recommendedActions: [
    'Schedule a discovery call to understand their needs',
    'Request additional information about their budget and timeline',
    'Provide relevant case studies or product information',
  ],
  riskFactors: ['Limited information available'],
  nextSteps: [
    'Follow up within 2-3 business days',
    'Send personalized email with value proposition',
    'Request a meeting to discuss requirements',
  ],
  confidence: 60,
};

export async function POST(request: NextRequest) {
  try {
    const body: LeadQualificationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackQualification, true, body.dataHash));
    }

    const leadContext = buildLeadIntelligenceContext(body.leadData);
    const saContext = buildSouthAfricanContext({
      industry: body.leadData.industry,
      businessSize: body.leadData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Lead Qualification Specialist with expertise in BANT (Budget, Authority, Need, Timeline) analysis',
      mission: 'Qualify the lead and provide actionable insights for sales team',
      context: {
        leadData: body.leadData,
        conversationNotes: body.conversationNotes || [],
        previousInteractions: body.previousInteractions || [],
      },
      instructions: [
        'Analyze the lead using BANT framework (Budget, Authority, Need, Timeline)',
        'Calculate qualification score (0-100)',
        'Determine qualification level (hot/warm/cold)',
        'Identify risk factors and opportunities',
        'Provide specific next steps and recommended actions',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          qualificationScore: 'number (0-100)',
          qualificationLevel: 'string (hot|warm|cold)',
          bantScore: {
            budget: 'number (0-100)',
            authority: 'number (0-100)',
            need: 'number (0-100)',
            timeline: 'number (0-100)',
          },
          recommendedActions: 'array of strings',
          riskFactors: 'array of strings',
          nextSteps: 'array of strings',
          confidence: 'number (0-100)',
        },
      },
    });

    const fullPrompt = leadContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 1024,
    });

    const parsed = parseJSONResponse<QualificationResponse>(result.text, fallbackQualification);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error qualifying lead:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to qualify lead',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackQualification, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
