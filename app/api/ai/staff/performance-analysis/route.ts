import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface PerformanceAnalysisRequest extends BaseAIRequest {
  staffData: Array<{
    id: string;
    name: string;
    role: string;
    metrics: Record<string, number>;
    goals?: Array<{ goal: string; achieved: boolean }>;
  }>;
  timeFrame?: string;
}

interface PerformanceAnalysisResponse {
  analysis: Array<{
    staffId: string;
    name: string;
    overallScore: number;
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  }>;
  trends: Array<{
    trend: string;
    description: string;
    impact: string;
  }>;
  teamInsights: string[];
}

const fallbackAnalysis: PerformanceAnalysisResponse = {
  analysis: [],
  trends: [],
  teamInsights: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: PerformanceAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnalysis, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Performance Analyst specializing in staff evaluation',
      mission: 'Analyze staff performance and provide insights',
      context: {
        staffData: body.staffData,
        timeFrame: body.timeFrame,
      },
      instructions: [
        'Calculate overall performance scores',
        'Identify strengths and improvement areas',
        'Detect trends',
        'Provide team-level insights',
        'Generate recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          analysis: 'array of {staffId, name, overallScore, strengths, areasForImprovement, recommendations}',
          trends: 'array of {trend, description, impact}',
          teamInsights: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<PerformanceAnalysisResponse>(result.text, fallbackAnalysis);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing performance:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze performance',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnalysis, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
