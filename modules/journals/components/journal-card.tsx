'use client';

import { JournalStatus, Journal } from '@/lib/types/journal';
import { Calendar, ExternalLink, Clock, FileText } from 'lucide-react';
import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Extend the Journal interface to include the missing properties
interface ExtendedJournal extends Journal {
    title?: string;
    source?: string;
}

interface JournalCardProps {
    journal: ExtendedJournal;
    onUpdateStatus: (journalId: number, newStatus: string) => void;
    onDelete: (journalId: number) => void;
    onViewDetails?: (journal: ExtendedJournal) => void;
    index: number;
}

export const JournalCard = memo(function JournalCard({
    journal,
    onViewDetails,
    index,
}: JournalCardProps) {
    const formattedDate = useMemo(() => {
        try {
            return format(new Date(journal.timestamp), 'dd MMM yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    }, [journal.timestamp]);

    const formatCreatedDate = useMemo(() => {
        try {
            return format(new Date(journal.createdAt), 'MMM d, yyyy');
        } catch (error) {
            return 'Invalid date';
        }
    }, [journal.createdAt]);

    const handleCardClick = () => {
        if (onViewDetails) {
            onViewDetails(journal);
        }
    };

    // Get owner initials for avatar fallback
    const getOwnerInitials = () => {
        if (!journal?.owner) return 'U';
        const name = journal.owner.name || '';
        const surname = journal.owner.surname || '';
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase() || 'U';
    };

    const getStatusBadgeColor = (status: JournalStatus) => {
        switch (status) {
            case JournalStatus.PENDING_REVIEW:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case JournalStatus.PUBLISHED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case JournalStatus.DRAFT:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case JournalStatus.REJECTED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case JournalStatus.ARCHIVED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-task-appear"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={handleCardClick}
        >
            <div className="flex items-center justify-between mb-2">
                {/* Journal Title & Status Badge */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                        {journal.title || journal.clientRef}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge
                            variant="outline"
                            className={`text-[9px] font-normal uppercase font-body px-4 py-1 border-0 ${getStatusBadgeColor(journal.status)}`}
                        >
                            {journal.status.replace('_', ' ')}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Journal Info Section */}
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                {/* Source/Reference Section */}
                <div className="flex items-center mb-2">
                    <ExternalLink size={16} className="w-4 h-4 mr-1" />
                    <span className="text-[12px] font-normal uppercase font-body">
                        {journal.source || journal.clientRef}
                    </span>
                </div>

                {/* Journal comments (if available) */}
                {journal?.comments && (
                    <p className="text-xs font-normal line-clamp-2 font-body">
                        {journal.comments}
                    </p>
                )}

                {/* Date Information */}
                <div className="grid grid-cols-2 gap-1">
                    {/* Timestamp */}
                    <div className="flex items-center col-span-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span className="text-[10px] font-normal uppercase font-body">
                            Timestamp: {formattedDate}
                        </span>
                    </div>

                    {/* Created Date */}
                    <div className="flex items-center col-span-2">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="text-[10px] font-normal uppercase font-body">
                            Created: {formatCreatedDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* File URL indicator (if available) */}
            {journal?.fileURL && (
                <div className="flex items-center pt-2 mt-2 text-xs border-t border-border/20 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    <span className="font-normal uppercase font-body text-[10px]">
                        Document attached
                    </span>
                </div>
            )}

            {/* Journal owner */}
            {journal?.owner && (
                <div className="flex items-center justify-start gap-1 pt-2 mt-2 border-t border-border/20">
                    <div className="flex -space-x-2">
                        <Avatar className="border h-9 w-9 border-primary">
                            <AvatarImage
                                src={journal?.owner?.photoURL}
                                alt={journal?.owner?.name}
                            />
                            <AvatarFallback className="text-[7px] font-normal uppercase font-body">
                                {getOwnerInitials()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex items-center justify-center text-[10px]">
                        <span className="text-[10px] font-normal font-body text-muted-foreground">
                            {journal?.owner?.name} {journal?.owner?.surname}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

JournalCard.displayName = 'JournalCard';
