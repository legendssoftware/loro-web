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
    companyName?: string;
    jobTitle?: string;
    
    // Lead qualification and scoring
    status: string;
    intent?: string;
    temperature?: string;
    priority?: string;
    leadScore?: number;
    userQualityRating?: number;
    lifecycleStage?: string;
    
    // Business context
    industry?: string;
    businessSize?: string;
    decisionMakerRole?: string;
    budgetRange?: string;
    purchaseTimeline?: string;
    estimatedValue?: number;
    
    // Communication and behavior
    source?: string;
    preferredCommunication?: string;
    timezone?: string;
    bestContactTime?: string;
    averageResponseTime?: number;
    totalInteractions?: number;
    daysSinceLastResponse?: number;
    lastContactDate?: string;
    nextFollowUpDate?: string;
    
    // Business intelligence
    painPoints?: string[];
    competitorInfo?: string;
    referralSource?: string;
    campaignName?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    
    // Activity and engagement
    scoringData?: {
        totalScore: number;
        engagementScore: number;
        demographicScore: number;
        behavioralScore: number;
        fitScore: number;
    };
    activityData?: {
        engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
        lastEngagementType: string;
        unresponsiveStreak: number;
    };
    
    // Additional context
    notes?: string;
    assignee?: string;
    customFields?: Record<string, any>;
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

// Multi-dimensional tone matrix
export interface ToneConfiguration {
    baseTone: 'consultative' | 'authoritative' | 'collaborative' | 'empathetic' | 'innovative' | 
              'results-driven' | 'professional' | 'encouraging' | 'motivational' | 'urgent' | 
              'friendly' | 'educational';
    intensity: 'subtle' | 'moderate' | 'strong';
    regionalAdaptation: 'south_african' | 'international' | 'local';
    industrySpecific: boolean;
}

// Enhanced template types
export type EnhancedTemplateType = 
    'introduction' | 'follow_up' | 'proposal' | 'objection_handling' | 'closing' | 
    're_engagement' | 'referral' | 'upsell' | 'check_in' | 'nurture' | 'educational' |
    'urgent_response' | 'value_demonstration' | 'social_proof';

export interface EmailTemplateRequest {
    recipientName: string;
    recipientEmail: string;
    leadData?: LeadData;
    templateType: EnhancedTemplateType;
    tone: ToneConfiguration;
    customMessage?: string;
    contextNotes?: string;
    industryInsights?: string[];
    competitiveContext?: string[];
    urgencyFactors?: string[];
    businessContext?: {
        companyNews?: string[];
        marketConditions?: string[];
        seasonalFactors?: string[];
    };
}

// Enhanced email response interface
export interface EnhancedEmailResponse {
    subject: string;
    body: string;
    followUpReminder?: string;
    personalizationScore?: number;
    keyPersonalizationElements?: string[];
    alternativeSubjectLines?: string[];
    responseStrategy?: string;
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
     * Uses comprehensive lead data and advanced personalization
     */
    async generateEmailTemplate(request: EmailTemplateRequest): Promise<EnhancedEmailResponse> {
        try {
            // Enhance request with intelligent defaults and context analysis
            const enhancedRequest = this.enhanceEmailRequest(request);

            const response = await fetch('/api/ai/email', {
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
            return {
                subject: data.subject || this.generateFallbackSubject(request),
                body: data.body || this.generateFallbackBody(request),
                followUpReminder: data.followUpReminder || this.generateSmartFollowUpReminder(request.leadData),
                personalizationScore: data.personalizationScore || 50,
                keyPersonalizationElements: data.keyPersonalizationElements || ['Basic personalization'],
                alternativeSubjectLines: data.alternativeSubjectLines || [],
                responseStrategy: data.responseStrategy || 'Follow standard sales methodology',
            };
        } catch (error) {
            console.error('Error generating enhanced email template:', error);
            return this.getEnhancedFallbackResponse(request);
        }
    }

    /**
     * Enhance email request with intelligent context and industry insights
     */
    private enhanceEmailRequest(request: EmailTemplateRequest): EmailTemplateRequest {
        const enhanced = { ...request };

        // Add intelligent tone defaults if not specified
        if (!enhanced.tone.baseTone) {
            enhanced.tone.baseTone = this.selectOptimalTone(request.leadData);
        }

        // Add industry insights based on lead data
        if (request.leadData?.industry && !enhanced.industryInsights?.length) {
            enhanced.industryInsights = this.generateIndustryInsights(request.leadData.industry);
        }

        // Add competitive context if available
        if (request.leadData?.competitorInfo && !enhanced.competitiveContext?.length) {
            enhanced.competitiveContext = [`Currently considering: ${request.leadData.competitorInfo}`];
        }

        // Add urgency factors based on lead temperature and timeline
        if (request.leadData && !enhanced.urgencyFactors?.length) {
            enhanced.urgencyFactors = this.generateUrgencyFactors(request.leadData);
        }

        // Add business context based on lead intelligence
        if (request.leadData && !enhanced.businessContext) {
            enhanced.businessContext = this.generateBusinessContext(request.leadData);
        }

        return enhanced;
    }

    /**
     * Select optimal tone based on lead data intelligence
     */
    private selectOptimalTone(leadData?: LeadData): ToneConfiguration['baseTone'] {
        if (!leadData) return 'professional';

        // High-score or hot leads get more confident approach
        if (leadData.temperature === 'HOT' || (leadData.leadScore && leadData.leadScore > 80)) {
            return leadData.decisionMakerRole === 'CEO' || leadData.decisionMakerRole === 'OWNER' 
                ? 'authoritative' : 'results-driven';
        }

        // Technical decision makers prefer consultative approach
        if (leadData.decisionMakerRole === 'CTO' || leadData.industry === 'TECHNOLOGY') {
            return 'consultative';
        }

        // Financial decision makers prefer data-driven approach
        if (leadData.decisionMakerRole === 'CFO' || leadData.industry === 'FINANCE') {
            return 'results-driven';
        }

        // Educational approach for early-stage leads
        if (leadData.temperature === 'COLD' || leadData.lifecycleStage === 'LEAD') {
            return 'educational';
        }

        return 'collaborative';
    }

    /**
     * Generate industry-specific insights
     */
    private generateIndustryInsights(industry: string): string[] {
        const insights: Record<string, string[]> = {
            'TECHNOLOGY': [
                'Digital transformation acceleration in SA market',
                'Cloud adoption and cybersecurity priorities',
                'Skills shortage and talent retention challenges'
            ],
            'HEALTHCARE': [
                'Healthcare digitization and telemedicine growth',
                'Regulatory compliance and patient data security',
                'Cost pressures and efficiency optimization'
            ],
            'FINANCE': [
                'Fintech disruption and digital banking trends',
                'Regulatory compliance (POPIA, Basel III)',
                'Customer experience and digital channels'
            ],
            'RETAIL': [
                'Omnichannel retail and e-commerce growth',
                'Supply chain optimization post-COVID',
                'Customer data analytics and personalization'
            ],
            'MANUFACTURING': [
                'Industry 4.0 and smart manufacturing',
                'Supply chain resilience and automation',
                'Sustainability and carbon footprint reduction'
            ],
            'MINING': [
                'Safety technology and regulatory compliance',
                'Operational efficiency and cost reduction',
                'Environmental impact and sustainability'
            ]
        };

        return insights[industry] || [
            'Digital transformation opportunities',
            'Operational efficiency improvements',
            'Market competitiveness enhancement'
        ];
    }

    /**
     * Generate urgency factors based on lead data
     */
    private generateUrgencyFactors(leadData: LeadData): string[] {
        const factors: string[] = [];

        if (leadData.temperature === 'HOT') {
            factors.push('High-interest lead requiring immediate attention');
        }

        if (leadData.purchaseTimeline === 'IMMEDIATE') {
            factors.push('Immediate purchase timeline');
        } else if (leadData.purchaseTimeline === 'SHORT_TERM') {
            factors.push('Short-term purchase timeline (1-4 weeks)');
        }

        if (leadData.daysSinceLastResponse && leadData.daysSinceLastResponse > 7) {
            factors.push('Extended period since last contact');
        }

        if (leadData.competitorInfo) {
            factors.push('Actively considering competitive solutions');
        }

        if (leadData.budgetRange && ['OVER_1M', 'R500K_1M'].includes(leadData.budgetRange)) {
            factors.push('High-value opportunity');
        }

        return factors;
    }

    /**
     * Generate business context based on lead intelligence
     */
    private generateBusinessContext(leadData: LeadData): EmailTemplateRequest['businessContext'] {
        const context: EmailTemplateRequest['businessContext'] = {
            marketConditions: [],
            seasonalFactors: [],
            companyNews: []
        };

        // Add market conditions based on industry
        if (leadData.industry) {
            switch (leadData.industry) {
                case 'RETAIL':
                    context.marketConditions?.push('Consumer spending pressure', 'Supply chain challenges');
                    break;
                case 'MANUFACTURING':
                    context.marketConditions?.push('Raw material cost inflation', 'Skills shortage');
                    break;
                case 'TECHNOLOGY':
                    context.marketConditions?.push('Digital acceleration', 'Cybersecurity concerns');
                    break;
            }
        }

        // Add seasonal factors
        const currentMonth = new Date().getMonth();
        if (currentMonth >= 10 || currentMonth <= 1) {
            context.seasonalFactors?.push('Year-end budget considerations', 'Holiday season planning');
        } else if (currentMonth >= 2 && currentMonth <= 4) {
            context.seasonalFactors?.push('New year implementation planning', 'Q1 priority setting');
        }

        return context;
    }

    /**
     * Generate fallback subject line
     */
    private generateFallbackSubject(request: EmailTemplateRequest): string {
        const name = request.leadData?.name || request.recipientName;
        const company = request.leadData?.companyName;
        
        switch (request.templateType) {
            case 'introduction':
                return company ? `${company} - Quick introduction` : `Introduction - ${name}`;
            case 'follow_up':
                return company ? `${company} - Following up` : `Following up - ${name}`;
            case 'proposal':
                return company ? `${company} - Proposal for review` : `Proposal for ${name}`;
            default:
                return `${name} - Next steps`;
        }
    }

    /**
     * Generate fallback email body
     */
    private generateFallbackBody(request: EmailTemplateRequest): string {
        const name = request.leadData?.name || request.recipientName;
        const company = request.leadData?.companyName || 'your organization';
        
        return `Dear ${name},

I hope you're doing well. I've been researching ${company} and believe there are valuable opportunities we could explore together.

${request.customMessage || 'Based on current market trends and the challenges facing businesses in your sector, I thought you might be interested in discussing how we can help drive growth and efficiency.'}

I'd love to schedule a brief conversation to understand your current priorities and share some relevant insights.

Would you be available for a call this week? I can work around your schedule.

Best regards,
Your Business Development Team`;
    }

    /**
     * Generate smart follow-up reminder
     */
    private generateSmartFollowUpReminder(leadData?: LeadData): string {
        if (!leadData) return 'Follow up in 3-5 business days if no response';
        
        if (leadData.temperature === 'HOT') {
            return 'Follow up within 24-48 hours - high priority lead';
        } else if (leadData.temperature === 'WARM') {
            return 'Follow up in 2-3 business days';
        } else if (leadData.averageResponseTime && leadData.averageResponseTime > 72) {
            return 'Follow up in 1 week - prospect typically takes time to respond';
        }
        
        return 'Follow up in 3-5 business days if no response';
    }

    /**
     * Enhanced fallback response with intelligent personalization
     */
    private getEnhancedFallbackResponse(request: EmailTemplateRequest): EnhancedEmailResponse {
        return {
            subject: this.generateFallbackSubject(request),
            body: this.generateFallbackBody(request),
            followUpReminder: this.generateSmartFollowUpReminder(request.leadData),
            personalizationScore: 40,
            keyPersonalizationElements: [
                'Name personalization',
                'Company reference',
                request.leadData?.industry ? 'Industry context' : 'Generic industry'
            ].filter(Boolean),
            alternativeSubjectLines: [
                'Quick question',
                'Brief conversation?',
                'Exploring opportunities'
            ],
            responseStrategy: 'Keep follow-up gentle and value-focused'
        };
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
