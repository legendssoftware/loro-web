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

interface NegotiationTipsRequest extends BaseAIRequest {
  quotation: {
    value: number;
    terms: Record<string, any>;
  };
  clientData: ClientData;
  objections?: string[];
  context?: string;
}

interface NegotiationTipsResponse {
  tips: Array<{
    tip: string;
    category: string;
    application: string;
    example: string;
  }>;
  strategies: Array<{
    strategy: string;
    whenToUse: string;
    steps: string[];
  }>;
  commonScenarios: Array<{
    scenario: string;
    approach: string;
    response: string;
  }>;
  redFlags: string[];
  winWin: Array<{
    opportunity: string;
    benefit: string;
  }>;
}

const fallbackTips: NegotiationTipsResponse = {
  tips: [],
  strategies: [],
  commonScenarios: [],
  redFlags: [],
  winWin: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: NegotiationTipsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackTips, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeCulturalContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Negotiation Coach specializing in B2B sales negotiations',
      mission: 'Provide negotiation tips and strategies for quotation',
      context: {
        quotation: body.quotation,
        clientData: body.clientData,
        objections: body.objections || [],
        context: body.context,
      },
      instructions: [
        'Provide practical negotiation tips',
        'Develop win-win strategies',
        'Address common scenarios',
        'Identify red flags',
        'Consider South African business culture',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          tips: 'array of {tip, category, application, example}',
          strategies: 'array of {strategy, whenToUse, steps}',
          commonScenarios: 'array of {scenario, approach, response}',
          redFlags: 'array of strings',
          winWin: 'array of {opportunity, benefit}',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<NegotiationTipsResponse>(result.text, fallbackTips);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating negotiation tips:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate negotiation tips',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackTips, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
