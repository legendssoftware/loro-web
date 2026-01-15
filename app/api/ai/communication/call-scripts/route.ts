import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildLeadIntelligenceContext,
  buildClientContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type LeadData,
  type ClientData,
  type BaseAIRequest,
} from '@/lib/ai';

interface CallScriptsRequest extends BaseAIRequest {
  leadData?: LeadData;
  clientData?: ClientData;
  purpose: string;
  objectives: string[];
  callType?: 'cold' | 'warm' | 'follow-up' | 'discovery' | 'closing';
}

interface CallScriptsResponse {
  script: {
    opening: string;
    introduction: string;
    valueProposition: string;
    questions: string[];
    talkingPoints: string[];
    objections: Array<{
      objection: string;
      response: string;
    }>;
    closing: string;
  };
  tips: string[];
  doAndDont: {
    do: string[];
    dont: string[];
  };
}

const fallbackScript: CallScriptsResponse = {
  script: {
    opening: 'Hello, this is [Your Name] from [Company].',
    introduction: 'I\'m calling to discuss...',
    valueProposition: 'We help businesses...',
    questions: [],
    talkingPoints: [],
    objections: [],
    closing: 'Thank you for your time.',
  },
  tips: [],
  doAndDont: {
    do: [],
    dont: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: CallScriptsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackScript, true, body.dataHash));
    }

    const leadContext = body.leadData ? buildLeadIntelligenceContext(body.leadData) : '';
    const clientContext = body.clientData ? buildClientContext(body.clientData) : '';
    const saContext = buildSouthAfricanContext({
      industry: body.leadData?.industry || body.clientData?.industry,
      businessSize: body.leadData?.businessSize || body.clientData?.businessSize,
      includeCulturalContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Call Script Writer specializing in effective phone communication',
      mission: 'Create professional call script tailored to the purpose and contact',
      context: {
        leadData: body.leadData,
        clientData: body.clientData,
        purpose: body.purpose,
        objectives: body.objectives,
        callType: body.callType || 'warm',
      },
      instructions: [
        'Create natural, conversational script',
        'Include opening, value proposition, questions, and closing',
        'Anticipate objections and prepare responses',
        'Provide do\'s and don\'ts',
        'Consider South African business culture',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          script: {
            opening: 'string',
            introduction: 'string',
            valueProposition: 'string',
            questions: 'array of strings',
            talkingPoints: 'array of strings',
            objections: 'array of {objection, response}',
            closing: 'string',
          },
          tips: 'array of strings',
          doAndDont: {
            do: 'array of strings',
            dont: 'array of strings',
          },
        },
      },
    });

    const fullPrompt = leadContext + '\n' + clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<CallScriptsResponse>(result.text, fallbackScript);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating call script:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate call script',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackScript, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
