import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Types
interface EmailTemplateRequest {
    recipientName: string;
    insights: string[];
    targetMetrics: any;
    tone: 'professional' | 'encouraging' | 'motivational';
}

export async function POST(request: NextRequest) {
    try {
        const body: EmailTemplateRequest = await request.json();
        const { recipientName, insights, targetMetrics, tone } = body;

        // Check if API key is available
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json({
                template: `Subject: Setup Required - Free AI API

🔑 To generate email templates, you need a FREE Google API key!

Get yours here: https://aistudio.google.com/app/apikey
- No credit card required
- Generous free tier
- Takes 2 minutes to set up

Add to .env.local: GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
Then restart your development server.

Best regards,
Your AI Assistant`
            });
        }

        const model = google('gemini-1.5-flash');

        const prompt = `
Create a professional email template with the following details:

Recipient: ${recipientName}
Tone: ${tone}
Key Insights: ${insights.join(', ')}
Target Metrics Summary: ${JSON.stringify(targetMetrics, null, 2)}

The email should:
1. Have a clear subject line
2. Be encouraging and constructive
3. Highlight key achievements and areas for improvement
4. Include specific metrics and progress
5. End with actionable next steps
6. Maintain a ${tone} tone throughout

Format the email with proper structure including subject, greeting, body paragraphs, and closing.
`;

        const { text } = await generateText({
            model,
            prompt,
            maxTokens: 1500,
            temperature: 0.6,
        });

        return NextResponse.json({ template: text });
        } catch (error) {
        console.error('Error generating email template:', error);

        const errorMessage = (error as any)?.message || String(error);
        if (errorMessage.includes('API key') || errorMessage.includes('GOOGLE_GENERATIVE_AI_API_KEY')) {
            return NextResponse.json({
                template: `Subject: Setup Required - Free AI API

🔑 To generate email templates, you need a FREE Google API key!

Get yours here: https://aistudio.google.com/app/apikey
- No credit card required
- Generous free tier
- Takes 2 minutes to set up

Add to .env.local: GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
Then restart your development server.

Best regards,
Your AI Assistant`
            });
        }

        return NextResponse.json({
            template: `Subject: Performance Update

Dear Team Member,

I hope this email finds you well. I wanted to share some insights about your recent performance and targets.

Your recent metrics show areas of both achievement and opportunity for growth. Please review your dashboard for detailed information.

Best regards,
Your Performance Team`
        });
    }
}
