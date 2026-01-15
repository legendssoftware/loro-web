import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildClientContext,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type ClientData,
  type BaseAIRequest,
} from '@/lib/ai';

interface PresentationsRequest extends BaseAIRequest {
  topic: string;
  audience: string;
  duration: number;
  objectives: string[];
  clientData?: ClientData;
}

interface PresentationsResponse {
  presentation: {
    title: string;
    overview: string;
    slides: Array<{
      slideNumber: number;
      title: string;
      content: string[];
      notes: string;
    }>;
    keyMessages: string[];
  };
  delivery: {
    tips: string[];
    timing: string;
    qa: string[];
  };
}

const fallbackPresentation: PresentationsResponse = {
  presentation: {
    title: '',
    overview: '',
    slides: [],
    keyMessages: [],
  },
  delivery: {
    tips: [],
    timing: '',
    qa: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: PresentationsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPresentation, true, body.dataHash));
    }

    const clientContext = body.clientData ? buildClientContext(body.clientData) : '';
    const saContext = buildSouthAfricanContext({
      industry: body.clientData?.industry,
      businessSize: body.clientData?.businessSize,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Presentation Designer',
      mission: 'Create presentation outline and content',
      context: {
        topic: body.topic,
        audience: body.audience,
        duration: body.duration,
        objectives: body.objectives,
        clientData: body.clientData,
      },
      instructions: [
        'Create engaging title',
        'Structure slides logically',
        'Provide content for each slide',
        'Include speaker notes',
        'Identify key messages',
        'Suggest delivery tips',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          presentation: {
            title: 'string',
            overview: 'string',
            slides: 'array of {slideNumber, title, content, notes}',
            keyMessages: 'array of strings',
          },
          delivery: {
            tips: 'array of strings',
            timing: 'string',
            qa: 'array of strings',
          },
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<PresentationsResponse>(result.text, fallbackPresentation);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating presentation:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate presentation',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPresentation, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
