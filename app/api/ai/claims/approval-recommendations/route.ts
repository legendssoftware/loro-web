import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ApprovalRecommendationsRequest extends BaseAIRequest {
  claim: {
    id: string;
    amount: number;
    type: string;
    staffId: string;
    validationScore?: number;
    fraudRisk?: number;
  };
  policies?: Record<string, any>;
}

interface ApprovalRecommendationsResponse {
  recommendation: 'approve' | 'reject' | 'review';
  confidence: number;
  rationale: string;
  conditions?: string[];
  alternatives?: Array<{
    option: string;
    description: string;
  }>;
}

const fallbackApproval: ApprovalRecommendationsResponse = {
  recommendation: 'review',
  confidence: 50,
  rationale: 'Requires manual review',
  conditions: [],
  alternatives: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ApprovalRecommendationsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackApproval, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Claims Approval Specialist',
      mission: 'Recommend approval decision for expense claims',
      context: {
        claim: body.claim,
        policies: body.policies || {},
      },
      instructions: [
        'Evaluate claim comprehensively',
        'Consider validation and fraud scores',
        'Check policy compliance',
        'Recommend approval decision',
        'Provide rationale',
        'Suggest alternatives if needed',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          recommendation: 'string (approve|reject|review)',
          confidence: 'number (0-100)',
          rationale: 'string',
          conditions: 'array of strings',
          alternatives: 'array of {option, description}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1024,
    });

    const parsed = parseJSONResponse<ApprovalRecommendationsResponse>(result.text, fallbackApproval);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating approval recommendation:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate approval recommendation',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackApproval, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
