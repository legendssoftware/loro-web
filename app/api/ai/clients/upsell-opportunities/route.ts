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

interface UpsellOpportunitiesRequest extends BaseAIRequest {
  clientData: ClientData;
  currentProducts?: Array<{
    name: string;
    value: number;
    renewalDate?: string;
  }>;
  usageData?: Record<string, any>;
  businessGoals?: string[];
}

interface UpsellOpportunitiesResponse {
  opportunities: Array<{
    product: string;
    description: string;
    value: number;
    probability: number;
    rationale: string;
    timing: string;
    approach: string;
  }>;
  totalPotentialValue: number;
  recommendedSequence: string[];
  talkingPoints: Array<{
    product: string;
    points: string[];
  }>;
  objections: Array<{
    objection: string;
    response: string;
  }>;
}

const fallbackOpportunities: UpsellOpportunitiesResponse = {
  opportunities: [
    {
      product: 'Additional Services',
      description: 'Expand service offering',
      value: 0,
      probability: 50,
      rationale: 'Based on client needs',
      timing: 'Next quarter',
      approach: 'Consultative discussion',
    },
  ],
  totalPotentialValue: 0,
  recommendedSequence: [],
  talkingPoints: [],
  objections: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: UpsellOpportunitiesRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackOpportunities, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Strategist specializing in account expansion and upsell opportunities',
      mission: 'Identify and prioritize upsell opportunities for the client',
      context: {
        clientData: body.clientData,
        currentProducts: body.currentProducts || [],
        usageData: body.usageData || {},
        businessGoals: body.businessGoals || [],
      },
      instructions: [
        'Analyze current client relationship and products',
        'Identify relevant upsell opportunities',
        'Calculate potential value and probability',
        'Recommend optimal sequence for presenting opportunities',
        'Develop talking points for each opportunity',
        'Anticipate objections and prepare responses',
        'Consider timing and approach for each opportunity',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          opportunities: 'array of {product, description, value, probability, rationale, timing, approach}',
          totalPotentialValue: 'number',
          recommendedSequence: 'array of product names',
          talkingPoints: 'array of {product, points}',
          objections: 'array of {objection, response}',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<UpsellOpportunitiesResponse>(result.text, fallbackOpportunities);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error identifying upsell opportunities:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to identify upsell opportunities',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackOpportunities, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
