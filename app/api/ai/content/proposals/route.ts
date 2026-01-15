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

interface ProposalsRequest extends BaseAIRequest {
  clientData: ClientData;
  proposalType: string;
  objectives: string[];
  products?: string[];
  requirements?: string[];
}

interface ProposalsResponse {
  proposal: {
    executiveSummary: string;
    problemStatement: string;
    solution: string;
    benefits: string[];
    implementation: string;
    pricing: string;
    timeline: string;
    nextSteps: string[];
  };
  sections: Record<string, string>;
}

const fallbackProposal: ProposalsResponse = {
  proposal: {
    executiveSummary: '',
    problemStatement: '',
    solution: '',
    benefits: [],
    implementation: '',
    pricing: '',
    timeline: '',
    nextSteps: [],
  },
  sections: {},
};

export async function POST(request: NextRequest) {
  try {
    const body: ProposalsRequest = await request.json();

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
      role: 'an AI Business Proposal Writer',
      mission: 'Generate comprehensive business proposal',
      context: {
        clientData: body.clientData,
        proposalType: body.proposalType,
        objectives: body.objectives,
        products: body.products || [],
        requirements: body.requirements || [],
      },
      instructions: [
        'Create executive summary',
        'Define problem statement',
        'Present solution',
        'List benefits',
        'Outline implementation',
        'Include pricing and timeline',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          proposal: {
            executiveSummary: 'string',
            problemStatement: 'string',
            solution: 'string',
            benefits: 'array of strings',
            implementation: 'string',
            pricing: 'string',
            timeline: 'string',
            nextSteps: 'array of strings',
          },
          sections: 'object with section names as keys',
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

    const parsed = parseJSONResponse<ProposalsResponse>(result.text, fallbackProposal);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating proposal:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate proposal',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackProposal, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
