import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface PredictiveModelingRequest extends BaseAIRequest {
  data: Array<Record<string, any>>;
  target: string;
  features: string[];
  objective: string;
}

interface PredictiveModelingResponse {
  model: {
    type: string;
    accuracy: number;
    features: Array<{
      feature: string;
      importance: number;
    }>;
  };
  predictions: Array<{
    input: Record<string, any>;
    prediction: number;
    confidence: number;
  }>;
  insights: string[];
}

const fallbackModel: PredictiveModelingResponse = {
  model: {
    type: '',
    accuracy: 0,
    features: [],
  },
  predictions: [],
  insights: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: PredictiveModelingRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackModel, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Predictive Modeling Specialist',
      mission: 'Build predictive models from data',
      context: {
        data: body.data,
        target: body.target,
        features: body.features,
        objective: body.objective,
      },
      instructions: [
        'Analyze data patterns',
        'Identify key features',
        'Build predictive model',
        'Calculate accuracy',
        'Generate predictions',
        'Provide insights',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          model: {
            type: 'string',
            accuracy: 'number',
            features: 'array of {feature, importance}',
          },
          predictions: 'array of {input, prediction, confidence}',
          insights: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<PredictiveModelingResponse>(result.text, fallbackModel);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error building predictive model:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to build predictive model',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackModel, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
