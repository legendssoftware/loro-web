import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface AnomalyDetectionRequest extends BaseAIRequest {
  data: Array<Record<string, any>>;
  metrics: string[];
  timeField?: string;
}

interface AnomalyDetectionResponse {
  anomalies: Array<{
    id: string;
    metric: string;
    value: number;
    expected: number;
    deviation: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    explanation: string;
    recommendation: string;
  }>;
  summary: {
    totalAnomalies: number;
    bySeverity: Record<string, number>;
    trends: string[];
  };
}

const fallbackAnomalies: AnomalyDetectionResponse = {
  anomalies: [],
  summary: {
    totalAnomalies: 0,
    bySeverity: {},
    trends: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: AnomalyDetectionRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnomalies, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Anomaly Detection Specialist',
      mission: 'Detect anomalies and outliers in data',
      context: {
        data: body.data,
        metrics: body.metrics,
        timeField: body.timeField,
      },
      instructions: [
        'Identify statistical anomalies',
        'Calculate deviations from expected values',
        'Assess severity',
        'Explain anomalies',
        'Provide recommendations',
        'Summarize trends',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          anomalies: 'array of {id, metric, value, expected, deviation, severity, explanation, recommendation}',
          summary: {
            totalAnomalies: 'number',
            bySeverity: 'object',
            trends: 'array of strings',
          },
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<AnomalyDetectionResponse>(result.text, fallbackAnomalies);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error detecting anomalies:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to detect anomalies',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnomalies, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
