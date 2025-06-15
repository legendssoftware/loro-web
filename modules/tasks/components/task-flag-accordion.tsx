import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Flag,
    ChevronDown,
    Calendar,
    CheckCircle2,
    FileIcon,
    FolderMinus,
    MessageSquare,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskFlag, TaskFlagStatus, TaskFlagItemStatus } from '@/lib/types/task';
import { cn } from '@/lib/utils';
import { formatDistance } from 'date-fns';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TaskFlagAccordionProps {
    flags: TaskFlag[];
    onAddFlag?: () => void;
    onUpdateFlag?: (flagId: number, updates: Partial<TaskFlag>) => void;
    onUpdateFlagItem?: (
        flagId: number,
        itemId: number,
        status: TaskFlagItemStatus,
    ) => void;
}

export const TaskFlagAccordion: React.FunctionComponent<TaskFlagAccordionProps> = ({
    flags,
    onAddFlag,
    onUpdateFlag,
    onUpdateFlagItem,
}) => {
    const [expandedFlags, setExpandedFlags] = useState<number[]>([]);
    const [heights, setHeights] = useState<Record<number, number>>({});
    const [updatingFlags, setUpdatingFlags] = useState<Record<number, boolean>>(
        {},
    );
    const contentRefs = useRef<Record<number, HTMLDivElement | null>>({});

    // Toggle flag expansion
    const toggleFlag = (flagId: number) => {
        setExpandedFlags((prev) =>
            prev.includes(flagId)
                ? prev.filter((id) => id !== flagId)
                : [...prev, flagId],
        );
    };

    // Update content height when expanded flags change
    useEffect(() => {
        const newHeights: Record<number, number> = {};

        expandedFlags.forEach((flagId) => {
            const ref = contentRefs.current[flagId];
            if (ref) {
                newHeights[flagId] = ref.scrollHeight;
            }
        });

        setHeights(newHeights);
    }, [expandedFlags, flags]);

    // Handle flag status update
    const handleFlagStatusUpdate = async (
        flagId: number,
        newStatus: TaskFlagStatus,
    ) => {
        // Set the updating state for this flag
        setUpdatingFlags((prev) => ({ ...prev, [flagId]: true }));

        try {
            if (onUpdateFlag) {
                await onUpdateFlag(flagId, { status: newStatus });
            }
        } finally {
            // Reset the updating state
            setUpdatingFlags((prev) => ({ ...prev, [flagId]: false }));
        }
    };

    // Get status badge styling
    const getFlagStatusStyles = (status: TaskFlagStatus) => {
        switch (status) {
            case TaskFlagStatus.OPEN:
                return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50';
            case TaskFlagStatus.IN_PROGRESS:
                return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50';
            case TaskFlagStatus.RESOLVED:
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50';
            case TaskFlagStatus.CLOSED:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
        }
    };

    // Get flag icon color
    const getFlagIconColor = (status: TaskFlagStatus) => {
        switch (status) {
            case TaskFlagStatus.OPEN:
                return 'text-amber-500 dark:text-amber-400';
            case TaskFlagStatus.IN_PROGRESS:
                return 'text-blue-500 dark:text-blue-400';
            case TaskFlagStatus.RESOLVED:
                return 'text-green-500 dark:text-green-400';
            case TaskFlagStatus.CLOSED:
                return 'text-gray-500 dark:text-gray-400';
            default:
                return 'text-gray-500 dark:text-gray-400';
        }
    };

    // Get status button variant
    const getStatusButtonVariant = (
        buttonStatus: TaskFlagStatus,
        currentStatus: TaskFlagStatus,
    ) => {
        const isActive = buttonStatus === currentStatus;
        const baseClasses = 'border-2 transition-colors';

        switch (buttonStatus) {
            case TaskFlagStatus.OPEN:
                return cn(
                    baseClasses,
                    isActive
                        ? 'bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-900/50 dark:border-amber-500'
                        : 'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-border',
                );
            case TaskFlagStatus.IN_PROGRESS:
                return cn(
                    baseClasses,
                    isActive
                        ? 'bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-900/50 dark:border-blue-500'
                        : 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-border',
                );
            case TaskFlagStatus.RESOLVED:
                return cn(
                    baseClasses,
                    isActive
                        ? 'bg-green-100 text-green-800 border-green-400 dark:bg-green-900/50 dark:border-green-500'
                        : 'hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 border-border',
                );
            case TaskFlagStatus.CLOSED:
                return cn(
                    baseClasses,
                    isActive
                        ? 'bg-gray-100 text-gray-800 border-gray-400 dark:bg-gray-800/50 dark:border-gray-600'
                        : 'hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/20 border-border',
                );
            default:
                return 'border-border';
        }
    };

    // Format date to relative time
    const formatRelativeTime = (date: Date) => {
        return formatDistance(new Date(date), new Date(), { addSuffix: true });
    };

    if (!flags || flags.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                <Flag className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-xs uppercase text-muted-foreground font-body">
                    No flags for this task
                </p>
                {onAddFlag && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 uppercase border cursor-pointer font-body text-muted-foreground"
                        onClick={onAddFlag}
                    >
                        <span className="text-[10px] font-thin uppercase font-body text-muted-foreground">
                            Add Flag
                        </span>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {flags.map((flag) => {
                const isExpanded = expandedFlags.includes(flag.uid);
                const hasAttachments =
                    flag.attachments && flag.attachments.length > 0;
                const attachmentCount =
                    hasAttachments && flag.attachments
                        ? flag.attachments.length
                        : 0;
                const hasItems = flag.items && flag.items.length > 0;
                const completedItems =
                    flag.items?.filter(
                        (item) =>
                            item.status === TaskFlagItemStatus.COMPLETED ||
                            item.status === TaskFlagItemStatus.SKIPPED,
                    ).length || 0;
                const totalItems = flag.items?.length || 0;
                const progress =
                    totalItems > 0
                        ? Math.round((completedItems / totalItems) * 100)
                        : 0;
                const isUpdating = updatingFlags[flag.uid] || false;

                return (
                    <motion.div
                        key={flag.uid}
                        className="overflow-hidden border rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Flag Header - Always visible, clickable to expand */}
                        <div
                            className="flex items-center justify-between p-3 transition-colors cursor-pointer hover:bg-accent/50"
                            onClick={() => toggleFlag(flag.uid)}
                        >
                            <div className="flex items-center gap-2">
                                <Flag
                                    className={`w-4 h-4 ${getFlagIconColor(flag.status)}`}
                                    strokeWidth={1.5}
                                />
                                <h4 className="text-xs font-normal uppercase font-body">
                                    {flag.title}
                                </h4>

                                {/* Attachment indicator */}
                                {hasAttachments && (
                                    <div
                                        className="flex items-center"
                                        title={`${attachmentCount} attachment${attachmentCount !== 1 ? 's' : ''}`}
                                    >
                                        <FileIcon className="w-3 h-3 text-primary/70" />
                                        <span className="text-[9px] text-primary/70 ml-0.5">
                                            {attachmentCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] uppercase font-body font-normal ${getFlagStatusStyles(flag.status)}`}
                                >
                                    {flag.status}
                                </Badge>

                                {/* Expand/collapse chevron */}
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Expandable content */}
                        <AnimatePresence initial={false}>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{
                                        height: heights[flag.uid] || 'auto',
                                        opacity: 1,
                                    }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: [0.04, 0.62, 0.23, 0.98],
                                    }}
                                    className="overflow-hidden"
                                >
                                    <div
                                        className="p-3 pt-1 border-t"
                                        ref={(el) => {
                                            contentRefs.current[flag.uid] = el;
                                        }}
                                    >
                                        <div className="mt-2 space-y-3">
                                            <div className="flex flex-col gap-1">
                                                {/* Created by info */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-4 h-4 overflow-hidden rounded-full bg-primary/10">
                                                            {flag.createdBy
                                                                ?.avatarUrl ? (
                                                                <img
                                                                    src={
                                                                        flag
                                                                            .createdBy
                                                                            .avatarUrl
                                                                    }
                                                                    alt={
                                                                        flag
                                                                            .createdBy
                                                                            .name
                                                                    }
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            ) : (
                                                                <span className="flex items-center justify-center w-full h-full text-[8px] uppercase">
                                                                    {flag.createdBy?.name?.charAt(
                                                                        0,
                                                                    ) || '?'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] font-normal text-muted-foreground font-body">
                                                            {flag.createdBy
                                                                ?.name ||
                                                                'Unknown'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                                        <span className="text-[10px] font-normal text-muted-foreground font-body">
                                                            {formatRelativeTime(
                                                                flag.createdAt,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="mt-2 text-xs font-normal text-foreground font-body">
                                                    {flag.description}
                                                </p>
                                            </div>

                                            {/* Deadline */}
                                            {flag.deadline && (
                                                <div className="flex items-center text-xs">
                                                    <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                                                    <span className="text-[10px] font-normal text-muted-foreground font-body">
                                                        Due:{' '}
                                                        {new Date(
                                                            flag.deadline,
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Items / Checklist */}
                                            {hasItems && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h5 className="text-xs font-medium font-body">
                                                            Checklist:
                                                        </h5>
                                                        <span className="text-[10px] font-normal text-muted-foreground font-body">
                                                            {completedItems}/
                                                            {totalItems}{' '}
                                                            completed (
                                                            {progress}%)
                                                        </span>
                                                    </div>

                                                    {/* Progress bar */}
                                                    <div className="w-full h-1 mb-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-700">
                                                        <motion.div
                                                            className={cn(
                                                                'h-full rounded-full',
                                                                progress === 100
                                                                    ? 'bg-green-500 dark:bg-green-600'
                                                                    : 'bg-blue-500 dark:bg-blue-600',
                                                            )}
                                                            initial={{
                                                                width: 0,
                                                            }}
                                                            animate={{
                                                                width: `${progress}%`,
                                                            }}
                                                            transition={{
                                                                duration: 0.5,
                                                                ease: 'easeInOut',
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        {flag.items.map(
                                                            (item) => (
                                                                <div
                                                                    key={
                                                                        item.uid
                                                                    }
                                                                    className="flex items-center gap-2 text-xs"
                                                                >
                                                                    <button
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            if (
                                                                                onUpdateFlagItem &&
                                                                                item.status !==
                                                                                    TaskFlagItemStatus.COMPLETED
                                                                            ) {
                                                                                onUpdateFlagItem(
                                                                                    flag.uid,
                                                                                    item.uid,
                                                                                    TaskFlagItemStatus.COMPLETED,
                                                                                );
                                                                            }
                                                                        }}
                                                                        className="focus:outline-none"
                                                                    >
                                                                        {item.status ===
                                                                        TaskFlagItemStatus.COMPLETED ? (
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                        ) : item.status ===
                                                                          TaskFlagItemStatus.SKIPPED ? (
                                                                            <FolderMinus className="w-3.5 h-3.5 text-gray-500" />
                                                                        ) : (
                                                                            <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full hover:border-gray-400 transition-colors" />
                                                                        )}
                                                                    </button>
                                                                    <span
                                                                        className={cn(
                                                                            'text-xs font-body',
                                                                            item.status ===
                                                                                TaskFlagItemStatus.COMPLETED
                                                                                ? 'line-through text-muted-foreground'
                                                                                : item.status ===
                                                                                    TaskFlagItemStatus.SKIPPED
                                                                                  ? 'text-muted-foreground'
                                                                                  : '',
                                                                        )}
                                                                    >
                                                                        {
                                                                            item.title
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Attachments */}
                                            {hasAttachments &&
                                                flag.attachments && (
                                                    <div className="mt-3">
                                                        <h5 className="mb-1 text-xs font-medium font-body">
                                                            Attachments:
                                                        </h5>
                                                        <div className="space-y-1">
                                                            {flag.attachments.map(
                                                                (
                                                                    attachment,
                                                                    idx,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <FileIcon className="w-3 h-3 text-primary" />
                                                                        <a
                                                                            href={
                                                                                attachment
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[10px] font-normal font-body hover:underline text-primary/90"
                                                                            onClick={(
                                                                                e,
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        >
                                                                            {typeof attachment ===
                                                                            'string'
                                                                                ? attachment
                                                                                      .split(
                                                                                          '/',
                                                                                      )
                                                                                      .pop()
                                                                                : `Attachment ${idx + 1}`}
                                                                        </a>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Comments */}
                                            {flag.comments &&
                                                flag.comments.length > 0 && (
                                                    <div className="pt-2 mt-3 border-t border-border">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <MessageSquare className="w-3 h-3 text-muted-foreground" />
                                                            <span className="text-[10px] font-normal uppercase text-muted-foreground font-body">
                                                                {
                                                                    flag
                                                                        .comments
                                                                        .length
                                                                }{' '}
                                                                comment
                                                                {flag.comments
                                                                    .length > 1
                                                                    ? 's'
                                                                    : ''}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {flag.comments.map(
                                                                (
                                                                    comment,
                                                                    idx,
                                                                ) => (
                                                                    <motion.div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="p-2 rounded-md bg-accent/50"
                                                                        initial={{
                                                                            opacity: 0,
                                                                            y: 5,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            y: 0,
                                                                        }}
                                                                        transition={{
                                                                            delay:
                                                                                idx *
                                                                                0.05,
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-1">
                                                                            <span className="text-[10px] font-medium font-body">
                                                                                {comment
                                                                                    .createdBy
                                                                                    ?.name ||
                                                                                    'Unknown'}
                                                                            </span>
                                                                            <span className="text-[9px] text-muted-foreground font-body">
                                                                                {formatRelativeTime(
                                                                                    comment.createdAt,
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] font-normal font-body text-foreground/90">
                                                                            {
                                                                                comment.content
                                                                            }
                                                                        </p>
                                                                    </motion.div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            {/* Quick Actions */}
                                            <div className="pt-3 mt-2 border-t">
                                                <div className="flex items-center justify-center mb-2">
                                                    <h3 className="text-xs font-thin uppercase font-body">
                                                        Quick Actions
                                                    </h3>
                                                </div>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className={`w-9 h-9 rounded-full ${getStatusButtonVariant(TaskFlagStatus.OPEN, flag.status)}`}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleFlagStatusUpdate(
                                                                            flag.uid,
                                                                            TaskFlagStatus.OPEN,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        isUpdating ||
                                                                        flag.status ===
                                                                            TaskFlagStatus.OPEN
                                                                    }
                                                                >
                                                                    <AlertCircle
                                                                        className="w-5 h-5 text-amber-600 dark:text-amber-400"
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">
                                                                    Open
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className={`w-9 h-9 rounded-full ${getStatusButtonVariant(TaskFlagStatus.IN_PROGRESS, flag.status)}`}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleFlagStatusUpdate(
                                                                            flag.uid,
                                                                            TaskFlagStatus.IN_PROGRESS,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        isUpdating ||
                                                                        flag.status ===
                                                                            TaskFlagStatus.IN_PROGRESS
                                                                    }
                                                                >
                                                                    <Loader2
                                                                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">
                                                                    In Progress
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className={`w-9 h-9 rounded-full ${getStatusButtonVariant(TaskFlagStatus.RESOLVED, flag.status)}`}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleFlagStatusUpdate(
                                                                            flag.uid,
                                                                            TaskFlagStatus.RESOLVED,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        isUpdating ||
                                                                        flag.status ===
                                                                            TaskFlagStatus.RESOLVED
                                                                    }
                                                                >
                                                                    <CheckCircle
                                                                        className="w-5 h-5 text-green-600 dark:text-green-400"
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">
                                                                    Resolved
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className={`w-9 h-9 rounded-full ${getStatusButtonVariant(TaskFlagStatus.CLOSED, flag.status)}`}
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleFlagStatusUpdate(
                                                                            flag.uid,
                                                                            TaskFlagStatus.CLOSED,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        isUpdating ||
                                                                        flag.status ===
                                                                            TaskFlagStatus.CLOSED
                                                                    }
                                                                >
                                                                    <XCircle
                                                                        className="w-5 h-5 text-gray-600 dark:text-gray-400"
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                    />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">
                                                                    Closed
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
};
