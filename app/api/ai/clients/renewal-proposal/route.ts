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

interface RenewalProposalRequest extends BaseAIRequest {
  clientData: ClientData;
  currentContract?: {
    startDate: string;
    endDate: string;
    value: number;
    products: string[];
  };
  performanceMetrics?: Record<string, any>;
  renewalOptions?: Array<{
    type: string;
    value: number;
    duration: string;
  }>;
}

interface RenewalProposalResponse {
  proposal: {
    introduction: string;
    valueSummary: string;
    achievements: string[];
    renewalOptions: Array<{
      option: string;
      benefits: string[];
      pricing: string;
      recommendation: boolean;
    }>;
    nextSteps: string[];
  };
  talkingPoints: string[];
  objections: Array<{
    objection: string;
    response: string;
  }>;
  urgencyFactors: string[];
}

const fallbackProposal: RenewalProposalResponse = {
  proposal: {
    introduction: 'Thank you for your partnership. We value our relationship.',
    valueSummary: 'Summary of value delivered during the contract period.',
    achievements: ['Successful partnership', 'Value delivered'],
    renewalOptions: [
      {
        option: 'Standard Renewal',
        benefits: ['Continued service', 'Existing benefits'],
        pricing: 'As per current terms',
        recommendation: true,
      },
    ],
    nextSteps: ['Schedule renewal discussion', 'Review proposal'],
  },
  talkingPoints: ['Partnership value', 'Continued success'],
  objections: [],
  urgencyFactors: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: RenewalProposalRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackProposal, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Contract Renewal Specialist with expertise in client retention',
      mission: 'Generate compelling renewal proposal tailored to the client',
      context: {
        clientData: body.clientData,
        currentContract: body.currentContract,
        performanceMetrics: body.performanceMetrics || {},
        renewalOptions: body.renewalOptions || [],
      },
      instructions: [
        'Create compelling introduction highlighting partnership value',
        'Summarize achievements and value delivered',
        'Present renewal options with clear benefits',
        'Recommend best option with rationale',
        'Develop talking points for renewal discussion',
        'Anticipate objections and prepare responses',
        'Identify urgency factors',
        'Define clear next steps',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          proposal: {
            introduction: 'string',
            valueSummary: 'string',
            achievements: 'array of strings',
            renewalOptions: 'array of {option, benefits, pricing, recommendation}',
            nextSteps: 'array of strings',
          },
          talkingPoints: 'array of strings',
          objections: 'array of {objection, response}',
          urgencyFactors: 'array of strings',
        },
      },
      tone: {
        baseTone: 'professional',
        intensity: 'moderate',
        regionalAdaptation: 'south_african',
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<RenewalProposalResponse>(result.text, fallbackProposal);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating renewal proposal:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate renewal proposal',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackProposal, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
