import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface AssignmentSuggestionsRequest extends BaseAIRequest {
  task: {
    title: string;
    description: string;
    requiredSkills?: string[];
    complexity?: string;
    deadline?: string;
  };
  teamMembers: Array<{
    id: string;
    name: string;
    skills: string[];
    currentWorkload: number;
    availability: number;
    experience?: string;
  }>;
}

interface AssignmentSuggestionsResponse {
  suggestions: Array<{
    memberId: string;
    memberName: string;
    matchScore: number;
    reasoning: string;
    pros: string[];
    cons: string[];
  }>;
  recommended: {
    memberId: string;
    memberName: string;
    rationale: string;
  };
  alternatives: Array<{
    memberId: string;
    memberName: string;
    whenToUse: string;
  }>;
  warnings: string[];
}

const fallbackSuggestions: AssignmentSuggestionsResponse = {
  suggestions: [],
  recommended: {
    memberId: '',
    memberName: '',
    rationale: 'Based on skills and availability',
  },
  alternatives: [],
  warnings: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: AssignmentSuggestionsRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackSuggestions, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Resource Allocation Specialist with expertise in team management',
      mission: 'Suggest optimal task assignment based on skills, workload, and availability',
      context: {
        task: body.task,
        teamMembers: body.teamMembers,
      },
      instructions: [
        'Match task requirements with team member skills',
        'Consider current workload and availability',
        'Calculate match scores for each member',
        'Recommend best assignment with rationale',
        'Provide alternatives for different scenarios',
        'Identify potential issues or warnings',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          suggestions: 'array of {memberId, memberName, matchScore, reasoning, pros, cons}',
          recommended: {
            memberId: 'string',
            memberName: 'string',
            rationale: 'string',
          },
          alternatives: 'array of {memberId, memberName, whenToUse}',
          warnings: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1536,
    });

    const parsed = parseJSONResponse<AssignmentSuggestionsResponse>(result.text, fallbackSuggestions);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error suggesting assignments:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to suggest assignments',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackSuggestions, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
