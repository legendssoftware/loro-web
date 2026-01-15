import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface RecommendationsRequest extends BaseAIRequest {
  reportData: Record<string, any>;
  objectives?: string[];
  constraints?: string[];
}

interface RecommendationsResponse {
  recommendations: Array<{
    recommendation: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    rationale: string;
  }>;
  quickWins: string[];
  strategic: string[];
}

const fallbackRecommendations: RecommendationsResponse = {
  recommendations: [],
  quickWins: [],
  strategic: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackRecommendations, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Strategic Recommendations Analyst',
      mission: 'Generate actionable recommendations from report data',
      context: {
        reportData: body.reportData,
        objectives: body.objectives || [],
        constraints: body.constraints || [],
      },
      instructions: [
        'Analyze data and identify opportunities',
        'Generate prioritized recommendations',
        'Categorize by impact and effort',
        'Identify quick wins',
        'Develop strategic recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          recommendations: 'array of {recommendation, category, priority, impact, effort, timeline, rationale}',
          quickWins: 'array of strings',
          strategic: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<RecommendationsResponse>(result.text, fallbackRecommendations);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating recommendations:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackRecommendations, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
