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

interface ProfileData {
    uid: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    department?: string;
}

interface SalesActionRequest {
    leadsData: LeadData[];
    timeFrame: 'today' | 'this_week' | 'this_month';
    userProfile: ProfileData;
    priorityFocus: 'high_value' | 'quick_wins' | 'nurture' | 'conversion';
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

function createSalesActionPrompt(request: SalesActionRequest): string {
    const { leadsData, timeFrame, userProfile, priorityFocus } = request;

    return `You are an AI Sales Coach generating actionable sales recommendations.

CONTEXT:
- User: ${userProfile.name} ${userProfile.surname} (${userProfile.role})
- Time Frame: ${timeFrame}
- Priority Focus: ${priorityFocus}
- Number of Leads: ${leadsData.length}

LEADS DATA: ${JSON.stringify(leadsData, null, 2)}

GENERATE SALES ACTIONS with the following sections:

1. ACTIONS: 3-5 strategic actions to take for ${timeFrame}
2. PRIORITY_TASKS: 3-4 high-priority tasks to focus on first
3. CONTACT_SUGGESTIONS: Specific contact recommendations with lead IDs, actions, reasons, and timing

RESPONSE FORMAT (use these exact section headers):
=== ACTIONS ===
• [Strategic action 1]
• [Strategic action 2]
• [Strategic action 3]
• [Strategic action 4]
• [Strategic action 5]

=== PRIORITY_TASKS ===
• [High-priority task 1]
• [High-priority task 2]
• [High-priority task 3]
• [High-priority task 4]

=== CONTACT_SUGGESTIONS ===
Lead ID: [uid] | Action: [specific action] | Reason: [why this action] | Timing: [when to do it]
Lead ID: [uid] | Action: [specific action] | Reason: [why this action] | Timing: [when to do it]
Lead ID: [uid] | Action: [specific action] | Reason: [why this action] | Timing: [when to do it]

Focus on ${priorityFocus} opportunities and provide specific, actionable guidance for ${timeFrame}.`;
}

function parseSalesActionResponse(text: string): {
    actions: string[];
    priorityTasks: string[];
    contactSuggestions: Array<{
        leadId: number;
        action: string;
        reason: string;
        timing: string;
    }>;
} {
    const result = {
        actions: [] as string[],
        priorityTasks: [] as string[],
        contactSuggestions: [] as Array<{
            leadId: number;
            action: string;
            reason: string;
            timing: string;
        }>,
    };

    try {
        // Parse actions
        const actionsMatch = text.match(/=== ACTIONS ===([\s\S]*?)(?====|$)/);
        if (actionsMatch) {
            result.actions = actionsMatch[1]
                .split('•')
                .filter((item) => item.trim().length > 0)
                .map((item) => item.trim())
                .slice(0, 5);
        }

        // Parse priority tasks
        const priorityMatch = text.match(/=== PRIORITY_TASKS ===([\s\S]*?)(?====|$)/);
        if (priorityMatch) {
            result.priorityTasks = priorityMatch[1]
                .split('•')
                .filter((item) => item.trim().length > 0)
                .map((item) => item.trim())
                .slice(0, 4);
        }

        // Parse contact suggestions
        const contactMatch = text.match(/=== CONTACT_SUGGESTIONS ===([\s\S]*?)(?====|$)/);
        if (contactMatch) {
            const contactLines = contactMatch[1]
                .split('\n')
                .filter((line) => line.includes('Lead ID:'))
                .slice(0, 10);

            result.contactSuggestions = contactLines.map((line) => {
                const parts = line.split(' | ');
                const leadIdMatch = parts[0]?.match(/Lead ID: (\d+)/);
                const actionMatch = parts[1]?.match(/Action: (.+)/);
                const reasonMatch = parts[2]?.match(/Reason: (.+)/);
                const timingMatch = parts[3]?.match(/Timing: (.+)/);

                return {
                    leadId: leadIdMatch ? parseInt(leadIdMatch[1]) : 0,
                    action: actionMatch ? actionMatch[1].trim() : 'Follow up',
                    reason: reasonMatch ? reasonMatch[1].trim() : 'Maintain engagement',
                    timing: timingMatch ? timingMatch[1].trim() : 'Today',
                };
            });
        }

        // Fallback if parsing fails
        if (result.actions.length === 0) {
            result.actions = [
                'Review and prioritize your lead pipeline',
                'Focus on high-value prospects for immediate follow-up',
                'Schedule regular check-ins with warm leads',
                'Update CRM with recent interactions',
            ];
        }

        if (result.priorityTasks.length === 0) {
            result.priorityTasks = [
                'Contact top 3 qualified leads today',
                'Follow up on pending proposals',
                'Update lead status in CRM',
                'Schedule next week\'s sales activities',
            ];
        }
    } catch (error) {
        console.error('Error parsing sales action response:', error);
    }

    return result;
}

export async function POST(request: NextRequest) {
    try {
        const body: SalesActionRequest = await request.json();
        
        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: 'Google AI API key not configured' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = createSalesActionPrompt(body);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const parsedResult = parseSalesActionResponse(text);

        return NextResponse.json(parsedResult);
    } catch (error) {
        console.error('Error generating sales actions:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate sales actions',
                actions: ['Review your pipeline and prioritize high-value leads'],
                priorityTasks: ['Follow up with recent inquiries'],
                contactSuggestions: [],
            },
            { status: 500 }
        );
    }
} 