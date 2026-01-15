import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ContextualHelpRequest extends BaseAIRequest {
  context: {
    module: string;
    page: string;
    action?: string;
    userRole?: string;
  };
  question?: string;
}

interface ContextualHelpResponse {
  help: {
    title: string;
    content: string;
    steps?: string[];
  };
  related: Array<{
    topic: string;
    link?: string;
  }>;
  tips: string[];
}

const fallbackHelp: ContextualHelpResponse = {
  help: {
    title: '',
    content: '',
    steps: [],
  },
  related: [],
  tips: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ContextualHelpRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackHelp, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Contextual Help Assistant',
      mission: 'Provide context-aware help and guidance',
      context: {
        context: body.context,
        question: body.question,
      },
      instructions: [
        'Understand current context',
        'Provide relevant help content',
        'Suggest related topics',
        'Offer practical tips',
        'Tailor to user role',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          help: {
            title: 'string',
            content: 'string',
            steps: 'array of strings',
          },
          related: 'array of {topic, link}',
          tips: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ContextualHelpResponse>(result.text, fallbackHelp);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error providing contextual help:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to provide contextual help',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackHelp, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
