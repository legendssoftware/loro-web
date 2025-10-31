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
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
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
const filterButtonClass =
    'flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer transition-colors hover:bg-accent bg-card border-border';
const filterLabelClass = 'text-[10px] font-thin uppercase font-body';
const filterIconClass = 'w-4 h-4';
const filterItemClass =
    'flex items-center gap-2 px-2 py-1.5 text-xs font-normal font-body rounded hover:bg-accent cursor-pointer';
const activeItemClass = 'bg-accent/40';

// Define initial filter state as a constant
const INITIAL_FILTERS = {
    status: undefined as ClientStatus | undefined,
    category: undefined as string | undefined,
    industry: undefined as string | undefined,
    riskLevel: undefined as ClientRiskLevel | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
};

export function ClientsFilter({
    onApplyFilters,
    onClearFilters,
    clients = [],
}: ClientsFilterProps) {
    // Consolidated state for all filters
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    
    // Ref to track last applied filters
    const lastAppliedFiltersRef = useRef<ClientFilterParams>({});

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
        if (!clients || clients.length === 0)
            return Object.values(ClientRiskLevel);

        const availableRiskLevels = Array.from(
            new Set(
                clients
                    .filter((client) => client.riskLevel)
                    .map((client) => client.riskLevel as ClientRiskLevel),
            ),
        );

        return availableRiskLevels.length > 0
            ? availableRiskLevels
            : Object.values(ClientRiskLevel);
    }, [clients]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.status) count++;
        if (filters.category) count++;
        if (filters.industry) count++;
        if (filters.riskLevel) count++;
        if (filters.startDate) count++;
        return count;
    }, [filters]);

    // Build filter parameters from current state
    const buildFilterParams = useCallback((): ClientFilterParams => {
        const params: ClientFilterParams = {};

        if (filters.status) {
            params.status = filters.status;
        }

        if (filters.category) {
            params.category = filters.category;
        }

        if (filters.industry) {
            params.industry = filters.industry;
        }

        if (filters.riskLevel) {
            params.riskLevel = filters.riskLevel;
        }

        if (filters.startDate) {
            params.from = format(filters.startDate, 'yyyy-MM-dd');
        }

        if (filters.endDate) {
            params.to = format(filters.endDate, 'yyyy-MM-dd');
        }

        return params;
    }, [filters]);

    // Check if filters have actually changed
    const hasFiltersChanged = useCallback((newParams: ClientFilterParams): boolean => {
        const lastParams = lastAppliedFiltersRef.current;
        
        return JSON.stringify(lastParams) !== JSON.stringify(newParams);
    }, []);

    // Apply filters - only if they've changed
    const applyFilters = useCallback(() => {
        const params = buildFilterParams();
        
        if (hasFiltersChanged(params)) {
            lastAppliedFiltersRef.current = params;
            onApplyFilters(params);
        }
    }, [buildFilterParams, hasFiltersChanged, onApplyFilters]);

    // Auto-apply filters when they change (except for search which uses debouncing in other filters)
    useEffect(() => {
        applyFilters();
    }, [filters.status, filters.category, filters.industry, filters.riskLevel, filters.startDate, filters.endDate, applyFilters]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setDateRangePreset(undefined);
        lastAppliedFiltersRef.current = {};
        onClearFilters();
    }, [onClearFilters]);

    // Update individual filter
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

    return (
        <div
            className="flex items-center justify-end flex-1 gap-2 px-2"
            id="clients-filters"
        >
            {/* Status Filter */}
            <div className="w-[180px]" id="client-status-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={filterButtonClass} id="status-filter">
                            <div className="flex items-center gap-2">
                                {filters.status ? (
                                    <>
                                        {React.createElement(
                                            statusIcons[filters.status],
                                            {
                                                className: `${filterIconClass} ${statusColors[filters.status]}`,
                                                strokeWidth: 1.5,
                                            },
                                        )}
                                        <span
                                            className={`${filterLabelClass} ${statusColors[filters.status]}`}
                                        >
                                            {statusLabels[filters.status]}
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
                                    const selected = filters.status === key;

                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            className={cn(
                                                filterItemClass,
                                                selected && activeItemClass,
                                            )}
                                            onClick={() => toggleFilter('status', key as ClientStatus)}
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
                                                        ? statusColors[
                                                              key as ClientStatus
                                                          ]
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
            <div className="w-[180px]" id="client-category-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={filterButtonClass}>
                            <div className="flex items-center gap-2">
                                {filters.category ? (
                                    <>
                                        <Tag
                                            className={`${filterIconClass} text-blue-600`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`${filterLabelClass} text-blue-600`}
                                        >
                                            {filters.category.toUpperCase()}
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
                                    const selected = filters.category === cat;

                                    return (
                                        <DropdownMenuItem
                                            key={cat}
                                            className={cn(
                                                filterItemClass,
                                                selected && activeItemClass,
                                            )}
                                            onClick={() => toggleFilter('category', cat)}
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
            <div className="w-[180px]" id="client-industry-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={filterButtonClass}>
                            <div className="flex items-center gap-2">
                                {filters.industry ? (
                                    <>
                                        <Building
                                            className={`${filterIconClass} text-purple-600`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`${filterLabelClass} text-purple-600`}
                                        >
                                            {filters.industry.toUpperCase()}
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
                                    const selected = filters.industry === ind;

                                    return (
                                        <DropdownMenuItem
                                            key={ind}
                                            className={cn(
                                                filterItemClass,
                                                selected && activeItemClass,
                                            )}
                                            onClick={() => toggleFilter('industry', ind)}
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
            <div className="w-[180px]" id="client-risk-level-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className={filterButtonClass}>
                            <div className="flex items-center gap-2">
                                {filters.riskLevel ? (
                                    <>
                                        <AlertTriangle
                                            className={`${filterIconClass} ${riskLevelColors[filters.riskLevel]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`${filterLabelClass} ${riskLevelColors[filters.riskLevel]}`}
                                        >
                                            {filters.riskLevel.toUpperCase()}
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
                                    const selected = filters.riskLevel === value;

                                    return (
                                        <DropdownMenuItem
                                            key={value}
                                            className={cn(
                                                filterItemClass,
                                                selected && activeItemClass,
                                            )}
                                            onClick={() => toggleFilter('riskLevel', value as ClientRiskLevel)}
                                        >
                                            <AlertTriangle
                                                className={`${filterIconClass} mr-2 ${
                                                    riskLevelColors[
                                                        value as ClientRiskLevel
                                                    ] || 'text-gray-600'
                                                }`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    selected
                                                        ? riskLevelColors[
                                                              value as ClientRiskLevel
                                                          ] || 'text-gray-600'
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
            {activeFilterCount > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-3 text-xs font-medium text-red-500 uppercase transition-colors border border-red-500 rounded hover:bg-red-50 hover:text-red-600 font-body"
                    onClick={handleClearFilters}
                >
                    <X className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Clear All ({activeFilterCount})
                </Button>
            )}
        </div>
    );
}
