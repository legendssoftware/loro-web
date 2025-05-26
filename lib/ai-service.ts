// Client-side AI service that calls server-side API routes

// Enhanced types for the AI service
export interface TargetData {
    currentValue: number;
    targetValue: number;
    progress: number;
    period: string;
    category: string;
}

export interface AttendanceData {
    hoursWorked: number;
    expectedHours: number;
    attendanceRate: number;
    punctualityScore: number;
}

export interface LeadData {
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

export interface ProfileData {
    uid: string;
    name: string;
    surname: string;
    email: string;
    role: string;
    department?: string;
}

export interface InsightRequest {
    targetData: TargetData[];
    attendanceData?: AttendanceData;
    profileData?: ProfileData;
    leadsData?: LeadData[];
    timeFrame: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    type: 'performance' | 'goals' | 'recommendations' | 'lead_analysis' | 'sales_strategy';
    dataHash?: string; // For change detection
}

export interface SalesInsightRequest {
    leadsData: LeadData[];
    targetData: TargetData[];
    timeFrame: 'daily' | 'weekly' | 'monthly';
    userProfile: ProfileData;
    previousInsights?: string[]; // For context
}

export interface EmailTemplateRequest {
    recipientName: string;
    recipientEmail: string;
    insights: string[];
    targetMetrics: TargetData[];
    leadData?: LeadData;
    templateType: 'follow_up' | 'check_in' | 'proposal' | 'nurture' | 'closing';
    tone: 'professional' | 'encouraging' | 'motivational' | 'urgent' | 'friendly';
    customMessage?: string;
}

export interface MessageTemplateRequest {
    recipientName: string;
    recipientPhone: string;
    messageType: 'sms' | 'whatsapp';
    templateType: 'follow_up' | 'appointment' | 'reminder' | 'promotion' | 'thank_you';
    leadData?: LeadData;
    customMessage?: string;
    tone: 'professional' | 'friendly' | 'urgent';
}

export interface SalesActionRequest {
    leadsData: LeadData[];
    timeFrame: 'today' | 'this_week' | 'this_month';
    userProfile: ProfileData;
    priorityFocus: 'high_value' | 'quick_wins' | 'nurture' | 'conversion';
}

// Cache interface for storing insights
interface InsightCache {
    dataHash: string;
    insights: string[];
    timestamp: number;
    expiresAt: number;
}

// AI Service class for generating insights and templates
export class AIService {
    private cache: Map<string, InsightCache> = new Map();
    private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

    /**
     * Generate a hash from data to detect changes
     */
    private generateDataHash(data: unknown): string {
        return btoa(JSON.stringify(data)).slice(0, 16);
    }

    /**
     * Check if cached insights are valid
     */
    private getCachedInsights(cacheKey: string): string[] | null {
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.insights;
        }
        // Clean up expired cache
        if (cached) {
            this.cache.delete(cacheKey);
        }
        return null;
    }

    /**
     * Cache insights with expiration
     */
    private setCachedInsights(cacheKey: string, dataHash: string, insights: string[]): void {
        this.cache.set(cacheKey, {
            dataHash,
            insights,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.CACHE_DURATION,
        });
    }

    /**
     * Generate enhanced performance insights with sales focus
     */
    async generateTargetInsights(request: InsightRequest): Promise<string[]> {
        try {
            // Generate cache key and data hash
            const dataHash = this.generateDataHash({
                targetData: request.targetData,
                attendanceData: request.attendanceData,
                leadsData: request.leadsData,
                timeFrame: request.timeFrame,
            });
            const cacheKey = `insights_${request.type}_${request.timeFrame}`;

            // Check cache first
            const cached = this.getCachedInsights(cacheKey);
            if (cached && this.cache.get(cacheKey)?.dataHash === dataHash) {
                return cached;
            }

            const response = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...request, dataHash }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const insights = data.insights || [];

            // Cache the results
            this.setCachedInsights(cacheKey, dataHash, insights);

            return insights;
        } catch (error) {
            console.error('Error generating insights:', error);
            return [
                'Unable to generate insights at this time. Please try again later.',
                'For immediate assistance, contact your manager or sales team.'
            ];
        }
    }

    /**
     * Generate sales-focused lead analysis and recommendations
     */
    async generateSalesInsights(request: SalesInsightRequest): Promise<{
        insights: string[];
        priorityLeads: LeadData[];
        actionableSteps: string[];
        timeBasedSuggestions: string[];
    }> {
        try {
            const response = await fetch('/api/ai/sales-insights', {
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
            return {
                insights: data.insights || [],
                priorityLeads: data.priorityLeads || [],
                actionableSteps: data.actionableSteps || [],
                timeBasedSuggestions: data.timeBasedSuggestions || [],
            };
        } catch (error) {
            console.error('Error generating sales insights:', error);
            return {
                insights: ['Unable to generate sales insights at this time.'],
                priorityLeads: [],
                actionableSteps: ['Review your leads manually for immediate opportunities.'],
                timeBasedSuggestions: ['Check in with recent leads today.'],
            };
        }
    }

    /**
     * Generate personalized email templates for lead communication
     */
    async generateEmailTemplate(request: EmailTemplateRequest): Promise<{
        subject: string;
        body: string;
        followUpReminder?: string;
    }> {
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
            return {
                subject: data.subject || `Follow-up: ${request.recipientName}`,
                body: data.body || 'Unable to generate email template at this time.',
                followUpReminder: data.followUpReminder,
            };
        } catch (error) {
            console.error('Error generating email template:', error);
            return {
                subject: `Follow-up: ${request.recipientName}`,
                body: `Dear ${request.recipientName},

I hope this email finds you well. I wanted to follow up on our previous conversation and see how I can assist you further.

Please let me know if you have any questions or if there's anything specific I can help you with.

Best regards,
Your Sales Team`,
            };
        }
    }

    /**
     * Generate SMS/WhatsApp message templates
     */
    async generateMessageTemplate(request: MessageTemplateRequest): Promise<{
        message: string;
        fallbackMessage?: string;
    }> {
        try {
            const response = await fetch('/api/ai/message', {
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
            return {
                message: data.message || `Hi ${request.recipientName}, hope you're doing well!`,
                fallbackMessage: data.fallbackMessage,
            };
        } catch (error) {
            console.error('Error generating message template:', error);
            return {
                message: `Hi ${request.recipientName}, hope you're doing well! Let me know if you need any assistance.`,
            };
        }
    }

    /**
     * Generate daily/weekly sales action plan
     */
    async generateSalesActions(request: SalesActionRequest): Promise<{
        actions: string[];
        priorityTasks: string[];
        contactSuggestions: Array<{
            leadId: number;
            action: string;
            reason: string;
            timing: string;
        }>;
    }> {
        try {
            const response = await fetch('/api/ai/sales-actions', {
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
            return {
                actions: data.actions || [],
                priorityTasks: data.priorityTasks || [],
                contactSuggestions: data.contactSuggestions || [],
            };
        } catch (error) {
            console.error('Error generating sales actions:', error);
            return {
                actions: ['Review your pipeline and prioritize high-value leads'],
                priorityTasks: ['Follow up with recent inquiries'],
                contactSuggestions: [],
            };
        }
    }

    /**
     * Generate quick performance summary with sales context
     */
    async generateQuickSummary(targetData: TargetData[]): Promise<string> {
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

    /**
     * Clear cache manually (useful for testing or forced refresh)
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; entries: string[] } {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
        };
    }
}

// Export a default instance
export const aiService = new AIService();

// Export utility functions with improved TypeScript support
export const generateTargetInsights = (request: InsightRequest): Promise<string[]> =>
    aiService.generateTargetInsights(request);

export const generateSalesInsights = (request: SalesInsightRequest) =>
    aiService.generateSalesInsights(request);

export const generateEmailTemplate = (request: EmailTemplateRequest) =>
    aiService.generateEmailTemplate(request);

export const generateMessageTemplate = (request: MessageTemplateRequest) =>
    aiService.generateMessageTemplate(request);

export const generateSalesActions = (request: SalesActionRequest) =>
    aiService.generateSalesActions(request);

export const generateQuickSummary = (targetData: TargetData[]): Promise<string> =>
    aiService.generateQuickSummary(targetData);
