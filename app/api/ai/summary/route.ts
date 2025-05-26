import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetData } = body;

        // Check if API key is available
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return NextResponse.json({
                summary: '🔑 Get your FREE Google API key at: https://aistudio.google.com/app/apikey to unlock AI insights!'
            });
        }

        const model = google('gemini-1.5-flash');

        const prompt = `
Based on this target data, provide a one-sentence performance summary:
${JSON.stringify(targetData, null, 2)}

The summary should be encouraging and highlight the most significant metric or achievement.
`;

        const { text } = await generateText({
            model,
            prompt,
            maxTokens: 100,
            temperature: 0.5,
        });

        return NextResponse.json({ summary: text.trim() });
    } catch (error) {
        console.error('Error generating summary:', error);

        const errorMessage = (error as Error)?.message || String(error);
        if (errorMessage.includes('API key') || errorMessage.includes('GOOGLE_GENERATIVE_AI_API_KEY')) {
            return NextResponse.json({
                summary: '🔑 Get your FREE Google API key at: https://aistudio.google.com/app/apikey to unlock AI insights!'
            });
        }

        return NextResponse.json({
            summary: 'Keep up the great work on your targets!'
        });
    }
}
