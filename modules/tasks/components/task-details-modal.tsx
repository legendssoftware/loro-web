'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import {
    X,
    Calendar,
    Clock,
    AlertCircle,
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
    Globe,
    User,
    Map,
    Building2,
    Plus,
    CheckCheck,
    CalendarCheck2,
    CalendarX2,
    CalendarClock,
    CalendarCog,
    CalendarRange,
    CalendarFold,
    Trash2,
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority, TaskType } from '@/lib/types/task';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar as UiCalendar } from '@/components/ui/calendar';

interface TaskDetailsModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus: (
        taskId: number,
        newStatus: string,
        newDeadline?: Date,
    ) => void;
    onUpdateTask?: (taskId: number, updates: Partial<Task>) => void;
    onDelete: (taskId: number) => void;
    onUpdateSubtaskStatus?: (subtaskId: number, newStatus: string) => void;
}

interface ExtendedCreator {
    uid: number;
    name: string;
    surname?: string;
    email: string;
    phone?: string;
    photoURL?: string;
    avatarUrl?: string;
    accessLevel?: string;
    role?: string;
    userref?: string;
}

interface ExtendedTask extends Task {
    routes?: Array<{
        uid?: number;
        name?: string;
    }>;
    creator?: ExtendedCreator;
    assignees?: Array<{
        uid: number;
        name: string;
        surname: string;
        email: string;
        phone: string;
        photoURL: string;
        accessLevel: string;
    }>;
}

export function TaskDetailsModal({
    task,
    isOpen,
    onClose,
    onUpdateStatus,
    onUpdateTask,
    onDelete,
    onUpdateSubtaskStatus,
}: TaskDetailsModalProps) {
    const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);
    const [activeTab, setActiveTab] = useState<string>('details');
    const extendedTask = task as ExtendedTask;
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] =
        useState<boolean>(false);
    const [pendingStatusChange, setPendingStatusChange] =
        useState<TaskStatus | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isPostponeDatePickerOpen, setIsPostponeDatePickerOpen] =
        useState<boolean>(false);
    const [postponeDate, setPostponeDate] = useState<Date | undefined>(
        task.deadline ? new Date(task.deadline) : new Date(),
    );
    const [postponeTime, setPostponeTime] = useState<string>(
        task.deadline ? format(new Date(task.deadline), 'HH:mm') : '12:00',
    );

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
        switch (status) {
            case TaskStatus.PENDING:
                return `text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${currentStatus === status ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`;
            case TaskStatus.IN_PROGRESS:
                return `text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30 ${currentStatus === status ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`;
            case TaskStatus.COMPLETED:
                return `text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${currentStatus === status ? 'bg-green-100 dark:bg-green-900/30' : ''}`;
            case TaskStatus.CANCELLED:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${currentStatus === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
            case TaskStatus.POSTPONED:
                return `text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30 ${currentStatus === status ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`;
            case TaskStatus.MISSED:
                return `text-orange-800 border-orange-200 hover:bg-orange-50 hover:border-orange-300 dark:text-orange-300 dark:hover:bg-orange-900/20 dark:border-orange-900/30 ${currentStatus === status ? 'bg-orange-100 dark:bg-orange-900/30' : ''}`;
            default:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${currentStatus === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
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
                return <Phone className="w-4 h-4 mr-2" />;
            case TaskType.EMAIL:
                return <Mail className="w-4 h-4 mr-2" />;
            case TaskType.IN_PERSON_MEETING:
                return <Users className="w-4 h-4 mr-2" />;
            case TaskType.VIRTUAL_MEETING:
                return <Users className="w-4 h-4 mr-2" />;
            case TaskType.FOLLOW_UP:
                return <MessageSquare className="w-4 h-4 mr-2" />;
            case TaskType.PROPOSAL:
                return <FileText className="w-4 h-4 mr-2" />;
            case TaskType.REPORT:
                return <FileText className="w-4 h-4 mr-2" />;
            case TaskType.QUOTATION:
                return <CreditCard className="w-4 h-4 mr-2" />;
            case TaskType.VISIT:
                return <MapPin className="w-4 h-4 mr-2" />;
            default:
                return <Edit className="w-4 h-4 mr-2" />;
        }
    };

    const handleStatusChange = (newStatus: TaskStatus) => {
        if (newStatus === currentStatus) return;

        if (newStatus === TaskStatus.POSTPONED) {
            setPendingStatusChange(newStatus);
            const deadlineDate = task.deadline
                ? new Date(task.deadline)
                : new Date();
            setPostponeDate(deadlineDate);
            setPostponeTime(format(deadlineDate, 'HH:mm'));
            setIsPostponeDatePickerOpen(true);
        } else {
            setPendingStatusChange(newStatus);
            setConfirmStatusChangeOpen(true);
        }
    };

    const confirmStatusChange = () => {
        if (pendingStatusChange) {
            setCurrentStatus(pendingStatusChange);
            setConfirmStatusChangeOpen(false);
            onClose();

            if (pendingStatusChange === TaskStatus.POSTPONED && postponeDate) {
                const [hours, minutes] = postponeTime.split(':').map(Number);
                const combinedDateTime = new Date(postponeDate);
                combinedDateTime.setHours(hours, minutes);
                onUpdateStatus(task.uid, pendingStatusChange, combinedDateTime);
            } else {
                onUpdateStatus(task.uid, pendingStatusChange);
            }
        }
    };

    const handleDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = () => {
        onDelete(task.uid);
        setConfirmDeleteOpen(false);
        onClose();
    };

    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    const handleSubtaskStatusToggle = (
        subtaskId: number,
        currentStatus: string,
    ) => {
        const newStatus =
            currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

        if (onUpdateSubtaskStatus) {
            onUpdateSubtaskStatus(subtaskId, newStatus);
        }
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'people', label: 'People & Org' },
        { id: 'activity', label: 'Activity' },
        { id: 'routes', label: 'Routes' },
    ];

    const formatAddress = (address?: any) => {
        if (!address) return 'No address provided';

        const parts = [];
        if (address?.street) parts.push(address.street);
        if (address?.suburb) parts.push(address.suburb);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);

        return parts.join(', ') || 'No address details provided';
    };

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

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-card">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Description
                            </h3>
                            <p className="text-xs font-thin font-body">
                                {task.description || 'No description provided'}
                            </p>
                        </div>

                        {/* Only show progress if there are subtasks */}
                        {task?.subtasks &&
                            task?.subtasks?.filter((st) => !st?.isDeleted)
                                .length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Stage
                                    </h3>
                                    <div className="flex flex-col gap-1 mb-2">
                                        <div className="flex items-center justify-between mb-1 text-xs">
                                            <div className="flex items-center">
                                                <span className="text-[10px] font-thin uppercase font-body">
                                                    Progress
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium uppercase font-body">
                                                {calculateSubtaskProgress()}%
                                            </span>
                                        </div>
                                        <Progress
                                            value={calculateSubtaskProgress()}
                                            className="h-2"
                                        />
                                    </div>
                                </div>
                            )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Priority
                                </h3>
                                <div className="flex items-center">
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-4 py-1 border-0 ${getPriorityBadgeColor()}`}
                                    >
                                        <AlertCircle
                                            className={`w-5 h-5 mr-1`}
                                        />
                                        <span className="text-xs font-normal uppercase font-body">
                                            {task?.priority}
                                        </span>
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Type
                                </h3>
                                <div className="flex items-center">
                                    <Badge
                                        variant="outline"
                                        className="px-4 py-1 text-xs font-normal border"
                                    >
                                        {getTaskTypeIcon()}
                                        <span className="text-xs font-normal uppercase font-body">
                                            {task?.taskType?.replace(/_/g, ' ')}
                                        </span>
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Repetition
                                </h3>
                                <div className="flex items-center">
                                    <Repeat className="w-4 h-4 mr-1 text-card-foreground/60" />
                                    <span className="text-xs font-thin uppercase font-body">
                                        {task?.repetitionType}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Category
                                </h3>
                                <div className="flex items-center">
                                    <Tag className="w-4 h-4 mr-1 text-card-foreground/60" />
                                    <span className="text-xs font-thin uppercase font-body">
                                        {task?.targetCategory ||
                                            'Not categorized'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Timeline
                            </h3>
                            <div className="p-4 space-y-3 rounded-lg bg-card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-[10px] font-thin uppercase font-body">
                                            Created
                                        </span>
                                    </div>
                                    <span className="text-xs font-thin font-body">
                                        {formatDate(task?.createdAt)}{' '}
                                        {formatTime(task?.createdAt)}
                                    </span>
                                </div>

                                {task.deadline && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-card-foreground/60" />
                                            <span className="text-[10px] font-thin uppercase font-body">
                                                Deadline
                                            </span>
                                        </div>
                                        <span className="text-xs font-thin uppercase font-body">
                                            {formatDate(task?.deadline)}{' '}
                                            {formatTime(task?.deadline)}
                                        </span>
                                    </div>
                                )}

                                {task?.completionDate && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                            <span className="text-xs font-thin uppercase font-body">
                                                Completed
                                            </span>
                                        </div>
                                        <span className="text-xs font-thin font-body">
                                            {formatDate(task?.completionDate)}{' '}
                                            {formatTime(task?.completionDate)}
                                        </span>
                                    </div>
                                )}

                                {task?.repetitionDeadline && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Repeat className="w-4 h-4 mr-2 text-card-foreground/60" />
                                            <span className="text-xs font-thin uppercase font-body">
                                                Repeats Until
                                            </span>
                                        </div>
                                        <span className="text-xs font-thin font-body">
                                            {formatDate(
                                                task?.repetitionDeadline,
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {extendedTask?.routes &&
                            extendedTask?.routes?.length > 0 && (
                                <div>
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Routes
                                    </h3>
                                    <div className="p-4 space-y-2 rounded-lg bg-card">
                                        {extendedTask.routes.map(
                                            (route, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center p-2 border bg-card"
                                                >
                                                    <Map className="w-4 h-4 mr-2 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {route?.name ||
                                                            `Route #${route?.uid || index + 1}`}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {task?.subtasks && task?.subtasks?.length > 0 && (
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Subtasks
                                </h3>
                                <div className="p-4 space-y-2 rounded-lg bg-card">
                                    {task?.subtasks
                                        ?.filter((st) => !st.isDeleted)
                                        .map((subtask) => (
                                            <div
                                                key={subtask?.uid}
                                                className="flex items-center justify-between p-3 border rounded bg-card"
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center border cursor-pointer ${
                                                            subtask.status ===
                                                            'COMPLETED'
                                                                ? 'bg-green-500 border-green-500'
                                                                : 'border-yellow-500 bg-transparent'
                                                        }`}
                                                        onClick={() =>
                                                            handleSubtaskStatusToggle(
                                                                subtask.uid,
                                                                subtask.status,
                                                            )
                                                        }
                                                    >
                                                        {subtask.status ===
                                                            'COMPLETED' && (
                                                            <CheckCheck className="w-3 h-3 text-white" />
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`text-xs font-thin font-body ${
                                                            subtask.status ===
                                                            'COMPLETED'
                                                                ? 'line-through text-muted-foreground'
                                                                : ''
                                                        }`}
                                                    >
                                                        {subtask?.title}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-3 py-1 border-0 font-body font-thin ${
                                                        subtask.status ===
                                                        'COMPLETED'
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
                    <div className="space-y-6">
                        <div>
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Assignees
                            </h3>
                            <div className="p-4 rounded-lg bg-card">
                                {extendedTask?.assignees &&
                                extendedTask?.assignees?.length > 0 ? (
                                    <div className="space-y-2">
                                        {extendedTask?.assignees?.map(
                                            (assignee, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center p-2 border bg-card"
                                                >
                                                    <Avatar className="w-12 h-12 mr-3 border border-primary">
                                                        {assignee?.photoURL ? (
                                                            <AvatarImage
                                                                src={
                                                                    assignee?.photoURL
                                                                }
                                                                alt={
                                                                    assignee?.name ||
                                                                    ''
                                                                }
                                                            />
                                                        ) : (
                                                            <AvatarFallback className="text-xs font-normal uppercase bg-primary/10 text-primary font-body">
                                                                {assignee?.name &&
                                                                assignee?.surname
                                                                    ? `${assignee?.name[0]}${assignee?.surname[0]}`
                                                                    : `U${assignee?.uid || index + 1}`}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <p className="text-xs font-medium uppercase font-body">
                                                            {assignee?.name}{' '}
                                                            {assignee?.surname}
                                                        </p>
                                                        <div className="flex flex-col space-y-1 text-xs text-card-foreground/60">
                                                            {assignee?.email &&
                                                                assignee?.phone && (
                                                                    <div className="flex items-center">
                                                                        <Mail className="w-4 h-4 mr-1" />
                                                                        <span className="text-xs font-thin font-body">
                                                                            {
                                                                                assignee?.email
                                                                            }{' '}
                                                                            -{' '}
                                                                            {
                                                                                assignee?.phone
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs italic uppercase text-card-f6reground/50 font-body">
                                        No assignees for this task
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Clients
                            </h3>
                            <div className="p-4 rounded-lg bg-card">
                                {task.clients && task.clients.length > 0 ? (
                                    <div className="space-y-2">
                                        {task.clients.map(
                                            (client: any, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col justify-start gap-1 p-2 border bg-card"
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <Avatar className="w-12 h-12 mr-3 border border-primary">
                                                            {client?.logo ? (
                                                                <AvatarImage
                                                                    src={
                                                                        client?.logo
                                                                    }
                                                                    alt={
                                                                        client?.name
                                                                    }
                                                                />
                                                            ) : (
                                                                <AvatarFallback className="text-xs text-blue-800 bg-blue-100">
                                                                    {client?.name
                                                                        ?.slice(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .toUpperCase() ||
                                                                        `C${client?.uid || index + 1}`}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-medium uppercase font-body">
                                                                {client?.name}
                                                            </p>
                                                            <p className="text-xs font-normal text-card-foreground/60 font-body">
                                                                {
                                                                    client?.category
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-2">
                                                        {client?.contactPerson && (
                                                            <div className="flex items-center text-xs">
                                                                <User className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                                <span className="text-xs font-thin font-body">
                                                                    {
                                                                        client?.contactPerson
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {client?.email && (
                                                            <div className="flex items-center text-xs">
                                                                <Mail className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                                <span className="text-xs font-thin font-body">
                                                                    {
                                                                        client?.email
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {client?.phone && (
                                                            <div className="flex items-center text-xs">
                                                                <Phone className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                                <span className="text-xs font-thin font-body">
                                                                    {
                                                                        client?.phone
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {client?.alternativePhone && (
                                                            <div className="flex items-center text-xs">
                                                                <Phone className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                                <span className="text-xs font-thin font-body">
                                                                    {
                                                                        client?.alternativePhone
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {client?.website && (
                                                            <div className="flex items-center text-xs">
                                                                <Globe className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                                <span className="text-xs font-thin font-body">
                                                                    {
                                                                        client?.website
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                        {client?.address && (
                                                            <div className="flex items-start col-span-2 text-xs">
                                                                <MapPin className="w-4 h-4 mr-1 mt-0.5 text-card-foreground/60" />
                                                                <span className="text-xs font-thin font-body">
                                                                    {formatAddress(
                                                                        client?.address,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs italic uppercase text-card-f6reground/50 font-body">
                                        No clients associated with this task
                                    </p>
                                )}
                            </div>
                        </div>

                        {task.creator && (
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Created By
                                </h3>
                                <div className="p-4 rounded-lg bg-card">
                                    <div className="flex flex-col justify-start gap-1 p-2 border bg-card">
                                        <div className="flex items-center mb-2">
                                            <Avatar className="w-12 h-12 mr-3 border border-primary">
                                                {task?.creator?.photoURL ||
                                                task?.creator?.avatarUrl ? (
                                                    <AvatarImage
                                                        src={
                                                            task?.creator
                                                                ?.photoURL ||
                                                            task?.creator
                                                                ?.avatarUrl ||
                                                            ''
                                                        }
                                                        alt={
                                                            task?.creator?.name
                                                        }
                                                    />
                                                ) : (
                                                    <AvatarFallback className="text-green-800 bg-green-100">
                                                        {task?.creator?.name &&
                                                        task?.creator?.surname
                                                            ? `${task?.creator?.name[0]}${task?.creator?.surname[0]}`
                                                            : `${
                                                                  task?.creator?.name
                                                                      ?.slice(
                                                                          0,
                                                                          2,
                                                                      )
                                                                      .toUpperCase() ||
                                                                  'U'
                                                              }`}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div>
                                                <p className="text-xs font-normal font-body">
                                                    {task?.creator.name}{' '}
                                                    {task?.creator.surname}
                                                </p>
                                                <p className="text-xs font-normal text-card-foreground/60 font-body">
                                                    {task?.creator
                                                        .accessLevel && (
                                                        <span className="capitalize">
                                                            {
                                                                task?.creator
                                                                    .accessLevel
                                                            }
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-2">
                                            {task?.creator?.email && (
                                                <div className="flex items-center text-xs">
                                                    <Mail className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.creator?.email}
                                                    </span>
                                                </div>
                                            )}
                                            {task?.creator?.phone && (
                                                <div className="flex items-center text-xs">
                                                    <Phone className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.creator?.phone}
                                                    </span>
                                                </div>
                                            )}
                                            {task?.creator?.userref && (
                                                <div className="flex items-center text-xs">
                                                    <Tag className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.creator?.userref}
                                                    </span>
                                                </div>
                                            )}
                                            {task?.creator?.accessLevel && (
                                                <div className="flex items-center text-xs">
                                                    <User className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.creator?.accessLevel
                                                            ?.charAt(0)
                                                            .toUpperCase() +
                                                            task?.creator?.accessLevel?.slice(
                                                                1,
                                                            )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Organization
                            </h3>
                            <div className="p-4 rounded-lg bg-card">
                                {task?.organisation ? (
                                    <div className="flex flex-col justify-start gap-1 p-2 border bg-card">
                                        <div className="flex items-center mb-2">
                                            <Avatar className="w-12 h-12 mr-3 border border-primary">
                                                {task?.organisation?.logo ? (
                                                    <AvatarImage
                                                        src={
                                                            task?.organisation
                                                                ?.logo
                                                        }
                                                        alt={
                                                            task?.organisation
                                                                ?.name
                                                        }
                                                    />
                                                ) : (
                                                    <AvatarFallback className="text-orange-800 bg-orange-100">
                                                        {task?.organisation?.name
                                                            ?.slice(0, 2)
                                                            .toUpperCase() ||
                                                            `O${task?.organisation?.uid}`}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium uppercase font-body">
                                                    {task?.organisation?.name}
                                                </p>
                                                <p className="flex flex-row items-center gap-1 text-xs text-card-foreground/60 font-body">
                                                    <Tag className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {
                                                            task?.organisation
                                                                ?.ref
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-2">
                                            {task?.organisation?.email && (
                                                <div className="flex items-center text-xs">
                                                    <Mail className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {
                                                            task?.organisation
                                                                ?.email
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {task?.organisation?.phone && (
                                                <div className="flex items-center text-xs">
                                                    <Phone className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {
                                                            task?.organisation
                                                                ?.phone
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {task?.organisation?.website && (
                                                <div className="flex items-center text-xs">
                                                    <Globe className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {
                                                            task?.organisation
                                                                ?.website
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {task?.organisation?.address && (
                                                <div className="flex items-start col-span-2 text-xs">
                                                    <MapPin className="w-4 h-4 mr-1 mt-0.5 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {formatAddress(
                                                            task?.organisation
                                                                ?.address,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs italic font-normal uppercase text-card-f6reground/50 font-body">
                                            No organization specified
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Branch
                            </h3>
                            <div className="p-4 rounded-lg bg-card">
                                {task?.branch ? (
                                    <div className="flex flex-col justify-start gap-1 p-2 border bg-card">
                                        <div className="flex items-center mb-2">
                                            <Building2 className="w-5 h-5 mr-2 text-card-foreground/60" />
                                            <div>
                                                <p className="text-sm font-medium uppercase font-body">
                                                    {task?.branch?.name}
                                                </p>
                                                <p className="flex flex-row items-center gap-1 text-xs text-card-foreground/60 font-body">
                                                    <Tag className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.branch?.ref}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 mt-2 md:grid-cols-2">
                                            {task?.branch?.contactPerson && (
                                                <div className="flex items-center text-xs">
                                                    <User className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {
                                                            task?.branch
                                                                ?.contactPerson
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {task?.branch?.email && (
                                                <div className="flex items-center text-xs">
                                                    <Mail className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.branch?.email}
                                                    </span>
                                                </div>
                                            )}
                                            {task?.branch?.phone && (
                                                <div className="flex items-center text-xs">
                                                    <Phone className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.branch?.phone}
                                                    </span>
                                                </div>
                                            )}
                                            {task?.branch?.website && (
                                                <div className="flex items-center text-xs">
                                                    <Globe className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {task?.branch?.website}
                                                    </span>
                                                </div>
                                            )}
                                            {task?.branch?.address && (
                                                <div className="flex items-start col-span-2 text-xs">
                                                    <MapPin className="w-4 h-4 mr-1 mt-0.5 text-card-foreground/60" />
                                                    <span className="text-xs font-thin font-body">
                                                        {formatAddress(
                                                            task?.branch
                                                                ?.address,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Briefcase className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs italic font-normal uppercase text-card-f6reground/50 font-body">
                                            No branch specified
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'activity':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-card">
                            <h3 className="mb-4 text-xs font-thin uppercase font-body">
                                Activity Timeline
                            </h3>
                            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-green-500 dark:before:bg-green-600">
                                <div className="relative">
                                    <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-green-500 dark:bg-green-600 text-white">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-normal uppercase font-body">
                                            Task created
                                        </p>
                                        <p className="text-xs font-thin uppercase text-card-f6reground/50 dark:text-gray-400 font-body">
                                            {formatDate(task.createdAt)}{' '}
                                            {formatTime(task.createdAt)}
                                        </p>
                                        <p className="text-[10px] font-normal text-card-foreground/60 uppercase dark:text-gray-400 font-body">
                                            Created by{' '}
                                            {task?.creator?.name || 'System'}
                                        </p>
                                    </div>
                                </div>
                                {task?.updatedAt &&
                                    formatDate(task?.updatedAt) !==
                                        formatDate(task?.createdAt) &&
                                    !task?.completionDate && (
                                        <div className="relative">
                                            <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 dark:bg-blue-600 text-white">
                                                <Edit className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-xs font-normal uppercase font-body">
                                                    Task updated
                                                </p>
                                                <p className="text-xs font-thin uppercase text-card-f6reground/50 dark:text-gray-400 font-body">
                                                    {formatDate(
                                                        task?.updatedAt,
                                                    )}{' '}
                                                    {formatTime(
                                                        task?.updatedAt,
                                                    )}
                                                </p>
                                                <p className="text-[10px] font-normal text-card-foreground/60 uppercase dark:text-gray-400 font-body">
                                                    Status: {task?.status}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                {task?.deadline && (
                                    <div className="relative">
                                        <div
                                            className={`absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full ${
                                                task?.isOverdue
                                                    ? 'bg-red-500 dark:bg-red-600'
                                                    : 'bg-orange-500 dark:bg-orange-600'
                                            } text-white`}
                                        >
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-normal uppercase font-body">
                                                {task?.isOverdue
                                                    ? 'Deadline passed'
                                                    : 'Upcoming deadline'}
                                            </p>
                                            <p className="text-[10px] font-normal text-card-foreground/60 uppercase dark:text-gray-400 font-body">
                                                {formatDate(task?.deadline)}{' '}
                                                {formatTime(task?.deadline)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {task?.completionDate && (
                                    <div className="relative">
                                        <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-green-500 dark:bg-green-600 text-white">
                                            <CheckCheck className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-normal uppercase font-body">
                                                Task completed
                                            </p>
                                            <p className="text-xs font-thin uppercase text-card-f6reground/50 dark:text-gray-400 font-body">
                                                {formatDate(
                                                    task?.completionDate,
                                                )}{' '}
                                                {formatTime(
                                                    task?.completionDate,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'routes':
                return (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-4 text-center rounded-lg bg-card">
                            <Map className="w-12 h-12 mb-2 text-primary/50" />
                            <p className="text-xs font-thin uppercase font-body">
                                Activating Soon
                            </p>
                            <p className="mt-2 text-xs font-thin uppercase text-card-foreground/60 font-body">
                                Route planning and management will be available
                                in a future update.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleEditFormSubmit = (taskId: number, taskData: Partial<Task>) => {
        // First, determine if we need to update the status separately
        if (taskData.status && taskData.status !== task.status) {
            // If we're postponing with a new deadline, it will be handled by onUpdateStatus
            if (taskData.status === TaskStatus.POSTPONED && taskData.deadline) {
                onUpdateStatus(
                    taskId,
                    taskData.status,
                    new Date(taskData.deadline),
                );
            } else {
                onUpdateStatus(taskId, taskData.status);
            }
        }

        // Create an updates object excluding status if it was already handled
        const updates: Partial<Task> = { ...taskData };
        if (updates.status && updates.status !== task.status) {
            delete updates.status; // Remove status as it's already handled
        }

        // Only proceed if there are other fields to update and we have the onUpdateTask function
        if (Object.keys(updates).length > 0 && onUpdateTask) {
            onUpdateTask(taskId, updates);
        }

        // Close the edit modal
        setIsEditModalOpen(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={() => onClose()}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold uppercase font-body">
                                {task?.title}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-4 py-1 font-body border-0 ${getStatusBadgeColor(
                                        task?.status,
                                    )}`}
                                >
                                    {task?.status?.replace(/_/g, ' ')}
                                </Badge>
                                {task.isOverdue && (
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] px-4 py-1 font-body border-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                    >
                                        OVERDUE
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <Edit className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="flex items-center mb-6 overflow-x-auto border-b border-border/10">
                            {tabs.map((tab) => (
                                <div
                                    key={tab?.id}
                                    className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
                                >
                                    <div
                                        className={`mb-3 font-body px-0 font-normal ${
                                            activeTab === tab.id
                                                ? 'text-primary dark:text-primary'
                                                : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                        onClick={() => handleTabChange(tab?.id)}
                                    >
                                        <span className="text-xs font-thin uppercase font-body">
                                            {tab?.label}
                                        </span>
                                    </div>
                                    {activeTab === tab?.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                        {renderTabContent()}
                    </div>
                    <DialogFooter className="flex flex-col flex-wrap gap-4 pt-4 mt-6 border-t dark:border-gray-700">
                        <div className="flex flex-col items-center justify-center w-full">
                            <p className="text-xs font-thin uppercase font-body">
                                Quick Actions
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center w-full gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(TaskStatus.PENDING)}`}
                                onClick={() =>
                                    handleStatusChange(TaskStatus.PENDING)
                                }
                                title="Set as Pending"
                            >
                                <CalendarClock
                                    strokeWidth={1.2}
                                    className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(TaskStatus.IN_PROGRESS)}`}
                                onClick={() =>
                                    handleStatusChange(TaskStatus.IN_PROGRESS)
                                }
                                title="Set as In Progress"
                            >
                                <CalendarCog
                                    strokeWidth={1.2}
                                    className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(TaskStatus.COMPLETED)}`}
                                onClick={() =>
                                    handleStatusChange(TaskStatus.COMPLETED)
                                }
                                title="Set as Completed"
                            >
                                <CalendarCheck2
                                    strokeWidth={1.2}
                                    className="text-green-600 w-7 h-7 dark:text-green-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(TaskStatus.CANCELLED)}`}
                                onClick={() =>
                                    handleStatusChange(TaskStatus.CANCELLED)
                                }
                                title="Set as Cancelled"
                            >
                                <CalendarX2
                                    strokeWidth={1.2}
                                    className="text-gray-600 w-7 h-7 dark:text-gray-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(TaskStatus.POSTPONED)}`}
                                onClick={() =>
                                    handleStatusChange(TaskStatus.POSTPONED)
                                }
                                title="Set as Postponed"
                            >
                                <CalendarRange
                                    strokeWidth={1.2}
                                    className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(TaskStatus.MISSED)}`}
                                onClick={() =>
                                    handleStatusChange(TaskStatus.MISSED)
                                }
                                title="Set as Missed"
                            >
                                <CalendarFold
                                    strokeWidth={1.2}
                                    className="text-orange-600 w-7 h-7 dark:text-orange-400"
                                />
                            </Button>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="rounded-full w-14 h-14 dark:bg-red-900/80 dark:text-white dark:hover:bg-red-900 dark:border-none"
                                onClick={handleDelete}
                                title="Delete Task"
                            >
                                <Trash2 className="w-7 h-7" strokeWidth={1.5} />
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Task Modal */}
            <Dialog
                open={isEditModalOpen}
                onOpenChange={() => setIsEditModalOpen(false)}
            >
                <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-thin uppercase font-body"></DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-64">
                        <h2 className="text-xs font-thin uppercase font-body">
                            Activating Soon
                        </h2>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Status Change Confirmation Dialog */}
            <AlertDialog
                open={confirmStatusChangeOpen}
                onOpenChange={setConfirmStatusChangeOpen}
            >
                <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirm Status Change
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to change the task status to{' '}
                            {pendingStatusChange}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row justify-between w-full">
                        <div className="w-1/2">
                            <AlertDialogCancel className="w-full dark:bg-card dark:text-gray-200 dark:hover:bg-card/80 dark:border-gray-700">
                                Cancel
                            </AlertDialogCancel>
                        </div>
                        <div className="w-1/2">
                            <AlertDialogAction
                                onClick={confirmStatusChange}
                                className="w-full bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                            >
                                Confirm
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
            >
                <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this task? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <div className="w-1/2">
                            <AlertDialogCancel className="w-full dark:bg-card dark:text-gray-200 dark:hover:bg-card/80 dark:border-gray-700">
                                Cancel
                            </AlertDialogCancel>
                        </div>
                        <div className="w-1/2">
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="w-full bg-destructive hover:bg-destructive/90 dark:bg-red-900/80 dark:hover:bg-red-900 dark:border-none"
                            >
                                Delete
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Postpone Date Picker Dialog */}
            <Dialog
                open={isPostponeDatePickerOpen}
                onOpenChange={setIsPostponeDatePickerOpen}
            >
                <DialogContent className="max-w-[350px] p-0 border-0 rounded-lg overflow-hidden dark:bg-black bg-card">
                    <div className="flex flex-col">
                        <div className="p-3 border-b dark:border-gray-800">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-medium">
                                    Pick a date and time
                                </h2>
                            </div>
                        </div>
                        <div className="p-0">
                            <UiCalendar
                                mode="single"
                                selected={postponeDate}
                                onSelect={(date) => setPostponeDate(date)}
                                initialFocus
                                className="dark:bg-black dark:text-gray-200"
                            />
                        </div>
                        <div className="p-3 border-t dark:border-gray-800">
                            <div className="flex flex-col space-y-2">
                                <span className="text-xs font-medium">
                                    Select Time
                                </span>
                                <input
                                    type="time"
                                    className="w-full h-8 px-3 text-sm bg-transparent border rounded dark:border-gray-800 dark:text-gray-300"
                                    value={postponeTime}
                                    onChange={(e) =>
                                        setPostponeTime(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end p-3 space-x-2 border-t dark:border-gray-800">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setIsPostponeDatePickerOpen(false)
                                }
                                className="text-xs h-9 dark:bg-transparent dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsPostponeDatePickerOpen(false);
                                    setConfirmStatusChangeOpen(true);
                                }}
                                className="text-xs h-9 bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
