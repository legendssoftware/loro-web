'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    Filter,
    X,
    CalendarIcon,
    ChevronDown,
    Check,
    Clock,
    RefreshCw,
    User,
    Upload,
} from 'lucide-react';
import { LeadFilterParams, LeadStatus } from '@/lib/types/lead';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
    format,
    subDays,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import React from 'react';

// Date range presets
enum DateRangePreset {
    TODAY = 'TODAY',
    YESTERDAY = 'YESTERDAY',
    LAST_WEEK = 'LAST_WEEK',
    LAST_MONTH = 'LAST_MONTH',
    CUSTOM = 'CUSTOM',
}

interface LeadsFilterProps {
    onApplyFilters: (filters: LeadFilterParams) => void;
    onClearFilters: () => void;
    onImportClick?: () => void;
}

// Define initial filter state as a constant
const INITIAL_FILTERS = {
    search: '',
    status: undefined as LeadStatus | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    ownerUid: undefined as number | undefined,
};

export function LeadsFilter({
    onApplyFilters,
    onClearFilters,
    onImportClick,
}: LeadsFilterProps) {
    // Single consolidated filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);

    // Ref to track the last applied filters to prevent unnecessary API calls
    const lastAppliedFiltersRef = useRef<LeadFilterParams>({});

    // Ref for debounce timer
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Derive active filter count from current filter state
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.startDate || filters.endDate) count++;
        if (filters.ownerUid) count++;
        return count;
    }, [filters]);

    // Helper function to build filter params from state
    const buildFilterParams = useCallback((): LeadFilterParams => {
        const params: LeadFilterParams = {};

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        if (filters.ownerUid !== undefined) params.ownerUid = filters.ownerUid;

        return params;
    }, [filters]);

    // Check if filters have actually changed
    const hasFiltersChanged = useCallback((newParams: LeadFilterParams): boolean => {
        const lastParams = lastAppliedFiltersRef.current;

        return (
            lastParams.search !== newParams.search ||
            lastParams.status !== newParams.status ||
            lastParams.startDate !== newParams.startDate ||
            lastParams.endDate !== newParams.endDate ||
            lastParams.ownerUid !== newParams.ownerUid
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
    }, [filters.status, filters.startDate, filters.endDate, filters.ownerUid, applyFilters]);

    // Handle search input changes
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFilters((prev) => ({
                ...prev,
                search: e.target.value,
            }));
        },
        [],
    );

    // Handle date range selection
    const handleDateRangeSelect = useCallback((preset: DateRangePreset) => {
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
    }, []);

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

    // Status Options with Icons and colors
    const statusLabels = {
        [LeadStatus.PENDING]: 'PENDING',
        [LeadStatus.APPROVED]: 'APPROVED',
        [LeadStatus.REVIEW]: 'REVIEW',
        [LeadStatus.DECLINED]: 'DECLINED',
        [LeadStatus.CONVERTED]: 'CONVERTED',
        [LeadStatus.CANCELLED]: 'CANCELLED',
    };

    const statusIcons = {
        [LeadStatus.PENDING]: Clock,
        [LeadStatus.APPROVED]: Check,
        [LeadStatus.REVIEW]: RefreshCw,
        [LeadStatus.DECLINED]: X,
        [LeadStatus.CONVERTED]: Check,
        [LeadStatus.CANCELLED]: X,
    };

    const statusColors = {
        [LeadStatus.PENDING]: 'text-yellow-600',
        [LeadStatus.APPROVED]: 'text-green-600',
        [LeadStatus.REVIEW]: 'text-blue-600',
        [LeadStatus.DECLINED]: 'text-red-600',
        [LeadStatus.CONVERTED]: 'text-purple-600',
        [LeadStatus.CANCELLED]: 'text-gray-600',
    };

    return (
        <div className="flex flex-1 gap-2 justify-end items-center" id="leads-filter-container">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="search..."
                    value={filters.search}
                    onChange={handleSearchChange}
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
                            <ChevronDown
                                className="ml-2 w-4 h-4 opacity-50"
                                strokeWidth={1.5}
                            />
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
                                onClick={() =>
                                    handleDateRangeSelect(DateRangePreset.TODAY)
                                }
                            >
                                Today
                                {dateRangePreset === DateRangePreset.TODAY && (
                                    <Check
                                        className="ml-auto w-4 h-4 text-primary"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.YESTERDAY,
                                    )
                                }
                            >
                                Yesterday
                                {dateRangePreset ===
                                    DateRangePreset.YESTERDAY && (
                                    <Check
                                        className="ml-auto w-4 h-4 text-primary"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_WEEK,
                                    )
                                }
                            >
                                Last Week
                                {dateRangePreset ===
                                    DateRangePreset.LAST_WEEK && (
                                    <Check
                                        className="ml-auto w-4 h-4 text-primary"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_MONTH,
                                    )
                                }
                            >
                                Last Month
                                {dateRangePreset ===
                                    DateRangePreset.LAST_MONTH && (
                                    <Check
                                        className="ml-auto w-4 h-4 text-primary"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.CUSTOM,
                                    )
                                }
                            >
                                Custom Range
                                {dateRangePreset === DateRangePreset.CUSTOM && (
                                    <Check
                                        className="ml-auto w-4 h-4 text-primary"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </DropdownMenuItem>

                            {dateRangePreset === DateRangePreset.CUSTOM && (
                                <>
                                    <DropdownMenuSeparator />
                                    <div className="p-2 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <p className="mb-1 text-[10px] font-normal">
                                                    Start
                                                </p>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full h-7 px-2 text-left font-normal text-xs justify-start',
                                                                !filters.startDate &&
                                                                    'text-muted-foreground',
                                                            )}
                                                        >
                                                            {filters.startDate
                                                                ? format(
                                                                      filters.startDate,
                                                                      'MMM d, yyyy',
                                                                  )
                                                                : 'Select'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="p-0 w-auto"
                                                        align="start"
                                                    >
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={filters.startDate}
                                                            onSelect={(date) =>
                                                                updateFilter('startDate', date)
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-[10px] font-normal">
                                                    End
                                                </p>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full h-7 px-2 text-left font-normal text-xs justify-start',
                                                                !filters.endDate &&
                                                                    'text-muted-foreground',
                                                            )}
                                                        >
                                                            {filters.endDate
                                                                ? format(
                                                                      filters.endDate,
                                                                      'MMM d, yyyy',
                                                                  )
                                                                : 'Select'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="p-0 w-auto"
                                                        align="start"
                                                    >
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={filters.endDate}
                                                            onSelect={(date) =>
                                                                updateFilter('endDate', date)
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="mt-2 w-full h-7"
                                            onClick={() => {}}
                                        >
                                            Apply Range
                                        </Button>
                                    </div>
                                </>
                            )}
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

            {/* Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.status ? (
                                    <>
                                        {React.createElement(
                                            statusIcons[filters.status],
                                            {
                                                className: `w-4 h-4 ${statusColors[filters.status]}`,
                                                strokeWidth: 1.5,
                                            },
                                        )}
                                        <span
                                            className={`text-[10px] font-thin font-body ${statusColors[filters.status]}`}
                                        >
                                            {statusLabels[filters.status]}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Filter
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            STATUS
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown
                                className="ml-2 w-4 h-4 opacity-50"
                                strokeWidth={1.5}
                            />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(LeadStatus).map((statusOption) => {
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
                                            <Check
                                                className="ml-auto w-4 h-4 text-primary"
                                                strokeWidth={1.5}
                                            />
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

            {/* Owner Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                <User
                                    className="w-4 h-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin font-body">
                                    {filters.ownerUid ? 'OWNER' : 'ASSIGNEE'}
                                </span>
                            </div>
                            <ChevronDown
                                className="ml-2 w-4 h-4 opacity-50"
                                strokeWidth={1.5}
                            />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Owner
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                            onClick={() => toggleFilter('ownerUid', -1)}
                        >
                            <Avatar className="mr-2 w-6 h-6">
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-normal font-body">
                                Assigned to Me
                            </span>
                            {filters.ownerUid === -1 && (
                                <Check
                                    className="ml-auto w-4 h-4 text-primary"
                                    strokeWidth={1.5}
                                />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                            onClick={() => toggleFilter('ownerUid', 0)}
                        >
                            <div className="flex justify-center items-center mr-2 w-6 h-6 rounded-full bg-muted">
                                <X className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-normal font-body">
                                Unassigned
                            </span>
                            {filters.ownerUid === 0 && (
                                <Check
                                    className="ml-auto w-4 h-4 text-primary"
                                    strokeWidth={1.5}
                                />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => updateFilter('ownerUid', undefined)}
                            className="flex justify-center items-center w-full"
                        >
                            <span className="text-[10px] font-normal text-red-500 font-body">
                                Clear Owner Filter
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Import Button - Always visible */}
            <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs font-normal text-white font-body bg-primary"
                onClick={() => onImportClick?.()}
            >
                <Upload className="mr-2 w-4 h-4" strokeWidth={1.5} />
                Import
            </Button>

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
