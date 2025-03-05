'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
    X,
    Calendar,
    Clock,
    AlertCircle,
    BarChart3,
    CheckCircle2,
    Building,
    Briefcase,
    Tag,
    Repeat,
    MessageSquare,
    Users,
    Phone,
    Mail,
    FileText,
    MapPin,
    CreditCard,
    Edit,
    Trash,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskType } from '@/lib/types/task';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface TaskDetailsModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (taskId: number, newStatus: string) => void;
    onDelete: (taskId: number) => void;
}

export function TaskDetailsModal({ task, isOpen, onClose, onUpdateStatus, onDelete }: TaskDetailsModalProps) {
    const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);
    const [activeTab, setActiveTab] = useState<string>('details');

    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    const formatTime = (date?: Date) => {
        if (!date) return '';
        return format(new Date(date), 'h:mm a');
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

    const getStatusButtonVariant = (status: TaskStatus) => {
        if (status === currentStatus) {
            switch (status) {
                case TaskStatus.PENDING:
                    return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
                case TaskStatus.IN_PROGRESS:
                    return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
                case TaskStatus.COMPLETED:
                    return 'bg-green-100 text-green-800 hover:bg-green-200';
                case TaskStatus.CANCELLED:
                    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
                default:
                    return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
            }
        }
        return 'bg-white hover:bg-gray-100';
    };

    const getPriorityColor = () => {
        switch (task.priority) {
            case TaskPriority.LOW:
                return 'text-gray-500';
            case TaskPriority.MEDIUM:
                return 'text-blue-500';
            case TaskPriority.HIGH:
                return 'text-orange-500';
            case TaskPriority.URGENT:
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    const getPriorityBadgeColor = () => {
        switch (task.priority) {
            case TaskPriority.LOW:
                return 'bg-gray-100 text-gray-800';
            case TaskPriority.MEDIUM:
                return 'bg-blue-100 text-blue-800';
            case TaskPriority.HIGH:
                return 'bg-orange-100 text-orange-800';
            case TaskPriority.URGENT:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTaskTypeIcon = () => {
        switch (task.taskType) {
            case TaskType.CALL:
                return <Phone className='w-4 h-4 mr-2' />;
            case TaskType.EMAIL:
                return <Mail className='w-4 h-4 mr-2' />;
            case TaskType.IN_PERSON_MEETING:
                return <Users className='w-4 h-4 mr-2' />;
            case TaskType.VIRTUAL_MEETING:
                return <Users className='w-4 h-4 mr-2' />;
            case TaskType.FOLLOW_UP:
                return <MessageSquare className='w-4 h-4 mr-2' />;
            case TaskType.PROPOSAL:
                return <FileText className='w-4 h-4 mr-2' />;
            case TaskType.REPORT:
                return <FileText className='w-4 h-4 mr-2' />;
            case TaskType.QUOTATION:
                return <CreditCard className='w-4 h-4 mr-2' />;
            case TaskType.VISIT:
                return <MapPin className='w-4 h-4 mr-2' />;
            default:
                return <Edit className='w-4 h-4 mr-2' />;
        }
    };

    const handleStatusChange = (newStatus: TaskStatus) => {
        setCurrentStatus(newStatus);
        onUpdateStatus(task.uid, newStatus);
        onClose();
    };

    const handleDelete = () => {
        onDelete(task.uid);
        onClose();
    };

    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'people', label: 'People & Org' },
        { id: 'activity', label: 'Activity' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className='space-y-6'>
                        {/* Description section */}
                        <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                            <h3 className='mb-2 text-xs font-normal uppercase font-body'>Description</h3>
                            <p className='text-xs font-normal font-body'>
                                {task.description || 'No description provided'}
                            </p>
                        </div>

                        {/* Progress section */}
                        <div>
                            <h3 className='mb-2 text-xs font-normal uppercase font-body'>Stage</h3>
                            <div className='flex flex-col gap-1 mb-2'>
                                <div className='flex items-center justify-between mb-1 text-xs'>
                                    <div className='flex items-center'>
                                        <span className='text-[10px] font-normal uppercase font-body'>Progress</span>
                                    </div>
                                    <span className='text-xs font-normal uppercase font-body'>{task?.progress}%</span>
                                </div>
                                <Progress value={task?.progress} className='h-2' />
                            </div>
                        </div>

                        {/* Task Details section */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <h3 className='mb-2 text-xs font-normal uppercase font-body'>Priority</h3>
                                <div className='flex items-center'>
                                    <Badge
                                        variant='outline'
                                        className={`text-[10px] px-4 py-1 border-0 ${getPriorityBadgeColor()}`}
                                    >
                                        <AlertCircle className={`w-5 h-5 mr-1`} />
                                        <span className='text-xs font-normal uppercase font-body'>
                                            {task?.priority}
                                        </span>
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className='mb-2 text-xs font-normal uppercase font-body'>Type</h3>
                                <div className='flex items-center'>
                                    <Badge variant='outline' className='px-4 py-1 text-xs font-normal border'>
                                        {getTaskTypeIcon()}
                                        {task?.taskType?.replace(/_/g, ' ')}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className='mb-2 text-xs font-normal uppercase font-body'>Repetition</h3>
                                <div className='flex items-center'>
                                    <Repeat className='w-4 h-4 mr-1 text-gray-500' />
                                    <span className='text-xs font-normal uppercase font-body'>
                                        {task?.repetitionType}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className='mb-2 text-xs font-normal uppercase font-body'>Category</h3>
                                <div className='flex items-center'>
                                    <Tag className='w-4 h-4 mr-1 text-gray-500' />
                                    <span className='text-xs font-normal uppercase font-body'>
                                        {task?.targetCategory || 'Not categorized'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Dates section */}
                        <div>
                            <h3 className='mb-2 text-xs font-normal uppercase font-body'>Timeline</h3>
                            <div className='p-4 space-y-3 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center'>
                                        <Clock className='w-4 h-4 mr-2 text-gray-500' />
                                        <span className='text-xs font-normal uppercase font-body'>Created</span>
                                    </div>
                                    <span className='text-xs font-normal font-body'>
                                        {formatDate(task?.createdAt)} {formatTime(task?.createdAt)}
                                    </span>
                                </div>

                                {task.deadline && (
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center'>
                                            <Calendar className='w-4 h-4 mr-2 text-gray-500' />
                                            <span className='text-xs font-normal uppercase font-body'>Deadline</span>
                                        </div>
                                        <span className='text-xs font-normal font-body'>
                                            {formatDate(task?.deadline)} {formatTime(task?.deadline)}
                                        </span>
                                    </div>
                                )}

                                {task?.completionDate && (
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center'>
                                            <CheckCircle2 className='w-4 h-4 mr-2 text-green-500' />
                                            <span className='text-xs font-normal uppercase font-body'>Completed</span>
                                        </div>
                                        <span className='text-xs font-normal font-body'>
                                            {formatDate(task?.completionDate)} {formatTime(task?.completionDate)}
                                        </span>
                                    </div>
                                )}

                                {task?.repetitionDeadline && (
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center'>
                                            <Repeat className='w-4 h-4 mr-2 text-gray-500' />
                                            <span className='text-xs font-normal uppercase font-body'>
                                                Repeats Until
                                            </span>
                                        </div>
                                        <span className='text-xs font-normal font-body'>
                                            {formatDate(task?.repetitionDeadline)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subtasks section */}
                        {task?.subtasks && task?.subtasks?.length > 0 && (
                            <div>
                                <h3 className='mb-2 text-xs font-normal uppercase font-body'>Subtasks</h3>
                                <div className='p-4 space-y-2 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                                    {task?.subtasks
                                        ?.filter(st => !st.isDeleted)
                                        .map(subtask => (
                                            <div
                                                key={subtask?.uid}
                                                className='flex items-center justify-between p-2 bg-white border rounded dark:bg-gray-800'
                                            >
                                                <div className='flex items-center'>
                                                    <div
                                                        className={`w-2 h-2 rounded-full mr-2 ${
                                                            subtask.status === 'COMPLETED'
                                                                ? 'bg-green-500'
                                                                : 'bg-yellow-500'
                                                        }`}
                                                    ></div>
                                                    <span className='text-xs font-normal font-body'>
                                                        {subtask?.title}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant='outline'
                                                    className={`text-[10px] px-2 py-0.5 border-0 ${
                                                        subtask.status === 'COMPLETED'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                                >
                                                    {subtask?.status}
                                                </Badge>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'people':
                return (
                    <div className='space-y-6'>
                        {/* Assignees section */}
                        <div>
                            <h3 className='mb-2 text-xs font-normal uppercase font-body'>Assignees</h3>
                            <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                                {task?.assignees && task?.assignees?.length > 0 ? (
                                    <div className='space-y-2'>
                                        {task?.assignees?.map((assignee, index) => (
                                            <div
                                                key={index}
                                                className='flex items-center p-2 bg-white border rounded dark:bg-gray-800'
                                            >
                                                <Avatar className='w-8 h-8 mr-3'>
                                                    <AvatarFallback className='text-xs bg-primary/10 text-primary'>
                                                        {`U${assignee?.uid || index + 1}`}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className='text-xs font-normal uppercase font-body'>
                                                        User ID: {assignee?.uid}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-xs italic text-gray-500 uppercase font-body'>
                                        No assignees for this task
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Clients section */}
                        <div>
                            <h3 className='mb-2 text-xs font-normal uppercase font-body'>Clients</h3>
                            <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                                {task.clients && task.clients.length > 0 ? (
                                    <div className='space-y-2'>
                                        {task.clients.map((client, index) => (
                                            <div
                                                key={index}
                                                className='flex items-center p-2 bg-white border rounded dark:bg-gray-800'
                                            >
                                                <Avatar className='w-8 h-8 mr-3'>
                                                    <AvatarFallback className='text-xs text-blue-800 bg-blue-100'>
                                                        {`C${client.uid || index + 1}`}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className='text-sm font-medium'>Client ID: {client.uid}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-xs italic text-gray-500 uppercase font-body'>
                                        No clients associated with this task
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Creator section */}
                        {task.creator && (
                            <div>
                                <h3 className='mb-2 text-xs font-normal uppercase font-body'>Created By</h3>
                                <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                                    <div className='flex items-center p-2 bg-white border rounded dark:bg-gray-800'>
                                        <Avatar className='w-8 h-8 mr-3'>
                                            {task?.creator?.avatarUrl ? (
                                                <AvatarImage src={task?.creator?.avatarUrl} alt={task?.creator?.name} />
                                            ) : (
                                                <AvatarFallback className='text-green-800 bg-green-100'>
                                                    {task?.creator?.name
                                                        .split(' ')
                                                        .map(n => n[0])
                                                        .join('')
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div>
                                            <p className='text-xs font-normal uppercase font-body'>
                                                {task?.creator?.name}
                                            </p>
                                            <p className='text-xs text-gray-500 font-body'>{task?.creator?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Organization section */}
                        <div>
                            <h3 className='mb-2 text-xs font-normal uppercase font-body'>Organization & Branch</h3>
                            <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                                <div className='flex flex-col space-y-2'>
                                    {task.organisation ? (
                                        <div className='flex items-center'>
                                            <Building className='w-4 h-4 mr-2 text-gray-500' />
                                            <span className='text-sm font-normal'>
                                                Organization: {task.organisation.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className='flex items-center'>
                                            <Building className='w-4 h-4 mr-2 text-gray-500' />
                                            <span className='text-xs italic font-normal text-gray-500 uppercase font-body'>
                                                No organization specified
                                            </span>
                                        </div>
                                    )}

                                    {task.branch ? (
                                        <div className='flex items-center'>
                                            <Briefcase className='w-4 h-4 mr-2 text-gray-500' />
                                            <span className='text-xs font-normal uppercase font-body'>
                                                Branch: {task?.branch?.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className='flex items-center'>
                                            <Briefcase className='w-4 h-4 mr-2 text-gray-500' />
                                            <span className='text-xs italic font-normal text-gray-500 uppercase font-body'>
                                                No branch specified
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'activity':
                return (
                    <div className='space-y-6'>
                        <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-900/30'>
                            <h3 className='mb-2 text-xs font-normal uppercase font-body'>Activity Timeline</h3>
                            <div className='relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200'>
                                {/* Creation event */}
                                <div className='relative'>
                                    <div className='absolute left-[-24px] top-0 w-4 h-4 rounded-full bg-blue-500'></div>
                                    <div className='flex flex-col'>
                                        <p className='font-normal font-body'>
                                            <span className='text-sm font-medium'>
                                                {task?.creator?.name || 'System'}
                                            </span>{' '}
                                            <span className='text-xs font-normal font-body'>created this task</span>
                                        </p>
                                        <p className='text-xs text-gray-500 font-body'>
                                            {formatDate(task.createdAt)} {formatTime(task.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Completion event */}
                                {task?.completionDate && (
                                    <div className='relative'>
                                        <div className='absolute left-[-24px] top-0 w-4 h-4 rounded-full bg-green-500'></div>
                                        <div className='flex flex-col'>
                                            <p className='text-xs font-normal uppercase font-body'>
                                                Task marked as{' '}
                                                <span className='text-xs font-normal uppercase font-body'>
                                                    COMPLETED
                                                </span>
                                            </p>
                                            <p className='text-xs text-gray-500 font-body'>
                                                {formatDate(task?.completionDate)} {formatTime(task?.completionDate)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Last update event */}
                                {task.updatedAt && task.updatedAt !== task.createdAt && !task.completionDate && (
                                    <div className='relative'>
                                        <div className='absolute left-[-24px] top-0 w-4 h-4 rounded-full bg-gray-500'></div>
                                        <div className='flex flex-col'>
                                            <p className='text-sm font-normal uppercase font-body'>Task was updated</p>
                                            <p className='text-xs text-gray-500 font-body'>
                                                {formatDate(task.updatedAt)} {formatTime(task.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader className='flex flex-row items-start justify-between'>
                    <div>
                        <DialogTitle className='text-xl font-semibold uppercase font-body'>{task.title}</DialogTitle>
                        <div className='flex items-center gap-2 mt-2'>
                            <Badge
                                variant='outline'
                                className={`text-[10px] px-4 py-1 border-0 ${getStatusBadgeColor(task?.status)}`}
                            >
                                {task?.status?.replace(/_/g, ' ')}
                            </Badge>
                            {task.isOverdue && (
                                <Badge
                                    variant='outline'
                                    className='text-[10px] px-4 py-1 border-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                >
                                    OVERDUE
                                </Badge>
                            )}
                        </div>
                    </div>
                    <Button variant='ghost' size='icon' className='w-8 h-8' onClick={onClose}>
                        <X className='w-4 h-4' />
                    </Button>
                </DialogHeader>

                <div className='mt-4'>
                    {/* Custom Tab Navigation matching TasksTabGroup */}
                    <div className='flex items-center mb-6 overflow-x-auto border-b border-border/10'>
                        {tabs.map(tab => (
                            <div
                                key={tab.id}
                                className='relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28'
                            >
                                <div
                                    className={`mb-3 font-body px-0 font-normal ${
                                        activeTab === tab.id
                                            ? 'text-primary dark:text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <span className='text-xs font-normal uppercase font-body'>{tab.label}</span>
                                </div>
                                {activeTab === tab.id && (
                                    <div className='absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary' />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {renderTabContent()}
                </div>

                <DialogFooter className='flex flex-wrap gap-2 pt-4 mt-6 border-t'>
                    <div className='flex justify-center w-full gap-2 sm:justify-start'>
                        <div className='w-1/5'>
                            <Button
                                variant='outline'
                                size='sm'
                                className={`w-full ${getStatusButtonVariant(TaskStatus.PENDING)}`}
                                onClick={() => handleStatusChange(TaskStatus.PENDING)}
                            >
                                <span className='text-xs font-normal uppercase font-body'>Pending</span>
                            </Button>
                        </div>
                        <div className='w-1/5'>
                            <Button
                                variant='outline'
                                size='sm'
                                className={`w-full ${getStatusButtonVariant(TaskStatus.IN_PROGRESS)}`}
                                onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                            >
                                <span className='text-xs font-normal uppercase font-body'>In Progress</span>
                            </Button>
                        </div>
                        <div className='w-1/5'>
                            <Button
                                variant='outline'
                                size='sm'
                                className={`w-full ${getStatusButtonVariant(TaskStatus.COMPLETED)}`}
                                onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
                            >
                                <span className='text-xs font-normal uppercase font-body'>Completed</span>
                            </Button>
                        </div>
                        <div className='w-1/5'>
                            <Button
                                variant='outline'
                                size='sm'
                                className={`w-full ${getStatusButtonVariant(TaskStatus.CANCELLED)}`}
                                onClick={() => handleStatusChange(TaskStatus.CANCELLED)}
                            >
                                <span className='text-xs font-normal uppercase font-body'>Cancelled</span>
                            </Button>
                        </div>
                        <div className='w-1/5'>
                            <Button variant='destructive' className='w-full' onClick={handleDelete}>
                                <span className='text-xs font-normal uppercase font-body'>Delete Task</span>
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
