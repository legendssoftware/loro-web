import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ActionSuggestionsRequest extends BaseAIRequest {
  context: {
    module: string;
    currentData?: Record<string, any>;
    userRole?: string;
  };
  goal?: string;
}

interface ActionSuggestionsResponse {
  suggestions: Array<{
    action: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    steps?: string[];
  }>;
  quickActions: string[];
}

const fallbackActions: ActionSuggestionsResponse = {
  suggestions: [],
  quickActions: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ActionSuggestionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackActions, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Action Suggestions Assistant',
      mission: 'Suggest relevant actions based on context',
      context: {
        context: body.context,
        goal: body.goal,
      },
      instructions: [
        'Analyze current context',
        'Suggest relevant actions',
        'Prioritize by impact',
        'Identify quick actions',
        'Provide step-by-step guidance',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          suggestions: 'array of {action, description, priority, impact, steps}',
          quickActions: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ActionSuggestionsResponse>(result.text, fallbackActions);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating action suggestions:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate action suggestions',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackActions, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
