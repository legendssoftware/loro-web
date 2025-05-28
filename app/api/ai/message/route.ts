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

interface MessageTemplateRequest {
    recipientName: string;
    recipientPhone: string;
    messageType: 'sms' | 'whatsapp';
    templateType: 'follow_up' | 'appointment' | 'reminder' | 'promotion' | 'thank_you';
    leadData?: LeadData;
    customMessage?: string;
    tone: 'professional' | 'friendly' | 'urgent';
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

function createMessagePrompt(request: MessageTemplateRequest): string {
    const { recipientName, messageType, templateType, tone, leadData, customMessage } = request;

    const characterLimit = messageType === 'sms' ? 160 : 300;

    return `You are an AI Message Writing Assistant specialized in CRM and sales communication via ${messageType.toUpperCase()}. Create a concise, engaging message.

RECIPIENT: ${recipientName}
MESSAGE TYPE: ${messageType}
TEMPLATE TYPE: ${templateType}
TONE: ${tone}
CHARACTER LIMIT: ${characterLimit}
${leadData ? `LEAD CONTEXT: ${JSON.stringify(leadData, null, 2)}` : ''}
${customMessage ? `CUSTOM MESSAGE: ${customMessage}` : ''}

MESSAGE GUIDELINES:
- Keep under ${characterLimit} characters for ${messageType}
- Include recipient's name naturally
- Clear call-to-action
- Professional yet conversational
- No excessive punctuation or emojis
- Make it personal and relevant

TEMPLATE TYPE SPECIFICS:

${templateType === 'follow_up' ? `
FOLLOW-UP MESSAGE:
- Reference previous interaction
- Provide quick value or update
- Gentle nudge for response
- Easy way to continue conversation` : ''}

${templateType === 'appointment' ? `
APPOINTMENT MESSAGE:
- Confirm or request meeting time
- Include key details (date/time/location)
- Easy confirmation method
- Professional scheduling tone` : ''}

${templateType === 'reminder' ? `
REMINDER MESSAGE:
- Friendly reminder about commitment
- Include relevant details
- Clear next steps
- Helpful and considerate tone` : ''}

${templateType === 'promotion' ? `
PROMOTIONAL MESSAGE:
- Highlight key benefit/offer
- Create appropriate urgency
- Clear value proposition
- Easy way to take action` : ''}

${templateType === 'thank_you' ? `
THANK YOU MESSAGE:
- Express genuine gratitude
- Reference specific interaction
- Maintain relationship warmth
- Optional next steps` : ''}

RESPONSE FORMAT:
Return a JSON object with these exact keys:
{
  "message": "The complete message text under ${characterLimit} characters",
  "fallbackMessage": "Shorter version if needed (optional)"
}

Use ${tone} tone and make it sound natural and very human like for ${messageType} communication.`;
}

export async function POST(request: NextRequest) {
    try {
        const body: MessageTemplateRequest = await request.json();

        if (!process.env.GOOGLE_AI_API_KEY) {
            return NextResponse.json(
                { error: 'AI service not configured' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = createMessagePrompt(body);

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        try {
            // Try to parse as JSON first
            const jsonResponse = JSON.parse(text);
            return NextResponse.json(jsonResponse);
        } catch {
            // Fallback with simple message
            const fallbackMessage = `Hi ${body.recipientName}, hope you're doing well! Let me know if you need any assistance. Thanks!`;

            return NextResponse.json({
                message: fallbackMessage,
                fallbackMessage: `Hi ${body.recipientName}, hope you're well! Let me know if you need help.`
            });
        }

    } catch (error: unknown) {
        console.error('Error generating message template:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate message template',
                message: 'Hi there! Hope you\'re doing well. Let me know if you need any assistance. Thanks!',
                fallbackMessage: 'Hi! Hope you\'re well. Let me know if you need help.'
            },
            { status: 500 }
        );
    }
}
