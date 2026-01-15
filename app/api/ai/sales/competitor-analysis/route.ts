import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface CompetitorAnalysisRequest extends BaseAIRequest {
  mentions: Array<{
    competitor: string;
    context: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    dealId?: string;
    outcome?: 'won' | 'lost' | 'open';
  }>;
  deals?: Array<{
    id: string;
    competitor: string;
    outcome: 'won' | 'lost';
    reason?: string;
  }>;
}

interface CompetitorAnalysisResponse {
  competitors: Array<{
    name: string;
    frequency: number;
    winRate: number;
    strengths: string[];
    weaknesses: string[];
    positioning: string;
  }>;
  insights: string[];
  strategies: Array<{
    competitor: string;
    strategy: string;
    tactics: string[];
  }>;
  recommendations: Array<{
    action: string;
    competitor: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  positioning: Array<{
    differentiator: string;
    advantage: string;
    messaging: string;
  }>;
}

const fallbackAnalysis: CompetitorAnalysisResponse = {
  competitors: [],
  insights: [],
  strategies: [],
  recommendations: [],
  positioning: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: CompetitorAnalysisRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAnalysis, true, body.dataHash));
    }

    const saContext = buildSouthAfricanContext({
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Competitive Intelligence Analyst specializing in sales strategy',
      mission: 'Analyze competitor mentions and provide strategic insights',
      context: {
        mentions: body.mentions,
        deals: body.deals || [],
      },
      instructions: [
        'Identify all competitors mentioned',
        'Analyze competitor strengths and weaknesses',
        'Calculate win rates against each competitor',
        'Develop competitive strategies',
        'Identify differentiation opportunities',
        'Provide positioning recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          competitors: 'array of {name, frequency, winRate, strengths, weaknesses, positioning}',
          insights: 'array of strings',
          strategies: 'array of {competitor, strategy, tactics}',
          recommendations: 'array of {action, competitor, priority}',
          positioning: 'array of {differentiator, advantage, messaging}',
        },
      },
    });

    const fullPrompt = saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<CompetitorAnalysisResponse>(result.text, fallbackAnalysis);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error analyzing competitors:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze competitors',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAnalysis, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
