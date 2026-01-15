import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TaskPrioritizationRequest extends BaseAIRequest {
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    deadline?: string;
    priority?: string;
    dependencies?: string[];
    assignee?: string;
    estimatedHours?: number;
  }>;
  context?: {
    goals?: string[];
    constraints?: string[];
    resources?: string[];
  };
}

interface TaskPrioritizationResponse {
  prioritizedTasks: Array<{
    taskId: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    score: number;
    reasoning: string;
    recommendedOrder: number;
  }>;
  groups: Array<{
    priority: string;
    tasks: string[];
    rationale: string;
  }>;
  recommendations: string[];
  warnings: Array<{
    taskId: string;
    warning: string;
    suggestion: string;
  }>;
}

const fallbackPrioritization: TaskPrioritizationResponse = {
  prioritizedTasks: [],
  groups: [],
  recommendations: ['Review task dependencies', 'Focus on high-priority items'],
  warnings: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: TaskPrioritizationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPrioritization, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Task Prioritization Specialist with expertise in project management',
      mission: 'Prioritize tasks based on urgency, importance, dependencies, and context',
      context: {
        tasks: body.tasks,
        context: body.context || {},
      },
      instructions: [
        'Analyze all tasks considering deadlines, dependencies, and importance',
        'Assign priority levels (critical/high/medium/low)',
        'Calculate priority scores',
        'Group tasks by priority',
        'Identify potential issues and conflicts',
        'Provide recommendations for optimal task execution',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          prioritizedTasks: 'array of {taskId, priority, score, reasoning, recommendedOrder}',
          groups: 'array of {priority, tasks, rationale}',
          recommendations: 'array of strings',
          warnings: 'array of {taskId, warning, suggestion}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<TaskPrioritizationResponse>(result.text, fallbackPrioritization);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error prioritizing tasks:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to prioritize tasks',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPrioritization, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
