import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildLeadIntelligenceContext,
  buildClientContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type LeadData,
  type ClientData,
  type BaseAIRequest,
} from '@/lib/ai';

interface MeetingPrepRequest extends BaseAIRequest {
  leadData?: LeadData;
  clientData?: ClientData;
  meetingType: string;
  objectives: string[];
  participants?: string[];
  agenda?: string[];
}

interface MeetingPrepResponse {
  preparation: {
    objectives: string[];
    agenda: Array<{
      item: string;
      duration: string;
      purpose: string;
    }>;
    keyPoints: string[];
    questions: string[];
    materials: string[];
  };
  background: {
    participants: Array<{
      name: string;
      role: string;
      interests: string[];
    }>;
    context: string;
    history: string;
  };
  strategy: {
    approach: string;
    talkingPoints: string[];
    desiredOutcome: string;
    nextSteps: string[];
  };
}

const fallbackPrep: MeetingPrepResponse = {
  preparation: {
    objectives: [],
    agenda: [],
    keyPoints: [],
    questions: [],
    materials: [],
  },
  background: {
    participants: [],
    context: '',
    history: '',
  },
  strategy: {
    approach: '',
    talkingPoints: [],
    desiredOutcome: '',
    nextSteps: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: MeetingPrepRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPrep, true, body.dataHash));
    }

    const leadContext = body.leadData ? buildLeadIntelligenceContext(body.leadData) : '';
    const clientContext = body.clientData ? buildClientContext(body.clientData) : '';
    const saContext = buildSouthAfricanContext({
      industry: body.leadData?.industry || body.clientData?.industry,
      businessSize: body.leadData?.businessSize || body.clientData?.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Meeting Preparation Specialist',
      mission: 'Prepare comprehensive meeting preparation guide',
      context: {
        leadData: body.leadData,
        clientData: body.clientData,
        meetingType: body.meetingType,
        objectives: body.objectives,
        participants: body.participants || [],
        agenda: body.agenda || [],
      },
      instructions: [
        'Define clear objectives',
        'Create structured agenda',
        'Identify key talking points',
        'Prepare relevant questions',
        'Research participants',
        'Develop strategy and desired outcomes',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          preparation: {
            objectives: 'array of strings',
            agenda: 'array of {item, duration, purpose}',
            keyPoints: 'array of strings',
            questions: 'array of strings',
            materials: 'array of strings',
          },
          background: {
            participants: 'array of {name, role, interests}',
            context: 'string',
            history: 'string',
          },
          strategy: {
            approach: 'string',
            talkingPoints: 'array of strings',
            desiredOutcome: 'string',
            nextSteps: 'array of strings',
          },
        },
      },
    });

    const fullPrompt = leadContext + '\n' + clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<MeetingPrepResponse>(result.text, fallbackPrep);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error preparing meeting:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to prepare meeting',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPrep, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
