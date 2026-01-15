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

interface TermsOptimizationRequest extends BaseAIRequest {
  clientData: ClientData;
  quotationValue: number;
  currentTerms?: {
    paymentTerms?: string;
    deliveryTerms?: string;
    warranty?: string;
  };
  objectives?: string[];
}

interface TermsOptimizationResponse {
  options: Array<{
    type: string;
    terms: {
      paymentTerms: string;
      deliveryTerms: string;
      warranty: string;
      other?: Record<string, string>;
    };
    benefits: string[];
    risks: string[];
    recommendation: boolean;
  }>;
  recommended: {
    terms: Record<string, string>;
    rationale: string;
    expectedImpact: string;
  };
  negotiation: {
    flexible: string[];
    nonNegotiable: string[];
    alternatives: string[];
  };
}

const fallbackTerms: TermsOptimizationResponse = {
  options: [],
  recommended: {
    terms: {},
    rationale: 'Based on standard terms',
    expectedImpact: 'Standard terms',
  },
  negotiation: {
    flexible: [],
    nonNegotiable: [],
    alternatives: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: TermsOptimizationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackTerms, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Contract Terms Specialist',
      mission: 'Optimize quotation terms for maximum acceptance and value',
      context: {
        clientData: body.clientData,
        quotationValue: body.quotationValue,
        currentTerms: body.currentTerms || {},
        objectives: body.objectives || [],
      },
      instructions: [
        'Develop multiple term options',
        'Optimize payment, delivery, and warranty terms',
        'Identify negotiation flexibility',
        'Consider South African business practices',
        'Recommend best terms with rationale',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          options: 'array of {type, terms, benefits, risks, recommendation}',
          recommended: {
            terms: 'object',
            rationale: 'string',
            expectedImpact: 'string',
          },
          negotiation: {
            flexible: 'array of strings',
            nonNegotiable: 'array of strings',
            alternatives: 'array of strings',
          },
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<TermsOptimizationResponse>(result.text, fallbackTerms);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error optimizing terms:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to optimize terms',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackTerms, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
