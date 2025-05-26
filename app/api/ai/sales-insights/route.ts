import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

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

interface TargetData {
    currentValue: number;
    targetValue: number;
    progress: number;
    period: string;
    category: string;
}

interface ProfileData {
    uid: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    department?: string;
}

interface SalesInsightRequest {
    leadsData: LeadData[];
    targetData: TargetData[];
    timeFrame: 'daily' | 'weekly' | 'monthly';
    userProfile: ProfileData;
    previousInsights?: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

function createSalesAnalysisPrompt(request: SalesInsightRequest): string {
    const { leadsData, targetData, timeFrame, userProfile } = request;

    return `You are an AI Sales Coach and Lead Conversion Expert. Analyze the following sales data and provide strategic insights.

CONTEXT:
- Sales Rep: ${userProfile.name} ${userProfile.surname} (${userProfile.role})
- Time Frame: ${timeFrame}
- Total Leads: ${leadsData.length}
- Targets: ${targetData.length} active targets

LEADS DATA:
${JSON.stringify(leadsData, null, 2)}

TARGETS DATA:
${JSON.stringify(targetData, null, 2)}

ANALYSIS REQUIREMENTS:

1. LEAD SCORING & PRIORITIZATION:
   - Identify the top 3-5 leads most likely to convert
   - Score leads based on: status, contact history, value potential, source quality
   - Consider lead age, response patterns, and engagement level

2. CONVERSION STRATEGY:
   - Specific approach for each priority lead
   - Recommended contact method (call, email, in-person)
   - Optimal timing for outreach
   - Key pain points to address

3. TIME-BASED ACTIONS:
   - What to do TODAY for immediate impact
   - This week's strategic priorities
   - Long-term nurturing strategies

4. PIPELINE OPTIMIZATION:
   - Bottlenecks in current pipeline
   - Leads that need immediate attention
   - Follow-up scheduling recommendations

5. TARGET ACHIEVEMENT STRATEGY:
   - Gap analysis between current and target performance
   - Action plan to bridge the gap
   - Resource allocation recommendations

RESPONSE FORMAT:
Return a JSON object with these exact keys:
{
  "insights": ["insight1", "insight2", "insight3", "insight4"],
  "priorityLeads": [
    {
      "uid": leadId,
      "name": "Lead Name",
      "priority": "high|medium|low",
      "conversionProbability": "percentage",
      "recommendedAction": "specific action",
      "timing": "when to contact"
    }
  ],
  "actionableSteps": ["step1", "step2", "step3"],
  "timeBasedSuggestions": [
    "TODAY: specific action",
    "THIS WEEK: strategic priority",
    "LONG-TERM: nurturing strategy"
  ]
}

Keep insights practical, specific, and focused on revenue generation and conversion optimization.`;
}

export async function POST(request: NextRequest) {
    try {
        const body: SalesInsightRequest = await request.json();

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = createSalesAnalysisPrompt(body);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        try {
            // Try to parse as JSON first
            const jsonResponse = JSON.parse(text);
            return NextResponse.json(jsonResponse);
        } catch {
            // Fallback to parsing as structured text
            const insights = text
                .split('\n')
                .filter((line: string) => line.trim().length > 0)
                .slice(0, 4);

            return NextResponse.json({
                insights,
                priorityLeads: [],
                actionableSteps: ['Review leads manually for conversion opportunities'],
                timeBasedSuggestions: [
                    'TODAY: Contact warm leads from the past week',
                    'THIS WEEK: Follow up on pending proposals',
                    'LONG-TERM: Nurture cold leads with valuable content'
                ]
            });
        }

    } catch (error: unknown) {
        console.error('Error generating sales insights:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate sales insights',
                insights: ['Unable to generate sales insights at this time'],
                priorityLeads: [],
                actionableSteps: ['Review your pipeline manually'],
                timeBasedSuggestions: ['Focus on recent high-value leads']
            },
            { status: 500 }
        );
    }
}
