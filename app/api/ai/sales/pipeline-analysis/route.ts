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

interface PipelineAnalysisRequest extends BaseAIRequest {
  pipelineData: Array<{
    stage: string;
    deals: Array<{
      id: string;
      value: number;
      probability: number;
      daysInStage: number;
      lastActivity?: string;
    }>;
  }>;
  targetData?: TargetData[];
  timeFrame?: string;
}

interface PipelineAnalysisResponse {
  analysis: {
    totalValue: number;
    weightedValue: number;
    averageDealSize: number;
    averageSalesCycle: number;
    conversionRate: number;
  };
  stageAnalysis: Array<{
    stage: string;
    deals: number;
    totalValue: number;
    weightedValue: number;
    averageDays: number;
    bottlenecks: string[];
    recommendations: string[];
  }>;
  insights: string[];
  risks: Array<{
    risk: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
}

const fallbackAnalysis: PipelineAnalysisResponse = {
  analysis: {
    totalValue: 0,
    weightedValue: 0,
    averageDealSize: 0,
    averageSalesCycle: 0,
    conversionRate: 0,
  },
  stageAnalysis: [],
  insights: ['Analyze pipeline regularly', 'Focus on high-probability deals'],
  risks: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: PipelineAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnalysis, true, body.dataHash));
    }

    const targetContext = buildTargetContext(body.targetData);
    const saContext = buildSouthAfricanContext({
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Pipeline Analyst specializing in revenue forecasting and optimization',
      mission: 'Analyze sales pipeline and provide actionable insights',
      context: {
        pipelineData: body.pipelineData,
        targetData: body.targetData || [],
        timeFrame: body.timeFrame,
      },
      instructions: [
        'Calculate key pipeline metrics (total value, weighted value, conversion rates)',
        'Analyze each stage for bottlenecks and opportunities',
        'Identify risks and mitigation strategies',
        'Compare pipeline performance against targets',
        'Provide prioritized recommendations',
        'Calculate average sales cycle and deal size',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          analysis: {
            totalValue: 'number',
            weightedValue: 'number',
            averageDealSize: 'number',
            averageSalesCycle: 'number',
            conversionRate: 'number',
          },
          stageAnalysis: 'array of {stage, deals, totalValue, weightedValue, averageDays, bottlenecks, recommendations}',
          insights: 'array of strings',
          risks: 'array of {risk, impact, mitigation}',
          recommendations: 'array of {action, priority, impact}',
        },
      },
    });

    const fullPrompt = targetContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<PipelineAnalysisResponse>(result.text, fallbackAnalysis);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing pipeline:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze pipeline',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnalysis, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
