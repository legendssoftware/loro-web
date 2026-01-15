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

interface FollowUpStrategyRequest extends BaseAIRequest {
  quotation: {
    id: string;
    value: number;
    sentDate: string;
    status: string;
  };
  clientData: ClientData;
  interactions?: Array<{
    date: string;
    type: string;
    outcome: string;
  }>;
}

interface FollowUpStrategyResponse {
  strategy: {
    approach: string;
    timeline: Array<{
      day: number;
      action: string;
      channel: string;
      message: string;
      purpose: string;
    }>;
    escalation: Array<{
      trigger: string;
      action: string;
    }>;
  };
  messages: Array<{
    timing: string;
    channel: string;
    content: string;
    tone: string;
  }>;
  bestPractices: string[];
}

const fallbackStrategy: FollowUpStrategyResponse = {
  strategy: {
    approach: 'Progressive follow-up',
    timeline: [],
    escalation: [],
  },
  messages: [],
  bestPractices: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: FollowUpStrategyRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackStrategy, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Follow-Up Strategy Specialist',
      mission: 'Develop effective follow-up strategy for quotation',
      context: {
        quotation: body.quotation,
        clientData: body.clientData,
        interactions: body.interactions || [],
      },
      instructions: [
        'Create timeline-based follow-up plan',
        'Develop personalized messages for each touchpoint',
        'Define escalation triggers',
        'Consider client preferences and industry norms',
        'Provide best practices',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          strategy: {
            approach: 'string',
            timeline: 'array of {day, action, channel, message, purpose}',
            escalation: 'array of {trigger, action}',
          },
          messages: 'array of {timing, channel, content, tone}',
          bestPractices: 'array of strings',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<FollowUpStrategyResponse>(result.text, fallbackStrategy);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating follow-up strategy:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate follow-up strategy',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackStrategy, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
