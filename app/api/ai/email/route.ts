import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

interface TargetData {
    currentValue: number;
    targetValue: number;
    progress: number;
    period: string;
    category: string;
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

interface EmailTemplateRequest {
    recipientName: string;
    recipientEmail: string;
    insights: string[];
    targetMetrics: TargetData[];
    leadData?: LeadData;
    templateType: 'follow_up' | 'check_in' | 'proposal' | 'nurture' | 'closing';
    tone: 'professional' | 'encouraging' | 'motivational' | 'urgent' | 'friendly';
    customMessage?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

function createEmailPrompt(request: EmailTemplateRequest): string {
    const { recipientName, templateType, tone, leadData, insights, customMessage } = request;

    const basePrompt = `You are an AI Email Writing Assistant specialized in CRM and sales communication. Create a professional, personalized email that drives engagement and conversion.

RECIPIENT: ${recipientName}
EMAIL TYPE: ${templateType}
TONE: ${tone}
${leadData ? `LEAD CONTEXT: ${JSON.stringify(leadData, null, 2)}` : ''}
${insights.length > 0 ? `INSIGHTS: ${insights.join(', ')}` : ''}
${customMessage ? `CUSTOM MESSAGE: ${customMessage}` : ''}

EMAIL GUIDELINES:
- Keep subject line under 50 characters
- Email body should be 150-300 words
- Include a clear call-to-action
- Personalize based on lead data and context
- Make it conversational yet professional
- Focus on value proposition

TEMPLATE TYPE SPECIFICS:`;

    let templateSpecifics = '';

    switch (templateType) {
        case 'follow_up':
            templateSpecifics = `
FOLLOW-UP EMAIL:
- Reference previous conversation or interaction
- Provide value or helpful information
- Gentle nudge without being pushy
- Clear next steps
- Maintain relationship warmth`;
            break;

        case 'check_in':
            templateSpecifics = `
CHECK-IN EMAIL:
- Friendly, relationship-building tone
- Ask about their current situation/needs
- Offer assistance or resources
- Keep it brief and non-salesy
- Show genuine interest`;
            break;

        case 'proposal':
            templateSpecifics = `
PROPOSAL EMAIL:
- Present solution clearly
- Highlight specific benefits
- Include social proof if possible
- Create urgency appropriately
- Make next steps obvious`;
            break;

        case 'nurture':
            templateSpecifics = `
NURTURE EMAIL:
- Provide valuable content/insights
- Build trust and credibility
- No direct sales pitch
- Educational or informative
- Keep them engaged long-term`;
            break;

        case 'closing':
            templateSpecifics = `
CLOSING EMAIL:
- Create appropriate urgency
- Address any final objections
- Summarize key benefits
- Make it easy to say yes
- Include clear next steps`;
            break;
    }

    return basePrompt + templateSpecifics + `

RESPONSE FORMAT:
Return a JSON object with these exact keys:
{
  "subject": "Compelling subject line",
  "body": "Full email body with proper formatting",
  "followUpReminder": "When to follow up if no response"
}

Make the email sound natural, not AI-generated. Use the ${tone} tone throughout.`;
}

export async function POST(request: NextRequest) {
    try {
        const body: EmailTemplateRequest = await request.json();

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = createEmailPrompt(body);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        try {
            // Try to parse as JSON first
            const jsonResponse = JSON.parse(text);
            return NextResponse.json(jsonResponse);
        } catch {
            // Fallback with structured response
            return NextResponse.json({
                subject: `Following up - ${body.recipientName}`,
                body: `Dear ${body.recipientName},

I hope this email finds you well. I wanted to follow up on our previous conversation and see how I can assist you further.

${body.customMessage || 'Based on our discussion, I believe we can help you achieve your goals with our solution.'}

Would you be available for a brief call this week to discuss the next steps?

Best regards,
Your Sales Team`,
                followUpReminder: 'Follow up in 3-5 business days if no response'
            });
        }

    } catch (error: unknown) {
        console.error('Error generating email template:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate email template',
                subject: 'Follow-up Message',
                body: `Dear Valued Contact,

I hope this email finds you well. I wanted to reach out and see how I can assist you further.

Please let me know if you have any questions or if there's anything specific I can help you with.

Best regards,
Your Sales Team`,
                followUpReminder: 'Follow up in 3-5 business days if no response'
            },
            { status: 500 }
        );
    }
}
