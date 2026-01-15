import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TrainingRecommendationsRequest extends BaseAIRequest {
  staffId: string;
  skillGaps: string[];
  role: string;
  careerGoals?: string[];
  budget?: number;
}

interface TrainingRecommendationsResponse {
  recommendations: Array<{
    training: string;
    type: string;
    duration: string;
    cost?: number;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
  }>;
  learningPath: Array<{
    step: number;
    training: string;
    order: string;
  }>;
}

const fallbackTraining: TrainingRecommendationsResponse = {
  recommendations: [],
  learningPath: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: TrainingRecommendationsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackTraining, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Training Recommendations Specialist',
      mission: 'Recommend training programs for staff development',
      context: {
        staffId: body.staffId,
        skillGaps: body.skillGaps,
        role: body.role,
        careerGoals: body.careerGoals || [],
        budget: body.budget,
      },
      instructions: [
        'Recommend relevant training programs',
        'Consider budget constraints',
        'Prioritize by impact',
        'Create learning path',
        'Provide rationale',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          recommendations: 'array of {training, type, duration, cost, priority, rationale}',
          learningPath: 'array of {step, training, order}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<TrainingRecommendationsResponse>(result.text, fallbackTraining);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating training recommendations:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate training recommendations',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackTraining, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
