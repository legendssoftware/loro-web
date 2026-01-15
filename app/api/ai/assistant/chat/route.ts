import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ChatRequest extends BaseAIRequest {
  message: string;
  context?: Record<string, any>;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface ChatResponse {
  response: string;
  suggestions?: string[];
  actions?: Array<{
    action: string;
    description: string;
  }>;
}

const fallbackChat: ChatResponse = {
  response: 'I\'m here to help. How can I assist you today?',
  suggestions: [],
  actions: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackChat, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Assistant for CRM operations',
      mission: 'Provide helpful responses and assistance',
      context: {
        message: body.message,
        context: body.context || {},
        conversationHistory: body.conversationHistory || [],
      },
      instructions: [
        'Understand user intent',
        'Provide accurate, helpful responses',
        'Suggest relevant actions',
        'Maintain conversation context',
        'Be concise and clear',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          response: 'string',
          suggestions: 'array of strings',
          actions: 'array of {action, description}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1024,
    });

    const parsed = parseJSONResponse<ChatResponse>(result.text, fallbackChat);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error in chat:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackChat, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
