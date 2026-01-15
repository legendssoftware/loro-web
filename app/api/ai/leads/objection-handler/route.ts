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

interface ObjectionHandlerRequest extends BaseAIRequest {
  leadData: LeadData;
  objection: string;
  context?: string;
  objectionType?: 'price' | 'timing' | 'authority' | 'need' | 'competitor' | 'other';
}

interface ObjectionResponse {
  response: string;
  approach: string;
  keyPoints: string[];
  alternativeResponses: string[];
  followUpQuestions: string[];
  resources: string[];
}

const fallbackResponse: ObjectionResponse = {
  response: 'I understand your concern. Let me address that for you.',
  approach: 'Empathetic and solution-focused',
  keyPoints: ['Acknowledge the concern', 'Provide value', 'Address specific needs'],
  alternativeResponses: [],
  followUpQuestions: ['What specific aspect concerns you most?'],
  resources: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ObjectionHandlerRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackResponse, true, body.dataHash));
    }

    const leadContext = buildLeadIntelligenceContext(body.leadData);
    const saContext = buildSouthAfricanContext({
      industry: body.leadData.industry,
      businessSize: body.leadData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Objection Handling Specialist with expertise in consultative selling',
      mission: 'Generate effective objection responses tailored to the lead and situation',
      context: {
        leadData: body.leadData,
        objection: body.objection,
        context: body.context,
        objectionType: body.objectionType || 'other',
      },
      instructions: [
        'Understand the root cause of the objection',
        'Develop empathetic, consultative response',
        'Address concerns while maintaining value proposition',
        'Provide multiple response options',
        'Suggest follow-up questions to uncover needs',
        'Recommend relevant resources or case studies',
        'Use South African business context where relevant',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          response: 'string',
          approach: 'string',
          keyPoints: 'array of strings',
          alternativeResponses: 'array of strings',
          followUpQuestions: 'array of strings',
          resources: 'array of strings',
        },
      },
      tone: {
        baseTone: 'consultative',
        intensity: 'moderate',
        regionalAdaptation: 'south_african',
      },
    });

    const fullPrompt = leadContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<ObjectionResponse>(result.text, fallbackResponse);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error handling objection:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to handle objection',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackResponse, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
