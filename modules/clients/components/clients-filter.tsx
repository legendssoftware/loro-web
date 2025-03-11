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
import { ClientStatus, ClientFilterParams } from '@/hooks/use-clients-query';
import {
    Search,
    X,
    ChevronDown,
    Calendar,
    Building,
    Check,
    CalendarIcon,
    UserCheck,
    UserX,
    AlertCircle,
    Tag,
    Trash,
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
import React from 'react';

// Date range presets
enum DateRangePreset {
    TODAY = 'TODAY',
    YESTERDAY = 'YESTERDAY',
    LAST_WEEK = 'LAST_WEEK',
    LAST_MONTH = 'LAST_MONTH',
    CUSTOM = 'CUSTOM',
}

interface ClientsFilterProps {
    onApplyFilters: (filters: ClientFilterParams) => void;
    onClearFilters: () => void;
    clients?: any[];
}

export function ClientsFilter({
    onApplyFilters,
    onClearFilters,
    clients = [],
}: ClientsFilterProps) {
    // State for filter values
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<ClientStatus | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Get unique categories from clients
    const categories = clients
        ? Array.from(
              new Set(
                  clients
                      .filter((client) => client.category)
                      .map((client) => client.category),
              ),
          )
        : [];

    // Apply filters
    const handleApplyFilters = useCallback(() => {
        const filters: ClientFilterParams = {};
        const newActiveFilters: string[] = [];

        if (search) {
            filters.search = search;
            newActiveFilters.push('Search');
        }

        if (status) {
            filters.status = status;
            newActiveFilters.push('Status');
        }

        if (category) {
            filters.category = category;
            newActiveFilters.push('Category');
        }

        if (startDate) {
            filters.from = format(startDate, 'yyyy-MM-dd');
            newActiveFilters.push('Date Range');
        }

        if (endDate) {
            filters.to = format(endDate, 'yyyy-MM-dd');
        }

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [search, status, category, startDate, endDate, onApplyFilters]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setCategory(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        setDateRangePreset(undefined);
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

    // Handle date range selection
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

    // Get date range label
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

    // Status labels and icons
    const statusLabels = {
        [ClientStatus.ACTIVE]: 'ACTIVE',
        [ClientStatus.INACTIVE]: 'INACTIVE',
        [ClientStatus.PENDING]: 'PENDING',
        [ClientStatus.DELETED]: 'DELETED',
    };

    const statusIcons = {
        [ClientStatus.ACTIVE]: UserCheck,
        [ClientStatus.INACTIVE]: UserX,
        [ClientStatus.PENDING]: AlertCircle,
        [ClientStatus.DELETED]: Trash,
    };

    const statusColors = {
        [ClientStatus.ACTIVE]: 'text-green-600',
        [ClientStatus.INACTIVE]: 'text-gray-600',
        [ClientStatus.PENDING]: 'text-yellow-600',
        [ClientStatus.DELETED]: 'text-red-600',
    };

    return (
        <div className="flex items-center justify-end flex-1 gap-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" strokeWidth={1.5} />
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
                        <X className="w-4 h-4" strokeWidth={1.5} />
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
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Select Date Range
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleDateRangeSelect(DateRangePreset.TODAY)
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Today
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.YESTERDAY,
                                    )
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Yesterday
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_WEEK,
                                    )
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Last Week
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_MONTH,
                                    )
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Last Month
                            </DropdownMenuItem>
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
                                            className={`text-xs font-thin font-body ${statusColors[status]}`}
                                        >
                                            {statusLabels[status]}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Building
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            STATUS
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.entries(statusLabels).map(
                                ([key, label]) => {
                                    const Icon =
                                        statusIcons[key as ClientStatus];
                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            onClick={() => {
                                                setStatus(key as ClientStatus);
                                                setTimeout(
                                                    handleApplyFilters,
                                                    0,
                                                );
                                            }}
                                            className="text-xs font-normal font-body"
                                        >
                                            <Icon
                                                className={`w-4 h-4 mr-2 ${
                                                    statusColors[
                                                        key as ClientStatus
                                                    ]
                                                }`}
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-normal font-body">
                                                {label}
                                            </span>
                                            {status === key && (
                                                <Check
                                                    className="w-4 h-4 ml-auto"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                },
                            )}
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

            {/* Category Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {category ? (
                                    <>
                                        <Tag className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                                        <span className="text-[10px] font-thin text-blue-600 font-body">
                                            {category.toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Tag
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            CATEGORY
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Category
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <DropdownMenuItem
                                        key={cat}
                                        onClick={() => {
                                            setCategory(cat);
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                        className="text-xs font-normal font-body"
                                    >
                                        <Tag
                                            className="w-4 h-4 mr-2 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-normal font-body">
                                            {cat.toUpperCase()}
                                        </span>
                                        {category === cat && (
                                            <Check
                                                className="w-4 h-4 ml-auto"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="px-2 py-1 text-xs text-muted-foreground">
                                    <span className="text-[10px] font-normal text-red-500 font-body uppercase">
                                        No categories available
                                    </span>
                                </div>
                            )}
                            {category && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setCategory(undefined);
                                            if (
                                                activeFilters.includes(
                                                    'Category',
                                                )
                                            ) {
                                                handleApplyFilters();
                                            }
                                        }}
                                        className="text-xs font-normal font-body"
                                    >
                                        Clear Category Filter
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
                {activeFilters.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-10 text-xs font-normal font-body"
                    >
                        <X className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Clear All ({activeFilters.length})
                    </Button>
                )}
            </div>
        </div>
    );
}
