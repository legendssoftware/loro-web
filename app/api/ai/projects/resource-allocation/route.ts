import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface ResourceAllocationRequest extends BaseAIRequest {
  project: {
    tasks: Array<{
      id: string;
      title: string;
      requiredSkills: string[];
      estimatedHours: number;
      priority: string;
      deadline?: string;
    }>;
  };
  resources: Array<{
    id: string;
    name: string;
    skills: string[];
    availability: number;
    currentAllocation: number;
    cost?: number;
  }>;
  constraints?: {
    maxCost?: number;
    maxHoursPerResource?: number;
  };
}

interface ResourceAllocationResponse {
  allocation: Array<{
    taskId: string;
    resourceId: string;
    resourceName: string;
    hours: number;
    matchScore: number;
    rationale: string;
  }>;
  utilization: Array<{
    resourceId: string;
    resourceName: string;
    utilization: number;
    tasks: string[];
  }>;
  optimization: {
    efficiency: number;
    cost: number;
    recommendations: string[];
  };
  warnings: string[];
}

const fallbackAllocation: ResourceAllocationResponse = {
  allocation: [],
  utilization: [],
  optimization: {
    efficiency: 0,
    cost: 0,
    recommendations: [],
  },
  warnings: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: ResourceAllocationRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackAllocation, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Resource Optimization Specialist',
      mission: 'Optimize resource allocation across project tasks',
      context: {
        project: body.project,
        resources: body.resources,
        constraints: body.constraints || {},
      },
      instructions: [
        'Match tasks with resources based on skills and availability',
        'Optimize for efficiency and cost',
        'Calculate utilization rates',
        'Identify optimization opportunities',
        'Flag potential issues',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          allocation: 'array of {taskId, resourceId, resourceName, hours, matchScore, rationale}',
          utilization: 'array of {resourceId, resourceName, utilization, tasks}',
          optimization: {
            efficiency: 'number',
            cost: 'number',
            recommendations: 'array of strings',
          },
          warnings: 'array of strings',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<ResourceAllocationResponse>(result.text, fallbackAllocation);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error allocating resources:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to allocate resources',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackAllocation, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
