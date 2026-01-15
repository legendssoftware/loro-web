import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildClientContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type ClientData,
  type BaseAIRequest,
} from '@/lib/ai';

interface CaseStudiesRequest extends BaseAIRequest {
  clientData: ClientData;
  challenge: string;
  solution: string;
  results: string[];
  format?: 'brief' | 'detailed' | 'executive';
}

interface CaseStudiesResponse {
  caseStudy: {
    title: string;
    executiveSummary: string;
    challenge: string;
    solution: string;
    implementation: string;
    results: Array<{
      metric: string;
      before: string;
      after: string;
      improvement: string;
    }>;
    testimonial: string;
    keyTakeaways: string[];
  };
}

const fallbackCaseStudy: CaseStudiesResponse = {
  caseStudy: {
    title: '',
    executiveSummary: '',
    challenge: '',
    solution: '',
    implementation: '',
    results: [],
    testimonial: '',
    keyTakeaways: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: CaseStudiesRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackCaseStudy, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Case Study Writer',
      mission: 'Create compelling case study',
      context: {
        clientData: body.clientData,
        challenge: body.challenge,
        solution: body.solution,
        results: body.results,
        format: body.format || 'detailed',
      },
      instructions: [
        'Create engaging title',
        'Write executive summary',
        'Detail challenge and solution',
        'Present results with metrics',
        'Include testimonial',
        'Extract key takeaways',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          caseStudy: {
            title: 'string',
            executiveSummary: 'string',
            challenge: 'string',
            solution: 'string',
            implementation: 'string',
            results: 'array of {metric, before, after, improvement}',
            testimonial: 'string',
            keyTakeaways: 'array of strings',
          },
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<CaseStudiesResponse>(result.text, fallbackCaseStudy);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating case study:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate case study',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackCaseStudy, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
