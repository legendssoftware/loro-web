import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface AutomationSuggestionsRequest extends BaseAIRequest {
  workflows: Array<{
    name: string;
    steps: string[];
    frequency: string;
    manualEffort: number;
  }>;
  objectives?: string[];
}

interface AutomationSuggestionsResponse {
  suggestions: Array<{
    workflow: string;
    automation: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    savings: string;
    priority: number;
  }>;
  quickWins: string[];
  strategic: string[];
}

const fallbackAutomation: AutomationSuggestionsResponse = {
  suggestions: [],
  quickWins: [],
  strategic: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: AutomationSuggestionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAutomation, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Workflow Automation Specialist',
      mission: 'Suggest workflow automations for efficiency',
      context: {
        workflows: body.workflows,
        objectives: body.objectives || [],
      },
      instructions: [
        'Analyze workflows for automation opportunities',
        'Assess impact and effort',
        'Calculate potential savings',
        'Prioritize suggestions',
        'Identify quick wins',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          suggestions: 'array of {workflow, automation, impact, effort, savings, priority}',
          quickWins: 'array of strings',
          strategic: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<AutomationSuggestionsResponse>(result.text, fallbackAutomation);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating automation suggestions:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate automation suggestions',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAutomation, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
