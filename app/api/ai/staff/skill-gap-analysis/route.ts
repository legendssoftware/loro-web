import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface SkillGapAnalysisRequest extends BaseAIRequest {
  staff: Array<{
    id: string;
    name: string;
    role: string;
    currentSkills: string[];
    requiredSkills: string[];
  }>;
  teamGoals?: string[];
}

interface SkillGapAnalysisResponse {
  gaps: Array<{
    staffId: string;
    name: string;
    gaps: Array<{
      skill: string;
      priority: 'high' | 'medium' | 'low';
      impact: string;
    }>;
  }>;
  teamGaps: Array<{
    skill: string;
    affectedCount: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  recommendations: Array<{
    action: string;
    priority: string;
    target: string[];
  }>;
}

const fallbackGaps: SkillGapAnalysisResponse = {
  gaps: [],
  teamGaps: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: SkillGapAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackGaps, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Skill Gap Analyst',
      mission: 'Identify skill gaps and training needs',
      context: {
        staff: body.staff,
        teamGoals: body.teamGoals || [],
      },
      instructions: [
        'Compare current vs required skills',
        'Identify individual gaps',
        'Identify team-level gaps',
        'Prioritize gaps',
        'Recommend training actions',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          gaps: 'array of {staffId, name, gaps}',
          teamGaps: 'array of {skill, affectedCount, priority}',
          recommendations: 'array of {action, priority, target}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<SkillGapAnalysisResponse>(result.text, fallbackGaps);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing skill gaps:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze skill gaps',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackGaps, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
