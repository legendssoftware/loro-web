import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ProjectPlanningRequest extends BaseAIRequest {
  project: {
    name: string;
    description: string;
    objectives: string[];
    deadline?: string;
    budget?: number;
    constraints?: string[];
  };
  resources?: Array<{
    id: string;
    name: string;
    skills: string[];
    availability: number;
  }>;
}

interface ProjectPlanningResponse {
  plan: {
    phases: Array<{
      phase: string;
      duration: string;
      tasks: string[];
      deliverables: string[];
      dependencies: string[];
    }>;
    timeline: Array<{
      milestone: string;
      date: string;
      dependencies: string[];
    }>;
    resources: Array<{
      resourceId: string;
      role: string;
      allocation: number;
      phases: string[];
    }>;
  };
  risks: Array<{
    risk: string;
    mitigation: string;
  }>;
  successCriteria: string[];
  recommendations: string[];
}

const fallbackPlan: ProjectPlanningResponse = {
  plan: {
    phases: [],
    timeline: [],
    resources: [],
  },
  risks: [],
  successCriteria: [],
  recommendations: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ProjectPlanningRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPlan, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Project Planning Specialist with expertise in project management',
      mission: 'Create comprehensive project plan with phases, timeline, and resource allocation',
      context: {
        project: body.project,
        resources: body.resources || [],
      },
      instructions: [
        'Break project into logical phases',
        'Define tasks and deliverables for each phase',
        'Create timeline with milestones',
        'Allocate resources optimally',
        'Identify risks and mitigation strategies',
        'Define success criteria',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          plan: {
            phases: 'array of {phase, duration, tasks, deliverables, dependencies}',
            timeline: 'array of {milestone, date, dependencies}',
            resources: 'array of {resourceId, role, allocation, phases}',
          },
          risks: 'array of {risk, mitigation}',
          successCriteria: 'array of strings',
          recommendations: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<ProjectPlanningResponse>(result.text, fallbackPlan);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error planning project:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to plan project',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPlan, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
