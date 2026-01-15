import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildClientContext,
  buildSouthAfricanContext,
  buildPersonalizationContext,
  parseJSONResponse,
  formatResponse,
  type ClientData,
  type BaseAIRequest,
} from '@/lib/ai';

interface CommunicationStrategyRequest extends BaseAIRequest {
  clientData: ClientData;
  communicationHistory?: Array<{
    date: string;
    type: string;
    outcome: string;
    preference?: string;
  }>;
  preferredChannels?: string[];
  communicationGoals?: string[];
}

interface CommunicationStrategyResponse {
  strategy: {
    approach: string;
    frequency: string;
    channels: Array<{
      channel: string;
      purpose: string;
      frequency: string;
      bestTime: string;
    }>;
    tone: string;
    keyMessages: string[];
  };
  personalization: {
    preferences: string[];
    topics: string[];
    style: string;
  };
  cadence: Array<{
    touchpoint: string;
    timing: string;
    purpose: string;
    content: string;
  }>;
  bestPractices: string[];
}

const fallbackStrategy: CommunicationStrategyResponse = {
  strategy: {
    approach: 'Consultative and value-focused',
    frequency: 'Regular check-ins',
    channels: [
      {
        channel: 'Email',
        purpose: 'Updates and information',
        frequency: 'Weekly',
        bestTime: 'Business hours',
      },
    ],
    tone: 'Professional and friendly',
    keyMessages: ['Value delivery', 'Relationship building'],
  },
  personalization: {
    preferences: [],
    topics: [],
    style: 'Professional',
  },
  cadence: [],
  bestPractices: ['Maintain regular communication', 'Provide value in each touchpoint'],
};

export async function POST(request: NextRequest) {
  try {
    const body: CommunicationStrategyRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackStrategy, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeCulturalContext: true,
    });
    const personalization = buildPersonalizationContext({
      recipientName: body.clientData.name,
      companyName: body.clientData.companyName,
      industry: body.clientData.industry,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Communication Strategist specializing in client relationship management',
      mission: 'Develop personalized communication strategy for the client',
      context: {
        clientData: body.clientData,
        communicationHistory: body.communicationHistory || [],
        preferredChannels: body.preferredChannels || [],
        communicationGoals: body.communicationGoals || [],
      },
      instructions: [
        'Analyze client communication preferences and history',
        'Develop comprehensive communication strategy',
        'Define optimal channels, frequency, and timing',
        'Create personalized messaging approach',
        'Design communication cadence',
        'Provide best practices for engagement',
        'Consider South African business culture',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          strategy: {
            approach: 'string',
            frequency: 'string',
            channels: 'array of {channel, purpose, frequency, bestTime}',
            tone: 'string',
            keyMessages: 'array of strings',
          },
          personalization: {
            preferences: 'array of strings',
            topics: 'array of strings',
            style: 'string',
          },
          cadence: 'array of {touchpoint, timing, purpose, content}',
          bestPractices: 'array of strings',
        },
      },
      tone: {
        baseTone: 'consultative',
        intensity: 'moderate',
        regionalAdaptation: 'south_african',
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + personalization + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<CommunicationStrategyResponse>(result.text, fallbackStrategy);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating communication strategy:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate communication strategy',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackStrategy, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
