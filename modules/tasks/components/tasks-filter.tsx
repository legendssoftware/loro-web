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
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
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

// Define initial filter state as a constant
const INITIAL_FILTERS = {
    search: '',
    status: undefined as TaskStatus | undefined,
    priority: undefined as TaskPriority | undefined,
    taskType: undefined as TaskType | undefined,
    assigneeId: undefined as number | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
};

export function TasksFilter({
    onApplyFilters,
    onClearFilters,
    tasks = [],
}: TasksFilterProps) {
    // Single consolidated filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);

    // Ref to track the last applied filters to prevent unnecessary API calls
    const lastAppliedFiltersRef = useRef<ExtendedTaskFilterParams>({});

    // Ref for debounce timer
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Derive active filter count from current filter state
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.priority) count++;
        if (filters.taskType) count++;
        if (filters.assigneeId) count++;
        if (filters.startDate || filters.endDate) count++;
        return count;
    }, [filters]);

    // Helper function to build filter params from state
    const buildFilterParams = useCallback((): ExtendedTaskFilterParams => {
        const params: ExtendedTaskFilterParams = {};

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.priority) params.priority = filters.priority;
        if (filters.taskType) params.taskType = filters.taskType;
        if (filters.assigneeId) params.assigneeId = filters.assigneeId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        return params;
    }, [filters]);

    // Check if filters have actually changed
    const hasFiltersChanged = useCallback((newParams: ExtendedTaskFilterParams): boolean => {
        const lastParams = lastAppliedFiltersRef.current;

        return (
            lastParams.search !== newParams.search ||
            lastParams.status !== newParams.status ||
            lastParams.priority !== newParams.priority ||
            lastParams.taskType !== newParams.taskType ||
            lastParams.assigneeId !== newParams.assigneeId ||
            lastParams.startDate !== newParams.startDate ||
            lastParams.endDate !== newParams.endDate
        );
    }, []);

    // Single unified apply filters function
    const applyFilters = useCallback(() => {
        const params = buildFilterParams();

        // Only apply if filters have actually changed
        if (hasFiltersChanged(params)) {
            lastAppliedFiltersRef.current = params;
            onApplyFilters(params);
        }
    }, [buildFilterParams, hasFiltersChanged, onApplyFilters]);

    // Debounced search effect
    useEffect(() => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for search debouncing
        debounceTimerRef.current = setTimeout(() => {
            applyFilters();
        }, 300);

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [filters.search, applyFilters]);

    // Immediate effect for non-search filters
    useEffect(() => {
        applyFilters();
    }, [filters.status, filters.priority, filters.taskType, filters.assigneeId, filters.startDate, filters.endDate, applyFilters]);

    // Handle clearing filters
    const handleClearFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setDateRangePreset(undefined);
        lastAppliedFiltersRef.current = {};
        onClearFilters();
    }, [onClearFilters]);

    // Handle individual filter updates
    const updateFilter = useCallback(
        <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
            setFilters((prev) => ({
                ...prev,
                [key]: value,
            }));
        },
        [],
    );

    // Toggle filter (set to undefined if already selected, otherwise set to new value)
    const toggleFilter = useCallback(
        <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
            setFilters((prev) => ({
                ...prev,
                [key]: prev[key] === value ? undefined : value,
            }));
        },
        [],
    );

    const handleDateRangeSelect = useCallback(
        (preset: DateRangePreset) => {
            const today = new Date();

            switch (preset) {
                case DateRangePreset.TODAY:
                    setFilters((prev) => ({ ...prev, startDate: today, endDate: today }));
                    break;
                case DateRangePreset.YESTERDAY:
                    const yesterday = subDays(today, 1);
                    setFilters((prev) => ({ ...prev, startDate: yesterday, endDate: yesterday }));
                    break;
                case DateRangePreset.LAST_WEEK:
                    const lastWeekStart = startOfWeek(subDays(today, 7));
                    const lastWeekEnd = endOfWeek(subDays(today, 7));
                    setFilters((prev) => ({ ...prev, startDate: lastWeekStart, endDate: lastWeekEnd }));
                    break;
                case DateRangePreset.LAST_MONTH:
                    const lastMonthStart = startOfMonth(subDays(today, 30));
                    const lastMonthEnd = endOfMonth(subDays(today, 30));
                    setFilters((prev) => ({ ...prev, startDate: lastMonthStart, endDate: lastMonthEnd }));
                    break;
                case DateRangePreset.CUSTOM:
                    break;
                default:
                    setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
            }

            setDateRangePreset(preset);
        },
        [],
    );

    const getDateRangeLabel = useCallback(() => {
        if (dateRangePreset === DateRangePreset.TODAY) return 'TODAY';
        if (dateRangePreset === DateRangePreset.YESTERDAY) return 'YESTERDAY';
        if (dateRangePreset === DateRangePreset.LAST_WEEK) return 'LAST WEEK';
        if (dateRangePreset === DateRangePreset.LAST_MONTH) return 'LAST MONTH';
        if (dateRangePreset === DateRangePreset.CUSTOM) {
            if (filters.startDate && filters.endDate) {
                return `${format(filters.startDate, 'MMM d')} - ${format(filters.endDate, 'MMM d')}`;
            }
            if (filters.startDate) {
                return `FROM ${format(filters.startDate, 'MMM d')}`;
            }
        }
        return 'DATE RANGE';
    }, [dateRangePreset, filters.startDate, filters.endDate]);

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
        <div className="flex flex-1 gap-2 justify-end items-center">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="search..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-input placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-thin placeholder:font-body"
                />
                {filters.search && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 w-8 h-8 transform -translate-y-1/2"
                        onClick={() => updateFilter('search', '')}
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
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                <CalendarIcon
                                    className="w-4 h-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin font-body">
                                    {getDateRangeLabel()}
                                </span>
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Select Date Range
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                        <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.TODAY)}
                            >
                                Today
                            {dateRangePreset === DateRangePreset.TODAY && (
                                    <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.YESTERDAY)}
                            >
                                Yesterday
                            {dateRangePreset === DateRangePreset.YESTERDAY && (
                                    <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.LAST_WEEK)}
                            >
                                Last Week
                            {dateRangePreset === DateRangePreset.LAST_WEEK && (
                                    <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.LAST_MONTH)}
                            >
                                Last Month
                                {dateRangePreset === DateRangePreset.LAST_MONTH && (
                                    <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setDateRangePreset(undefined);
                                    updateFilter('startDate', undefined);
                                    updateFilter('endDate', undefined);
                                }}
                                className="flex justify-center items-center w-full"
                            >
                                <span className="text-[10px] font-normal text-red-500 font-body">
                                    Clear Date Range
                                </span>
                        </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Task Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.status ? (
                                    <>
                                        {statusIcons[filters.status] &&
                                            React.createElement(
                                                statusIcons[filters.status],
                                                {
                                                    className: `w-4 h-4 ${statusColors[filters.status]}`,
                                                    strokeWidth: 1.5,
                                                },
                                            )}
                                        <span className={`text-[10px] font-thin font-body ${statusColors[filters.status]}`}>
                                            {statusLabels[filters.status]}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Clock
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            STATUS
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(TaskStatus).map((statusOption) => {
                                const StatusIcon = statusIcons[statusOption];

                                return (
                                    <DropdownMenuItem
                                        key={statusOption}
                                        className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                        onClick={() => toggleFilter('status', statusOption)}
                                    >
                                            {StatusIcon && (
                                                    <StatusIcon
                                                className={`mr-2 w-4 h-4 ${statusColors[statusOption]}`}
                                                strokeWidth={1.5}
                                                    />
                                            )}
                                            <span
                                            className={`text-[10px] font-normal font-body ${
                                                    filters.status === statusOption
                                                    ? statusColors[statusOption]
                                                        : ''
                                                }`}
                                            >
                                                {statusLabels[statusOption]}
                                            </span>
                                        {filters.status === statusOption && (
                                            <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => updateFilter('status', undefined)}
                                className="flex justify-center items-center w-full"
                            >
                                <span className="text-[10px] font-normal text-red-500 font-body">
                                    Clear Status Filter
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Priority Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.priority ? (
                                    <>
                                        <Award
                                            className={`w-4 h-4 ${priorityColors[filters.priority]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={`text-[10px] font-thin font-body ${priorityColors[filters.priority]}`}>
                                            {priorityLabels[filters.priority].toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Award
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            PRIORITY
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Priority
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(TaskPriority).map(
                                (priorityOption) => (
                                    <DropdownMenuItem
                                        key={priorityOption}
                                        className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                        onClick={() => toggleFilter('priority', priorityOption)}
                                    >
                                                <Award
                                            className={`mr-2 w-4 h-4 ${priorityColors[priorityOption]}`}
                                            strokeWidth={1.5}
                                                />
                                            <span
                                            className={`text-[10px] font-normal font-body ${
                                                    filters.priority === priorityOption
                                                    ? priorityColors[priorityOption]
                                                        : ''
                                                }`}
                                            >
                                            {priorityLabels[priorityOption].toUpperCase()}
                                            </span>
                                        {filters.priority === priorityOption && (
                                            <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                                        )}
                                    </DropdownMenuItem>
                                ),
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => updateFilter('priority', undefined)}
                                className="flex justify-center items-center w-full"
                            >
                                <span className="text-[10px] font-normal text-red-500 font-body">
                                    Clear Priority Filter
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Task Type Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.taskType ? (
                                    <>
                                        <Tag
                                            className={`w-4 h-4 ${taskTypeColors[filters.taskType]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={`text-[10px] font-thin font-body ${taskTypeColors[filters.taskType]}`}>
                                            {filters.taskType.replace(/_/g, ' ')}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Tag
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            TASK TYPE
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Task Type
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
                                        className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                        onClick={() => toggleFilter('taskType', typeOption)}
                                    >
                                            <TypeIcon
                                                className={`mr-2 w-4 h-4 ${taskTypeColors[typeOption]}`}
                                            strokeWidth={1.5}
                                            />
                                            <span
                                            className={`text-[10px] font-normal font-body ${
                                                    filters.taskType === typeOption
                                                    ? taskTypeColors[typeOption]
                                                        : ''
                                                }`}
                                            >
                                                {typeOption.replace(/_/g, ' ')}
                                            </span>
                                        {filters.taskType === typeOption && (
                                            <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => updateFilter('taskType', undefined)}
                                className="flex justify-center items-center w-full"
                            >
                                <span className="text-[10px] font-normal text-red-500 font-body">
                                    Clear Task Type Filter
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Assignee Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                <Users
                                    className="w-4 h-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin font-body">
                                    {filters.assigneeId ? 'ASSIGNED' : 'ASSIGNEE'}
                                </span>
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Assignee
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                            onClick={() => toggleFilter('assigneeId', -1)}
                        >
                            <Avatar className="mr-2 w-6 h-6">
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                            <span className="text-[10px] font-normal font-body">
                                    Assigned to Me
                                </span>
                            {filters.assigneeId === -1 && (
                                <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                            onClick={() => toggleFilter('assigneeId', 0)}
                        >
                            <div className="flex justify-center items-center mr-2 w-6 h-6 rounded-full bg-muted">
                                <X className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-normal font-body">
                                Unassigned
                            </span>
                            {filters.assigneeId === 0 && (
                                <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {assignees.map((assignee) => (
                            <DropdownMenuItem
                                key={assignee.id}
                                className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                onClick={() => toggleFilter('assigneeId', assignee.id)}
                            >
                                <Avatar className="mr-2 w-6 h-6">
                                        <AvatarImage
                                            src={assignee.avatar}
                                            alt={assignee.name}
                                        />
                                        <AvatarFallback>
                                            {assignee.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                <span className="text-[10px] font-normal font-body">
                                        {assignee.name}
                                    </span>
                                {filters.assigneeId === assignee.id && (
                                    <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => updateFilter('assigneeId', undefined)}
                            className="flex justify-center items-center w-full"
                        >
                            <span className="text-[10px] font-normal text-red-500 font-body">
                                Clear Assignee Filter
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear Filters Button - Only show when filters are active */}
            {activeFilterCount > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs font-normal font-body"
                    onClick={handleClearFilters}
                >
                    <X className="mr-2 w-4 h-4" strokeWidth={1.5} />
                    Clear All ({activeFilterCount})
                </Button>
            )}
        </div>
    );
}
