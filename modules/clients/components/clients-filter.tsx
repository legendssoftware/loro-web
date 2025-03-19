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
import { ClientStatus, ClientFilterParams } from '@/hooks/use-clients-query';
import {
    X,
    ChevronDown,
    Users,
    Check,
    UserCheck,
    UserX,
    AlertCircle,
    Tag,
    Trash,
} from 'lucide-react';
import { useCallback, useState, useMemo } from 'react';
import { format } from 'date-fns';
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
    const categories = useMemo(() => {
        if (!clients || clients.length === 0) return [];
        return Array.from(
            new Set(
                clients
                    .filter((client) => client.category)
                    .map((client) => client.category),
            ),
        ).sort();
    }, [clients]);

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

    // Adding direct filter application helper to avoid setTimeout issues
    const applyFilter = useCallback(
        (
            filterType: 'status' | 'category' | 'dateRange' | 'search',
            value: any,
            startValue?: Date,
            endValue?: Date
        ) => {
            const filters: ClientFilterParams = {};
            const newActiveFilters: string[] = [];

            // Preserve existing filters
            if (search && filterType !== 'search') {
                filters.search = search;
                newActiveFilters.push('Search');
            }

            if (status && filterType !== 'status') {
                filters.status = status;
                newActiveFilters.push('Status');
            }

            if (category && filterType !== 'category') {
                filters.category = category;
                newActiveFilters.push('Category');
            }

            if (startDate && filterType !== 'dateRange') {
                filters.from = format(startDate, 'yyyy-MM-dd');
                newActiveFilters.push('Date Range');
            }

            if (endDate && filterType !== 'dateRange') {
                filters.to = format(endDate, 'yyyy-MM-dd');
            }

            // Add the new filter value
            if (filterType === 'search' && value) {
                filters.search = value;
                newActiveFilters.push('Search');
            } else if (filterType === 'status' && value) {
                filters.status = value;
                newActiveFilters.push('Status');
            } else if (filterType === 'category' && value) {
                filters.category = value;
                newActiveFilters.push('Category');
            } else if (filterType === 'dateRange') {
                if (startValue) {
                    filters.from = format(startValue, 'yyyy-MM-dd');
                    newActiveFilters.push('Date Range');
                }
                if (endValue) {
                    filters.to = format(endValue, 'yyyy-MM-dd');
                }
            }

            setActiveFilters(newActiveFilters);
            onApplyFilters(filters);
        },
        [search, status, category, startDate, endDate, onApplyFilters]
    );

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
        <div className="flex items-center justify-end flex-1 gap-2 px-2">
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
                                        <Users
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
                            {Object.entries(statusLabels).map(
                                ([key, label]) => {
                                    const Icon =
                                        statusIcons[key as ClientStatus];
                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                            onClick={() => {
                                                const newStatus =
                                                    status === (key as ClientStatus)
                                                        ? undefined
                                                        : (key as ClientStatus);
                                                setStatus(newStatus);
                                                applyFilter('status', newStatus);
                                            }}
                                        >
                                            <Icon
                                                className={`w-4 h-4 mr-2 ${
                                                    statusColors[
                                                        key as ClientStatus
                                                    ]
                                                }`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    status === key
                                                        ? statusColors[key as ClientStatus]
                                                        : ''
                                                }`}
                                            >
                                                {label}
                                            </span>
                                            {status === key && (
                                                <Check
                                                    className="w-4 h-4 ml-auto text-primary"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                },
                            )}
                            <DropdownMenuSeparator />
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
                                        <Tag
                                            className="w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
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
                            <ChevronDown
                                className="w-4 h-4 ml-2 opacity-50"
                                strokeWidth={1.5}
                            />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Category
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <DropdownMenuItem
                                        key={cat}
                                        className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                        onClick={() => {
                                            const newCategory =
                                                category === cat
                                                    ? undefined
                                                    : cat;
                                            setCategory(newCategory);
                                            applyFilter('category', newCategory);
                                        }}
                                    >
                                        <Tag
                                            className="w-4 h-4 mr-2 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                category === cat
                                                    ? 'text-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            {cat.toUpperCase()}
                                        </span>
                                        {category === cat && (
                                            <Check
                                                className="w-4 h-4 ml-auto text-primary"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    <span className="text-[10px] font-normal font-body uppercase">
                                        No categories available
                                    </span>
                                </div>
                            )}
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear Filters Button - Only show when filters are active */}
            {activeFilters.length > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] hover:text-red-500 font-normal uppercase border border-red-500 rounded h-9 font-body text-red-400"
                    onClick={handleClearFilters}
                >
                    <X className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Clear All
                </Button>
            )}
        </div>
    );
}
