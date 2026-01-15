import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TimeEstimationRequest extends BaseAIRequest {
  task: {
    title: string;
    description: string;
    complexity?: 'simple' | 'moderate' | 'complex';
    type?: string;
    assignee?: {
      experience: string;
      availability: number;
    };
    similarTasks?: Array<{
      title: string;
      actualHours: number;
    }>;
  };
}

interface TimeEstimationResponse {
  estimates: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
  breakdown: Array<{
    phase: string;
    hours: number;
    confidence: number;
  }>;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
  confidence: number;
}

const fallbackEstimation: TimeEstimationResponse = {
  estimates: {
    optimistic: 4,
    realistic: 8,
    pessimistic: 12,
  },
  breakdown: [
    {
      phase: 'Planning',
      hours: 2,
      confidence: 70,
    },
    {
      phase: 'Execution',
      hours: 4,
      confidence: 60,
    },
    {
      phase: 'Review',
      hours: 2,
      confidence: 70,
    },
  ],
  factors: [],
  recommendations: ['Break down into smaller tasks', 'Account for buffer time'],
  confidence: 65,
};

export async function POST(request: NextRequest) {
  try {
    const body: TimeEstimationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackEstimation, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Time Estimation Specialist with expertise in project planning',
      mission: 'Estimate task duration using three-point estimation technique',
      context: {
        task: body.task,
      },
      instructions: [
        'Use three-point estimation (optimistic, realistic, pessimistic)',
        'Break down task into phases with time estimates',
        'Consider complexity, assignee experience, and similar tasks',
        'Identify factors affecting estimation',
        'Calculate confidence level',
        'Provide recommendations for accurate estimation',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          estimates: {
            optimistic: 'number (hours)',
            realistic: 'number (hours)',
            pessimistic: 'number (hours)',
          },
          breakdown: 'array of {phase, hours, confidence}',
          factors: 'array of {factor, impact, description}',
          recommendations: 'array of strings',
          confidence: 'number (0-100)',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<TimeEstimationResponse>(result.text, fallbackEstimation);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error estimating time:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to estimate time',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackEstimation, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
