import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface MilestoneTrackingRequest extends BaseAIRequest {
  project: {
    milestones: Array<{
      id: string;
      name: string;
      targetDate: string;
      tasks: string[];
      status?: string;
    }>;
    tasks: Array<{
      id: string;
      status: string;
      progress: number;
      completionDate?: string;
    }>;
  };
  historicalData?: Array<{
    milestone: string;
    plannedDate: string;
    actualDate?: string;
    variance: number;
  }>;
}

interface MilestoneTrackingResponse {
  status: Array<{
    milestoneId: string;
    milestoneName: string;
    status: 'on-track' | 'at-risk' | 'delayed' | 'completed';
    progress: number;
    predictedDate: string;
    variance: number;
    tasks: Array<{
      taskId: string;
      status: string;
      impact: string;
    }>;
  }>;
  predictions: Array<{
    milestoneId: string;
    predictedCompletion: string;
    confidence: number;
    factors: string[];
  }>;
  risks: Array<{
    milestoneId: string;
    risk: string;
    impact: string;
    mitigation: string;
  }>;
  recommendations: string[];
}

const fallbackTracking: MilestoneTrackingResponse = {
  status: [],
  predictions: [],
  risks: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: MilestoneTrackingRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackTracking, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Milestone Tracking Specialist',
      mission: 'Track milestone progress and predict completion dates',
      context: {
        project: body.project,
        historicalData: body.historicalData || [],
      },
      instructions: [
        'Assess current milestone status',
        'Calculate progress and variance',
        'Predict completion dates',
        'Identify risks to milestones',
        'Analyze task dependencies',
        'Provide recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          status: 'array of {milestoneId, milestoneName, status, progress, predictedDate, variance, tasks}',
          predictions: 'array of {milestoneId, predictedCompletion, confidence, factors}',
          risks: 'array of {milestoneId, risk, impact, mitigation}',
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<MilestoneTrackingResponse>(result.text, fallbackTracking);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error tracking milestones:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to track milestones',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackTracking, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
