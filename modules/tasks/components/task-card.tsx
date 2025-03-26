'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task, TaskStatus, JobStatus } from '@/lib/types/task';
import {
    AlertCircle,
    Calendar,
    Clock,
    CheckCircle2,
    ChartSpline,
    Timer,
    Flag,
    MessageCircle,
} from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TaskDetailsModal } from './task-details-modal';

interface TaskCardProps {
    task: Task;
    onUpdateStatus?: (
        taskId: number,
        newStatus: string,
        newDeadline?: Date,
    ) => void;
    onUpdateTask?: (taskId: number, updates: Partial<Task>) => void;
    onDelete?: (taskId: number) => void;
    onUpdateSubtaskStatus?: (subtaskId: number, newStatus: string) => void;
    index?: number;
}

// Create the TaskCard as a standard component
function TaskCardComponent({
    task,
    onUpdateStatus,
    onUpdateTask,
    onDelete,
    onUpdateSubtaskStatus,
    index = 0,
}: TaskCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use CSS variables for animation delay
    const cardStyle = {
        '--task-delay': `${Math.min(index * 50, 500)}ms`,
    } as React.CSSProperties;

    const handleStatusChange = useCallback(
        (taskId: number, newStatus: string, newDeadline?: Date) => {
            if (onUpdateStatus) {
                onUpdateStatus(taskId, newStatus, newDeadline);
            }
        },
        [onUpdateStatus],
    );

    const handleSubtaskStatusToggle = useCallback(
        (subtaskId: number, newStatus: string) => {
            if (onUpdateSubtaskStatus) {
                onUpdateSubtaskStatus(subtaskId, newStatus);
            }
        },
        [onUpdateSubtaskStatus],
    );

    const handleDelete = useCallback(
        (taskId: number) => {
            if (onDelete) {
                onDelete(taskId);
            }
        },
        [onDelete],
    );

    const formatDate = (date?: Date) => {
        if (!date) return null;
        return format(new Date(date), 'MMM d, yyyy');
    };

    const getStatusBadgeColor = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case TaskStatus.IN_PROGRESS:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case TaskStatus.COMPLETED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case TaskStatus.CANCELLED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            case TaskStatus.OVERDUE:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case TaskStatus.POSTPONED:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case TaskStatus.MISSED:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getJobStatusBadgeColor = (status?: JobStatus) => {
        if (!status)
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        switch (status) {
            case JobStatus.QUEUED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            case JobStatus.RUNNING:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case JobStatus.COMPLETED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = () => {
        switch (task.priority) {
            case 'LOW':
                return 'text-gray-500';
            case 'MEDIUM':
                return 'text-blue-500';
            case 'HIGH':
                return 'text-orange-500';
            case 'URGENT':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // Add a function to calculate progress based on subtasks
    const calculateSubtaskProgress = useCallback(() => {
        // Check if task has subtasks that aren't deleted
        const validSubtasks =
            task?.subtasks?.filter((st) => !st?.isDeleted) || [];

        if (validSubtasks.length === 0) {
            return 0;
        }

        // Count completed subtasks
        const completedSubtasks = validSubtasks.filter(
            (st) => st?.status === 'COMPLETED',
        ).length;

        // Calculate percentage
        return Math.round((completedSubtasks / validSubtasks.length) * 100);
    }, [task?.subtasks]);

    return (
        <>
            <div
                className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-task-appear"
                style={cardStyle}
                onClick={openModal}
            >
                <div className="flex items-center justify-between mb-2">
                    {/* Task Title & Status Badge */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                            {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={`text-[9px] font-normal uppercase font-body px-4 py-1 border-0 ${getStatusBadgeColor(
                                    task?.status,
                                )}`}
                            >
                                {task?.status?.replace('_', ' ')}
                            </Badge>
                            {task.isOverdue && (
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-4 py-1 border-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                >
                                    OVERDUE
                                </Badge>
                            )}
                            {task.jobStatus && (
                                <Badge
                                    variant="outline"
                                    className={`text-[9px] font-normal uppercase font-body px-3 py-1 border-0 ${getJobStatusBadgeColor(
                                        task?.jobStatus,
                                    )}`}
                                >
                                    <Timer className="w-3 h-3 mr-1" />
                                    <span className="text-[9px] font-normal uppercase font-body">
                                        JOB:{' '}
                                        {task?.jobStatus?.replace('_', ' ')}
                                    </span>
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Task Details */}
                <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {/* Task Description */}
                    <p className="text-xs font-normal line-clamp-2 font-body">
                        {task?.description}
                    </p>

                    {/* Progress - Only show if task has subtasks */}
                    {task?.subtasks &&
                        task?.subtasks?.filter((st) => !st?.isDeleted).length >
                            0 && (
                            <div className="mb-2">
                                <div className="flex items-center justify-between text-[10px] mb-1">
                                    <div className="flex items-center">
                                        <ChartSpline
                                            className="w-4 h-4 mr-1"
                                            strokeWidth={1.5}
                                        />
                                        <span className="font-normal uppercase font-body text-[10px]">
                                            Progress
                                        </span>
                                    </div>
                                    <span className="font-normal uppercase font-body text-[12px]">
                                        {calculateSubtaskProgress()}%
                                    </span>
                                </div>
                                <Progress
                                    value={calculateSubtaskProgress()}
                                    className="h-1"
                                />
                            </div>
                        )}

                    {/* Task Meta Information */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Priority */}
                        <div className="flex items-center">
                            <AlertCircle
                                className={`w-4 h-4 mr-1 ${getPriorityColor()}`}
                            />
                            <span
                                className={`text-[12px] font-normal uppercase font-body ${getPriorityColor()}`}
                            >
                                {task?.priority}
                            </span>
                        </div>

                        {/* Type */}
                        <div className="flex items-center">
                            <span className="text-[10px] font-normal uppercase font-body">
                                {task?.taskType?.replace(/_/g, ' ')}
                            </span>
                        </div>

                        {/* Deadline */}
                        {task.deadline && (
                            <div className="flex items-center col-span-2">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Due Date: {formatDate(task?.deadline)}
                                </span>
                            </div>
                        )}

                        {/* Created Date */}
                        <div className="flex items-center col-span-2">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                Created: {formatDate(task?.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subtasks Count */}
                {task?.subtasks && task?.subtasks?.length > 0 && (
                    <div className="flex items-center pt-2 mt-2 text-xs border-t border-border/20 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        <span className="font-normal uppercase font-body text-[10px]">
                            {
                                task?.subtasks?.filter(
                                    (st) =>
                                        !st?.isDeleted &&
                                        st?.status === 'COMPLETED',
                                ).length
                            }{' '}
                            /{' '}
                            {
                                task?.subtasks?.filter((st) => !st?.isDeleted)
                                    .length
                            }{' '}
                            subtasks
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between w-full mt-4">
                    {/* Assignees */}
                    {task?.assignees && task?.assignees?.length > 0 && (
                        <div className="flex items-center justify-start gap-1 border-t border-border/20">
                            <div className="flex -space-x-2">
                                {task?.assignees
                                    ?.slice(0, 3)
                                    .map((assignee, index) => (
                                        <Avatar
                                            key={index}
                                            className="border w-7 h-7 border-primary"
                                        >
                                            <AvatarImage
                                                src={assignee?.photoURL}
                                                alt={assignee?.name}
                                            />
                                            <AvatarFallback className="text-[7px] font-normal uppercase font-body">
                                                {`${assignee?.name?.charAt(0)} ${assignee?.surname?.charAt(0)}`}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                            </div>
                            {task?.assignees?.length > 3 && (
                                <div className=" flex items-center justify-center text-[10px]">
                                    <span className="text-[10px] font-normal font-body text-muted-foreground">
                                        {' '}
                                        +{task?.assignees?.length - 2} more
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        {/* Feedback counter - Using temporary dummy data until backend integrates feedback */}
                        {(task as any).feedback &&
                            (task as any).feedback.length > 0 && (
                                <Badge
                                    variant="outline"
                                    className="flex items-center justify-center gap-1 px-3 py-1 bg-green-500 border-0"
                                >
                                    <MessageCircle
                                        strokeWidth={1.5}
                                        size={16}
                                        color="white"
                                    />
                                    <span className="text-[10px] font-normal uppercase text-white font-body">
                                        {(task as any).feedback.length}
                                    </span>
                                </Badge>
                            )}

                        {/* Flag indicator */}
                        {task.flags && task.flags.length > 0 && (
                            <Badge
                                variant="outline"
                                className="flex items-center justify-center gap-1 px-3 py-1 bg-red-500 border-0"
                            >
                                <Flag
                                    strokeWidth={1.5}
                                    size={16}
                                    color="white"
                                />
                                <span className="text-[10px] font-normal uppercase text-white font-body">
                                    {task.flags.length}
                                </span>
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Task Details Modal */}
            {isModalOpen && (
                <TaskDetailsModal
                    task={task}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onUpdateStatus={handleStatusChange}
                    onUpdateTask={onUpdateTask}
                    onDelete={handleDelete}
                    onUpdateSubtaskStatus={handleSubtaskStatusToggle}
                />
            )}
        </>
    );
}

// Export a memoized version to prevent unnecessary re-renders
export const TaskCard = memo(TaskCardComponent);
