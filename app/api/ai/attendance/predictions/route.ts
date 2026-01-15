import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface AttendancePredictionsRequest extends BaseAIRequest {
  historicalData: Array<{
    date: string;
    attendance: number;
    absences: number;
  }>;
  staffId?: string;
  forecastPeriods: number;
}

interface AttendancePredictionsResponse {
  predictions: Array<{
    period: string;
    expectedAttendance: number;
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
  }>;
  risks: Array<{
    staffId?: string;
    risk: string;
    probability: number;
    mitigation: string;
  }>;
}

const fallbackPredictions: AttendancePredictionsResponse = {
  predictions: [],
  risks: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: AttendancePredictionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPredictions, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Attendance Prediction Specialist',
      mission: 'Predict future attendance patterns',
      context: {
        historicalData: body.historicalData,
        staffId: body.staffId,
        forecastPeriods: body.forecastPeriods,
      },
      instructions: [
        'Analyze historical patterns',
        'Predict future attendance',
        'Assess risk levels',
        'Identify risk factors',
        'Suggest mitigation',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          predictions: 'array of {period, expectedAttendance, riskLevel, factors}',
          risks: 'array of {staffId, risk, probability, mitigation}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<AttendancePredictionsResponse>(result.text, fallbackPredictions);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error predicting attendance:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to predict attendance',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPredictions, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
