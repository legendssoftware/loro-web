'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    TaskFilterParams,
    TaskPriority,
    TaskStatus,
    TaskType,
    Task,
} from '@/lib/types/task';
import {
    CalendarIcon,
    Check,
    ChevronDown,
    Search,
    X,
    Clock,
    Users,
    Award,
    Tag,
    AlertCircle,
    CheckCircle,
    PauseCircle,
    XCircle,
    HourglassIcon,
    Calendar,
    Video,
    Phone,
    Mail,
    MessageSquare,
    MessageCircle,
    Redo2,
    FileText,
    BarChart2,
    MapPin,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import {
    format,
    subDays,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
} from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';

// Date range presets
enum DateRangePreset {
    TODAY = 'TODAY',
    YESTERDAY = 'YESTERDAY',
    LAST_WEEK = 'LAST_WEEK',
    LAST_MONTH = 'LAST_MONTH',
    CUSTOM = 'CUSTOM',
}

// Extend TaskFilterParams to include assigneeId
interface ExtendedTaskFilterParams extends TaskFilterParams {
    assigneeId?: number;
}

interface TasksFilterProps {
    onApplyFilters: (filters: ExtendedTaskFilterParams) => void;
    onClearFilters: () => void;
    tasks?: Task[];
}

export function TasksFilter({
    onApplyFilters,
    onClearFilters,
    tasks = [],
}: TasksFilterProps) {
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
    const [priority, setPriority] = useState<TaskPriority | undefined>(
        undefined,
    );
    const [taskType, setTaskType] = useState<TaskType | undefined>(undefined);
    const [assigneeId, setAssigneeId] = useState<number | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const handleApplyFilters = useCallback(() => {
        const filters: ExtendedTaskFilterParams = {};
        const newActiveFilters: string[] = [];

        if (search) {
            filters.search = search;
            newActiveFilters.push('Search');
        }

        if (status) {
            filters.status = status;
            newActiveFilters.push('Status');
        }

        if (priority) {
            filters.priority = priority;
            newActiveFilters.push('Priority');
        }

        if (taskType) {
            filters.taskType = taskType;
            newActiveFilters.push('Task Type');
        }

        if (assigneeId) {
            filters.assigneeId = assigneeId;
            newActiveFilters.push('Assignee');
        }

        if (startDate || endDate) {
            if (startDate) {
                filters.startDate = startDate;
                newActiveFilters.push('Date Range');
            }
            if (endDate) {
                filters.endDate = endDate;
            }
        }

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [
        search,
        status,
        priority,
        taskType,
        assigneeId,
        startDate,
        endDate,
        onApplyFilters,
    ]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setPriority(undefined);
        setTaskType(undefined);
        setAssigneeId(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        setDateRangePreset(undefined);
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

    const handleDateRangeSelect = useCallback(
        (preset: DateRangePreset) => {
            const today = new Date();

            switch (preset) {
                case DateRangePreset.TODAY:
                    setStartDate(today);
                    setEndDate(today);
                    break;
                case DateRangePreset.YESTERDAY:
                    const yesterday = subDays(today, 1);
                    setStartDate(yesterday);
                    setEndDate(yesterday);
                    break;
                case DateRangePreset.LAST_WEEK:
                    const lastWeekStart = startOfWeek(subDays(today, 7));
                    const lastWeekEnd = endOfWeek(subDays(today, 7));
                    setStartDate(lastWeekStart);
                    setEndDate(lastWeekEnd);
                    break;
                case DateRangePreset.LAST_MONTH:
                    const lastMonthStart = startOfMonth(subDays(today, 30));
                    const lastMonthEnd = endOfMonth(subDays(today, 30));
                    setStartDate(lastMonthStart);
                    setEndDate(lastMonthEnd);
                    break;
                case DateRangePreset.CUSTOM:
                    break;
                default:
                    setStartDate(undefined);
                    setEndDate(undefined);
            }

            setDateRangePreset(preset);
            if (preset !== DateRangePreset.CUSTOM) {
                setTimeout(handleApplyFilters, 0);
            }
        },
        [handleApplyFilters],
    );

    const getDateRangeLabel = useCallback(() => {
        if (dateRangePreset === DateRangePreset.TODAY) return 'TODAY';
        if (dateRangePreset === DateRangePreset.YESTERDAY) return 'YESTERDAY';
        if (dateRangePreset === DateRangePreset.LAST_WEEK) return 'LAST WEEK';
        if (dateRangePreset === DateRangePreset.LAST_MONTH) return 'LAST MONTH';
        if (dateRangePreset === DateRangePreset.CUSTOM) {
            if (startDate && endDate) {
                return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
            }
            if (startDate) {
                return `FROM ${format(startDate, 'MMM d')}`;
            }
        }
        return 'DATE RANGE';
    }, [dateRangePreset, startDate, endDate]);

    const priorityLabels = {
        [TaskPriority.LOW]: 'Low',
        [TaskPriority.MEDIUM]: 'Medium',
        [TaskPriority.HIGH]: 'High',
        [TaskPriority.URGENT]: 'Urgent',
    };

    const statusLabels = {
        [TaskStatus.PENDING]: 'PENDING',
        [TaskStatus.IN_PROGRESS]: 'IN PROGRESS',
        [TaskStatus.COMPLETED]: 'COMPLETED',
        [TaskStatus.CANCELLED]: 'CANCELLED',
        [TaskStatus.OVERDUE]: 'OVERDUE',
        [TaskStatus.POSTPONED]: 'POSTPONED',
        [TaskStatus.MISSED]: 'MISSED',
    };

    const statusIcons = {
        [TaskStatus.PENDING]: HourglassIcon,
        [TaskStatus.IN_PROGRESS]: Clock,
        [TaskStatus.COMPLETED]: CheckCircle,
        [TaskStatus.CANCELLED]: XCircle,
        [TaskStatus.OVERDUE]: AlertCircle,
        [TaskStatus.POSTPONED]: PauseCircle,
        [TaskStatus.MISSED]: XCircle,
    };

    const statusColors = {
        [TaskStatus.PENDING]: 'text-yellow-600',
        [TaskStatus.IN_PROGRESS]: 'text-blue-600',
        [TaskStatus.COMPLETED]: 'text-green-600',
        [TaskStatus.CANCELLED]: 'text-gray-600',
        [TaskStatus.OVERDUE]: 'text-red-600',
        [TaskStatus.POSTPONED]: 'text-purple-600',
        [TaskStatus.MISSED]: 'text-orange-600',
    };

    const priorityColors = {
        [TaskPriority.LOW]: 'text-gray-600',
        [TaskPriority.MEDIUM]: 'text-blue-600',
        [TaskPriority.HIGH]: 'text-amber-600',
        [TaskPriority.URGENT]: 'text-red-600',
    };

    const taskTypeColors = {
        [TaskType.IN_PERSON_MEETING]: 'text-violet-600',
        [TaskType.VIRTUAL_MEETING]: 'text-indigo-600',
        [TaskType.CALL]: 'text-cyan-600',
        [TaskType.EMAIL]: 'text-blue-600',
        [TaskType.WHATSAPP]: 'text-green-600',
        [TaskType.SMS]: 'text-teal-600',
        [TaskType.FOLLOW_UP]: 'text-amber-600',
        [TaskType.PROPOSAL]: 'text-purple-600',
        [TaskType.REPORT]: 'text-gray-600',
        [TaskType.QUOTATION]: 'text-orange-600',
        [TaskType.VISIT]: 'text-pink-600',
        [TaskType.OTHER]: 'text-slate-600',
    };

    // Extract unique assignees from tasks
    const uniqueAssignees = React.useMemo(() => {
        const assigneesMap = new Map();

        tasks.forEach((task) => {
            if (task.assignees && task.assignees.length > 0) {
                task.assignees.forEach((assignee) => {
                    if (assignee.uid && !assigneesMap.has(assignee.uid)) {
                        assigneesMap.set(assignee.uid, {
                            id: assignee.uid,
                            name: assignee.name || 'Unknown',
                            surname: assignee.surname || '',
                            email: assignee.email || '',
                            avatar:
                                assignee.photoURL || assignee.avatarUrl || '',
                        });
                    }
                });
            }
        });

        return Array.from(assigneesMap.values());
    }, [tasks]);

    // Mock data for assignees - we'll replace this with uniqueAssignees
    const assignees =
        uniqueAssignees.length > 0
            ? uniqueAssignees
            : [
                  { id: 1, name: 'John Doe', avatar: '/avatars/01.png' },
                  { id: 2, name: 'Jane Smith', avatar: '/avatars/02.png' },
                  { id: 3, name: 'Alex Johnson', avatar: '/avatars/03.png' },
              ];

    return (
        <div className="flex items-center justify-end flex-1 gap-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                    placeholder="search..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (e.target.value) {
                            handleApplyFilters();
                        } else if (activeFilters.includes('Search')) {
                            handleApplyFilters();
                        }
                    }}
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-input placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-thin placeholder:font-body"
                />
                {search && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute w-8 h-8 transform -translate-y-1/2 right-1 top-1/2"
                        onClick={() => {
                            setSearch('');
                            if (activeFilters.includes('Search')) {
                                handleApplyFilters();
                            }
                        }}
                    >
                        <X className="w-4 h-4" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>

            {/* Date Range Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {getDateRangeLabel()}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            DATE RANGE
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(DateRangePreset.TODAY)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    TODAY
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.TODAY && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(DateRangePreset.YESTERDAY)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    YESTERDAY
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.YESTERDAY && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(DateRangePreset.LAST_WEEK)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    LAST WEEK
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.LAST_WEEK && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(
                                    DateRangePreset.LAST_MONTH,
                                )
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    LAST MONTH
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.LAST_MONTH && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Task Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {status ? (
                                    <>
                                        {statusIcons[status] &&
                                            React.createElement(
                                                statusIcons[status],
                                                {
                                                    className: `w-3 h-3 ${statusColors[status]}`,
                                                },
                                            )}
                                    </>
                                ) : (
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {status ? statusLabels[status] : 'STATUS'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            TASK STATUS
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(TaskStatus).map((statusOption) => {
                                const StatusIcon = statusIcons[statusOption];

                                return (
                                    <DropdownMenuItem
                                        key={statusOption}
                                        className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                        onClick={() => {
                                            setStatus(
                                                status === statusOption
                                                    ? undefined
                                                    : statusOption,
                                            );
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            {StatusIcon && (
                                                <>
                                                    <StatusIcon
                                                        className={`w-4 h-4 ${statusColors[statusOption]}`}
                                                    />
                                                </>
                                            )}
                                            <span
                                                className={`uppercase text-[10px] font-normal ml-1 ${
                                                    status === statusOption
                                                        ? statusColors[
                                                              statusOption
                                                          ]
                                                        : ''
                                                }`}
                                            >
                                                {statusLabels[statusOption]}
                                            </span>
                                        </div>
                                        {status === statusOption && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Priority Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {priority ? (
                                    <>
                                        <Award
                                            className={`h-3 w-3 ${priorityColors[priority]}`}
                                        />
                                    </>
                                ) : (
                                    <Award className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {priority
                                        ? priorityLabels[priority].toUpperCase()
                                        : 'PRIORITY'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            TASK PRIORITY
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(TaskPriority).map(
                                (priorityOption) => (
                                    <DropdownMenuItem
                                        key={priorityOption}
                                        className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                        onClick={() => {
                                            setPriority(
                                                priority === priorityOption
                                                    ? undefined
                                                    : priorityOption,
                                            );
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <>
                                                <Award
                                                    className={`h-4 w-4 ${priorityColors[priorityOption]}`}
                                                />
                                            </>
                                            <span
                                                className={`uppercase text-[10px] font-normal ml-1 ${
                                                    priority === priorityOption
                                                        ? priorityColors[
                                                              priorityOption
                                                          ]
                                                        : ''
                                                }`}
                                            >
                                                {priorityLabels[
                                                    priorityOption
                                                ].toUpperCase()}
                                            </span>
                                        </div>
                                        {priority === priorityOption && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ),
                            )}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Task Type Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {taskType ? (
                                    <Tag
                                        className={`h-4 w-4 ${taskTypeColors[taskType]}`}
                                    />
                                ) : (
                                    <Tag className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {taskType
                                        ? taskType.replace(/_/g, ' ')
                                        : 'TASK TYPE'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[220px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            TASK TYPE
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {Object.values(TaskType).map((typeOption) => {
                                let TypeIcon;
                                if (typeOption === 'IN_PERSON_MEETING')
                                    TypeIcon = Users;
                                else if (typeOption === 'VIRTUAL_MEETING')
                                    TypeIcon = Video;
                                else if (typeOption === 'CALL')
                                    TypeIcon = Phone;
                                else if (typeOption === 'EMAIL')
                                    TypeIcon = Mail;
                                else if (typeOption === 'WHATSAPP')
                                    TypeIcon = MessageSquare;
                                else if (typeOption === 'SMS')
                                    TypeIcon = MessageCircle;
                                else if (typeOption === 'FOLLOW_UP')
                                    TypeIcon = Redo2;
                                else if (typeOption === 'PROPOSAL')
                                    TypeIcon = FileText;
                                else if (typeOption === 'REPORT')
                                    TypeIcon = BarChart2;
                                else if (typeOption === 'QUOTATION')
                                    TypeIcon = FileText;
                                else if (typeOption === 'VISIT')
                                    TypeIcon = MapPin;
                                else TypeIcon = Tag;

                                return (
                                    <DropdownMenuItem
                                        key={typeOption}
                                        className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                        onClick={() => {
                                            setTaskType(
                                                taskType === typeOption
                                                    ? undefined
                                                    : typeOption,
                                            );
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <TypeIcon
                                                className={`w-4 h-4 mr-2 ${taskTypeColors[typeOption]}`}
                                            />
                                            <span
                                                className={`uppercase text-[10px] font-normal ${
                                                    taskType === typeOption
                                                        ? taskTypeColors[
                                                              typeOption
                                                          ]
                                                        : ''
                                                }`}
                                            >
                                                {typeOption.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        {taskType === typeOption && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Assignee Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {assigneeId ? 'ASSIGNED' : 'ASSIGNEE'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            ASSIGNEE
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() => {
                                setAssigneeId(
                                    assigneeId === -1 ? undefined : -1,
                                );
                                setTimeout(handleApplyFilters, 0);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-normal">
                                    Assigned to Me
                                </span>
                            </div>
                            {assigneeId === -1 && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() => {
                                setAssigneeId(assigneeId === 0 ? undefined : 0);
                                setTimeout(handleApplyFilters, 0);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                                    <X className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-normal">
                                    Unassigned
                                </span>
                            </div>
                            {assigneeId === 0 && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {assignees.map((assignee) => (
                            <DropdownMenuItem
                                key={assignee.id}
                                className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                onClick={() => {
                                    setAssigneeId(
                                        assigneeId === assignee.id
                                            ? undefined
                                            : assignee.id,
                                    );
                                    setTimeout(handleApplyFilters, 0);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage
                                            src={assignee.avatar}
                                            alt={assignee.name}
                                        />
                                        <AvatarFallback>
                                            {assignee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-normal">
                                        {assignee.name}
                                    </span>
                                </div>
                                {assigneeId === assignee.id && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear Filters Button - Only show when filters are active */}
            {activeFilters.length > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10"
                    onClick={handleClearFilters}
                >
                    <X className="w-5 h-5 text-red-500" />
                    <span className="sr-only">Clear all filters</span>
                </Button>
            )}
        </div>
    );
}
