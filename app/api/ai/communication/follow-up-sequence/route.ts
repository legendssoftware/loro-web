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

interface FollowUpSequenceRequest extends BaseAIRequest {
  leadData?: LeadData;
  clientData?: ClientData;
  lastInteraction: {
    type: string;
    date: string;
    outcome: string;
  };
  goal: string;
  sequenceLength?: number;
}

interface FollowUpSequenceResponse {
  sequence: Array<{
    step: number;
    day: number;
    channel: string;
    subject?: string;
    message: string;
    purpose: string;
    timing: string;
  }>;
  strategy: string;
  bestPractices: string[];
}

const fallbackSequence: FollowUpSequenceResponse = {
  sequence: [],
  strategy: '',
  bestPractices: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: FollowUpSequenceRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackSequence, true, body.dataHash));
    }

    const leadContext = body.leadData ? buildLeadIntelligenceContext(body.leadData) : '';
    const clientContext = body.clientData ? buildClientContext(body.clientData) : '';
    const saContext = buildSouthAfricanContext({
      industry: body.leadData?.industry || body.clientData?.industry,
      businessSize: body.leadData?.businessSize || body.clientData?.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Follow-Up Sequence Specialist',
      mission: 'Create effective follow-up sequence for lead or client',
      context: {
        leadData: body.leadData,
        clientData: body.clientData,
        lastInteraction: body.lastInteraction,
        goal: body.goal,
        sequenceLength: body.sequenceLength || 5,
      },
      instructions: [
        'Create multi-step follow-up sequence',
        'Vary channels and messaging',
        'Space touchpoints appropriately',
        'Provide personalized messages',
        'Define purpose for each step',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          sequence: 'array of {step, day, channel, subject, message, purpose, timing}',
          strategy: 'string',
          bestPractices: 'array of strings',
        },
      },
    });

    const fullPrompt = leadContext + '\n' + clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<FollowUpSequenceResponse>(result.text, fallbackSequence);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating follow-up sequence:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate follow-up sequence',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackSequence, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
