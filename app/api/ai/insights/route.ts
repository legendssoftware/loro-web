import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Enhanced types for better TypeScript support
interface TargetData {
    currentValue: number;
    targetValue: number;
    progress: number;
    period: string;
    category: string;
}

interface AttendanceData {
    hoursWorked: number;
    expectedHours: number;
    attendanceRate: number;
    punctualityScore: number;
}

interface LeadData {
    uid: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    score?: number;
    lastContact?: string;
    source: string;
    value?: number;
    assignee?: string;
}

interface ProfileData {
    uid: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    department?: string;
}

interface InsightRequest {
    targetData: TargetData[];
    attendanceData?: AttendanceData;
    profileData?: ProfileData;
    leadsData?: LeadData[];
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    type:
        | 'performance'
        | 'goals'
        | 'recommendations'
        | 'lead_analysis'
        | 'sales_strategy'
        | 'comprehensive_performance';
    dataHash?: string;
    targetCategories?: Record<string, TargetData[]>;
    feasibilityMetrics?: Record<string, any>;
    currentDate?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Model fallback strategy: Try newer models first, then fall back to older ones
// This handles the case where gemini-pro is deprecated and no longer available

// Enhanced comprehensive prompt that generates all sections in one response
function createComprehensivePrompt(request: InsightRequest): string {
    const {
        targetData,
        attendanceData,
        profileData,
        leadsData,
        timeFrame,
        type,
    } = request;

    return `You are an AI Sales Coach and CRM Assistant with expertise in sales performance, lead management, and business development.

CONTEXT:
- Time Frame: ${timeFrame}
- Analysis Type: ${type}
- User: ${profileData?.name} ${profileData?.surname} (${profileData?.role})
- Department: ${profileData?.department || 'Sales'}

TARGET DATA: ${JSON.stringify(targetData, null, 2)}
${attendanceData ? `ATTENDANCE DATA: ${JSON.stringify(attendanceData, null, 2)}` : ''}
${leadsData ? `LEADS DATA: ${JSON.stringify(leadsData, null, 2)}` : ''}

GENERATE A COMPREHENSIVE RESPONSE with the following sections:

1. SUMMARY: A 2-3 sentence overview of current performance and key focus areas
2. INSIGHTS: 4-6 specific, actionable insights about performance, opportunities, and strategies
3. RECOMMENDATIONS: 3-4 strategic recommendations for improvement
4. QUICK_ACTIONS: 3-4 immediate actions to take today/this week

RESPONSE FORMAT (use these exact section headers):
=== SUMMARY ===
[2-3 sentence performance overview]

=== INSIGHTS ===
• [Insight 1: Specific and actionable]
• [Insight 2: Performance-focused]
• [Insight 3: Strategy-oriented]
• [Insight 4: Opportunity-based]
• [Insight 5: Goal-focused]
• [Insight 6: Relationship-building]

=== RECOMMENDATIONS ===
• [Strategic recommendation 1]
• [Strategic recommendation 2]
• [Strategic recommendation 3]
• [Strategic recommendation 4]

=== QUICK_ACTIONS ===
• [Immediate action 1]
• [Immediate action 2]
• [Immediate action 3]
• [Immediate action 4]

Keep each item concise (2-4 sentences), actionable, and relevant to ${timeFrame} success. Focus on sales performance, lead conversion, and CRM effectiveness.`;
}

// Parse the comprehensive AI response into structured sections
function parseComprehensiveResponse(text: string): {
    insights: string[];
    summary: string;
    recommendations: string[];
    quickActions: string[];
} {
    const sections = {
        insights: [] as string[],
        summary: '',
        recommendations: [] as string[],
        quickActions: [] as string[],
    };

    try {
        // Split into sections (using [\s\S] instead of . with s flag for compatibility)
        const summaryMatch = text.match(/=== SUMMARY ===([\s\S]*?)(?====|$)/);
        const insightsMatch = text.match(/=== INSIGHTS ===([\s\S]*?)(?====|$)/);
        const recommendationsMatch = text.match(
            /=== RECOMMENDATIONS ===([\s\S]*?)(?====|$)/,
        );
        const quickActionsMatch = text.match(
            /=== QUICK_ACTIONS ===([\s\S]*?)(?====|$)/,
        );

        // Parse summary
        if (summaryMatch) {
            sections.summary = summaryMatch[1].trim().replace(/\n/g, ' ');
        }

        // Parse insights
        if (insightsMatch) {
            sections.insights = insightsMatch[1]
                .split('•')
                .filter((item) => item.trim().length > 0)
                .map((item) => item.trim())
                .slice(0, 6);
        }

        // Parse recommendations
        if (recommendationsMatch) {
            sections.recommendations = recommendationsMatch[1]
                .split('•')
                .filter((item) => item.trim().length > 0)
                .map((item) => item.trim())
                .slice(0, 4);
        }

        // Parse quick actions
        if (quickActionsMatch) {
            sections.quickActions = quickActionsMatch[1]
                .split('•')
                .filter((item) => item.trim().length > 0)
                .map((item) => item.trim())
                .slice(0, 4);
        }

        // Fallback if parsing fails
        if (sections.insights.length === 0) {
            sections.insights = text
                .split('•')
                .filter((item) => item.trim().length > 0)
                .map((item) => item.trim())
                .slice(0, 6);
        }
    } catch (error) {
        console.error('Error parsing comprehensive response:', error);
        // Return fallback content
        sections.insights = [
            'Focus on high-priority activities to maximize your impact',
            'Schedule consistent follow-ups with warm prospects',
            'Review your pipeline regularly for conversion opportunities',
            'Set clear daily goals aligned with monthly targets',
        ];
        sections.summary =
            'Continue focusing on your core activities and maintain momentum toward your goals.';
        sections.recommendations = [
            'Prioritize high-value prospects in your pipeline',
            'Create a structured follow-up schedule',
            'Set weekly review sessions for pipeline analysis',
        ];
        sections.quickActions = [
            'Contact your top 3 prospects today',
            'Update CRM with recent interactions',
            "Plan tomorrow's priority activities",
        ];
    }

    return sections;
}

// Determine urgency level based on target progress
function determineUrgencyLevel(
    targetData: TargetData[],
): 'low' | 'medium' | 'high' | 'critical' {
    const overallProgress =
        targetData.reduce((sum, target) => sum + target.progress, 0) /
        targetData.length;

    // Check for critical categories with zero progress
    const criticalCategories = targetData.filter(
        (t) => ['sales', 'clients'].includes(t.category) && t.progress === 0,
    );

    if (criticalCategories.length > 1 || overallProgress < 10) {
        return 'critical';
    } else if (overallProgress < 30) {
        return 'high';
    } else if (overallProgress < 60) {
        return 'medium';
    } else {
        return 'low';
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: InsightRequest = await request.json();

        // Normalize target data to ensure numeric values
        if (body.targetData) {
            body.targetData = body.targetData.map(target => ({
                ...target,
                currentValue: typeof target.currentValue === 'string'
                    ? parseFloat(target.currentValue) || 0
                    : target.currentValue,
                targetValue: typeof target.targetValue === 'string'
                    ? parseFloat(target.targetValue) || 0
                    : target.targetValue,
            }));
        }

        // Handle missing API key with comprehensive fallback
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.warn(
                'Google AI API key not configured, using fallback insights',
            );
            const fallbackInsights = [
                'Focus on your highest-value targets this week to maximize impact.',
                'Schedule follow-ups with warm leads within the next 2 business days.',
                'Review your pipeline for conversion opportunities and potential bottlenecks.',
                'Set aside time daily for prospecting new leads in your target market.',
                'Analyze successful closed deals to replicate winning strategies.',
                'Prioritize relationship-building activities to strengthen your network.',
            ];
            const fallbackRecommendations = [
                'Block calendar time for high-priority prospecting activities',
                'Create a standardized follow-up sequence for new leads',
                'Set weekly goals that align with monthly targets',
                'Schedule regular pipeline reviews to identify opportunities',
            ];
            const fallbackQuickActions = [
                'Call your top 3 warm leads today',
                'Send follow-up emails to recent inquiries',
                'Update CRM with latest contact information',
                "Review and prioritize this week's activities",
            ];

            return NextResponse.json({
                insights: fallbackInsights,
                feasibilityAnalysis: fallbackRecommendations,
                actionableRecommendations: fallbackQuickActions,
                urgencyLevel: determineUrgencyLevel(body.targetData),
                summary: `Based on your current performance, you're making solid progress toward your targets. Focus on consistent daily activities and strategic follow-ups to maintain momentum.`,
                recommendations: fallbackRecommendations,
                quickActions: fallbackQuickActions,
                generatedAt: new Date().toISOString(),
                dataHash: body.dataHash,
                type: body.type,
                timeFrame: body.timeFrame,
                usingFallback: true,
            });
        }

        // Try different model names in order of preference
        const modelNames = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
        let result;
        let modelUsed = '';

        for (const modelName of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const prompt = createComprehensivePrompt(body);

                result = await model.generateContent(prompt);
                modelUsed = modelName;
                console.log(`Successfully used model: ${modelName}`);
                break;
            } catch (modelError: any) {
                console.warn(`Failed to use model ${modelName}:`, modelError.message);

                // If this is the last model to try, throw the error
                if (modelName === modelNames[modelNames.length - 1]) {
                    throw modelError;
                }
                continue;
            }
        }

        if (!result) {
            throw new Error('All model attempts failed');
        }

        const response = result.response;
        const text = response.text();

        // Parse the comprehensive response into sections
        const parsedResponse = parseComprehensiveResponse(text);

        return NextResponse.json({
            insights: parsedResponse.insights,
            feasibilityAnalysis: parsedResponse.recommendations,
            actionableRecommendations: parsedResponse.quickActions,
            urgencyLevel: determineUrgencyLevel(body.targetData),
            summary: parsedResponse.summary,
            recommendations: parsedResponse.recommendations,
            quickActions: parsedResponse.quickActions,
            generatedAt: new Date().toISOString(),
            dataHash: body.dataHash,
            type: body.type,
            timeFrame: body.timeFrame,
            usingFallback: false,
        });
    } catch (error: unknown) {
        console.error('Error generating insights:', error);

        // Determine error type and provide appropriate response
        const errorMessage = (error as Error)?.message || String(error);
        let errorType = 'general';
        let statusCode = 500;

        if (errorMessage.includes('API key') || errorMessage.includes('GOOGLE_AI_API_KEY')) {
            errorType = 'api_key';
            statusCode = 401;
        } else if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
            errorType = 'model_unavailable';
            statusCode = 503;
        } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
            errorType = 'rate_limit';
            statusCode = 429;
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
            errorType = 'network';
            statusCode = 503;
        }

        const errorInsights = [
            errorType === 'api_key'
                ? 'AI insights require a valid API key to function. Please contact your administrator.'
                : errorType === 'model_unavailable'
                ? 'AI model is temporarily unavailable. Using fallback insights based on your data.'
                : errorType === 'rate_limit'
                ? 'AI service usage limit reached. Please try again in a few minutes.'
                : errorType === 'network'
                ? 'Network connectivity issue. Please check your connection and try again.'
                : 'Unable to generate AI insights at this time. Please try again later.',
            'Review your current targets and focus on high-priority activities.',
            'Consider reaching out to recent leads for immediate opportunities.',
            'Analyze your sales pipeline for conversion opportunities.',
        ];

        const errorRecommendations = [
            'Review your pipeline manually for immediate opportunities',
            'Follow up with recent leads and prospects',
            'Set clear daily and weekly activity goals',
        ];

        const errorQuickActions = [
            'Contact warm leads from this week',
            'Update your CRM with recent activities',
            "Plan tomorrow's priority activities",
        ];

        return NextResponse.json(
            {
                error: 'Failed to generate insights',
                errorType,
                insights: errorInsights,
                feasibilityAnalysis: errorRecommendations,
                actionableRecommendations: errorQuickActions,
                urgencyLevel: 'medium' as const,
                summary: errorType === 'model_unavailable'
                    ? 'AI insights are temporarily unavailable, but your performance data shows continued progress. Focus on core activities.'
                    : 'Focus on your core activities and maintain consistent effort toward your goals.',
                recommendations: errorRecommendations,
                quickActions: errorQuickActions,
                generatedAt: new Date().toISOString(),
                usingFallback: true,
            },
            { status: statusCode },
        );
    }
}
