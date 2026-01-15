import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface PatternAnalysisRequest extends BaseAIRequest {
  attendanceData: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
  staffData?: Array<{
    id: string;
    attendance: Array<{ date: string; status: string }>;
  }>;
}

interface PatternAnalysisResponse {
  patterns: Array<{
    pattern: string;
    description: string;
    frequency: number;
    impact: string;
  }>;
  trends: Array<{
    trend: string;
    direction: 'improving' | 'declining' | 'stable';
    description: string;
  }>;
  insights: string[];
  recommendations: string[];
}

const fallbackPatterns: PatternAnalysisResponse = {
  patterns: [],
  trends: [],
  insights: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: PatternAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPatterns, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Attendance Pattern Analyst',
      mission: 'Analyze attendance patterns and identify trends',
      context: {
        attendanceData: body.attendanceData,
        staffData: body.staffData || [],
      },
      instructions: [
        'Identify attendance patterns',
        'Detect trends',
        'Analyze individual patterns',
        'Provide insights',
        'Recommend improvements',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          patterns: 'array of {pattern, description, frequency, impact}',
          trends: 'array of {trend, direction, description}',
          insights: 'array of strings',
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<PatternAnalysisResponse>(result.text, fallbackPatterns);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing attendance patterns:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze attendance patterns',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPatterns, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
