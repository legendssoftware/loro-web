import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildLeadIntelligenceContext,
  buildSouthAfricanContext,
  parseSuggestionsResponse,
  formatResponse,
  type LeadData,
  type BaseAIRequest,
} from '@/lib/ai';

interface NextActionRequest extends BaseAIRequest {
  leadData: LeadData;
  currentStatus: string;
  lastAction?: {
    type: string;
    date: string;
    outcome?: string;
  };
  availableActions?: string[];
  urgency?: 'high' | 'medium' | 'low';
}

const fallbackActions = {
  suggestions: [
    {
      id: 1,
      title: 'Send follow-up email',
      description: 'Follow up on previous interaction with additional value',
      priority: 'medium' as const,
      action: 'email',
      timing: 'Within 24-48 hours',
    },
    {
      id: 2,
      title: 'Schedule discovery call',
      description: 'Schedule a call to understand their needs better',
      priority: 'high' as const,
      action: 'call',
      timing: 'This week',
    },
    {
      id: 3,
      title: 'Share relevant content',
      description: 'Send case study or product information',
      priority: 'low' as const,
      action: 'content',
      timing: 'Within 3-5 days',
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: NextActionRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackActions, true, body.dataHash));
    }

    const leadContext = buildLeadIntelligenceContext(body.leadData);
    const saContext = buildSouthAfricanContext({
      industry: body.leadData.industry,
      businessSize: body.leadData.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Strategy Advisor specializing in lead nurturing and conversion',
      mission: 'Recommend the best next action to move the lead forward in the sales process',
      context: {
        leadData: body.leadData,
        currentStatus: body.currentStatus,
        lastAction: body.lastAction,
        urgency: body.urgency || 'medium',
      },
      instructions: [
        'Analyze the lead\'s current status and history',
        'Consider the urgency level and lead temperature',
        'Recommend 3-5 specific next actions',
        'Prioritize actions based on likelihood of conversion',
        'Include timing recommendations for each action',
      ],
      outputFormat: {
        type: 'structured',
        sections: ['SUGGESTIONS'],
      },
      limits: {
        maxItems: 5,
      },
    });

    const fullPrompt = leadContext + '\n' + saContext + '\n' + prompt + '\n\nFormat suggestions as:\nLead ID: [uid] | Action: [specific action] | Reason: [why] | Timing: [when]';

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    const parsed = parseSuggestionsResponse(result.text);

    // Enhance with lead-specific data
    const enhanced = {
      ...parsed,
      suggestions: parsed.suggestions.map((suggestion, index) => ({
        ...suggestion,
        id: suggestion.id || body.leadData.uid * 100 + index,
        leadId: body.leadData.uid,
        leadName: body.leadData.name,
      })),
    };

    return NextResponse.json(formatResponse(enhanced, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating next actions:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate next actions',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackActions, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
