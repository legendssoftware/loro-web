import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

// Types
interface InsightRequest {
    targetData: any;
    attendanceData?: any;
    profileData?: any;
    type: 'performance' | 'goals' | 'recommendations';
}

export async function POST(request: NextRequest) {
    try {
        const body: InsightRequest = await request.json();
        const { targetData, attendanceData, profileData, type } = body;

        // Check if API key is available
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json({
                insights: [
                    '🔑 Free Google API key needed! Get yours at: https://aistudio.google.com/app/apikey',
                    "💰 It's completely FREE - no credit card required!",
                    '📝 Add it to your .env.local file as: GOOGLE_GENERATIVE_AI_API_KEY=your_key_here',
                    '🔄 Restart your development server after adding the key'
                ]
            });
        }

        const model = google('gemini-1.5-flash');

        const prompt = `
You are an AI performance analyst. Analyze the following data and provide 3-5 actionable insights for performance improvement.

Target Data: ${JSON.stringify(targetData, null, 2)}
Attendance Data: ${JSON.stringify(attendanceData, null, 2)}
Profile Data: ${JSON.stringify(profileData, null, 2)}

Focus on ${type} analysis. Provide insights that are:
1. Specific and data-driven
2. Actionable with clear next steps
3. Encouraging yet honest
4. Relevant to the user's role and context

Format each insight as a complete sentence starting with a strong action word or observation.
Return only the insights, one per line, without numbering or bullet points.
`;

        const { text } = await generateText({
            model,
            prompt,
            maxTokens: 1000,
            temperature: 0.7,
        });

        // Parse the response into an array of insights
        const insights = text
            .split('\n')
            .filter((line) => line.trim().length > 0)
            .map((line) => line.trim())
            .slice(0, 5);

        return NextResponse.json({ insights });
    } catch (error) {
        console.error('Error generating insights:', error);

        const errorMessage = (error as any)?.message || String(error);
        if (errorMessage.includes('API key') || errorMessage.includes('GOOGLE_GENERATIVE_AI_API_KEY')) {
            return NextResponse.json({
                insights: [
                    '🔑 Free Google API key needed! Get yours at: https://aistudio.google.com/app/apikey',
                    "💰 It's completely FREE - no credit card required!",
                    '📝 Add it to your .env.local file as: GOOGLE_GENERATIVE_AI_API_KEY=your_key_here',
                    '🔄 Restart your development server after adding the key'
                ]
            });
        }

        return NextResponse.json({
            insights: [
                'Unable to generate insights at this time. Please try again later.',
                'For immediate assistance, contact your manager or HR department.'
            ]
        });
    }
}
