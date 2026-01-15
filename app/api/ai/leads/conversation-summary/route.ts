import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildLeadIntelligenceContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type LeadData,
  type BaseAIRequest,
} from '@/lib/ai';

interface ConversationSummaryRequest extends BaseAIRequest {
  leadData: LeadData;
  conversations: Array<{
    date: string;
    type: 'call' | 'email' | 'meeting' | 'message' | 'other';
    content: string;
    participants?: string[];
    outcome?: string;
  }>;
  summaryType?: 'brief' | 'detailed' | 'executive';
}

interface ConversationSummaryResponse {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  nextSteps: string[];
  actionItems: Array<{
    item: string;
    priority: 'high' | 'medium' | 'low';
    assignee?: string;
  }>;
  timeline: Array<{
    date: string;
    event: string;
    significance: string;
  }>;
}

const fallbackSummary: ConversationSummaryResponse = {
  summary: 'Summary of lead interactions and conversations.',
  keyPoints: ['Multiple touchpoints with the lead', 'Ongoing engagement'],
  sentiment: 'neutral',
  nextSteps: ['Continue nurturing relationship', 'Schedule follow-up'],
  actionItems: [
    {
      item: 'Follow up on previous conversation',
      priority: 'medium',
    },
  ],
  timeline: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ConversationSummaryRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackSummary, true, body.dataHash));
    }

    const leadContext = buildLeadIntelligenceContext(body.leadData);
    const saContext = buildSouthAfricanContext({
      industry: body.leadData.industry,
      businessSize: body.leadData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Conversation Analyst specializing in sales interaction analysis',
      mission: 'Summarize lead conversations and extract actionable insights',
      context: {
        leadData: body.leadData,
        conversations: body.conversations,
        summaryType: body.summaryType || 'detailed',
      },
      instructions: [
        'Analyze all conversation interactions',
        'Extract key points and themes',
        'Determine overall sentiment',
        'Identify action items and next steps',
        'Create timeline of significant events',
        'Provide concise but comprehensive summary',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          summary: 'string',
          keyPoints: 'array of strings',
          sentiment: 'string (positive|neutral|negative)',
          nextSteps: 'array of strings',
          actionItems: 'array of {item, priority, assignee}',
          timeline: 'array of {date, event, significance}',
        },
      },
    });

    const fullPrompt = leadContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<ConversationSummaryResponse>(result.text, fallbackSummary);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error summarizing conversations:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to summarize conversations',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackSummary, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
