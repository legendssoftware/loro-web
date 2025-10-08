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
    User,
    UserStatus,
    AccessLevel,
    UserFilterParams,
} from '@/lib/types/user';
import {
    X,
    ChevronDown,
    Users,
    Shield,
    Building,
    Check,
    UserCheck,
    UserX,
    AlertCircle,
    UserMinus,
    UserCog,
    Mail,
    Search,
} from 'lucide-react';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import React from 'react';
import { useBranchQuery } from '@/hooks/use-branch-query';
import { axiosInstance } from '@/lib/services/api-client';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

interface UsersFilterProps {
    onApplyFilters: (filters: UserFilterParams) => void;
    onClearFilters: () => void;
    users?: User[];
}

// Define initial filter state as a constant
const INITIAL_FILTERS = {
    search: '',
    status: undefined as UserStatus | undefined,
    accessLevel: undefined as AccessLevel | undefined,
    branchId: undefined as number | undefined,
};

export function UsersFilter({
    onApplyFilters,
    onClearFilters,
    users = [],
}: UsersFilterProps) {
    // Single consolidated filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [isReInviting, setIsReInviting] = useState(false);

    // Ref to track the last applied filters to prevent unnecessary API calls
    const lastAppliedFiltersRef = useRef<UserFilterParams>({});

    // Ref for debounce timer
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Use the global branch query hook
    const { branches, isLoading: isLoadingBranches } = useBranchQuery();

    // Derive active filter count from current filter state
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.accessLevel) count++;
        if (filters.branchId) count++;
        return count;
    }, [filters]);

    // Helper function to build filter params from state
    const buildFilterParams = useCallback((): UserFilterParams => {
        const params: UserFilterParams = {};

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.accessLevel) params.accessLevel = filters.accessLevel;
        if (filters.branchId) params.branchId = filters.branchId;

        return params;
    }, [filters]);

    // Check if filters have actually changed
    const hasFiltersChanged = useCallback((newParams: UserFilterParams): boolean => {
        const lastParams = lastAppliedFiltersRef.current;

        return (
            lastParams.search !== newParams.search ||
            lastParams.status !== newParams.status ||
            lastParams.accessLevel !== newParams.accessLevel ||
            lastParams.branchId !== newParams.branchId
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
    }, [filters.status, filters.accessLevel, filters.branchId, applyFilters]);

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

    // Handle clearing filters
    const handleClearFilters = useCallback(() => {
        setFilters(INITIAL_FILTERS);
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

    // Handle re-invite all users
    const handleReInviteAllUsers = useCallback(async () => {
        try {
            setIsReInviting(true);

            const response = await axiosInstance.post('/user/admin/re-invite-all');

            if (response.data.success) {
                showSuccessToast(
                    `Re-invitation emails sent to ${response.data.data.invitedCount} users successfully!`,
                    toast
                );
            } else {
                showErrorToast('Failed to send re-invitation emails', toast);
            }
        } catch (error) {
            console.error('Error re-inviting users:', error);
            showErrorToast('Failed to send re-invitation emails', toast);
        } finally {
            setIsReInviting(false);
        }
    }, []);

    const statusLabels = {
        [UserStatus.ACTIVE]: 'ACTIVE',
        [UserStatus.INACTIVE]: 'INACTIVE',
        [UserStatus.SUSPENDED]: 'SUSPENDED',
        [UserStatus.PENDING]: 'PENDING',
        [UserStatus.DELETED]: 'DELETED',
        [UserStatus.REVIEW]: 'REVIEW',
        [UserStatus.BANNED]: 'BANNED',
        [UserStatus.DECLINED]: 'DECLINED',
    };

    const statusIcons = {
        [UserStatus.ACTIVE]: UserCheck,
        [UserStatus.INACTIVE]: UserX,
        [UserStatus.SUSPENDED]: UserMinus,
        [UserStatus.PENDING]: AlertCircle,
        [UserStatus.DELETED]: UserCog,
        [UserStatus.REVIEW]: AlertCircle,
        [UserStatus.BANNED]: UserX,
        [UserStatus.DECLINED]: UserMinus,
    };

    const statusColors = {
        [UserStatus.ACTIVE]: 'text-green-600',
        [UserStatus.INACTIVE]: 'text-gray-600',
        [UserStatus.SUSPENDED]: 'text-red-600',
        [UserStatus.PENDING]: 'text-yellow-600',
        [UserStatus.DELETED]: 'text-purple-600',
        [UserStatus.REVIEW]: 'text-orange-600',
        [UserStatus.BANNED]: 'text-red-800',
        [UserStatus.DECLINED]: 'text-rose-600',
    };

    const accessLevelColors: Record<AccessLevel, string> = {
        [AccessLevel.ADMIN]: 'text-purple-600',
        [AccessLevel.MANAGER]: 'text-blue-600',
        [AccessLevel.SUPPORT]: 'text-teal-600',
        [AccessLevel.DEVELOPER]: 'text-indigo-600',
        [AccessLevel.USER]: 'text-gray-600',
        [AccessLevel.OWNER]: 'text-red-600',
    };

    return (
        <div className="flex flex-1 gap-2 justify-end items-center px-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm" id="staff-search-input">
                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="search users..."
                    value={filters.search}
                    onChange={handleSearchChange}
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-border placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-thin placeholder:font-body"
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

            {/* Status Filter */}
            <div className="w-[180px]" id="user-status-filter-trigger">
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
                                            className={`font-thin text-[10px] font-body ${statusColors[filters.status]}`}
                                        >
                                            {statusLabels[filters.status]}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <UserCheck
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
                            {Object.entries(statusLabels).map(([key, label]) => {
                                const Icon = statusIcons[key as UserStatus];
                                const statusKey = key as UserStatus;
                                return (
                                    <DropdownMenuItem
                                        key={key}
                                        className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                        onClick={() => toggleFilter('status', statusKey)}
                                    >
                                        <Icon
                                            className={`mr-2 w-4 h-4 ${statusColors[statusKey]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                filters.status === statusKey
                                                    ? statusColors[statusKey]
                                                    : ''
                                            }`}
                                        >
                                            {label}
                                        </span>
                                        {filters.status === statusKey && (
                                            <Check
                                                className="ml-auto w-4 h-4 text-primary"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Access Level Filter */}
            <div className="w-[180px]" id="user-access-level-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.accessLevel ? (
                                    <>
                                        <Shield
                                            className={`w-4 h-4 ${accessLevelColors[filters.accessLevel]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`font-thin text-[10px] font-body ${accessLevelColors[filters.accessLevel]}`}
                                        >
                                            {filters.accessLevel.toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Shield
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            ACCESS LEVEL
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
                            Filter by Access Level
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(AccessLevel).map((level) => (
                                <DropdownMenuItem
                                    key={level}
                                    className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                    onClick={() => toggleFilter('accessLevel', level)}
                                >
                                    <Shield
                                        className={`mr-2 w-4 h-4 ${accessLevelColors[level]}`}
                                        strokeWidth={1.5}
                                    />
                                    <span
                                        className={`text-[10px] font-normal font-body ${
                                            filters.accessLevel === level
                                                ? accessLevelColors[level]
                                                : ''
                                        }`}
                                    >
                                        {level.toUpperCase()}
                                    </span>
                                    {filters.accessLevel === level && (
                                        <Check
                                            className="ml-auto w-4 h-4 text-primary"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Branch Filter */}
            <div className="w-[180px]" id="user-branch-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.branchId ? (
                                    <>
                                        <Building
                                            className="w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin text-blue-600 font-body">
                                            {branches?.find(b => b.uid === filters.branchId)?.name?.toUpperCase() || 'BRANCH'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Building
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            BRANCH
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
                            Filter by Branch
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {isLoadingBranches ? (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    <span className="text-[10px] font-normal font-body uppercase">
                                        Loading branches...
                                    </span>
                                </div>
                            ) : branches && branches.length > 0 ? (
                                branches.map((branch) => (
                                    <DropdownMenuItem
                                        key={branch.uid}
                                        className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                        onClick={() => toggleFilter('branchId', branch.uid)}
                                    >
                                        <Building
                                            className="mr-2 w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                filters.branchId === branch.uid
                                                    ? 'text-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            {branch.name.toUpperCase()}
                                        </span>
                                        {filters.branchId === branch.uid && (
                                            <Check
                                                className="ml-auto w-4 h-4 text-primary"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    <span className="text-[10px] font-normal font-body uppercase">
                                        No branches found
                                    </span>
                                </div>
                            )}
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Actions Dropdown */}
            <div className="w-[120px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                <Mail
                                    className="w-4 h-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin font-body">
                                    ACTIONS
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
                            Bulk Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={handleReInviteAllUsers}
                                disabled={isReInviting}
                                className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                            >
                                <Mail
                                    className="mr-2 w-4 h-4 text-blue-600"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-normal font-body">
                                    {isReInviting
                                        ? 'RE-INVITING...'
                                        : 'RE-INVITE ALL USERS'}
                                </span>
                            </DropdownMenuItem>
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
                    className="relative text-[10px] hover:text-red-500 font-normal uppercase border border-red-500 rounded h-9 font-body text-red-400"
                    onClick={handleClearFilters}
                >
                    <X className="mr-1 w-4 h-4" strokeWidth={1.5} />
                    Clear All
                    {/* Filter count badge */}
                    <span className="ml-1.5 px-1.5 py-0.5 text-[8px] font-bold bg-red-500 text-white rounded-full">
                        {activeFilterCount}
                    </span>
                </Button>
            )}
        </div>
    );
}
