// Client-side AI service that calls server-side API routes

// Enhanced types for the AI service
export interface TargetData {
    currentValue: number;
    targetValue: number;
    progress: number;
    period: string;
    category: 'sales' | 'work_hours' | 'clients' | 'leads' | 'check_ins' | 'calls_made';
    startDate?: string;
    endDate?: string;
    unit?: string; // e.g., 'ZAR', 'hours', 'count'
    subTargets?: {
        daily?: number;
        weekly?: number;
        monthly?: number;
    };
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
    type: 'comprehensive_performance' | 'sales_strategy' | 'work_efficiency' | 'client_management' | 'lead_analysis';
    dataHash?: string; // For change detection
    currentDate?: string; // For feasibility analysis
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
    leadData?: LeadData;
    templateType: 'follow_up' | 'check_in' | 'proposal' | 'nurture' | 'closing';
    tone: 'professional' | 'encouraging' | 'motivational' | 'urgent' | 'friendly';
    customMessage?: string;
    contextNotes?: string; // For additional context without including LDA content
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
     * Generate comprehensive performance insights covering all target categories
     */
    async generateTargetInsights(request: InsightRequest): Promise<{
        insights: string[];
        feasibilityAnalysis: string[];
        actionableRecommendations: string[];
        urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    }> {
        try {
            // Generate cache key and data hash
            const dataHash = this.generateDataHash({
                targetData: request.targetData,
                attendanceData: request.attendanceData,
                leadsData: request.leadsData,
                timeFrame: request.timeFrame,
                currentDate: request.currentDate,
            });
            const cacheKey = `insights_${request.type}_${request.timeFrame}`;

            // Check cache first
            const cached = this.getCachedInsights(cacheKey);
            if (cached && this.cache.get(cacheKey)?.dataHash === dataHash) {
                return {
                    insights: cached,
                    feasibilityAnalysis: [],
                    actionableRecommendations: [],
                    urgencyLevel: 'medium'
                };
            }

            // Enhance request with comprehensive target analysis
            const enhancedRequest = {
                ...request,
                targetCategories: this.categorizeTargets(request.targetData),
                feasibilityMetrics: this.calculateFeasibilityMetrics(request.targetData, request.currentDate),
                dataHash,
            };

            const response = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enhancedRequest),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const result = {
                insights: data.insights || [],
                feasibilityAnalysis: data.feasibilityAnalysis || [],
                actionableRecommendations: data.actionableRecommendations || [],
                urgencyLevel: data.urgencyLevel || 'medium'
            };

            // Cache the results (store insights only for compatibility)
            this.setCachedInsights(cacheKey, dataHash, result.insights);

            return result;
        } catch (error) {
            console.error('Error generating comprehensive insights:', error);
            return {
                insights: [
                    'Unable to generate insights at this time. Please try again later.',
                    'Focus on your highest priority targets for today.',
                    'For immediate assistance, contact your manager or sales team.'
                ],
                feasibilityAnalysis: [
                    'Unable to assess feasibility at this time.',
                    'Review your targets manually and adjust timeline if needed.'
                ],
                actionableRecommendations: [
                    'Start with your most achievable targets first.',
                    'Break down large targets into smaller daily goals.',
                    'Track your progress regularly throughout the day.'
                ],
                urgencyLevel: 'medium'
            };
        }
    }

    /**
     * Categorize targets by type for comprehensive analysis
     */
    private categorizeTargets(targetData: TargetData[]): Record<string, TargetData[]> {
        const categories: Record<string, TargetData[]> = {
            sales: [],
            work_hours: [],
            clients: [],
            leads: [],
            check_ins: [],
            calls_made: []
        };

        targetData.forEach(target => {
            if (categories[target.category]) {
                categories[target.category].push(target);
            }
        });

        return categories;
    }

    /**
     * Calculate feasibility metrics based on targets and timeline
     */
    private calculateFeasibilityMetrics(targetData: TargetData[], currentDate?: string): Record<string, any> {
        const metrics: Record<string, any> = {};
        const now = currentDate ? new Date(currentDate) : new Date();

        targetData.forEach(target => {
            const targetEndDate = target.endDate ? new Date(target.endDate) : null;
            const timeRemaining = targetEndDate ? (targetEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) : null;
            const remainingValue = target.targetValue - target.currentValue;
            const dailyRequiredRate = timeRemaining ? remainingValue / timeRemaining : null;

            metrics[target.category] = {
                ...metrics[target.category],
                timeRemaining,
                remainingValue,
                dailyRequiredRate,
                feasibilityScore: this.calculateFeasibilityScore(target, timeRemaining, dailyRequiredRate),
            };
        });

        return metrics;
    }

    /**
     * Calculate feasibility score (0-100)
     */
    private calculateFeasibilityScore(target: TargetData, timeRemaining: number | null, dailyRequiredRate: number | null): number {
        if (!timeRemaining || !dailyRequiredRate || timeRemaining <= 0) return 0;

        const progressRate = target.currentValue / target.targetValue;
        const timeProgress = timeRemaining > 0 ? 1 - (timeRemaining / 30) : 0; // Assuming 30-day cycle
        
        // High feasibility if on track or ahead
        if (progressRate >= timeProgress) return Math.min(100, 80 + (progressRate - timeProgress) * 100);
        
        // Lower feasibility if behind
        const gap = timeProgress - progressRate;
        return Math.max(10, 80 - (gap * 200));
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
     * Uses lead data as context without including previous conversation content
     */
    async generateEmailTemplate(request: EmailTemplateRequest): Promise<{
        subject: string;
        body: string;
        followUpReminder?: string;
    }> {
        try {
            // Prepare request without LDA content - use lead data for context only
            const cleanRequest = {
                ...request,
                // Remove any previous conversation data, use lead info for tone and context
                leadContext: request.leadData ? {
                    status: request.leadData.status,
                    source: request.leadData.source,
                    value: request.leadData.value,
                    lastContact: request.leadData.lastContact,
                } : undefined,
            };

            const response = await fetch('/api/ai/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanRequest),
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
     * Uses lead data for context without including previous conversation content
     */
    async generateMessageTemplate(request: MessageTemplateRequest): Promise<{
        message: string;
        fallbackMessage?: string;
    }> {
        try {
            // Prepare request without LDA content - use lead data for context only
            const cleanRequest = {
                ...request,
                // Remove any previous conversation data, use lead info for tone and context
                leadContext: request.leadData ? {
                    status: request.leadData.status,
                    source: request.leadData.source,
                    value: request.leadData.value,
                } : undefined,
            };

            const response = await fetch('/api/ai/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanRequest),
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
     * Generate comprehensive performance summary covering all target categories
     */
    async generateQuickSummary(targetData: TargetData[]): Promise<{
        summary: string;
        categoryBreakdown: Record<string, string>;
        nextActions: string[];
    }> {
        try {
            const categorizedTargets = this.categorizeTargets(targetData);
            const feasibilityMetrics = this.calculateFeasibilityMetrics(targetData);

            const response = await fetch('/api/ai/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    targetData,
                    categorizedTargets,
                    feasibilityMetrics
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                summary: data.summary || 'Keep up the great work on your targets!',
                categoryBreakdown: data.categoryBreakdown || {},
                nextActions: data.nextActions || ['Continue focusing on your priorities', 'Track progress regularly']
            };
        } catch (error) {
            console.error('Error generating comprehensive summary:', error);
            return {
                summary: 'Keep up the great work on your targets!',
                categoryBreakdown: {
                    sales: 'Focus on converting your current leads',
                    work_hours: 'Maintain a healthy work-life balance',
                    clients: 'Keep building strong client relationships',
                    leads: 'Continue prospecting and qualifying leads',
                    check_ins: 'Stay connected with your contacts',
                    calls_made: 'Maintain consistent communication'
                },
                nextActions: [
                    'Start with your highest priority targets',
                    'Break down large goals into smaller tasks',
                    'Track your progress throughout the day'
                ]
            };
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
export const generateTargetInsights = (request: InsightRequest): Promise<{
    insights: string[];
    feasibilityAnalysis: string[];
    actionableRecommendations: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}> => aiService.generateTargetInsights(request);

export const generateSalesInsights = (request: SalesInsightRequest) =>
    aiService.generateSalesInsights(request);

export const generateEmailTemplate = (request: EmailTemplateRequest) =>
    aiService.generateEmailTemplate(request);

export const generateMessageTemplate = (request: MessageTemplateRequest) =>
    aiService.generateMessageTemplate(request);

export const generateSalesActions = (request: SalesActionRequest) =>
    aiService.generateSalesActions(request);

export const generateQuickSummary = (targetData: TargetData[]): Promise<{
    summary: string;
    categoryBreakdown: Record<string, string>;
    nextActions: string[];
}> => aiService.generateQuickSummary(targetData);
