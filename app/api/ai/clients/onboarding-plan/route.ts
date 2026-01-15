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

interface OnboardingPlanRequest extends BaseAIRequest {
  clientData: ClientData;
  products?: string[];
  services?: string[];
  contractValue?: number;
  contractDuration?: string;
  specialRequirements?: string;
}

interface OnboardingPlanResponse {
  plan: {
    phase: string;
    duration: string;
    tasks: Array<{
      task: string;
      owner: string;
      dueDate: string;
      priority: 'high' | 'medium' | 'low';
    }>;
    milestones: string[];
  }[];
  successCriteria: string[];
  riskMitigation: string[];
  communicationPlan: Array<{
    touchpoint: string;
    frequency: string;
    method: string;
    purpose: string;
  }>;
}

const fallbackPlan: OnboardingPlanResponse = {
  plan: [
    {
      phase: 'Initial Setup',
      duration: 'Week 1-2',
      tasks: [
        {
          task: 'Complete account setup',
          owner: 'Account Manager',
          dueDate: 'Within 3 days',
          priority: 'high',
        },
      ],
      milestones: ['Account activated', 'Initial training completed'],
    },
  ],
  successCriteria: ['Client satisfaction', 'All systems operational'],
  riskMitigation: ['Regular check-ins', 'Escalation process'],
  communicationPlan: [
    {
      touchpoint: 'Welcome call',
      frequency: 'Once',
      method: 'Phone',
      purpose: 'Introduce team and process',
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: OnboardingPlanRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackPlan, true, body.dataHash));
    }

    const clientContext = buildClientContext(body.clientData);
    const saContext = buildSouthAfricanContext({
      industry: body.clientData.industry,
      businessSize: body.clientData.businessSize,
      includeEconomicContext: true,
    });

    const prompt = aiService.buildPrompt({
      role: 'an AI Client Onboarding Specialist with expertise in customer success',
      mission: 'Create comprehensive onboarding plan tailored to the client',
      context: {
        clientData: body.clientData,
        products: body.products || [],
        services: body.services || [],
        contractValue: body.contractValue,
        contractDuration: body.contractDuration,
        specialRequirements: body.specialRequirements,
      },
      instructions: [
        'Create phased onboarding plan (3-5 phases)',
        'Define tasks with owners and due dates',
        'Identify key milestones',
        'Establish success criteria',
        'Identify risks and mitigation strategies',
        'Create communication plan',
        'Consider South African business context',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          plan: 'array of {phase, duration, tasks, milestones}',
          successCriteria: 'array of strings',
          riskMitigation: 'array of strings',
          communicationPlan: 'array of {touchpoint, frequency, method, purpose}',
        },
      },
    });

    const fullPrompt = clientContext + '\n' + saContext + '\n' + prompt;

    const result = await aiService.generateContent(fullPrompt, {
      temperature: 0.7,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<OnboardingPlanResponse>(result.text, fallbackPlan);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error generating onboarding plan:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate onboarding plan',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackPlan, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
