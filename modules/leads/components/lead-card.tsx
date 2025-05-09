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
} from 'lucide-react';
import { useState, useCallback, memo } from 'react';
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

interface LeadCardProps {
    lead: Lead;
    onUpdateStatus?: (leadId: number, newStatus: string, reason?: string, description?: string, nextStep?: string) => void;
    onDelete?: (leadId: number) => void;
    index?: number;
    id?: string;
}

// Define action types for the sheets
type ActionType = 'call' | 'email' | 'message' | null;

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
                return 'Call this lead directly from the app using templates';
            case 'email':
                return 'Send an email to this lead using predefined templates';
            case 'message':
                return 'Send a message to this lead using predefined templates';
            default:
                return '';
        }
    };

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
                                <PhoneCall
                                    strokeWidth={1.5}
                                    size={18}
                                    className="cursor-pointer text-muted-foreground/50 hover:text-muted-foreground"
                                    onClick={(e) =>
                                        handleActionClick(e, 'call')
                                    }
                                />
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
                <SheetContent side="right" className="sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle className="text-xs font-normal uppercase font-body">
                            {getSheetTitle()}
                        </SheetTitle>
                        <SheetDescription className="text-[10px] font-normal font-body">
                            {getSheetDescription()}
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6">
                        {activeSheet === 'call' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg border-border bg-background/50">
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Call Templates
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        You will be able to use predefined call
                                        scripts and templates to ensure
                                        consistent communication with leads.
                                    </p>
                                </div>

                                <div className="flex items-center p-3 border rounded-lg border-border">
                                    <PhoneCall className="w-5 h-5 mr-3 text-primary" />
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {lead.phone}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            Click to call directly
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSheet === 'email' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg border-border bg-background/50">
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Email Templates
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        You will be able to select from various
                                        email templates designed for different
                                        stages of the lead nurturing process.
                                    </p>
                                </div>

                                <div className="flex items-center p-3 border rounded-lg border-border">
                                    <Mail className="w-5 h-5 mr-3 text-primary" />
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {lead.email}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            Send personalized emails
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSheet === 'message' && (
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg border-border bg-background/50">
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Message Templates
                                    </h3>
                                    <p className="text-[10px] text-muted-foreground font-body">
                                        You will be able to send text messages
                                        using predefined templates, making
                                        communication with leads efficient and
                                        consistent.
                                    </p>
                                </div>

                                <div className="flex items-center p-3 border rounded-lg border-border">
                                    <MessageSquare className="w-5 h-5 mr-3 text-primary" />
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {lead.phone}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            Send personalized messages
                                        </p>
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
                        <Button
                            type="button"
                            disabled
                            className="text-xs font-normal text-white uppercase font-body"
                        >
                            Coming Soon
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}

// Export a memoized version to prevent unnecessary re-renders
export const LeadCard = memo(LeadCardComponent);
