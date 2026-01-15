import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ClaimsValidationRequest extends BaseAIRequest {
  claim: {
    id: string;
    type: string;
    amount: number;
    description: string;
    supportingDocs?: string[];
    staffId: string;
  };
  history?: Array<{
    claimId: string;
    amount: number;
    status: string;
  }>;
  policies?: Record<string, any>;
}

interface ClaimsValidationResponse {
  validation: {
    isValid: boolean;
    score: number;
    issues: Array<{
      issue: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      recommendation: string;
    }>;
  };
  compliance: Array<{
    rule: string;
    status: 'compliant' | 'non-compliant';
    details: string;
  }>;
  recommendation: 'approve' | 'reject' | 'review';
}

const fallbackValidation: ClaimsValidationResponse = {
  validation: {
    isValid: true,
    score: 100,
    issues: [],
  },
  compliance: [],
  recommendation: 'review',
};

export async function POST(request: NextRequest) {
  try {
    const body: ClaimsValidationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackValidation, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Claims Validation Specialist',
      mission: 'Validate expense claims and check compliance',
      context: {
        claim: body.claim,
        history: body.history || [],
        policies: body.policies || {},
      },
      instructions: [
        'Validate claim details',
        'Check policy compliance',
        'Identify issues',
        'Calculate validation score',
        'Recommend action',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          validation: {
            isValid: 'boolean',
            score: 'number (0-100)',
            issues: 'array of {issue, severity, recommendation}',
          },
          compliance: 'array of {rule, status, details}',
          recommendation: 'string (approve|reject|review)',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ClaimsValidationResponse>(result.text, fallbackValidation);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error validating claim:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to validate claim',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackValidation, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
