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
import { ClientRiskLevel } from '@/lib/types/client-enums';
import { Client } from '@/lib/types/client';
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
    Building,
    AlertTriangle,
} from 'lucide-react';
import { useCallback, useState, useMemo } from 'react';
import { format } from 'date-fns';
import React from 'react';
import { cn } from '@/lib/utils';

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
    clients?: Client[];
}

// Base styling for filter buttons
const filterButtonClass = "flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer transition-colors hover:bg-accent bg-card border-border";
const filterLabelClass = "text-[10px] font-medium uppercase font-body";
const filterIconClass = "w-4 h-4";
const filterItemClass = "flex items-center gap-2 px-2 py-1.5 text-xs font-normal font-body rounded hover:bg-accent cursor-pointer";
const activeItemClass = "bg-accent/40";

export function ClientsFilter({
    onApplyFilters,
    onClearFilters,
    clients = [],
}: ClientsFilterProps) {
    // State for filter values
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<ClientStatus | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [industry, setIndustry] = useState<string | undefined>(undefined);
    const [riskLevel, setRiskLevel] = useState<ClientRiskLevel | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset | undefined>(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Extract unique values from clients
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

    const industries = useMemo(() => {
        if (!clients || clients.length === 0) return [];
        return Array.from(
            new Set(
                clients
                    .filter((client) => client.industry)
                    .map((client) => client.industry),
            ),
        ).sort();
    }, [clients]);

    const riskLevels = useMemo(() => {
        if (!clients || clients.length === 0) return Object.values(ClientRiskLevel);

        const availableRiskLevels = Array.from(
            new Set(
                clients
                    .filter((client) => client.riskLevel)
                    .map((client) => client.riskLevel as ClientRiskLevel)
            )
        );

        return availableRiskLevels.length > 0
            ? availableRiskLevels
            : Object.values(ClientRiskLevel);
    }, [clients]);

    // Apply filters function
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

        if (industry) {
            filters.industry = industry;
            newActiveFilters.push('Industry');
        }

        if (riskLevel) {
            filters.riskLevel = riskLevel;
            newActiveFilters.push('Risk Level');
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
    }, [search, status, category, industry, riskLevel, startDate, endDate, onApplyFilters]);

    // Direct filter application helper - improved to ensure correct data passing
    const applyFilter = useCallback(
        (
            filterType: 'status' | 'category' | 'industry' | 'riskLevel' | 'dateRange' | 'search',
            value: any,
            filterStartDate?: Date,
            filterEndDate?: Date
        ) => {
            console.log(`Applying filter: ${filterType}`, { value, currentValue:
                filterType === 'status' ? status :
                filterType === 'category' ? category :
                filterType === 'industry' ? industry :
                filterType === 'riskLevel' ? riskLevel :
                filterType === 'search' ? search :
                filterType === 'dateRange' ? { startDate, endDate } : null
            });

            // Create a copy of the current filters state
            let newStatus = status;
            let newCategory = category;
            let newIndustry = industry;
            let newRiskLevel = riskLevel;
            let newSearch = search;
            let newStartDate = startDate;
            let newEndDate = endDate;

            // Update the specific filter value based on type
            if (filterType === 'status') {
                newStatus = value;
                setStatus(value);
            } else if (filterType === 'category') {
                newCategory = value;
                setCategory(value);
            } else if (filterType === 'industry') {
                newIndustry = value;
                setIndustry(value);
            } else if (filterType === 'riskLevel') {
                newRiskLevel = value;
                setRiskLevel(value);
            } else if (filterType === 'search') {
                newSearch = value;
                setSearch(value);
            } else if (filterType === 'dateRange') {
                if (filterStartDate) {
                    newStartDate = filterStartDate;
                    setStartDate(filterStartDate);
                }
                if (filterEndDate) {
                    newEndDate = filterEndDate;
                    setEndDate(filterEndDate);
                }
            }

            // Build filter object with the updated values
            const filters: ClientFilterParams = {};
            const newActiveFilters: string[] = [];

            // Add each active filter to the filters object
            if (newSearch) {
                filters.search = newSearch;
                newActiveFilters.push('Search');
            }

            if (newStatus) {
                filters.status = newStatus;
                newActiveFilters.push('Status');
            }

            if (newCategory) {
                filters.category = newCategory;
                newActiveFilters.push('Category');
            }

            if (newIndustry) {
                filters.industry = newIndustry;
                newActiveFilters.push('Industry');
            }

            if (newRiskLevel) {
                filters.riskLevel = newRiskLevel;
                newActiveFilters.push('Risk Level');
            }

            if (newStartDate) {
                filters.from = format(newStartDate, 'yyyy-MM-dd');
                newActiveFilters.push('Date Range');
            }

            if (newEndDate) {
                filters.to = format(newEndDate, 'yyyy-MM-dd');
            }

            // Log the final filter state
            console.log('Applying filters:', filters, 'Active filters:', newActiveFilters);

            // Update active filters and apply
            setActiveFilters(newActiveFilters);
            onApplyFilters(filters);
        },
        [search, status, category, industry, riskLevel, startDate, endDate, onApplyFilters]
    );

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setCategory(undefined);
        setIndustry(undefined);
        setRiskLevel(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        setDateRangePreset(undefined);
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

    // Status data
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

    // Risk level colors
    const riskLevelColors = {
        [ClientRiskLevel.LOW]: 'text-green-600',
        [ClientRiskLevel.MEDIUM]: 'text-yellow-600',
        [ClientRiskLevel.HIGH]: 'text-red-600',
        [ClientRiskLevel.CRITICAL]: 'text-purple-600',
    };

    // Item is selected helper
    const isSelected = (type: string, value: any) => {
        switch (type) {
            case 'status': return status === value;
            case 'category': return category === value;
            case 'industry': return industry === value;
            case 'riskLevel': return riskLevel === value;
            default: return false;
        }
    };

    return (
        <div className="flex items-center justify-end flex-1 gap-2 px-2">
            {/* Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={filterButtonClass}>
                            <div className="flex items-center gap-2">
                                {status ? (
                                    <>
                                        {React.createElement(
                                            statusIcons[status],
                                            {
                                                className: `${filterIconClass} ${statusColors[status]}`,
                                                strokeWidth: 1.5,
                                            },
                                        )}
                                        <span
                                            className={`${filterLabelClass} ${statusColors[status]}`}
                                        >
                                            {statusLabels[status]}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Users
                                            className={`${filterIconClass} text-muted-foreground`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={filterLabelClass}>
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
                        <DropdownMenuLabel className={filterLabelClass}>
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.entries(statusLabels).map(
                                ([key, label]) => {
                                    const Icon =
                                        statusIcons[key as ClientStatus];
                                    const selected = isSelected('status', key);

                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            className={cn(filterItemClass, selected && activeItemClass)}
                                            onClick={() => {
                                                const newStatus =
                                                    status === (key as ClientStatus)
                                                        ? undefined
                                                        : (key as ClientStatus);
                                                applyFilter('status', newStatus);
                                            }}
                                        >
                                            <Icon
                                                className={`${filterIconClass} mr-2 ${
                                                    statusColors[
                                                        key as ClientStatus
                                                    ]
                                                }`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    selected
                                                        ? statusColors[key as ClientStatus]
                                                        : ''
                                                }`}
                                            >
                                                {label}
                                            </span>
                                            {selected && (
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
                        <div className={filterButtonClass}>
                            <div className="flex items-center gap-2">
                                {category ? (
                                    <>
                                        <Tag
                                            className={`${filterIconClass} text-blue-600`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={`${filterLabelClass} text-blue-600`}>
                                            {category.toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Tag
                                            className={`${filterIconClass} text-muted-foreground`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={filterLabelClass}>
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
                        <DropdownMenuLabel className={filterLabelClass}>
                            Filter by Category
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {categories.length > 0 ? (
                                categories.map((cat) => {
                                    if (!cat) return null;
                                    const selected = isSelected('category', cat);

                                    return (
                                        <DropdownMenuItem
                                            key={cat}
                                            className={cn(filterItemClass, selected && activeItemClass)}
                                            onClick={() => {
                                                const newCategory =
                                                    category === cat
                                                        ? undefined
                                                        : cat;
                                                applyFilter('category', newCategory);
                                            }}
                                        >
                                            <Tag
                                                className={`${filterIconClass} mr-2 text-blue-600`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    selected
                                                        ? 'text-blue-600'
                                                        : ''
                                                }`}
                                            >
                                                {cat.toUpperCase()}
                                            </span>
                                            {selected && (
                                                <Check
                                                    className="w-4 h-4 ml-auto text-primary"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })
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

            {/* Industry Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={filterButtonClass}>
                            <div className="flex items-center gap-2">
                                {industry ? (
                                    <>
                                        <Building
                                            className={`${filterIconClass} text-purple-600`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={`${filterLabelClass} text-purple-600`}>
                                            {industry.toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Building
                                            className={`${filterIconClass} text-muted-foreground`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={filterLabelClass}>
                                            INDUSTRY
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
                        <DropdownMenuLabel className={filterLabelClass}>
                            Filter by Industry
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {industries.length > 0 ? (
                                industries.map((ind) => {
                                    if (!ind) return null;
                                    const selected = isSelected('industry', ind);

                                    return (
                                        <DropdownMenuItem
                                            key={ind}
                                            className={cn(filterItemClass, selected && activeItemClass)}
                                            onClick={() => {
                                                const newIndustry =
                                                    industry === ind
                                                        ? undefined
                                                        : ind;
                                                applyFilter('industry', newIndustry);
                                            }}
                                        >
                                            <Building
                                                className={`${filterIconClass} mr-2 text-purple-600`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    selected
                                                        ? 'text-purple-600'
                                                        : ''
                                                }`}
                                            >
                                                {ind.toUpperCase()}
                                            </span>
                                            {selected && (
                                                <Check
                                                    className="w-4 h-4 ml-auto text-primary"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })
                            ) : (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    <span className="text-[10px] font-normal font-body uppercase">
                                        No industries available
                                    </span>
                                </div>
                            )}
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Risk Level Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={filterButtonClass}>
                            <div className="flex items-center gap-2">
                                {riskLevel ? (
                                    <>
                                        <AlertTriangle
                                            className={`${filterIconClass} ${riskLevelColors[riskLevel]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`${filterLabelClass} ${riskLevelColors[riskLevel]}`}
                                        >
                                            {riskLevel.toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle
                                            className={`${filterIconClass} text-muted-foreground`}
                                            strokeWidth={1.5}
                                        />
                                        <span className={filterLabelClass}>
                                            RISK LEVEL
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
                        <DropdownMenuLabel className={filterLabelClass}>
                            Filter by Risk Level
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {riskLevels.length > 0 ? (
                                riskLevels.map((value) => {
                                    if (!value) return null;
                                    const selected = isSelected('riskLevel', value);

                                    return (
                                        <DropdownMenuItem
                                            key={value}
                                            className={cn(filterItemClass, selected && activeItemClass)}
                                            onClick={() => {
                                                const newRiskLevel = riskLevel === value
                                                    ? undefined
                                                    : value as ClientRiskLevel;
                                                applyFilter('riskLevel', newRiskLevel);
                                            }}
                                        >
                                            <AlertTriangle
                                                className={`${filterIconClass} mr-2 ${
                                                    riskLevelColors[value as ClientRiskLevel] || 'text-gray-600'
                                                }`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    selected
                                                        ? riskLevelColors[value as ClientRiskLevel] || 'text-gray-600'
                                                        : ''
                                                }`}
                                            >
                                                {value.toUpperCase()}
                                            </span>
                                            {selected && (
                                                <Check
                                                    className="w-4 h-4 ml-auto text-primary"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })
                            ) : (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    <span className="text-[10px] font-normal font-body uppercase">
                                        No risk levels available
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
                    className="h-10 px-3 text-xs font-medium uppercase transition-colors border rounded hover:bg-red-50 hover:text-red-600 border-red-500 font-body text-red-500"
                    onClick={handleClearFilters}
                >
                    <X className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Clear All
                </Button>
            )}
        </div>
    );
}
