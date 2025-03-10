'use client';

import { useState, useCallback } from 'react';
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
    Calendar,
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
}

export function LeadsFilter({
    onApplyFilters,
    onClearFilters,
}: LeadsFilterProps) {
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<LeadStatus | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [ownerUid, setOwnerUid] = useState<number | undefined>(undefined);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            if (e.target.value) {
                setTimeout(handleApplyFilters, 0);
            } else if (activeFilters.includes('Search')) {
                setTimeout(handleApplyFilters, 0);
            }
        },
        [activeFilters],
    );

    const handleStatusChange = useCallback(
        (value: LeadStatus) => {
            setStatus(value === status ? undefined : value);
        },
        [status],
    );

    const handleDateRangeSelect = useCallback((preset: DateRangePreset) => {
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
    }, []);

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

    const handleApplyFilters = useCallback(() => {
        const filters: LeadFilterParams = {};
        const newActiveFilters: string[] = [];

        if (search) {
            filters.search = search;
            newActiveFilters.push('Search');
        }

        if (status) {
            filters.status = status;
            newActiveFilters.push('Status');
        }

        if (startDate || endDate) {
            if (startDate) {
                filters.startDate = startDate;
            }
            if (endDate) {
                filters.endDate = endDate;
            }
            newActiveFilters.push('Date Range');
        }

        if (ownerUid !== undefined) {
            filters.ownerUid = ownerUid;
            newActiveFilters.push('Owner');
        }

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [search, status, startDate, endDate, ownerUid, onApplyFilters]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        setDateRangePreset(undefined);
        setOwnerUid(undefined);
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

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
        <div className="flex items-center justify-end flex-1 gap-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                    placeholder="search..."
                    value={search}
                    onChange={handleSearchChange}
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
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(DateRangePreset.CUSTOM)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    CUSTOM RANGE
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.CUSTOM && (
                                <Check className="w-4 h-4 text-primary" />
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
                                                            !startDate &&
                                                                'text-muted-foreground',
                                                        )}
                                                    >
                                                        {startDate
                                                            ? format(
                                                                  startDate,
                                                                  'MMM d, yyyy',
                                                              )
                                                            : 'Select'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={startDate}
                                                        onSelect={setStartDate}
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
                                                            !endDate &&
                                                                'text-muted-foreground',
                                                        )}
                                                    >
                                                        {endDate
                                                            ? format(
                                                                  endDate,
                                                                  'MMM d, yyyy',
                                                              )
                                                            : 'Select'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-auto p-0"
                                                    align="start"
                                                >
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={endDate}
                                                        onSelect={setEndDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full mt-2 h-7"
                                        onClick={handleApplyFilters}
                                    >
                                        Apply Range
                                    </Button>
                                </div>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {status ? (
                                    <>
                                        {React.createElement(
                                            statusIcons[status],
                                            {
                                                className: `w-4 h-4 ${statusColors[status]}`,
                                            },
                                        )}
                                    </>
                                ) : (
                                    <Filter className="w-4 h-4 text-muted-foreground" />
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
                            LEAD STATUS
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(LeadStatus).map((statusOption) => {
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

            {/* Owner Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {ownerUid ? 'ASSIGNED' : 'OWNER'}
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
                            OWNER
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() => {
                                setOwnerUid(ownerUid === -1 ? undefined : -1);
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
                            {ownerUid === -1 && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() => {
                                setOwnerUid(ownerUid === 0 ? undefined : 0);
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
                            {ownerUid === 0 && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
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
