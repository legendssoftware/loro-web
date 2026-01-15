import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ProgressAnalysisRequest extends BaseAIRequest {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    estimatedHours: number;
    actualHours?: number;
    deadline?: string;
    startDate?: string;
    updates?: Array<{
      date: string;
      progress: number;
      notes?: string;
    }>;
  }>;
  timeFrame?: string;
}

interface ProgressAnalysisResponse {
  summary: {
    totalTasks: number;
    completed: number;
    inProgress: number;
    delayed: number;
    onTrack: number;
    averageProgress: number;
  };
  patterns: Array<{
    pattern: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  atRisk: Array<{
    taskId: string;
    title: string;
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
    recommendation: string;
  }>;
  insights: string[];
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    expectedImpact: string;
  }>;
}

const fallbackAnalysis: ProgressAnalysisResponse = {
  summary: {
    totalTasks: 0,
    completed: 0,
    inProgress: 0,
    delayed: 0,
    onTrack: 0,
    averageProgress: 0,
  },
  patterns: [],
  atRisk: [],
  insights: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ProgressAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnalysis, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Progress Analyst specializing in project tracking and performance',
      mission: 'Analyze task progress patterns and identify risks',
      context: {
        tasks: body.tasks,
        timeFrame: body.timeFrame,
      },
      instructions: [
        'Calculate summary statistics',
        'Identify progress patterns and trends',
        'Detect at-risk tasks',
        'Analyze velocity and completion rates',
        'Provide actionable insights',
        'Recommend improvements',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          summary: {
            totalTasks: 'number',
            completed: 'number',
            inProgress: 'number',
            delayed: 'number',
            onTrack: 'number',
            averageProgress: 'number',
          },
          patterns: 'array of {pattern, description, impact}',
          atRisk: 'array of {taskId, title, riskLevel, reason, recommendation}',
          insights: 'array of strings',
          recommendations: 'array of {action, priority, expectedImpact}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<ProgressAnalysisResponse>(result.text, fallbackAnalysis);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing progress:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze progress',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnalysis, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
