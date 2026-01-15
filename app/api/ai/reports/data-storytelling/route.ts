import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface DataStorytellingRequest extends BaseAIRequest {
  data: Record<string, any>;
  narrative: string;
  audience: string;
  keyPoints?: string[];
}

interface DataStorytellingResponse {
  story: {
    title: string;
    narrative: string;
    sections: Array<{
      heading: string;
      content: string;
      data: Record<string, any>;
    }>;
    conclusion: string;
  };
  visualizations: Array<{
    type: string;
    data: Record<string, any>;
    description: string;
  }>;
}

const fallbackStory: DataStorytellingResponse = {
  story: {
    title: '',
    narrative: '',
    sections: [],
    conclusion: '',
  },
  visualizations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: DataStorytellingRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackStory, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Data Storytelling Specialist',
      mission: 'Create compelling narrative from data',
      context: {
        data: body.data,
        narrative: body.narrative,
        audience: body.audience,
        keyPoints: body.keyPoints || [],
      },
      instructions: [
        'Create engaging title',
        'Develop narrative structure',
        'Integrate data into story',
        'Suggest visualizations',
        'Write compelling conclusion',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          story: {
            title: 'string',
            narrative: 'string',
            sections: 'array of {heading, content, data}',
            conclusion: 'string',
          },
          visualizations: 'array of {type, data, description}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<DataStorytellingResponse>(result.text, fallbackStory);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error creating data story:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to create data story',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackStory, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
