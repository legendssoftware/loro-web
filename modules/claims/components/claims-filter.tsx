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
    ClaimFilterParams,
    ClaimStatus,
    ClaimCategory,
    Claim,
    StatusColors,
} from '@/lib/types/claim';
import {
    CalendarIcon,
    Check,
    ChevronDown,
    Search,
    X,
    AlertCircle,
    CheckCircle,
    XCircle,
    CreditCard,
    Calendar,
    Users,
    Tag,
    User,
    DollarSign,
    Receipt,
    Plane,
    Bus,
    Utensils,
    Coffee,
    Hotel,
    Building,
    MapPin,
    Clock,
    CalendarX2,
} from 'lucide-react';
import { useCallback, useState, memo, useMemo, useEffect, useRef } from 'react';
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

// Extend ClaimFilterParams to include ownerId
interface ExtendedClaimFilterParams extends ClaimFilterParams {
    ownerId?: number;
}

interface ClaimsFilterProps {
    onApplyFilters: (filters: ExtendedClaimFilterParams) => void;
    onClearFilters: () => void;
    claims?: Claim[];
}

// Define initial filter state as a constant
const INITIAL_FILTERS = {
    search: '',
    status: undefined as ClaimStatus | undefined,
    category: undefined as ClaimCategory | undefined,
    ownerId: undefined as number | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
};

function ClaimsFilterComponent({
    onApplyFilters,
    onClearFilters,
    claims = [],
}: ClaimsFilterProps) {
    // Single consolidated filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);

    // Ref to track the last applied filters to prevent unnecessary API calls
    const lastAppliedFiltersRef = useRef<ExtendedClaimFilterParams>({});

    // Ref for debounce timer
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Derive active filter count from current filter state
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.category) count++;
        if (filters.ownerId) count++;
        if (filters.startDate || filters.endDate) count++;
        return count;
    }, [filters]);

    // Helper function to build filter params from state
    const buildFilterParams = useCallback((): ExtendedClaimFilterParams => {
        const params: ExtendedClaimFilterParams = {};

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.category) params.category = filters.category;
        if (filters.ownerId) params.ownerId = filters.ownerId;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        return params;
    }, [filters]);

    // Check if filters have actually changed
    const hasFiltersChanged = useCallback((newParams: ExtendedClaimFilterParams): boolean => {
        const lastParams = lastAppliedFiltersRef.current;

        return (
            lastParams.search !== newParams.search ||
            lastParams.status !== newParams.status ||
            lastParams.category !== newParams.category ||
            lastParams.ownerId !== newParams.ownerId ||
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
    }, [filters.status, filters.category, filters.ownerId, filters.startDate, filters.endDate, applyFilters]);

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

    const categoryLabels = {
        [ClaimCategory.GENERAL]: 'General',
        [ClaimCategory.TRAVEL]: 'Travel',
        [ClaimCategory.TRANSPORT]: 'Transport',
        [ClaimCategory.ACCOMMODATION]: 'Accommodation',
        [ClaimCategory.MEALS]: 'Meals',
        [ClaimCategory.ENTERTAINMENT]: 'Entertainment',
        [ClaimCategory.HOTEL]: 'Hotel',
        [ClaimCategory.OTHER]: 'Other',
        [ClaimCategory.PROMOTION]: 'Promotion',
        [ClaimCategory.EVENT]: 'Event',
        [ClaimCategory.ANNOUNCEMENT]: 'Announcement',
        [ClaimCategory.TRANSPORTATION]: 'Transportation',
        [ClaimCategory.OTHER_EXPENSES]: 'Other Expenses',
    };

    const statusLabels = {
        [ClaimStatus.PENDING]: 'PENDING',
        [ClaimStatus.APPROVED]: 'APPROVED',
        [ClaimStatus.REJECTED]: 'REJECTED',
        [ClaimStatus.PAID]: 'PAID',
        [ClaimStatus.CANCELLED]: 'CANCELLED',
        [ClaimStatus.DECLINED]: 'DECLINED',
        [ClaimStatus.DELETED]: 'DELETED',
    };

    const statusIcons = {
        [ClaimStatus.PENDING]: AlertCircle,
        [ClaimStatus.APPROVED]: CheckCircle,
        [ClaimStatus.REJECTED]: XCircle,
        [ClaimStatus.PAID]: CreditCard,
        [ClaimStatus.CANCELLED]: CalendarX2,
        [ClaimStatus.DECLINED]: XCircle,
        [ClaimStatus.DELETED]: XCircle,
    };

    const statusColors = {
        [ClaimStatus.PENDING]: 'text-yellow-600',
        [ClaimStatus.APPROVED]: 'text-green-600',
        [ClaimStatus.REJECTED]: 'text-red-600',
        [ClaimStatus.PAID]: 'text-blue-600',
        [ClaimStatus.CANCELLED]: 'text-gray-600',
        [ClaimStatus.DECLINED]: 'text-purple-600',
        [ClaimStatus.DELETED]: 'text-orange-600',
    };

    const categoryColors = {
        [ClaimCategory.GENERAL]: 'text-gray-600',
        [ClaimCategory.TRAVEL]: 'text-blue-600',
        [ClaimCategory.TRANSPORT]: 'text-indigo-600',
        [ClaimCategory.ACCOMMODATION]: 'text-purple-600',
        [ClaimCategory.MEALS]: 'text-green-600',
        [ClaimCategory.ENTERTAINMENT]: 'text-pink-600',
        [ClaimCategory.HOTEL]: 'text-violet-600',
        [ClaimCategory.OTHER]: 'text-slate-600',
        [ClaimCategory.PROMOTION]: 'text-yellow-600',
        [ClaimCategory.EVENT]: 'text-orange-600',
        [ClaimCategory.ANNOUNCEMENT]: 'text-red-600',
        [ClaimCategory.TRANSPORTATION]: 'text-cyan-600',
        [ClaimCategory.OTHER_EXPENSES]: 'text-gray-500',
    };

    const categoryIcons = {
        [ClaimCategory.GENERAL]: Receipt,
        [ClaimCategory.TRAVEL]: Plane,
        [ClaimCategory.TRANSPORT]: Bus,
        [ClaimCategory.ACCOMMODATION]: Building,
        [ClaimCategory.MEALS]: Utensils,
        [ClaimCategory.ENTERTAINMENT]: Coffee,
        [ClaimCategory.HOTEL]: Hotel,
        [ClaimCategory.OTHER]: Tag,
        [ClaimCategory.PROMOTION]: DollarSign,
        [ClaimCategory.EVENT]: Calendar,
        [ClaimCategory.ANNOUNCEMENT]: AlertCircle,
        [ClaimCategory.TRANSPORTATION]: Bus,
        [ClaimCategory.OTHER_EXPENSES]: Receipt,
    };

    // Extract unique owners from claims
    const uniqueOwners = React.useMemo(() => {
        const ownersMap = new Map();

        claims.forEach((claim) => {
            if (
                claim.owner &&
                claim.owner.uid &&
                !ownersMap.has(claim.owner.uid)
            ) {
                ownersMap.set(claim.owner.uid, {
                    id: claim.owner.uid,
                    name: claim.owner.name || 'Unknown',
                    surname: claim.owner.surname || '',
                    email: claim.owner.email || '',
                    avatar: claim.owner.photoURL || claim.owner.avatarUrl || '',
                });
            }
        });

        return Array.from(ownersMap.values());
    }, [claims]);

    // Use unique owners or fallback to sample data if empty
    const owners =
        uniqueOwners.length > 0
            ? uniqueOwners
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
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-input placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-normal placeholder:font-body"
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
                                <Calendar
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

            {/* Claim Status Filter */}
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
                                        <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-[10px] font-thin font-body">
                                            STATUS
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-56"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-thin uppercase font-body">
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(ClaimStatus).map((statusOption) => {
                                const StatusIcon = statusIcons[statusOption];

                                return (
                                    <DropdownMenuItem
                                        key={statusOption}
                                        className="flex gap-2 items-center px-2 text-xs font-normal rounded cursor-pointer font-body"
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

            {/* Category Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.category ? (
                                    <>
                                        {categoryIcons[filters.category] &&
                                            React.createElement(
                                                categoryIcons[filters.category],
                                                {
                                                    className: `w-4 h-4 ${categoryColors[filters.category]}`,
                                                    strokeWidth: 1.5,
                                                },
                                            )}
                                        <span className={`text-[10px] font-thin font-body ${categoryColors[filters.category]}`}>
                                            {categoryLabels[filters.category].toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Tag className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-[10px] font-thin font-body">
                                            CATEGORY
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-56"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-thin uppercase font-body">
                            Filter by Category
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {Object.values(ClaimCategory).map(
                                (categoryOption) => {
                                    const CategoryIcon =
                                        categoryIcons[categoryOption];

                                    return (
                                        <DropdownMenuItem
                                            key={categoryOption}
                                            className="flex gap-2 items-center px-2 text-xs font-normal rounded cursor-pointer font-body"
                                            onClick={() => toggleFilter('category', categoryOption)}
                                        >
                                            <CategoryIcon
                                                className={`mr-2 w-4 h-4 ${categoryColors[categoryOption]}`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    filters.category === categoryOption
                                                        ? categoryColors[categoryOption]
                                                        : ''
                                                }`}
                                            >
                                                {categoryLabels[categoryOption].toUpperCase()}
                                            </span>
                                            {filters.category === categoryOption && (
                                                <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                },
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => updateFilter('category', undefined)}
                                className="flex justify-center items-center w-full"
                            >
                                <span className="text-[10px] font-normal text-red-500 font-body">
                                    Clear Category Filter
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
                                <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                <span className="text-[10px] font-thin font-body">
                                    {filters.ownerId ? 'OWNER' : 'ASSIGNEE'}
                                </span>
                            </div>
                            <ChevronDown className="ml-2 w-4 h-4 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-56"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-thin uppercase font-body">
                            Filter by Owner
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex gap-2 items-center px-2 text-xs font-normal rounded cursor-pointer font-body"
                            onClick={() => toggleFilter('ownerId', -1)}
                        >
                            <Avatar className="mr-2 w-6 h-6">
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-normal font-body">
                                My Claims
                            </span>
                            {filters.ownerId === -1 && (
                                <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex gap-2 items-center px-2 text-xs font-normal rounded cursor-pointer font-body"
                            onClick={() => toggleFilter('ownerId', 0)}
                        >
                            <div className="flex justify-center items-center mr-2 w-6 h-6 rounded-full bg-muted">
                                <X className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-normal font-body">
                                No Owner
                            </span>
                            {filters.ownerId === 0 && (
                                <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {owners.map((owner) => (
                            <DropdownMenuItem
                                key={owner.id}
                                className="flex gap-2 items-center px-2 text-xs font-normal rounded cursor-pointer font-body"
                                onClick={() => toggleFilter('ownerId', owner.id)}
                            >
                                <Avatar className="mr-2 w-6 h-6">
                                    <AvatarImage
                                        src={owner.avatar}
                                        alt={owner.name}
                                    />
                                    <AvatarFallback>
                                        {owner.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-normal font-body">
                                    {owner.name}
                                </span>
                                {filters.ownerId === owner.id && (
                                    <Check className="ml-auto w-4 h-4 text-primary" strokeWidth={1.5} />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => updateFilter('ownerId', undefined)}
                            className="flex justify-center items-center w-full"
                        >
                            <span className="text-[10px] font-normal text-red-500 font-body">
                                Clear Owner Filter
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
                    onClick={handleClearFilters}
                    className="h-10 text-xs font-normal font-body"
                >
                    <X className="mr-2 w-4 h-4" strokeWidth={1.5} />
                    Clear All ({activeFilterCount})
                </Button>
            )}
        </div>
    );
}

export const ClaimsFilter = memo(ClaimsFilterComponent);
