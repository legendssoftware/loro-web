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
        | 'sales_strategy';
    dataHash?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

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



export async function POST(request: NextRequest) {
    try {
        const body: InsightRequest = await request.json();

        // Handle missing API key with comprehensive fallback
        if (!process.env.GOOGLE_AI_API_KEY) {
            console.warn(
                'Google AI API key not configured, using fallback insights',
            );
            return NextResponse.json({
                insights: [
                    'Focus on your highest-value targets this week to maximize impact.',
                    'Schedule follow-ups with warm leads within the next 2 business days.',
                    'Review your pipeline for conversion opportunities and potential bottlenecks.',
                    'Set aside time daily for prospecting new leads in your target market.',
                    'Analyze successful closed deals to replicate winning strategies.',
                    'Prioritize relationship-building activities to strengthen your network.',
                ],
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
                generatedAt: new Date().toISOString(),
                dataHash: body.dataHash,
                type: body.type,
                timeFrame: body.timeFrame,
                usingFallback: true,
            });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = createComprehensivePrompt(body);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Parse the comprehensive response into sections
        const parsedResponse = parseComprehensiveResponse(text);

        return NextResponse.json({
            ...parsedResponse,
            generatedAt: new Date().toISOString(),
            dataHash: body.dataHash,
            type: body.type,
            timeFrame: body.timeFrame,
            usingFallback: false,
        });
    } catch (error: unknown) {
        console.error('Error generating insights:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate insights',
                insights: [
                    'Unable to generate AI insights at this time. Please try again later.',
                    'Review your current targets and focus on high-priority activities.',
                    'Consider reaching out to recent leads for immediate opportunities.',
                    'Analyze your sales pipeline for conversion opportunities.',
                ],
                summary:
                    'Focus on your core activities and maintain consistent effort toward your goals.',
                recommendations: [
                    'Review your pipeline manually for immediate opportunities',
                    'Follow up with recent leads and prospects',
                    'Set clear daily and weekly activity goals',
                ],
                quickActions: [
                    'Contact warm leads from this week',
                    'Update your CRM with recent activities',
                    "Plan tomorrow's priority activities",
                ],
                generatedAt: new Date().toISOString(),
                usingFallback: true,
            },
            { status: 500 },
        );
    }
}
