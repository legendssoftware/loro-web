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

// Create the LeadCard as a standard component
function LeadCardComponent({
    lead,
    onUpdateStatus,
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

    const formatDate = (date?: Date) => {
        if (!date) return null;
        return format(new Date(date), 'MMM d, yyyy');
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

    const closeSheet = useCallback(() => {
        setActiveSheet(null);
        setSelectedTemplate(null);
        setIsPreviewMode(false);
        setCustomMessage('');
        setSelectedTone('professional');
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

    // Enhanced AI v4 Template Generation - Context-aware, time-aware, and intelligent
    const generateTemplates = useCallback(async (tone: ToneType, actionType: Exclude<ActionType, null>) => {
        setIsGeneratingTemplates(true);

        // Enhanced context analysis for better templates
        const leadContext = {
            // Lead basic info
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            companyName: lead.companyName,

            // Lead status and stage analysis
            status: lead.status,
            isNewLead: lead.status === 'PENDING',
            isConverted: lead.status === 'CONVERTED',
            isDeclined: lead.status === 'DECLINED',
            needsReview: lead.status === 'REVIEW',
            isApproved: lead.status === 'APPROVED',

            // Time-aware context
            daysSinceCreated: Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            isRecentLead: Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)) <= 3,
            isStale: Math.floor((new Date().getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)) > 14,
            createdAt: lead.createdAt,
            currentQuarter: Math.floor(new Date().getMonth() / 3) + 1,

            // Lead activity and engagement
            hasNotes: !!lead.notes,
            notes: lead.notes,
            hasOwner: !!lead.owner,
            leadOwnerName: lead.owner?.name, // Person who created the lead
            
            // Current sender context (TODO: Get from current user session)
            currentSenderName: '[Current User Name]', // This should come from logged-in user
            isOwnerSending: false, // TODO: Check if current user is the lead owner
            
            // Status change context
            hasStatusChanges: !!lead.changeHistory?.length,
            lastStatusChange: lead.changeHistory?.[lead.changeHistory.length - 1],
            statusChangeReason: lead.statusChangeReason,
            statusChangeDescription: lead.statusChangeDescription,
            nextStep: lead.nextStep,

            // Branch context
            branchName: lead.branch?.name,
            branchLocation: lead.branch?.address ? `${lead.branch.address.city}, ${lead.branch.address.state}` : null,

            // Tone-specific context
            tone: tone,
            urgencyLevel: tone === 'urgent' ? 'high' : tone === 'casual' ? 'low' : 'medium'
        };

        // Mock AI template generation with enhanced context awareness
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

                const generateContextualContent = (templateType: string, action: string) => {
            // Enhanced AI v4 Content Generation - Complete, professional, and contextually aware
            
            // Time and context awareness
            const now = new Date();
            const timeOfDay = now.getHours();
            const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
            const currentDate = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Enhanced greetings based on time and tone
            const getGreeting = () => {
                const baseGreeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening';
                
                if (tone === 'warm' || tone === 'friendly') {
                    return timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening';
                } else if (tone === 'casual') {
                    return timeOfDay < 12 ? 'Morning' : timeOfDay < 17 ? 'Afternoon' : 'Evening';
                } else if (tone === 'professional') {
                    return baseGreeting;
                }
                return baseGreeting;
            };

            // Status-specific intelligent context
            const statusInsights = {
                'PENDING': {
                    context: 'new inquiry',
                    action: 'discuss how we can help',
                    urgency: 'timely response',
                    nextStep: 'schedule an initial consultation'
                },
                'REVIEW': {
                    context: 'application under review',
                    action: 'provide an update on progress',
                    urgency: 'important update',
                    nextStep: 'finalize the review process'
                },
                'APPROVED': {
                    context: 'approved application',
                    action: 'move forward with next steps',
                    urgency: 'ready to proceed',
                    nextStep: 'begin implementation'
                },
                'DECLINED': {
                    context: 'previous inquiry',
                    action: 'explore alternative solutions',
                    urgency: 'new opportunities',
                    nextStep: 'discuss revised options'
                },
                'CONVERTED': {
                    context: 'successful partnership',
                    action: 'ensure continued success',
                    urgency: 'ongoing support',
                    nextStep: 'optimize current solutions'
                },
                'CANCELLED': {
                    context: 'previous interest',
                    action: 'reconnect and explore new possibilities',
                    urgency: 'changed circumstances',
                    nextStep: 'reassess current needs'
                }
            };

            // Advanced tone-based language and personality
            const tonePersonality = {
                'professional': {
                    style: 'formal and business-focused',
                    language: 'precise and respectful',
                    closing: 'I look forward to hearing from you.',
                    signature: 'Best regards,'
                },
                'friendly': {
                    style: 'warm and approachable',
                    language: 'conversational yet professional',
                    closing: 'Hope to hear from you soon!',
                    signature: 'Warm regards,'
                },
                'consultative': {
                    style: 'advisory and solution-focused',
                    language: 'insightful and strategic',
                    closing: 'I believe we can create significant value together.',
                    signature: 'Best regards,'
                },
                'empathetic': {
                    style: 'understanding and supportive',
                    language: 'caring and considerate',
                    closing: 'I understand your needs and am here to help.',
                    signature: 'With understanding,'
                },
                'collaborative': {
                    style: 'partnership-oriented',
                    language: 'inclusive and team-focused',
                    closing: 'Let\'s work together on this.',
                    signature: 'Looking forward to our collaboration,'
                },
                'strategic': {
                    style: 'analytical and forward-thinking',
                    language: 'data-driven and insightful',
                    closing: 'The strategic benefits are significant.',
                    signature: 'Strategically yours,'
                },
                'urgent': {
                    style: 'direct and time-sensitive',
                    language: 'clear and immediate',
                    closing: 'Time is of the essence - let\'s connect soon.',
                    signature: 'Urgently yours,'
                },
                'assertive': {
                    style: 'confident and decisive',
                    language: 'strong and purposeful',
                    closing: 'I\'m confident this is the right move.',
                    signature: 'Confidently,'
                },
                'warm': {
                    style: 'personal and caring',
                    language: 'heartfelt and genuine',
                    closing: 'Looking forward to connecting with you personally.',
                    signature: 'Warmly,'
                },
                'casual': {
                    style: 'relaxed and informal',
                    language: 'easy-going yet professional',
                    closing: 'Let me know what works for you!',
                    signature: 'Cheers,'
                }
            };

            const currentPersonality = tonePersonality[tone] || tonePersonality['professional'];
            const currentStatusInsight = statusInsights[leadContext.status] || statusInsights['PENDING'];

            // Business card integration  
            const businessCardSection = lead?.owner?.businesscardURL 
                ? `\n\n📧 My Business Card: ${lead.owner.businesscardURL}\n`
                : leadContext.currentSenderName !== '[Current User Name]'
                ? `\n\n📧 Connect with me: ${leadContext.currentSenderName}\n`
                : '';

            // Company signature with all available details
            const getCompanySignature = () => {
                let signature = `\n\n${currentPersonality.signature}\n`;
                signature += `${leadContext.currentSenderName}\n`;
                
                if (leadContext.branchName) {
                    signature += `${leadContext.branchName}\n`;
                }
                
                if (leadContext.branchLocation) {
                    signature += `${leadContext.branchLocation}\n`;
                }
                
                // Add business card if available
                if (lead?.owner?.businesscardURL) {
                    signature += `\n📧 View my business card: ${lead.owner.businesscardURL}\n`;
                }
                
                // Removed AI reference as requested
                
                return signature;
            };

            // Generate content based on action type
            if (action === 'email') {
                let subject = '';
                let content = '';
                
                switch (templateType) {
                    case 'status-based':
                        subject = `Re: ${leadContext.companyName || leadContext.name} - ${currentStatusInsight.context} update`;
                        content = `Subject: ${subject}\n\n`;
                        content += `${getGreeting()} ${leadContext.name},\n\n`;
                        
                        // Opening based on lead status and time context
                        if (leadContext.isRecentLead) {
                            content += `Thank you for reaching out to us recently. I wanted to personally follow up on your ${currentStatusInsight.context}.`;
                        } else if (leadContext.isStale) {
                            content += `I hope this email finds you well. It's been ${leadContext.daysSinceCreated} days since we last connected, and I wanted to provide you with an important update regarding your ${currentStatusInsight.context}.`;
                        } else {
                            content += `I hope you're having a great ${dayOfWeek}. I wanted to reach out regarding your ${currentStatusInsight.context} and ${currentStatusInsight.action}.`;
                        }
                        
                        content += `\n\n`;
                        
                        // Lead-specific context
                        if (leadContext.notes) {
                            content += `**Background Context:**\n`;
                            content += `Based on our previous discussions about "${leadContext.notes}", I've been working on solutions that specifically address your needs.\n\n`;
                        }
                        
                        // Status-specific information
                        content += `**Current Status Update:**\n`;
                        content += `Your application is currently "${leadContext.status}" which means we're ready to ${currentStatusInsight.action}. `;
                        
                        if (leadContext.nextStep) {
                            content += `The next step, as we discussed, is: ${leadContext.nextStep}.\n\n`;
                        } else {
                            content += `I believe the next logical step is to ${currentStatusInsight.nextStep}.\n\n`;
                        }
                        
                        // Company/branch specific value proposition
                        if (leadContext.branchName && leadContext.branchLocation) {
                            content += `**Our Local Advantage:**\n`;
                            content += `Our ${leadContext.branchName} team in ${leadContext.branchLocation} has been specifically prepared to support your requirements.\n\n`;
                        }
                        
                        // Team collaboration reference (if lead owner is different from sender)
                        if (leadContext.leadOwnerName && !leadContext.isOwnerSending) {
                            content += `**Team Collaboration:**\n`;
                            content += `I've been working closely with ${leadContext.leadOwnerName}, who originally handled your inquiry, to ensure continuity and the best possible service.\n\n`;
                        }
                        
                        // Call to action based on tone
                        content += `**Next Steps:**\n`;
                        if (currentPersonality.style.includes('urgent') || tone === 'urgent') {
                            content += `Given the time-sensitive nature of your ${currentStatusInsight.context}, I'd like to schedule a call within the next 24-48 hours to ${currentStatusInsight.action}.`;
                        } else {
                            content += `I'd love to schedule a convenient time this week to ${currentStatusInsight.action} and answer any questions you might have.`;
                        }
                        
                        content += `\n\n${currentPersonality.closing}`;
                        content += getCompanySignature();
                        break;

                    case 'time-aware':
                        subject = `${leadContext.isRecentLead ? '⏰ Quick Follow-up' : '🔄 Reconnecting'} - ${leadContext.name}`;
                        content = `Subject: ${subject}\n\n`;
                        content += `${getGreeting()} ${leadContext.name},\n\n`;
                        
                        // Time-contextual opening
                        if (leadContext.isRecentLead) {
                            content += `I wanted to reach out while your inquiry is still fresh in both our minds. Thank you for taking the time to connect with us ${leadContext.daysSinceCreated === 0 ? 'today' : leadContext.daysSinceCreated === 1 ? 'yesterday' : `${leadContext.daysSinceCreated} days ago`}.`;
                        } else if (leadContext.isStale) {
                            content += `I hope this ${dayOfWeek} finds you well! I realized it's been ${leadContext.daysSinceCreated} days since we last spoke, and I didn't want your inquiry to fall through the cracks.`;
                        } else {
                            content += `I hope you're having a productive ${dayOfWeek}! I wanted to check in and see how things are progressing since we last connected.`;
                        }
                        
                        content += `\n\n`;
                        
                        // Timing-based value proposition
                        content += `**Perfect Timing:**\n`;
                        const quarterContext = leadContext.currentQuarter === 1 ? 'Q1 planning season' : 
                                            leadContext.currentQuarter === 2 ? 'mid-year optimization period' :
                                            leadContext.currentQuarter === 3 ? 'peak performance quarter' : 
                                            'year-end strategy period';
                        
                        content += `Given that we're in ${quarterContext}, this is actually an ideal time to ${currentStatusInsight.action}. Many of our clients find that ${leadContext.status.toLowerCase()} applications during this period yield the best results.\n\n`;
                        
                        // Lead specific context with time relevance
                        if (leadContext.notes) {
                            content += `**Relevant to Your Needs:**\n`;
                            content += `Regarding your specific requirements about "${leadContext.notes.substring(0, 100)}${leadContext.notes.length > 100 ? '...' : ''}", I've been monitoring industry trends and have some insights that could be valuable.\n\n`;
                        }
                        
                        // Time-sensitive call to action
                        content += `**Let's Reconnect:**\n`;
                        content += `${currentPersonality.closing} Would you have 15-20 minutes this week for a brief call? I have some updates that I think you'll find quite relevant to your situation.`;
                        
                        content += getCompanySignature();
                        break;

                    case 'personalized':
                        subject = `Customized solution for ${leadContext.companyName || leadContext.name} | ${currentDate}`;
                        content = `Subject: ${subject}\n\n`;
                        content += `${getGreeting()} ${leadContext.name},\n\n`;
                        
                        // Highly personalized opening
                        if (leadContext.companyName) {
                            content += `I've been doing some research on ${leadContext.companyName} and I'm impressed by what I've discovered. Based on your industry and current market position, I believe we have a solution that's perfectly aligned with your strategic objectives.`;
                        } else {
                            content += `I've been thinking about your specific situation and requirements, and I wanted to reach out with a personalized approach that I believe will be highly relevant to your needs.`;
                        }
                        
                        content += `\n\n`;
                        
                        // Personalized insights
                        content += `**Tailored to Your Situation:**\n`;
                        if (leadContext.statusChangeReason) {
                            content += `I understand that ${leadContext.statusChangeReason}, which is exactly why I wanted to present a customized approach.\n\n`;
                        }
                        
                        // Adjust language based on who is sending vs who owns the lead
                        if (leadContext.leadOwnerName && !leadContext.isOwnerSending) {
                            content += `Given your current ${leadContext.status.toLowerCase()} status and the specific details you've shared with us, I've worked with ${leadContext.leadOwnerName} to develop a proposal that addresses your unique requirements.\n\n`;
                        } else {
                            content += `Given your current ${leadContext.status.toLowerCase()} status and the specific details you've shared with us, I've developed a proposal that addresses your unique requirements.\n\n`;
                        }
                        
                        // Specific value proposition
                        content += `**What Makes This Different:**\n`;
                        content += `• Custom solution designed specifically for your needs\n`;
                        content += `• Implementation timeline that works with your schedule\n`;
                        content += `• Dedicated support from our ${leadContext.branchName || 'local'} team\n`;
                        content += `• Flexible approach that adapts to your changing requirements\n\n`;
                        
                        // Notes integration
                        if (leadContext.notes) {
                            content += `**Addressing Your Specific Concerns:**\n`;
                            content += `You mentioned: "${leadContext.notes}"\n`;
                            content += `Our customized approach directly addresses these points with proven solutions.\n\n`;
                        }
                        
                        // Strong call to action
                        content += `**Ready to Move Forward:**\n`;
                        content += `I'd love to walk you through this personalized proposal. When would be a good time for a 30-minute conversation where I can show you exactly how this solution fits your needs?`;
                        
                        content += `\n\n${currentPersonality.closing}`;
                        content += getCompanySignature();
                        break;
                }
                
                return content;
                
            } else if (action === 'message') {
                // Enhanced SMS generation with better context
                let content = '';
                
                switch (templateType) {
                    case 'status-based':
                        content = `${getGreeting()} ${leadContext.name}! `;
                        
                        if (leadContext.isRecentLead) {
                            content += `Thanks for your recent inquiry. `;
                        }
                        
                        content += `Your ${leadContext.status.toLowerCase()} status means we're ready to ${currentStatusInsight.action}. `;
                        
                        if (tone === 'urgent') {
                            content += `Can we connect today? Time-sensitive opportunities available.`;
                        } else {
                            content += `When would be a good time for a quick call this week?`;
                        }
                        
                        if (lead?.owner?.businesscardURL) {
                            content += ` My card: ${lead.owner.businesscardURL}`;
                        }
                        break;

                    case 'time-aware':
                        content = `${getGreeting()} ${leadContext.name}! `;
                        
                        if (leadContext.isStale) {
                            content += `It's been ${leadContext.daysSinceCreated} days - perfect time to reconnect! `;
                        } else if (leadContext.isRecentLead) {
                            content += `Following up on your fresh inquiry while it's still top of mind. `;
                        }
                        
                        if (leadContext.nextStep) {
                            content += `Ready for: ${leadContext.nextStep}? `;
                        }
                        
                        content += `Quick 15-min call this week?`;
                        
                        if (lead?.owner?.businesscardURL) {
                            content += ` 📧 ${lead.owner.businesscardURL}`;
                        }
                        break;

                    case 'personalized':
                        content = `Hi ${leadContext.name}! `;
                        
                        if (leadContext.companyName) {
                            content += `Have a custom solution for ${leadContext.companyName}. `;
                        }
                        
                        if (leadContext.notes) {
                            const shortNotes = leadContext.notes.substring(0, 30);
                            content += `Re: ${shortNotes}${leadContext.notes.length > 30 ? '...' : ''} - `;
                        }
                        
                        content += `personalized approach ready. Available for a quick call?`;
                        
                        if (lead?.owner?.businesscardURL) {
                            content += ` Card: ${lead.owner.businesscardURL}`;
                        }
                        break;
                }
                
                return content;
            }

            return '';
        };

        const templates: Template[] = [
            {
                id: '1',
                title: `${leadContext.status}-Based ${actionType === 'email' ? 'Email' : 'Message'}`,
                content: generateContextualContent('status-based', actionType),
                tone
            },
            {
                id: '2',
                title: `Time-Aware ${actionType === 'email' ? 'Email' : 'Message'} (${leadContext.daysSinceCreated} days)`,
                content: generateContextualContent('time-aware', actionType),
                tone
            },
            {
                id: '3',
                title: `Personalized ${actionType === 'email' ? 'Email' : 'Message'}`,
                content: generateContextualContent('personalized', actionType),
                tone
            }
        ];

        setIsGeneratingTemplates(false);
        return templates;
    }, [lead]);

    // Handle template selection
    const handleTemplateSelect = useCallback((template: Template) => {
        setSelectedTemplate(template);
        setCustomMessage(template.content);
        setIsPreviewMode(true);
    }, []);

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
        alert(`${activeSheet?.toUpperCase()} prepared successfully for ${lead.name}!\nCheck console for full details.`);
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

    // Get available templates for current action type
    const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);

    // Load templates when tone or action changes
    const loadTemplates = useCallback(async () => {
        if (activeSheet && activeSheet !== null) {
            const templates = await generateTemplates(selectedTone, activeSheet);
            setAvailableTemplates(templates);
        }
    }, [activeSheet, selectedTone, generateTemplates]);

    // Load templates when sheet opens or tone changes
    useEffect(() => {
        if (activeSheet) {
            loadTemplates();
        }
    }, [activeSheet, selectedTone, loadTemplates]);

    // Update selected template content when tone changes
    useEffect(() => {
        if (selectedTemplate && activeSheet) {
            const updateTemplateContent = async () => {
                const templates = await generateTemplates(selectedTone, activeSheet);
                const updatedTemplate = templates.find(t => t.id === selectedTemplate.id);
                if (updatedTemplate) {
                    setSelectedTemplate(updatedTemplate);
                    setCustomMessage(updatedTemplate.content);
                }
            };
            updateTemplateContent();
        }
    }, [selectedTone, selectedTemplate, activeSheet, generateTemplates]);

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
                            <Select value={selectedTone} onValueChange={(value: ToneType) => setSelectedTone(value)}>
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
                                        onClick={() => generateTemplates(selectedTone, activeSheet!)}
                                        variant="ghost"
                                        size="sm"
                                        disabled={isGeneratingTemplates}
                                        className="text-[10px] font-body h-6 px-2"
                                    >
                                        🔄 Regenerate
                                    </Button>
                                </div>

                                {isGeneratingTemplates ? (
                                    <div className="p-4 text-center border rounded-lg border-border bg-background/50">
                                        <div className="w-5 h-5 mx-auto mb-2 border-2 rounded-full animate-spin border-primary border-t-transparent"></div>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            Generating personalized templates based on your selected tone...
                                        </p>
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
                                            onClick={() => generateTemplates(selectedTone, activeSheet!)}
                                            variant="ghost"
                                            size="sm"
                                            disabled={isGeneratingTemplates}
                                            className="text-[10px] font-body h-6 px-2"
                                        >
                                            🔄 Regenerate
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsPreviewMode(false)}
                                            className="text-sm font-body"
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
