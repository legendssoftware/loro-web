import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  buildSouthAfricanContext,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface BlogPostsRequest extends BaseAIRequest {
  topic: string;
  targetAudience: string;
  length?: 'short' | 'medium' | 'long';
  tone?: string;
  keywords?: string[];
}

interface BlogPostsResponse {
  post: {
    title: string;
    introduction: string;
    sections: Array<{
      heading: string;
      content: string;
    }>;
    conclusion: string;
    keyPoints: string[];
  };
  seo: {
    metaDescription: string;
    keywords: string[];
    suggestions: string[];
  };
}

const fallbackPost: BlogPostsResponse = {
  post: {
    title: '',
    introduction: '',
    sections: [],
    conclusion: '',
    keyPoints: [],
  },
  seo: {
    metaDescription: '',
    keywords: [],
    suggestions: [],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: BlogPostsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPost, true, body.dataHash));
    }

    const saContext = buildSouthAfricanContext({
      includeCulturalContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Blog Writer specializing in business content',
      mission: 'Create comprehensive blog post',
      context: {
        topic: body.topic,
        targetAudience: body.targetAudience,
        length: body.length || 'medium',
        tone: body.tone || 'professional',
        keywords: body.keywords || [],
      },
      instructions: [
        'Create engaging title',
        'Write compelling introduction',
        'Structure content with sections',
        'Include key points',
        'Write strong conclusion',
        'Optimize for SEO',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          post: {
            title: 'string',
            introduction: 'string',
            sections: 'array of {heading, content}',
            conclusion: 'string',
            keyPoints: 'array of strings',
          },
          seo: {
            metaDescription: 'string',
            keywords: 'array of strings',
            suggestions: 'array of strings',
          },
        },
      },
    });

    const fullPrompt = saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<BlogPostsResponse>(result.text, fallbackPost);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating blog post:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate blog post',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPost, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
