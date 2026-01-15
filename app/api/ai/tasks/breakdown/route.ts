import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TaskBreakdownRequest extends BaseAIRequest {
  taskTitle: string;
  taskDescription: string;
  complexity?: 'simple' | 'moderate' | 'complex';
  deadline?: string;
  assigneeRole?: string;
  relatedContext?: string;
}

interface Subtask {
  title: string;
  description: string;
  estimatedHours?: number;
  dependencies?: string[];
  priority: 'high' | 'medium' | 'low';
}

interface TaskBreakdownResponse {
  subtasks: Subtask[];
  estimatedTotalHours: number;
  suggestedOrder: string[];
  riskFactors: string[];
  recommendations: string[];
}

const fallbackBreakdown: TaskBreakdownResponse = {
  subtasks: [
    {
      title: 'Research and planning',
      description: 'Gather requirements and create initial plan',
      estimatedHours: 4,
      priority: 'high',
    },
    {
      title: 'Implementation',
      description: 'Execute the main work',
      estimatedHours: 8,
      priority: 'high',
    },
    {
      title: 'Review and testing',
      description: 'Review work and test for quality',
      estimatedHours: 2,
      priority: 'medium',
    },
  ],
  estimatedTotalHours: 14,
  suggestedOrder: ['Research and planning', 'Implementation', 'Review and testing'],
  riskFactors: ['Unclear requirements', 'Time constraints'],
  recommendations: ['Break down into smaller tasks', 'Set clear milestones'],
};

export async function POST(request: NextRequest) {
  try {
    const body: TaskBreakdownRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackBreakdown, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Project Management Assistant specializing in task decomposition',
      mission: 'Break down a complex task into manageable subtasks',
      context: {
        taskTitle: body.taskTitle,
        taskDescription: body.taskDescription,
        complexity: body.complexity || 'moderate',
        deadline: body.deadline,
        assigneeRole: body.assigneeRole,
        relatedContext: body.relatedContext,
      },
      instructions: [
        'Break down the task into 3-8 logical subtasks',
        'Estimate hours for each subtask',
        'Identify dependencies between subtasks',
        'Assign priority levels (high/medium/low)',
        'Suggest optimal execution order',
        'Identify potential risks',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          subtasks: 'array of {title, description, estimatedHours, dependencies, priority}',
          estimatedTotalHours: 'number',
          suggestedOrder: 'array of subtask titles',
          riskFactors: 'array of strings',
          recommendations: 'array of strings',
        },
      },
      limits: {
        maxItems: 8,
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<TaskBreakdownResponse>(result.text, fallbackBreakdown);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error breaking down task:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to break down task',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackBreakdown, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
