import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface BenchmarkingRequest extends BaseAIRequest {
  metrics: Record<string, number>;
  benchmarks?: Record<string, number>;
  industry?: string;
  context?: string;
}

interface BenchmarkingResponse {
  comparison: Array<{
    metric: string;
    current: number;
    benchmark: number;
    variance: number;
    percentile: number;
    status: 'above' | 'at' | 'below';
  }>;
  gaps: Array<{
    metric: string;
    gap: number;
    priority: 'high' | 'medium' | 'low';
    action: string;
  }>;
  strengths: string[];
  opportunities: string[];
}

const fallbackBenchmark: BenchmarkingResponse = {
  comparison: [],
  gaps: [],
  strengths: [],
  opportunities: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: BenchmarkingRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackBenchmark, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Benchmarking Analyst',
      mission: 'Compare metrics against benchmarks',
      context: {
        metrics: body.metrics,
        benchmarks: body.benchmarks || {},
        industry: body.industry,
        context: body.context,
      },
      instructions: [
        'Compare each metric against benchmark',
        'Calculate variance and percentile',
        'Identify gaps',
        'Highlight strengths',
        'Find opportunities',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          comparison: 'array of {metric, current, benchmark, variance, percentile, status}',
          gaps: 'array of {metric, gap, priority, action}',
          strengths: 'array of strings',
          opportunities: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<BenchmarkingResponse>(result.text, fallbackBenchmark);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error benchmarking:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to benchmark',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackBenchmark, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
