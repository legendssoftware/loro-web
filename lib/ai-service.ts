// Client-side AI service that calls server-side API routes

// Types for the AI service
export interface InsightRequest {
    targetData: any;
    attendanceData?: any;
    profileData?: any;
    type: 'performance' | 'goals' | 'recommendations';
}

export interface EmailTemplateRequest {
    recipientName: string;
    insights: string[];
    targetMetrics: any;
    tone: 'professional' | 'encouraging' | 'motivational';
}

// AI Service class for generating insights and templates
export class AIService {
    /**
     * Generate performance insights based on target and attendance data
     */
    async generateTargetInsights(request: InsightRequest): Promise<string[]> {
        try {
            const response = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.insights || [];
        } catch (error) {
            console.error('Error generating insights:', error);
            return [
                'Unable to generate insights at this time. Please try again later.',
                'For immediate assistance, contact your manager or HR department.'
            ];
        }
    }

    /**
     * Generate an email template based on insights and metrics
     */
    async generateEmailTemplate(request: EmailTemplateRequest): Promise<string> {
        try {
            const response = await fetch('/api/ai/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.template || 'Unable to generate email template at this time.';
        } catch (error) {
            console.error('Error generating email template:', error);
            return `Subject: Performance Update - ${request.recipientName}

Dear ${request.recipientName},

I hope this email finds you well. I wanted to share some insights about your recent performance and targets.

Your recent metrics show areas of both achievement and opportunity for growth. Please review your dashboard for detailed information.

Best regards,
Your Performance Team`;
        }
    }

    /**
     * Generate quick performance summary
     */
    async generateQuickSummary(targetData: any): Promise<string> {
        try {
            const response = await fetch('/api/ai/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ targetData }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.summary || 'Keep up the great work on your targets!';
        } catch (error) {
            console.error('Error generating summary:', error);
            return 'Keep up the great work on your targets!';
        }
    }
}

// Export a default instance
export const aiService = new AIService();

// Export utility functions
export const generateTargetInsights = (request: InsightRequest) =>
    aiService.generateTargetInsights(request);

export const generateEmailTemplate = (request: EmailTemplateRequest) =>
    aiService.generateEmailTemplate(request);

export const generateQuickSummary = (targetData: any) =>
    aiService.generateQuickSummary(targetData);
