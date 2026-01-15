import { NextRequest, NextResponse } from 'next/server';
import { 
  aiService, 
  buildComprehensiveContext, 
  parseInsightsResponse,
  formatResponse,
  type TargetData,
  type LeadData,
  type AIRequestWithTimeFrame 
} from '@/lib/ai';

interface AttendanceData {
  hoursWorked: number;
  expectedHours: number;
  attendanceRate: number;
  punctualityScore: number;
}

interface ProfileData {
  uid: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  department?: string;
}

interface InsightRequest extends AIRequestWithTimeFrame {
  targetData: TargetData[];
  attendanceData?: AttendanceData;
  profileData?: ProfileData;
  leadsData?: LeadData[];
  type: 'performance' | 'goals' | 'recommendations' | 'lead_analysis' | 'sales_strategy' | 'comprehensive_performance';
  targetCategories?: Record<string, TargetData[]>;
  feasibilityMetrics?: Record<string, any>;
  currentDate?: string;
}

function determineUrgencyLevel(targetData: TargetData[]): 'low' | 'medium' | 'high' | 'critical' {
  const overallProgress = targetData.reduce((sum, target) => sum + target.progress, 0) / targetData.length;
  const criticalCategories = targetData.filter(
    (t) => ['sales', 'clients'].includes(t.category) && t.progress === 0,
  );

  if (criticalCategories.length > 1 || overallProgress < 10) return 'critical';
  if (overallProgress < 30) return 'high';
  if (overallProgress < 60) return 'medium';
  return 'low';
}

function getFallbackResponse(body: InsightRequest) {
  return {
    insights: [
      'Focus on your highest-value targets this week to maximize impact.',
      'Schedule follow-ups with warm leads within the next 2 business days.',
      'Review your pipeline for conversion opportunities and potential bottlenecks.',
      'Set aside time daily for prospecting new leads in your target market.',
      'Analyze successful closed deals to replicate winning strategies.',
      'Prioritize relationship-building activities to strengthen your network.',
    ],
    feasibilityAnalysis: [
      'Block calendar time for high-priority prospecting activities',
      'Create a standardized follow-up sequence for new leads',
      'Set weekly goals that align with monthly targets',
      'Schedule regular pipeline reviews to identify opportunities',
    ],
    actionableRecommendations: [
      'Call your top 3 warm leads today',
      'Send follow-up emails to recent inquiries',
      'Update CRM with latest contact information',
      "Review and prioritize this week's activities",
    ],
    urgencyLevel: determineUrgencyLevel(body.targetData),
    summary: `Based on your current performance, you're making solid progress toward your targets. Focus on consistent daily activities and strategic follow-ups to maintain momentum.`,
    recommendations: [
      'Block calendar time for high-priority prospecting activities',
      'Create a standardized follow-up sequence for new leads',
      'Set weekly goals that align with monthly targets',
      'Schedule regular pipeline reviews to identify opportunities',
    ],
    quickActions: [
      'Call your top 3 warm leads today',
      'Send follow-up emails to recent inquiries',
      'Update CRM with latest contact information',
      "Review and prioritize this week's activities",
    ],
    type: body.type,
    timeFrame: body.timeFrame,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: InsightRequest = await request.json();

    // Normalize target data
    if (body.targetData) {
      body.targetData = body.targetData.map(target => ({
        ...target,
        currentValue: typeof target.currentValue === 'string' ? parseFloat(target.currentValue) || 0 : target.currentValue,
        targetValue: typeof target.targetValue === 'string' ? parseFloat(target.targetValue) || 0 : target.targetValue,
      }));
    }

    // Check if AI service is configured
    if (!aiService.isConfigured()) {
      console.warn('Google AI API key not configured, using fallback insights');
      return NextResponse.json(formatResponse(getFallbackResponse(body), true, body.dataHash));
    }

    // Build context
    const context = buildComprehensiveContext({
      targetData: body.targetData,
      southAfricanContext: {
        industry: body.profileData?.department,
        includeEconomicContext: true,
        includeCulturalContext: true,
      },
      personalization: body.profileData ? {
        recipientName: `${body.profileData.name} ${body.profileData.surname}`,
        role: body.profileData.role,
        companyName: body.profileData.department,
      } : undefined,
      customContext: {
        attendanceData: body.attendanceData,
        leadsData: body.leadsData,
        timeFrame: body.timeFrame,
        type: body.type,
      },
    });

    // Build prompt using shared service
    const prompt = aiService.buildPrompt({
      role: 'an AI Sales Coach and CRM Assistant with expertise in sales performance, lead management, and business development',
      mission: 'Generate comprehensive performance insights and actionable recommendations',
      context: {
        timeFrame: body.timeFrame,
        analysisType: body.type,
        user: body.profileData ? `${body.profileData.name} ${body.profileData.surname} (${body.profileData.role})` : 'User',
        department: body.profileData?.department || 'Sales',
      },
      instructions: [
        'Provide a 2-3 sentence summary of current performance and key focus areas',
        'Generate 4-6 specific, actionable insights about performance, opportunities, and strategies',
        'Provide 3-4 strategic recommendations for improvement',
        'Suggest 3-4 immediate actions to take today/this week',
      ],
      outputFormat: {
        type: 'structured',
        sections: ['SUMMARY', 'INSIGHTS', 'RECOMMENDATIONS', 'QUICK_ACTIONS'],
      },
      limits: {
        maxItems: 6,
      },
    });

    const fullPrompt = context + '\n' + prompt;

    // Generate content
    const result = await aiService.generateContent(fullPrompt);
    const parsedResponse = parseInsightsResponse(result.text);

    return NextResponse.json({
      ...formatResponse(parsedResponse, false, body.dataHash),
      feasibilityAnalysis: parsedResponse.recommendations,
      actionableRecommendations: parsedResponse.quickActions,
      urgencyLevel: determineUrgencyLevel(body.targetData),
      type: body.type,
      timeFrame: body.timeFrame,
    });

  } catch (error: unknown) {
    console.error('Error generating insights:', error);
    const errorResponse = aiService.handleError(error);
    
    const fallbackInsights = [
      errorResponse.errorType === 'api_key'
        ? 'AI insights require a valid API key to function. Please contact your administrator.'
        : errorResponse.errorType === 'model_unavailable'
        ? 'AI model is temporarily unavailable. Using fallback insights based on your data.'
        : 'Unable to generate AI insights at this time. Please try again later.',
      'Review your current targets and focus on high-priority activities.',
      'Consider reaching out to recent leads for immediate opportunities.',
      'Analyze your sales pipeline for conversion opportunities.',
    ];

    const body = await request.json().catch(() => ({})) as InsightRequest;
    const fallback = getFallbackResponse(body);

    return NextResponse.json(
      {
        error: 'Failed to generate insights',
        errorType: errorResponse.errorType,
        ...formatResponse({
          insights: fallbackInsights,
          summary: errorResponse.errorType === 'model_unavailable'
            ? 'AI insights are temporarily unavailable, but your performance data shows continued progress. Focus on core activities.'
            : 'Focus on your core activities and maintain consistent effort toward your goals.',
          recommendations: fallback.recommendations,
          quickActions: fallback.quickActions,
        }, true, body.dataHash),
        urgencyLevel: determineUrgencyLevel(body.targetData || []),
        type: body.type,
        timeFrame: body.timeFrame,
      },
      { status: errorResponse.errorType === 'api_key' ? 401 : errorResponse.errorType === 'rate_limit' ? 429 : 500 }
    );
  }
}
