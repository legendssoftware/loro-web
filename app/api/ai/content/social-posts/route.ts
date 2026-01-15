import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface SocialPostsRequest extends BaseAIRequest {
  topic: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  tone?: string;
  hashtags?: boolean;
  callToAction?: string;
}

interface SocialPostsResponse {
  posts: Array<{
    content: string;
    hashtags?: string[];
    characterCount: number;
  }>;
  variations: string[];
  bestPractices: string[];
}

const fallbackPosts: SocialPostsResponse = {
  posts: [],
  variations: [],
  bestPractices: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: SocialPostsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPosts, true, body.dataHash));
    }

    const saContext = buildSouthAfricanContext({
      includeCulturalContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Social Media Content Creator',
      mission: 'Generate engaging social media posts',
      context: {
        topic: body.topic,
        platform: body.platform,
        tone: body.tone || 'professional',
        hashtags: body.hashtags !== false,
        callToAction: body.callToAction,
      },
      instructions: [
        'Create platform-appropriate content',
        'Include relevant hashtags if requested',
        'Match character limits for platform',
        'Provide multiple variations',
        'Consider South African context',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          posts: 'array of {content, hashtags, characterCount}',
          variations: 'array of strings',
          bestPractices: 'array of strings',
        },
      },
    });

    const fullPrompt = saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.8,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<SocialPostsResponse>(result.text, fallbackPosts);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating social posts:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate social posts',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPosts, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
