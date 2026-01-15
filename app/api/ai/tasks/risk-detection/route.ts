import { NextRequest, NextResponse } from 'next/server';
import {
  aiService,
  parseJSONResponse,
  formatResponse,
  type BaseAIRequest,
} from '@/lib/ai';

interface RiskDetectionRequest extends BaseAIRequest {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    deadline?: string;
    dependencies?: string[];
    progress: number;
    assignee?: string;
    complexity?: string;
  }>;
  projectContext?: {
    deadline?: string;
    criticalPath?: string[];
    resources?: string[];
  };
}

interface RiskDetectionResponse {
  risks: Array<{
    taskId: string;
    title: string;
    riskType: 'schedule' | 'resource' | 'dependency' | 'quality' | 'scope';
    severity: 'critical' | 'high' | 'medium' | 'low';
    probability: number;
    impact: string;
    mitigation: string;
  }>;
  summary: {
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
  };
  recommendations: Array<{
    action: string;
    riskType: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  earlyWarning: Array<{
    indicator: string;
    taskId: string;
    action: string;
  }>;
}

const fallbackRisks: RiskDetectionResponse = {
  risks: [],
  summary: {
    criticalRisks: 0,
    highRisks: 0,
    mediumRisks: 0,
    lowRisks: 0,
  },
  recommendations: [],
  earlyWarning: [],
};

export async function POST(request: NextRequest) {
  try {
    const body: RiskDetectionRequest = await request.json();

    if (!aiService.isConfigured()) {
      return NextResponse.json(formatResponse(fallbackRisks, true, body.dataHash));
    }

    const prompt = aiService.buildPrompt({
      role: 'an AI Risk Management Specialist with expertise in project risk analysis',
      mission: 'Detect and analyze risks in tasks and projects',
      context: {
        tasks: body.tasks,
        projectContext: body.projectContext || {},
      },
      instructions: [
        'Identify risks across multiple dimensions (schedule, resource, dependency, quality, scope)',
        'Assess severity and probability for each risk',
        'Categorize risks by type',
        'Develop mitigation strategies',
        'Provide early warning indicators',
        'Prioritize recommendations',
      ],
      outputFormat: {
        type: 'json',
        schema: {
          risks: 'array of {taskId, title, riskType, severity, probability, impact, mitigation}',
          summary: {
            criticalRisks: 'number',
            highRisks: 'number',
            mediumRisks: 'number',
            lowRisks: 'number',
          },
          recommendations: 'array of {action, riskType, priority}',
          earlyWarning: 'array of {indicator, taskId, action}',
        },
      },
    });

    const result = await aiService.generateContent(prompt, {
      temperature: 0.6,
      maxOutputTokens: 2048,
    });

    const parsed = parseJSONResponse<RiskDetectionResponse>(result.text, fallbackRisks);

    return NextResponse.json(formatResponse(parsed, false, body.dataHash));

  } catch (error: unknown) {
    console.error('Error detecting risks:', error);
    const errorResponse = aiService.handleError(error);
    
    return NextResponse.json(
      {
        error: 'Failed to detect risks',
        errorType: errorResponse.errorType,
        ...formatResponse(fallbackRisks, true),
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : 500 }
    );
  }
}
