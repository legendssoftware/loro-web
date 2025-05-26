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

// Define tone types for templates
type ToneType = 'professional' | 'friendly' | 'urgent' | 'casual';

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
        switch (activeSheet) {
            case 'call':
                return 'Generate call scripts and templates with AI based on your selected tone';
            case 'email':
                return 'Create personalized email templates using AI based on your selected tone';
            case 'message':
                return 'Generate message templates using AI based on your selected tone';
            default:
                return '';
        }
    };

        // Generate AI templates based on tone and action type
    const generateTemplates = useCallback(async (tone: ToneType, actionType: Exclude<ActionType, null>) => {
        setIsGeneratingTemplates(true);

        // Mock AI template generation - replace with actual AI service
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

        const mockTemplates: Record<Exclude<ActionType, null>, Template[]> = {
            call: [
                {
                    id: '1',
                    title: 'Introduction Call',
                    content: `Hi ${lead.name}, this is [Your Name] from [Company]. I wanted to reach out regarding your recent inquiry. Is this a good time to chat about how we can help with your needs?`,
                    tone
                },
                {
                    id: '2',
                    title: 'Follow-up Call',
                    content: `Hello ${lead.name}, I'm following up on our previous conversation. I have some updates that might interest you. When would be a convenient time to discuss further?`,
                    tone
                },
                {
                    id: '3',
                    title: 'Closing Call',
                    content: `Hi ${lead.name}, I wanted to check if you're ready to move forward with our proposal. I'm here to answer any final questions you might have.`,
                    tone
                }
            ],
            email: [
                {
                    id: '1',
                    title: 'Welcome Email',
                    content: `Subject: Welcome to [Company], ${lead.name}!\n\nDear ${lead.name},\n\nThank you for your interest in our services. We're excited to help you achieve your goals. I'll be your dedicated point of contact moving forward.\n\nBest regards,\n[Your Name]`,
                    tone
                },
                {
                    id: '2',
                    title: 'Information Email',
                    content: `Subject: Information you requested, ${lead.name}\n\nHi ${lead.name},\n\nAs promised, I'm sending you the information about our services. Please find the details attached. Let me know if you have any questions.\n\nBest regards,\n[Your Name]`,
                    tone
                },
                {
                    id: '3',
                    title: 'Follow-up Email',
                    content: `Subject: Following up on our conversation\n\nHi ${lead.name},\n\nI wanted to follow up on our recent conversation. Have you had a chance to review the information I sent? I'm here to help with any questions.\n\nBest regards,\n[Your Name]`,
                    tone
                }
            ],
            message: [
                {
                    id: '1',
                    title: 'Quick Introduction',
                    content: `Hi ${lead.name}! This is [Your Name] from [Company]. Thanks for your interest! Can we schedule a quick call to discuss your needs?`,
                    tone
                },
                {
                    id: '2',
                    title: 'Follow-up Message',
                    content: `Hi ${lead.name}, just following up on your inquiry. We have some great solutions that might be perfect for you. When would be a good time to chat?`,
                    tone
                },
                {
                    id: '3',
                    title: 'Appointment Reminder',
                    content: `Hi ${lead.name}, this is a friendly reminder about our appointment tomorrow. Looking forward to speaking with you!`,
                    tone
                }
            ]
        };

        setIsGeneratingTemplates(false);
        return mockTemplates[actionType] || [];
    }, [lead.name]);

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
                                {lead.name}
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
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                Created: {formatDate(lead?.createdAt)}
                            </span>
                        </div>
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
                                    {`${lead?.owner?.name?.charAt(0)} ${lead?.owner?.surname?.charAt(0) || ''}`}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex items-center justify-center text-[10px]">
                            <span className="text-[10px] font-normal font-body text-muted-foreground">
                                {lead?.owner?.name} {lead?.owner?.surname || ''}
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
                        {/* Tone Selection */}
                        <div className="mb-6">
                            <label className="block mb-2 text-xs font-normal uppercase font-body">
                                Select Tone
                            </label>
                            <Select value={selectedTone} onValueChange={(value: ToneType) => setSelectedTone(value)}>
                                <SelectTrigger className="text-xs font-body">
                                    <SelectValue placeholder="Choose tone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="professional">Professional</SelectItem>
                                    <SelectItem value="friendly">Friendly</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
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
                                                                <h3 className="text-sm font-medium uppercase font-body">
                                    {isGeneratingTemplates ? 'Generating AI Templates...' : activeSheet === 'call' ? 'Choose Call Script' : 'Choose Template'}
                                </h3>

                                {isGeneratingTemplates ? (
                                    <div className="p-4 text-center border rounded-lg border-border bg-background/50">
                                        <div className="w-6 h-6 mx-auto mb-2 border-2 rounded-full animate-spin border-primary border-t-transparent"></div>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            AI is generating personalized templates based on your selected tone...
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsPreviewMode(false)}
                                        className="text-sm font-body"
                                    >
                                        ← Back to {activeSheet === 'call' ? 'Scripts' : 'Templates'}
                                    </Button>
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
                                            rows={activeSheet === 'email' ? 8 : activeSheet === 'call' ? 6 : 4}
                                            className="text-sm font-body"
                                            placeholder={
                                                activeSheet === 'call'
                                                    ? 'Review and customize your call script...'
                                                    : activeSheet === 'email'
                                                    ? 'Edit your email content here...'
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
