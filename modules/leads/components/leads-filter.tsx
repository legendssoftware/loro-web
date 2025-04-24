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
                                <CalendarIcon
                                    className="w-4 h-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin font-body">
                                    {getDateRangeLabel()}
                                </span>
                            </div>
                            <ChevronDown
                                className="w-4 h-4 ml-2 opacity-50"
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
                                        className="w-4 h-4 ml-auto text-primary"
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
                                        className="w-4 h-4 ml-auto text-primary"
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
                                        className="w-4 h-4 ml-auto text-primary"
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
                                        className="w-4 h-4 ml-auto text-primary"
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
                                        className="w-4 h-4 ml-auto text-primary"
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
                                                            onSelect={
                                                                setStartDate
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
                                                            onSelect={
                                                                setEndDate
                                                            }
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setDateRangePreset(undefined);
                                    setStartDate(undefined);
                                    setEndDate(undefined);
                                    if (activeFilters.includes('Date Range')) {
                                        handleApplyFilters();
                                    }
                                }}
                                className="flex items-center justify-center w-full"
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
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {status ? (
                                    <>
                                        {React.createElement(
                                            statusIcons[status],
                                            {
                                                className: `w-4 h-4 ${statusColors[status]}`,
                                                strokeWidth: 1.5,
                                            },
                                        )}
                                        <span
                                            className={`text-[10px] font-thin font-body ${statusColors[status]}`}
                                        >
                                            {statusLabels[status]}
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
                                className="w-4 h-4 ml-2 opacity-50"
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
                                        className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                        onClick={() => {
                                            setStatus(
                                                status === statusOption
                                                    ? undefined
                                                    : statusOption,
                                            );
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        {StatusIcon && (
                                            <StatusIcon
                                                className={`w-4 h-4 mr-2 ${statusColors[statusOption]}`}
                                                strokeWidth={1.5}
                                            />
                                        )}
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                status === statusOption
                                                    ? statusColors[statusOption]
                                                    : ''
                                            }`}
                                        >
                                            {statusLabels[statusOption]}
                                        </span>
                                        {status === statusOption && (
                                            <Check
                                                className="w-4 h-4 ml-auto text-primary"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setStatus(undefined);
                                    if (activeFilters.includes('Status')) {
                                        handleApplyFilters();
                                    }
                                }}
                                className="flex items-center justify-center w-full"
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
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <User
                                    className="w-4 h-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin font-body">
                                    {ownerUid ? 'OWNER' : 'ASSIGNEE'}
                                </span>
                            </div>
                            <ChevronDown
                                className="w-4 h-4 ml-2 opacity-50"
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
                            className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                            onClick={() => {
                                setOwnerUid(ownerUid === -1 ? undefined : -1);
                                setTimeout(handleApplyFilters, 0);
                            }}
                        >
                            <Avatar className="w-6 h-6 mr-2">
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-normal font-body">
                                Assigned to Me
                            </span>
                            {ownerUid === -1 && (
                                <Check
                                    className="w-4 h-4 ml-auto text-primary"
                                    strokeWidth={1.5}
                                />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                            onClick={() => {
                                setOwnerUid(ownerUid === 0 ? undefined : 0);
                                setTimeout(handleApplyFilters, 0);
                            }}
                        >
                            <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-muted">
                                <X className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-normal font-body">
                                Unassigned
                            </span>
                            {ownerUid === 0 && (
                                <Check
                                    className="w-4 h-4 ml-auto text-primary"
                                    strokeWidth={1.5}
                                />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                setOwnerUid(undefined);
                                if (activeFilters.includes('Owner')) {
                                    handleApplyFilters();
                                }
                            }}
                            className="flex items-center justify-center w-full"
                        >
                            <span className="text-[10px] font-normal text-red-500 font-body">
                                Clear Owner Filter
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear Filters Button - Only show when filters are active */}
            {activeFilters.length > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-xs font-normal font-body"
                    onClick={handleClearFilters}
                >
                    <X className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Clear All ({activeFilters.length})
                </Button>
            )}
        </div>
    );
}
