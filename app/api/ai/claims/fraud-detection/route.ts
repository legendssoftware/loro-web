import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface FraudDetectionRequest extends BaseAIRequest {
  claim: {
    id: string;
    amount: number;
    type: string;
    date: string;
    staffId: string;
  };
  history: Array<{
    claimId: string;
    amount: number;
    date: string;
    status: string;
  }>;
  patterns?: Record<string, any>;
}

interface FraudDetectionResponse {
  risk: {
    level: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: Array<{
      factor: string;
      risk: number;
      description: string;
    }>;
  };
  flags: Array<{
    flag: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
  }>;
  recommendation: 'approve' | 'investigate' | 'reject';
}

const fallbackFraud: FraudDetectionResponse = {
  risk: {
    level: 'low',
    score: 0,
    factors: [],
  },
  flags: [],
  recommendation: 'approve',
};

export async function POST(request: NextRequest) {
  try {
    const body: FraudDetectionRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackFraud, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Fraud Detection Specialist',
      mission: 'Detect potential fraud in expense claims',
      context: {
        claim: body.claim,
        history: body.history,
        patterns: body.patterns || {},
      },
      instructions: [
        'Analyze claim for fraud indicators',
        'Check against historical patterns',
        'Identify risk factors',
        'Flag suspicious activities',
        'Recommend action',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          risk: {
            level: 'string',
            score: 'number (0-100)',
            factors: 'array of {factor, risk, description}',
          },
          flags: 'array of {flag, severity, description}',
          recommendation: 'string (approve|investigate|reject)',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<FraudDetectionResponse>(result.text, fallbackFraud);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error detecting fraud:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to detect fraud',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackFraud, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
