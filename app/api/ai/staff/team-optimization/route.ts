import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface TeamOptimizationRequest extends BaseAIRequest {
  team: Array<{
    id: string;
    name: string;
    role: string;
    skills: string[];
    performance: number;
  }>;
  objectives: string[];
  constraints?: string[];
}

interface TeamOptimizationResponse {
  recommendations: Array<{
    action: string;
    type: 'hire' | 'train' | 'reassign' | 'restructure';
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
  optimalStructure: Array<{
    role: string;
    skills: string[];
    count: number;
  }>;
  gaps: string[];
}

const fallbackOptimization: TeamOptimizationResponse = {
  recommendations: [],
  optimalStructure: [],
  gaps: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: TeamOptimizationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackOptimization, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Team Optimization Specialist',
      mission: 'Optimize team composition and structure',
      context: {
        team: body.team,
        objectives: body.objectives,
        constraints: body.constraints || [],
      },
      instructions: [
        'Analyze current team composition',
        'Identify gaps',
        'Recommend optimal structure',
        'Suggest actions (hire/train/reassign)',
        'Prioritize recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          recommendations: 'array of {action, type, priority, impact}',
          optimalStructure: 'array of {role, skills, count}',
          gaps: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<TeamOptimizationResponse>(result.text, fallbackOptimization);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error optimizing team:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to optimize team',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackOptimization, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
