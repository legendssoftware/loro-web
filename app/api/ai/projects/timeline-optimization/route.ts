import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TimelineOptimizationRequest extends BaseAIRequest {
  project: {
    tasks: Array<{
      id: string;
      title: string;
      duration: number;
      dependencies: string[];
      resources?: string[];
      priority: string;
    }>;
    deadline?: string;
    constraints?: string[];
  };
}

interface TimelineOptimizationResponse {
  optimizedTimeline: Array<{
    taskId: string;
    startDate: string;
    endDate: string;
    duration: number;
    dependencies: string[];
  }>;
  criticalPath: string[];
  milestones: Array<{
    milestone: string;
    date: string;
    tasks: string[];
  }>;
  optimization: {
    originalDuration: number;
    optimizedDuration: number;
    savings: number;
    techniques: string[];
  };
  recommendations: string[];
}

const fallbackTimeline: TimelineOptimizationResponse = {
  optimizedTimeline: [],
  criticalPath: [],
  milestones: [],
  optimization: {
    originalDuration: 0,
    optimizedDuration: 0,
    savings: 0,
    techniques: [],
  },
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: TimelineOptimizationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackTimeline, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Timeline Optimization Specialist',
      mission: 'Optimize project timeline using critical path analysis and resource optimization',
      context: {
        project: body.project,
      },
      instructions: [
        'Identify critical path',
        'Optimize task sequencing',
        'Calculate optimized timeline',
        'Identify milestones',
        'Apply optimization techniques (parallelization, resource leveling)',
        'Compare original vs optimized duration',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          optimizedTimeline: 'array of {taskId, startDate, endDate, duration, dependencies}',
          criticalPath: 'array of task IDs',
          milestones: 'array of {milestone, date, tasks}',
          optimization: {
            originalDuration: 'number',
            optimizedDuration: 'number',
            savings: 'number',
            techniques: 'array of strings',
          },
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<TimelineOptimizationResponse>(result.text, fallbackTimeline);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error optimizing timeline:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to optimize timeline',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackTimeline, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
