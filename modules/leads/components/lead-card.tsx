'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lead, LeadStatus } from '@/lib/types/lead';
import {
    Clock,
    Building,
    Mail,
    Phone,
    PhoneCall,
    MessageSquare,
    Send,
    Eye,
    ThermometerSun,
    Share2,
    DollarSign,
    Star,
    TrendingUp,
    Zap,
    Globe,
    Target,
} from 'lucide-react';
import { useState, useCallback, memo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LeadDetailsModal } from './lead-details-modal';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeadCardProps {
    lead: Lead;
    onUpdateStatus?: (leadId: number, newStatus: string, reason?: string, description?: string, nextStep?: string) => void;
    onUpdate?: (leadId: number, updateData: any) => void;
    onDelete?: (leadId: number) => void;
    index?: number;
    id?: string;
}

// Define action types for the sheets
type ActionType = 'call' | 'email' | 'message' | null;

// Define tone types for templates - Enhanced v4 with more sophisticated options
type ToneType = 'professional' | 'friendly' | 'urgent' | 'casual' | 'consultative' | 'empathetic' | 'assertive' | 'collaborative' | 'strategic' | 'warm';

// Define template structure
interface Template {
    id: string;
    title: string;
    content: string;
    tone: ToneType;
}

// Types for AI requests - keeping only what we need
interface EnhancedLeadData {
    uid: number;
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    jobTitle?: string;
    status: string;
    temperature?: string;
    source?: string;
    budgetRange?: string;
    userQualityRating?: number;
    notes?: string;
    industry?: string;
    businessSize?: string;
    estimatedValue?: number;
    daysSinceLastResponse?: number;
    lastContactDate?: string;
    painPoints?: string[];
    competitorInfo?: string;
    referralSource?: string;
    campaignName?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    assignee?: string;
    customFields?: Record<string, any>;
    // Enhanced lead intelligence
    priority?: string;
    intent?: string;
    purchaseTimeline?: string;
    preferredCommunication?: string;
    // Activity and engagement data
    totalInteractions?: number;
    activityData?: {
        engagementLevel: 'HIGH' | 'MEDIUM' | 'LOW';
        lastEngagementType: string;
        unresponsiveStreak: number;
    };
    // Scoring data
    scoringData?: {
        totalScore: number;
        engagementScore: number;
        demographicScore: number;
        behavioralScore: number;
        fitScore: number;
    };
}

interface EmailTemplateRequest {
    recipientName: string;
    recipientEmail: string;
    leadData?: EnhancedLeadData;
    templateType: 'introduction' | 'follow_up' | 'proposal' | 'objection_handling' | 'closing' | 're_engagement' | 'referral' | 'upsell' | 'check_in' | 'nurture' | 'educational' | 'urgent_response' | 'value_demonstration' | 'social_proof';
    tone: {
        baseTone: string;
        intensity: string;
        regionalAdaptation: string;
        industrySpecific: boolean;
    };
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

interface MessageTemplateRequest {
    recipientName: string;
    recipientPhone: string;
    messageType: 'sms' | 'whatsapp';
    templateType: 'follow_up' | 'appointment' | 'reminder' | 'promotion' | 'thank_you';
    leadData?: any;
    tone: string;
    customMessage?: string;
}

// Define enhanced template type 
type EnhancedTemplateType = 'introduction' | 'follow_up' | 'proposal' | 'objection_handling' | 'closing' | 're_engagement' | 'referral' | 'upsell' | 'check_in' | 'nurture' | 'educational' | 'urgent_response' | 'value_demonstration' | 'social_proof';

// Define tone configuration
interface ToneConfiguration {
    baseTone: string;
    intensity: string;
    regionalAdaptation: string;
    industrySpecific: boolean;
}

// Create the LeadCard as a standard component
function LeadCardComponent({
    lead,
    onUpdateStatus,
    onUpdate,
    onDelete,
    index = 0,
    id,
}: LeadCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSheet, setActiveSheet] = useState<ActionType>(null);
    const [selectedTone, setSelectedTone] = useState<ToneType>('professional');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
    const [templatesCache, setTemplatesCache] = useState<Map<string, Template[]>>(new Map());
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Use CSS variables for animation delay - match tasks component's variable name
    const cardStyle = {
        '--task-delay': `${Math.min(index * 50, 500)}ms`,
    } as React.CSSProperties;

    const handleStatusChange = useCallback(
        (leadId: number, newStatus: string, reason?: string, description?: string, nextStep?: string) => {
            if (onUpdateStatus) {
                onUpdateStatus(leadId, newStatus, reason, description, nextStep);
            }
        },
        [onUpdateStatus],
    );

    const handleDelete = useCallback(
        (leadId: number) => {
            if (onDelete) {
                onDelete(leadId);
            }
        },
        [onDelete],
    );

    const formatDate = (date?: Date | string | null) => {
        if (!date) return null;
        
        try {
            // Handle both Date objects and date strings
            const dateObj = date instanceof Date ? date : new Date(date);
            
            // Check if the date is valid
            if (isNaN(dateObj.getTime())) {
                return null;
            }
            
            return format(dateObj, 'MMM d, yyyy');
        } catch (error) {
            console.warn('Date formatting error:', error, 'for date:', date);
            return null;
        }
    };

    const formatNameInitialSurname = (name: string) => {
        const nameParts = name.trim().split(' ');
        if (nameParts.length === 1) {
            return nameParts[0]; // Just return the name if no surname
        }
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        return `${firstName.charAt(0)}. ${lastName}`;
    };

    const getTemperatureColor = (temp?: string) => {
        switch (temp) {
            case 'HOT':
                return 'text-red-500';
            case 'WARM':
                return 'text-orange-500';
            case 'COLD':
                return 'text-blue-500';
            case 'FROZEN':
                return 'text-slate-400';
            default:
                return 'text-gray-400';
        }
    };

    const getSourceColor = (source?: string) => {
        switch (source) {
            case 'WEBSITE':
                return 'text-blue-500';
            case 'SOCIAL_MEDIA':
                return 'text-purple-500';
            case 'REFERRAL':
                return 'text-green-500';
            case 'EMAIL_CAMPAIGN':
                return 'text-indigo-500';
            case 'COLD_CALL':
                return 'text-orange-500';
            default:
                return 'text-gray-400';
        }
    };

    const getBudgetColor = (budget?: string) => {
        if (!budget) return 'text-gray-400';
        
        // Higher budget ranges get warmer colors
        if (budget.includes('1M') || budget === 'OVER_1M') {
            return 'text-emerald-600';
        } else if (budget.includes('500K') || budget.includes('250K')) {
            return 'text-green-500';
        } else if (budget.includes('100K') || budget.includes('50K')) {
            return 'text-lime-500';
        } else if (budget.includes('25K') || budget.includes('10K')) {
            return 'text-yellow-500';
        } else {
            return 'text-orange-400';
        }
    };

    const getRatingColor = (rating?: number) => {
        if (!rating) return 'text-gray-400';
        
        if (rating >= 4) {
            return 'text-green-500';
        } else if (rating >= 3) {
            return 'text-yellow-500';
        } else {
            return 'text-red-500';
        }
    };

    const getStatusBadgeColor = (status: LeadStatus) => {
        switch (status) {
            case LeadStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case LeadStatus.APPROVED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case LeadStatus.REVIEW:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case LeadStatus.DECLINED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case LeadStatus.CONVERTED:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case LeadStatus.CANCELLED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handleActionClick = useCallback(
        (e: React.MouseEvent, action: ActionType) => {
            e.stopPropagation(); // Prevent the card click event
            setActiveSheet(action);
        },
        [],
    );

    // Generate cache key for templates
    const getCacheKey = useCallback((tone: ToneType, actionType: Exclude<ActionType, null>) => {
        return `${actionType}-${tone}-${lead.uid}`;
    }, [lead.uid]);

    // Clear all states when sheet closes
    const closeSheet = useCallback(() => {
        setActiveSheet(null);
        setSelectedTemplate(null);
        setIsPreviewMode(false);
        setCustomMessage('');
        setSelectedTone('professional');
        setAvailableTemplates([]);
        setIsGeneratingTemplates(false);
        setIsRegenerating(false);
    }, []);

    // Handle template regeneration
    const handleRegenerateTemplates = useCallback(async () => {
        if (!activeSheet) return;
        
        setIsRegenerating(true);
        setIsGeneratingTemplates(true);
        setAvailableTemplates([]);
        
        try {
            // Direct template generation without dependencies
            const templates = await generateTemplates(selectedTone, activeSheet);
            setAvailableTemplates(templates);
        } catch (error) {
            console.error('Error regenerating templates:', error);
            const fallbackTemplates = generateFallbackTemplates(lead, selectedTone, activeSheet);
            setAvailableTemplates(fallbackTemplates);
        } finally {
            setIsGeneratingTemplates(false);
            setIsRegenerating(false);
        }
    }, [activeSheet, selectedTone, lead]);

    // Handle tone change
    const handleToneChange = useCallback(async (newTone: ToneType) => {
        setSelectedTone(newTone);
        
        if (activeSheet) {
            // If in preview mode, exit it first
            if (isPreviewMode) {
                setIsPreviewMode(false);
                setSelectedTemplate(null);
                setCustomMessage('');
            }
            
            // Generate templates for new tone
            setIsGeneratingTemplates(true);
            setAvailableTemplates([]);
            
            try {
                const templates = await generateTemplates(newTone, activeSheet);
                setAvailableTemplates(templates);
            } catch (error) {
                console.error('Error changing tone:', error);
                const fallbackTemplates = generateFallbackTemplates(lead, newTone, activeSheet);
                setAvailableTemplates(fallbackTemplates);
            } finally {
                setIsGeneratingTemplates(false);
            }
        }
    }, [activeSheet, isPreviewMode, lead]);

    // Handle going back to template selection
    const handleBackToTemplates = useCallback(() => {
        setIsPreviewMode(false);
        setSelectedTemplate(null);
        setCustomMessage('');
        // Templates should already be loaded
    }, []);

    // Load templates when sheet opens
    useEffect(() => {
        if (activeSheet && !isGeneratingTemplates) {
            const loadInitialTemplates = async () => {
                setIsGeneratingTemplates(true);
                setAvailableTemplates([]);
                
                try {
                    const templates = await generateTemplates(selectedTone, activeSheet);
                    setAvailableTemplates(templates);
                } catch (error) {
                    console.error('Error loading initial templates:', error);
                    const fallbackTemplates = generateFallbackTemplates(lead, selectedTone, activeSheet);
                    setAvailableTemplates(fallbackTemplates);
                } finally {
                    setIsGeneratingTemplates(false);
                }
            };
            
            loadInitialTemplates();
        }
    }, [activeSheet]); // Only depend on activeSheet to avoid loops

    // Handle template selection
    const handleTemplateSelect = useCallback((template: Template) => {
        setSelectedTemplate(template);
        setCustomMessage(template.content);
        setIsPreviewMode(true);
    }, []);

    // Get sheet title based on action type
    const getSheetTitle = () => {
        switch (activeSheet) {
            case 'call':
                return `Call ${lead.name}`;
            case 'email':
                return `Email ${lead.name}`;
            case 'message':
                return `Message ${lead.name}`;
            default:
                return '';
        }
    };

    // Get sheet description based on action type
    const getSheetDescription = () => {
        const daysSince = Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        const baseDescription = `Generate personalized ${activeSheet} using lead status (${lead.status}), time context (${daysSince} days), and contextual insights`;

        switch (activeSheet) {
            case 'call':
                return `${baseDescription} for strategic conversation guidance`;
            case 'email':
                return `${baseDescription} with subject lines and personalized content`;
            case 'message':
                return `${baseDescription} optimized for SMS engagement`;
            default:
                return '';
        }
    };

    // Helper function to safely convert dates to ISO strings
    const safeISOString = (date: Date | string | undefined | null): string | undefined => {
        if (!date) return undefined;
        
        try {
            // If it's already a Date object, use toISOString()
            if (date instanceof Date) {
                return date.toISOString();
            }
            
            // If it's a string, try to convert to Date first
            if (typeof date === 'string') {
                const dateObj = new Date(date);
                // Check if the date is valid
                if (!isNaN(dateObj.getTime())) {
                    return dateObj.toISOString();
                }
                // If conversion failed, return the original string if it looks like an ISO string
                if (date.includes('T') || date.includes('-')) {
                    return date;
                }
            }
            
            return undefined;
        } catch (error) {
            console.warn('Date conversion error:', error, 'for date:', date);
            return undefined;
        }
    };

    // Helper function to safely calculate days since a date
    const safeDaysSince = (date: Date | string | undefined | null): number => {
        if (!date) return 0;
        
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            if (isNaN(dateObj.getTime())) return 0;
            
            return Math.floor((new Date().getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
        } catch (error) {
            console.warn('Days calculation error:', error, 'for date:', date);
            return 0;
        }
    };

    const generateTemplates = useCallback(async (tone: ToneType, actionType: Exclude<ActionType, null>) => {
        try {
            if (actionType === 'email') {
                // Enhanced AI request for highly personalized email generation
                const emailRequest: EmailTemplateRequest = {
                    recipientName: lead.name,
                    recipientEmail: lead.email,
                    leadData: {
                        uid: lead.uid,
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        companyName: lead.companyName,
                        jobTitle: lead.jobTitle,
                        status: lead.status,
                        temperature: lead.temperature,
                        source: lead.source,
                        budgetRange: lead.budgetRange,
                        userQualityRating: lead.userQualityRating,
                        notes: lead.notes,
                        industry: lead.industry || lead.branch?.name, // Enhanced industry context
                        businessSize: lead.businessSize,
                        estimatedValue: lead.estimatedValue,
                        daysSinceLastResponse: safeDaysSince(lead.updatedAt),
                        lastContactDate: safeISOString(lead.updatedAt),
                        painPoints: lead.notes ? [lead.notes] : undefined,
                        competitorInfo: lead.competitorInfo,
                        referralSource: lead.source,
                        campaignName: lead.campaignName,
                        utmSource: lead.utmSource,
                        utmMedium: lead.utmMedium,
                        utmCampaign: lead.utmCampaign,
                        assignee: lead.owner?.name,
                        // Enhanced lead intelligence
                        priority: lead.priority,
                        intent: lead.intent,
                        purchaseTimeline: lead.purchaseTimeline,
                        preferredCommunication: lead.preferredCommunication,
                        // Activity and engagement data
                        totalInteractions: 0, // Would come from CRM history
                        activityData: {
                            engagementLevel: lead.temperature === 'HOT' ? 'HIGH' as const : 
                                           lead.temperature === 'WARM' ? 'MEDIUM' as const : 'LOW' as const,
                            lastEngagementType: `Lead created via ${lead.source || 'unknown source'}`,
                            unresponsiveStreak: safeDaysSince(lead.createdAt)
                        },
                        // Scoring data based on available lead info
                        scoringData: {
                            totalScore: (lead.userQualityRating || 0) * 20, // Convert 1-5 rating to 0-100 score
                            engagementScore: lead.temperature === 'HOT' ? 90 : 
                                           lead.temperature === 'WARM' ? 60 : 30,
                            demographicScore: lead.companyName && lead.jobTitle ? 80 : 40,
                            behavioralScore: lead.notes ? 70 : 30,
                            fitScore: lead.budgetRange && lead.industry ? 80 : 50
                        }
                    },
                    templateType: getTemplateTypeFromLeadStatus(lead.status),
                    tone: mapToneToConfiguration(tone),
                    // Enhanced contextual information
                    customMessage: lead.notes ? 
                        `Lead Context: ${lead.notes}. Quality Rating: ${lead.userQualityRating || 'Not rated'}/5. 
                         Budget Range: ${lead.budgetRange || 'Not specified'}. 
                         Lead Temperature: ${lead.temperature || 'COLD'}.` : 
                        `Quality Rating: ${lead.userQualityRating || 'Not rated'}/5. Lead Temperature: ${lead.temperature || 'COLD'}.`,
                    contextNotes: `Lead created ${safeDaysSince(lead.createdAt)} days ago via ${lead.source || 'unknown source'}. 
                                  Current status: ${lead.status}. 
                                  ${lead.companyName ? `Works at ${lead.companyName}` : 'Company not specified'}. 
                                  ${lead.jobTitle ? `Role: ${lead.jobTitle}` : 'Job title not specified'}.
                                  ${lead.estimatedValue ? `Estimated deal value: R${lead.estimatedValue.toLocaleString()}` : ''}`,
                    // Industry insights for better personalization
                    industryInsights: lead.industry ? [
                        `${lead.industry} industry trends and challenges in South Africa`,
                        `Digital transformation opportunities in ${lead.industry}`,
                        `Economic factors affecting ${lead.industry} businesses`,
                        `Growth strategies for ${lead.industry} companies`
                    ] : [
                        'General business trends in South Africa',
                        'Digital transformation opportunities',
                        'Economic recovery strategies',
                        'Business efficiency improvements'
                    ],
                    // Competitive context
                    competitiveContext: lead.competitorInfo ? [
                        `Currently considering: ${lead.competitorInfo}`,
                        'Alternative solution comparison points',
                        'Unique value proposition positioning'
                    ] : [
                        'Market positioning advantages',
                        'Competitive differentiation factors',
                        'Industry-leading solutions'
                    ],
                    // Urgency factors based on lead data
                    urgencyFactors: [
                        ...(lead.temperature === 'HOT' ? ['High engagement lead - immediate follow-up required'] : []),
                        ...(lead.purchaseTimeline === 'IMMEDIATE' ? ['Urgent purchase timeline indicated'] : []),
                        ...(safeDaysSince(lead.createdAt) > 7 ? ['Lead aging - requires prompt attention'] : []),
                        ...(lead.userQualityRating && lead.userQualityRating >= 4 ? ['High quality lead - priority prospect'] : []),
                        ...(lead.estimatedValue && lead.estimatedValue > 100000 ? ['High-value opportunity'] : []),
                        ...(lead.budgetRange && ['OVER_1M', '500K_1M', '250K_500K'].includes(lead.budgetRange) ? ['Significant budget capacity'] : []),
                        'Year-end planning considerations',
                        'Budget cycle timing opportunities'
                    ],
                    // Business context
                    businessContext: {
                        companyNews: lead.companyName ? [
                            `Recent developments at ${lead.companyName}`,
                            `${lead.companyName} growth opportunities and challenges`,
                            `Market position of ${lead.companyName}`,
                            `Industry reputation of ${lead.companyName}`
                        ] : [
                            'General company growth strategies',
                            'Market expansion opportunities',
                            'Operational efficiency improvements'
                        ],
                        marketConditions: [
                            'South African business environment and economic factors',
                            'Load shedding and infrastructure challenges',
                            'Digital transformation acceleration post-COVID',
                            lead.industry ? `${lead.industry} sector trends and opportunities` : 'Cross-industry market trends',
                            'Currency fluctuation impacts on business',
                            'Skills shortage and talent retention challenges'
                        ],
                        seasonalFactors: [
                            'Year-end planning and budget preparation',
                            'Q4 decision-making acceleration',
                            'New year strategic planning cycles',
                            'Holiday period business continuity',
                            'Annual review and goal-setting periods'
                        ]
                    }
                };

                // Call email API route directly
                const emailResponse = await fetch('/api/ai/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(emailRequest),
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                });
                
                // Create templates from AI response
                const templates: Template[] = [
                    {
                        id: '1',
                        title: `🤖 AI Email: ${emailResponse.subject}`,
                        content: `Subject: ${emailResponse.subject}\n\n${emailResponse.body}`,
                        tone
                    }
                ];

                // Add alternative templates if provided
                if (emailResponse.alternativeSubjectLines && emailResponse.alternativeSubjectLines.length > 0) {
                    emailResponse.alternativeSubjectLines.forEach((subject: string, index: number) => {
                        templates.push({
                            id: `${index + 2}`,
                            title: `📧 Alternative: ${subject}`,
                            content: `Subject: ${subject}\n\n${emailResponse.body}`,
                            tone
                        });
                    });
                }

                return templates;

            } else if (actionType === 'message') {
                // Prepare AI service request for message generation
                const messageRequest: MessageTemplateRequest = {
                    recipientName: lead.name,
                    recipientPhone: lead.phone,
                    messageType: 'sms',
                    templateType: getMessageTypeFromLeadStatus(lead.status),
                    leadData: {
                        uid: lead.uid,
                        name: lead.name,
                        email: lead.email,
                        phone: lead.phone,
                        status: lead.status,
                        source: lead.source,
                        userQualityRating: lead.userQualityRating,
                        lastContactDate: safeISOString(lead.updatedAt),
                        estimatedValue: lead.estimatedValue,
                        assignee: lead.owner?.name,
                        notes: lead.notes,
                        temperature: lead.temperature,
                        companyName: lead.companyName,
                    },
                    tone: tone === 'professional' ? 'professional' :
                          tone === 'friendly' ? 'friendly' :
                          tone === 'urgent' ? 'urgent' : 'professional',
                    customMessage: lead.notes ? `Context: ${lead.notes}` : undefined,
                };

                // Call message API route directly
                const messageResponse = await fetch('/api/ai/message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messageRequest),
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                });
                
                // Create templates from AI response
                const templates: Template[] = [
                    {
                        id: '1',
                        title: `📱 AI SMS Message`,
                        content: messageResponse.message,
                        tone
                    }
                ];

                // Add fallback message if provided
                if (messageResponse.fallbackMessage) {
                    templates.push({
                        id: '2',
                        title: `📱 Shorter SMS Version`,
                        content: messageResponse.fallbackMessage,
                        tone
                    });
                }

                return templates;

            } else if (actionType === 'call') {
                // For call scripts, we'll still use local generation since there's no specific call AI endpoint
                const templates: Template[] = [
                    {
                        id: '1',
                        title: `📞 Call Script - ${tone} Approach`,
                        content: generateCallScript(lead, tone),
                        tone
                    }
                ];

                return templates;
            }

            // Fallback if no action type matches
            return [];

        } catch (error) {
            console.error('Error generating templates with AI service:', error);
            
            // Fallback to basic templates if AI service fails
            const fallbackTemplates = generateFallbackTemplates(lead, tone, actionType);
            return fallbackTemplates;
        }
    }, [lead]);

    // Helper function to map lead status to email template type
    const getTemplateTypeFromLeadStatus = (status: string): EnhancedTemplateType => {
        switch (status) {
            case 'PENDING':
                return 'introduction';
            case 'REVIEW':
                return 'follow_up';
            case 'APPROVED':
                return 'closing';
            case 'DECLINED':
                return 're_engagement';
            case 'CONVERTED':
                return 'check_in';
            case 'CANCELLED':
                return 're_engagement';
            default:
                return 'follow_up';
        }
    };

    // Helper function to map lead status to message template type
    const getMessageTypeFromLeadStatus = (status: string): MessageTemplateRequest['templateType'] => {
        switch (status) {
            case 'PENDING':
                return 'follow_up';
            case 'REVIEW':
                return 'reminder';
            case 'APPROVED':
                return 'thank_you';
            case 'DECLINED':
                return 'follow_up';
            case 'CONVERTED':
                return 'thank_you';
            case 'CANCELLED':
                return 'follow_up';
            default:
                return 'follow_up';
        }
    };

    // Helper function to map tone to AI service configuration
    const mapToneToConfiguration = (tone: ToneType): ToneConfiguration => {
        const baseMapping: Record<ToneType, ToneConfiguration['baseTone']> = {
            'professional': 'professional',
            'friendly': 'friendly',
            'urgent': 'urgent',
            'consultative': 'consultative',
            'empathetic': 'empathetic',
            'collaborative': 'collaborative',
            'strategic': 'results-driven',
            'assertive': 'authoritative',
            'warm': 'encouraging',
            'casual': 'friendly',
        };

        return {
            baseTone: baseMapping[tone] || 'professional',
            intensity: tone === 'urgent' ? 'strong' : 
                      tone === 'casual' ? 'subtle' : 'moderate',
            regionalAdaptation: 'south_african',
            industrySpecific: true
        };
    };

    // Fallback template generation function (used only when AI service fails)
    const generateFallbackTemplates = (lead: any, tone: ToneType, actionType: Exclude<ActionType, null>): Template[] => {
        if (actionType === 'email') {
            return [
                {
                    id: '1',
                    title: `⚠️ Fallback ${tone} Email (AI Unavailable)`,
                    content: `Subject: Following up on your inquiry - ${lead.name}\n\nDear ${lead.name},\n\nI hope this email finds you well. I wanted to follow up on your recent inquiry and see how we can assist you.\n\n${lead.notes ? `Regarding your specific needs: ${lead.notes}\n\n` : ''}I believe we have solutions that could be valuable for ${lead.companyName || 'your business'}.\n\nWould you have time for a brief call this week to discuss how we can help?\n\nBest regards,\nYour Sales Team\n\n[Note: This is a basic template. AI generation is currently unavailable.]`,
                    tone
                }
            ];
        } else if (actionType === 'message') {
            return [
                {
                    id: '1',
                    title: `⚠️ Fallback ${tone} SMS (AI Unavailable)`,
                    content: `Hi ${lead.name}! Following up on your inquiry. Would you have time for a quick call to discuss how we can help ${lead.companyName || 'your business'}? Let me know what works for you. [Basic template - AI unavailable]`,
                    tone
                }
            ];
        } else {
            return [
                {
                    id: '1',
                    title: `📞 Basic ${tone} Call Script`,
                    content: generateCallScript(lead, tone),
                    tone
                }
            ];
        }
    };

    // Call script generation function
    const generateCallScript = (lead: any, tone: ToneType): string => {
        const greeting = tone === 'casual' ? `Hi ${lead.name}` : 
                        tone === 'friendly' ? `Hello ${lead.name}` : 
                        `Good morning/afternoon ${lead.name}`;
        
        return `${greeting}, this is [Your Name] from [Company Name].\n\nI'm calling regarding your recent inquiry ${lead.notes ? `about ${lead.notes}` : 'with us'}.\n\nI wanted to personally reach out to see how we can best assist ${lead.companyName || 'your business'} and answer any questions you might have.\n\nDo you have a few minutes to discuss your needs and how we might be able to help?\n\n[Wait for response and engage based on their availability]\n\nKey Points to Cover:\n- Understand their specific requirements\n- Explain relevant solutions\n- Schedule follow-up if needed\n- Confirm next steps`;
    };

    // Handle message editing
    const handleMessageChange = useCallback((value: string) => {
        setCustomMessage(value);
    }, []);

    // Handle send action
    const handleSendMessage = useCallback(() => {
        const messageData = {
            type: activeSheet,
            recipient: {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                leadId: lead.uid
            },
            template: {
                id: selectedTemplate?.id,
                title: selectedTemplate?.title,
                tone: selectedTone
            },
            content: customMessage,
            timestamp: new Date().toISOString(),
            sender: {
                // Add sender info here when available
                name: '[Your Name]',
                company: '[Company]'
            }
        };

        console.log('📧 EMAIL/MESSAGE DATA TO BE SENT:', {
            ...messageData,
            preview: customMessage.substring(0, 100) + (customMessage.length > 100 ? '...' : '')
        });

        // TODO: Replace console.log with actual server API call to send email/message
        // Example: await sendEmailOrMessage(messageData);
        // This should integrate with the email/SMS service provider
        // and handle success/error responses appropriately

        // Here you would integrate with your actual sending service
        // For now, just close the sheet
        closeSheet();

        // Show success message (you might want to use a toast here)
        alert(`✅ ${activeSheet?.toUpperCase()} template generated successfully for ${lead.name}!\n\n📋 Template details have been logged to console for your review.\n\n💡 Next: Integrate with your email/SMS service to send automatically.`);
    }, [activeSheet, customMessage, lead, selectedTemplate, selectedTone, closeSheet]);

    // Handle call action
    const handleCallAction = useCallback(() => {
        console.log('📞 CALL ACTION:', {
            leadName: lead.name,
            phoneNumber: lead.phone,
            leadId: lead.uid,
            timestamp: new Date().toISOString()
        });

        // Check if on mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // Try to open dialer on mobile
            window.location.href = `tel:${lead.phone}`;
        } else {
            // Show instruction for desktop
            alert(`📱 Please call ${lead.name} from your mobile phone:\n\n${lead.phone}\n\nClick OK to copy the number to clipboard.`);

            // Copy to clipboard
            navigator.clipboard.writeText(lead.phone).catch(err => {
                console.error('Failed to copy to clipboard:', err);
            });
        }

        closeSheet();
    }, [lead, closeSheet]);

    return (
        <>
            <div
                id={id}
                className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-task-appear"
                style={cardStyle}
                onClick={openModal}
            >
                <div className="flex items-center justify-between mb-2">
                    {/* Lead Name & Status Badge */}
                    <div className="flex-1 min-w-0">
                        <div
                            className="flex items-center justify-between w-full gap-2"
                            id="lead-quick-actions"
                        >
                            <h3
                                id="lead-name-field"
                                className="text-sm font-medium uppercase truncate text-card-foreground font-body"
                            >
                                {formatNameInitialSurname(lead.name)}
                            </h3>
                            <div className="flex items-center gap-2">
                                <Mail
                                    strokeWidth={1.5}
                                    size={18}
                                    className="cursor-pointer text-muted-foreground/50 hover:text-muted-foreground"
                                    onClick={(e) =>
                                        handleActionClick(e, 'email')
                                    }
                                />
                                <MessageSquare
                                    strokeWidth={1.5}
                                    size={18}
                                    className="cursor-pointer text-muted-foreground/50 hover:text-muted-foreground"
                                    onClick={(e) =>
                                        handleActionClick(e, 'message')
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={`text-[9px] font-normal uppercase font-body px-4 py-1 border-0 ${getStatusBadgeColor(
                                    lead?.status,
                                )}`}
                            >
                                {lead?.status?.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Lead Details */}
                <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {/* Lead Notes */}
                    {lead.notes && (
                        <p className="text-xs font-normal line-clamp-2 font-body">
                            {lead?.notes}
                        </p>
                    )}

                    {/* Lead Meta Information */}
                    <div
                        id="lead-contact-details"
                        className="grid grid-cols-2 gap-1"
                    >
                        {/* Email */}
                        <div className="flex items-center col-span-2">
                            <Mail className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                {lead?.email}
                            </span>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center col-span-2">
                            <Phone className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                {lead?.phone}
                            </span>
                        </div>

                        {/* Branch */}
                        {lead.branch && (
                            <div className="flex items-center col-span-2">
                                <Building className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {lead.branch.name}
                                </span>
                            </div>
                        )}

                        {/* Created Date */}
                        <div
                            id="lead-metadata-section"
                            className="flex items-center col-span-2"
                        >
                            <Clock className="w-5 h-5 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                Created: {formatDate(lead?.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                   {/* Lead Metrics Row */}
                   <div className="flex items-center justify-between gap-1 my-3">
                            <div className="flex items-center gap-3">
                                {/* Temperature */}
                                {lead.temperature && (
                                    <div className="flex items-center gap-1" title={`Temperature: ${lead.temperature}`}>
                                        <ThermometerSun className={`w-5 h-5 ${getTemperatureColor(lead.temperature)}`} strokeWidth={1.5} />
                                        <span className={`text-[10px] font-medium uppercase font-body ${getTemperatureColor(lead.temperature)}`}>
                                            {lead.temperature.charAt(0)}
                                        </span>
                                    </div>
                                )}

                                {/* Source */}
                                {lead.source && (
                                    <div className="flex items-center gap-1" title={`Source: ${lead.source.replace(/_/g, ' ')}`}>
                                        {lead.source === 'WEBSITE' && <Globe className={`w-5 h-5 ${getSourceColor(lead.source)}`} strokeWidth={1.5} />}
                                        {lead.source === 'SOCIAL_MEDIA' && <Share2 className={`w-5 h-5 ${getSourceColor(lead.source)}`} strokeWidth={1.5} />}
                                        {lead.source === 'REFERRAL' && <Target className={`w-5 h-5 ${getSourceColor(lead.source)}`} strokeWidth={1.5} />}
                                        {lead.source === 'EMAIL_CAMPAIGN' && <Mail className={`w-5 h-5 ${getSourceColor(lead.source)}`} strokeWidth={1.5} />}
                                        {lead.source === 'COLD_CALL' && <Phone className={`w-5 h-5 ${getSourceColor(lead.source)}`} strokeWidth={1.5} />}
                                        {!['WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL', 'EMAIL_CAMPAIGN', 'COLD_CALL'].includes(lead.source) && 
                                            <Zap className={`w-5 h-5 ${getSourceColor(lead.source)}`} strokeWidth={1.5} />}
                                        <span className={`text-[10px] font-medium uppercase font-body ${getSourceColor(lead.source)}`}>
                                            {lead.source.charAt(0)}
                                        </span>
                                    </div>
                                )}

                                {/* Budget Range */}
                                {lead.budgetRange && (
                                    <div className="flex items-center gap-1" title={`Budget: ${lead.budgetRange.replace(/_/g, ' ')}`}>
                                        <DollarSign className={`w-5 h-5 ${getBudgetColor(lead.budgetRange)}`} strokeWidth={1.5} />
                                        <span className={`text-[10px] font-medium uppercase font-body ${getBudgetColor(lead.budgetRange)}`}>
                                            {lead.budgetRange.includes('1M') || lead.budgetRange === 'OVER_1M' ? '1M+' :
                                             lead.budgetRange.includes('500K') ? '500K' :
                                             lead.budgetRange.includes('250K') ? '250K' :
                                             lead.budgetRange.includes('100K') ? '100K' :
                                             lead.budgetRange.includes('50K') ? '50K' :
                                             lead.budgetRange.includes('25K') ? '25K' :
                                             lead.budgetRange.includes('10K') ? '10K' :
                                             lead.budgetRange.includes('5K') ? '5K' :
                                             lead.budgetRange.includes('1K') ? '1K' : 'U1K'}
                                        </span>
                                    </div>
                                )}

                                {/* Quality Rating */}
                                {lead.userQualityRating && (
                                    <div className="flex items-center gap-1" title={`Quality Rating: ${lead.userQualityRating}/5`}>
                                        <Star className={`w-5 h-5 ${getRatingColor(lead.userQualityRating)}`} strokeWidth={1.5} />
                                        <span className={`text-[10px] font-medium font-body ${getRatingColor(lead.userQualityRating)}`}>
                                            {lead.userQualityRating}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                {/* Owner */}
                {lead?.owner && (
                    <div className="flex items-center justify-start gap-1 pt-2 mt-2 border-t border-border/20">
                        <div className="flex -space-x-2">
                            <Avatar className="border w-9 h-9 border-primary">
                                <AvatarImage
                                    src={lead?.owner?.photoURL}
                                    alt={lead?.owner?.name}
                                />
                                <AvatarFallback className="text-[7px] font-normal uppercase font-body">
                                    {lead?.owner?.name && lead?.owner?.surname ? 
                                        `${lead.owner.name.charAt(0)}${lead.owner.surname.charAt(0)}` :
                                        lead?.owner?.name ? lead.owner.name.charAt(0) : 'U'
                                    }
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex items-center justify-center text-[10px]">
                            <span className="text-[10px] font-normal font-body text-muted-foreground">
                                {lead?.owner?.name ? formatNameInitialSurname(`${lead.owner.name} ${lead.owner.surname || ''}`.trim()) : 'Unassigned'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Lead Details Modal */}
            {isModalOpen && (
                <LeadDetailsModal
                    lead={lead}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onUpdateStatus={handleStatusChange}
                    onUpdate={onUpdate}
                    onDelete={handleDelete}
                />
            )}

            {/* Action Sheets */}
            <Sheet
                open={activeSheet !== null}
                onOpenChange={(open) => !open && setActiveSheet(null)}
            >
                <SheetContent side="right" className="w-full sm:max-w-2xl">
                    <SheetHeader>
                        <SheetTitle className="text-xs font-normal uppercase font-body">
                            {getSheetTitle()}
                        </SheetTitle>
                        <SheetDescription className="text-[10px] font-normal font-body">
                            {getSheetDescription()}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6">
                        {/* Enhanced Tone Selection v4 */}
                        <div className="mb-6">
                            <label className="block mb-2 text-xs font-normal uppercase font-body text-muted-foreground">
                                Communication Tone
                            </label>
                            <Select value={selectedTone} onValueChange={(value: ToneType) => handleToneChange(value)}>
                                <SelectTrigger className="h-10 text-xs font-body border-border/50 bg-background/50 hover:bg-background focus:ring-1 focus:ring-primary/20 focus:border-primary/30">
                                    <SelectValue placeholder="Choose your communication style" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64 border-border/50 bg-background/95 backdrop-blur-sm">
                                    <SelectItem value="professional" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Professional</span>
                                            <span className="text-[10px] text-muted-foreground">Formal, business-appropriate tone</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="friendly" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Friendly</span>
                                            <span className="text-[10px] text-muted-foreground">Warm and approachable</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="consultative" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Consultative</span>
                                            <span className="text-[10px] text-muted-foreground">Advisory and solution-focused</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="empathetic" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Empathetic</span>
                                            <span className="text-[10px] text-muted-foreground">Understanding and supportive</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="collaborative" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Collaborative</span>
                                            <span className="text-[10px] text-muted-foreground">Partnership-oriented approach</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="strategic" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Strategic</span>
                                            <span className="text-[10px] text-muted-foreground">Analytical and long-term focused</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="urgent" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Urgent</span>
                                            <span className="text-[10px] text-muted-foreground">Direct and time-sensitive</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="assertive" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Assertive</span>
                                            <span className="text-[10px] text-muted-foreground">Confident and decisive</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="warm" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Warm</span>
                                            <span className="text-[10px] text-muted-foreground">Personal and caring</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="casual" className="py-3 text-xs cursor-pointer font-body">
                                        <div className="flex flex-col space-y-1">
                                            <span className="font-medium">Casual</span>
                                            <span className="text-[10px] text-muted-foreground">Relaxed and informal</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Contact Information */}
                        <div className="flex items-center p-3 mb-6 border rounded-lg border-border">
                            <div className="flex items-center w-full">
                                {activeSheet === 'call' && <PhoneCall className="w-5 h-5 mr-3 text-primary" />}
                                {activeSheet === 'email' && <Mail className="w-5 h-5 mr-3 text-primary" />}
                                {activeSheet === 'message' && <MessageSquare className="w-5 h-5 mr-3 text-primary" />}
                                <div className="flex-1">
                                    <p className="text-sm font-medium font-body">
                                        {activeSheet === 'email' ? lead.email : lead.phone}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-body">
                                        {activeSheet === 'call' && 'Call script for conversation guidance'}
                                        {activeSheet === 'email' && 'Email will be sent to this address'}
                                        {activeSheet === 'message' && 'SMS will be sent to this number'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!isPreviewMode ? (
                            /* Template Selection */
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium uppercase font-body">
                                        {isGeneratingTemplates ? 'Generating Templates...' : activeSheet === 'call' ? 'Choose Call Script' : 'Choose Template'}
                                    </h3>
                                    <Button
                                        onClick={handleRegenerateTemplates}
                                        variant="ghost"
                                        size="sm"
                                        disabled={isGeneratingTemplates || isRegenerating}
                                        className="text-[10px] font-body h-6 px-2"
                                    >
                                        {isRegenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
                                    </Button>
                                </div>

                                {isGeneratingTemplates ? (
                                    <div className="p-4 text-center border rounded-lg border-border bg-background/50">
                                        <div className="w-5 h-5 mx-auto mb-2 border-2 rounded-full animate-spin border-primary border-t-transparent"></div>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            🤖 AI is generating personalized {activeSheet === 'email' ? 'email templates' : activeSheet === 'message' ? 'SMS messages' : 'call scripts'} based on your selected tone and lead context...
                                        </p>
                                        <p className="mt-2 text-[9px] text-muted-foreground/70 font-body">
                                            This may take a few seconds
                                        </p>
                                    </div>
                                ) : availableTemplates.length === 0 ? (
                                    <div className="p-4 text-center border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-500/20">
                                        <div className="w-8 h-8 mx-auto mb-2 text-orange-500">⚠️</div>
                                        <p className="text-sm text-orange-800 dark:text-orange-200 font-body">
                                            AI Template Generation Failed
                                        </p>
                                        <p className="mt-1 text-[10px] text-orange-600 dark:text-orange-300 font-body">
                                            The AI service for {activeSheet === 'email' ? 'email' : 'SMS'} generation is currently unavailable. 
                                            Basic fallback templates will be used instead.
                                        </p>
                                        <div className="mt-2 text-[9px] text-orange-500 dark:text-orange-400 font-body">
                                            💡 AI templates provide personalized content based on lead context, status, and industry insights.
                                        </div>
                                        <Button
                                            onClick={handleRegenerateTemplates}
                                            variant="outline"
                                            size="sm"
                                            className="mt-3 text-xs text-orange-700 border-orange-300 hover:bg-orange-100 font-body"
                                        >
                                            🔄 Retry AI Generation
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {availableTemplates.map((template) => (
                                            <Card
                                                key={template.id}
                                                className="transition-colors cursor-pointer hover:bg-accent"
                                                onClick={() => handleTemplateSelect(template)}
                                            >
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-sm font-medium font-body">
                                                        {template.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-sm text-muted-foreground font-body line-clamp-4">
                                                        {template.content}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Preview and Edit Mode */
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium uppercase font-body">
                                        Preview & Edit
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={handleBackToTemplates}
                                            variant="ghost"
                                            size="sm"
                                            disabled={isGeneratingTemplates}
                                            className="text-[10px] font-body h-6 px-2"
                                        >
                                            ← Back to {activeSheet === 'call' ? 'Scripts' : 'Templates'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-4 border rounded-lg border-border bg-background/50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Eye className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium font-body">
                                                {selectedTemplate?.title}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-body">
                                            Tone: <span className="capitalize">{selectedTone}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-xs font-normal uppercase font-body">
                                            {activeSheet === 'call' ? 'Call Script:' : activeSheet === 'email' ? 'Email Content:' : 'SMS Message:'}
                                        </label>
                                        <Textarea
                                            value={customMessage}
                                            onChange={(e) => handleMessageChange(e.target.value)}
                                            rows={activeSheet === 'email' ? 16 : activeSheet === 'call' ? 10 : 6}
                                            className="text-sm font-body min-h-[200px] resize-y"
                                            placeholder={
                                                activeSheet === 'call'
                                                    ? 'Review and customize your call script...'
                                                    : activeSheet === 'email'
                                                    ? 'Edit your complete email content here...'
                                                    : 'Edit your SMS message here...'
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <SheetFooter>
                        <SheetClose asChild>
                            <Button
                                variant="outline"
                                className="text-xs font-normal uppercase font-body"
                            >
                                Close
                            </Button>
                        </SheetClose>
                                                {isPreviewMode ? (
                            <Button
                                onClick={activeSheet === 'call' ? handleCallAction : handleSendMessage}
                                disabled={activeSheet !== 'call' && !customMessage.trim()}
                                className="text-xs font-normal text-white uppercase font-body"
                            >
                                {activeSheet === 'call' ? (
                                    <>
                                        <PhoneCall className="w-4 h-4 mr-2" />
                                        Start Call
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send {activeSheet}
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                disabled={availableTemplates.length === 0 || isGeneratingTemplates}
                                className="text-xs font-normal text-white uppercase font-body"
                                onClick={() => {
                                    if (availableTemplates.length > 0) {
                                        handleTemplateSelect(availableTemplates[0]);
                                    }
                                }}
                            >
                                {isGeneratingTemplates ? 'Generating...' : activeSheet === 'call' ? 'Select Script' : 'Select Template'}
                            </Button>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

// Export a memoized version to prevent unnecessary re-renders
export const LeadCard = memo(LeadCardComponent);
