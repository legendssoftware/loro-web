import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildTargetContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
  type TargetData,
} from '@/lib/ai';

interface ExecutiveSummaryRequest extends BaseAIRequest {
  reportData: Record<string, any>;
  targetData?: TargetData[];
  timeFrame: string;
  focus?: string[];
}

interface ExecutiveSummaryResponse {
  summary: {
    overview: string;
    keyHighlights: string[];
    achievements: string[];
    challenges: string[];
    recommendations: string[];
  };
  metrics: Array<{
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    significance: string;
  }>;
}

const fallbackSummary: ExecutiveSummaryResponse = {
  summary: {
    overview: '',
    keyHighlights: [],
    achievements: [],
    challenges: [],
    recommendations: [],
  },
  metrics: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ExecutiveSummaryRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackSummary, true, body.dataHash));
    }

    const targetContext = buildTargetContext(body.targetData);
    const saContext = buildSouthAfricanContext({
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Executive Summary Writer',
      mission: 'Generate concise executive summary from report data',
      context: {
        reportData: body.reportData,
        targetData: body.targetData || [],
        timeFrame: body.timeFrame,
        focus: body.focus || [],
      },
      instructions: [
        'Create high-level overview',
        'Extract key highlights',
        'Identify achievements and challenges',
        'Provide strategic recommendations',
        'Summarize key metrics with trends',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          summary: {
            overview: 'string',
            keyHighlights: 'array of strings',
            achievements: 'array of strings',
            challenges: 'array of strings',
            recommendations: 'array of strings',
          },
          metrics: 'array of {metric, value, trend, significance}',
        },
      },
    });

    const fullPrompt = targetContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ExecutiveSummaryResponse>(result.text, fallbackSummary);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating executive summary:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate executive summary',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackSummary, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
