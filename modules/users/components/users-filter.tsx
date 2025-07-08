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
import { useCallback, useState } from 'react';
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

export function UsersFilter({
    onApplyFilters,
    onClearFilters,
    users = [],
}: UsersFilterProps) {
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<UserStatus | undefined>(undefined);
    const [accessLevel, setAccessLevel] = useState<AccessLevel | undefined>(
        undefined,
    );
    const [branchId, setBranchId] = useState<number | undefined>(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [isReInviting, setIsReInviting] = useState(false);

    // Use the global branch query hook instead of generating branches from users
    const { branches, isLoading: isLoadingBranches } = useBranchQuery();

    // Handle search input changes
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            // Apply search filter with slight delay to avoid too many requests during typing
            setTimeout(() => {
                const filters: UserFilterParams = {};
                const newActiveFilters: string[] = [];

                if (status) {
                    filters.status = status;
                    newActiveFilters.push('Status');
                }

                if (accessLevel) {
                    filters.accessLevel = accessLevel;
                    newActiveFilters.push('Access Level');
                }

                if (branchId) {
                    filters.branchId = branchId;
                    newActiveFilters.push('Branch');
                }

                if (e.target.value) {
                    filters.search = e.target.value;
                    newActiveFilters.push('Search');
                }

                setActiveFilters(newActiveFilters);
                onApplyFilters(filters);
            }, 300);
        },
        [status, accessLevel, branchId, onApplyFilters],
    );

    const handleApplyFilters = useCallback(() => {
        const filters: UserFilterParams = {};
        const newActiveFilters: string[] = [];

        if (search) {
            filters.search = search;
            newActiveFilters.push('Search');
        }

        if (status) {
            filters.status = status;
            newActiveFilters.push('Status');
        }

        if (accessLevel) {
            filters.accessLevel = accessLevel;
            newActiveFilters.push('Access Level');
        }

        if (branchId) {
            filters.branchId = branchId;
            newActiveFilters.push('Branch');
        }

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [search, status, accessLevel, branchId, onApplyFilters]);

    // Adding direct filter application helper to avoid setTimeout issues
    const applyFilter = useCallback(
        (
            filterType: 'status' | 'accessLevel' | 'branchId' | 'search',
            value: any,
        ) => {
            const filters: UserFilterParams = {};
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

            if (accessLevel && filterType !== 'accessLevel') {
                filters.accessLevel = accessLevel;
                newActiveFilters.push('Access Level');
            }

            if (branchId && filterType !== 'branchId') {
                filters.branchId = branchId;
                newActiveFilters.push('Branch');
            }

            // Add the new filter value
            if (filterType === 'search' && value) {
                filters.search = value;
                newActiveFilters.push('Search');
            } else if (filterType === 'status' && value) {
                filters.status = value;
                newActiveFilters.push('Status');
            } else if (filterType === 'accessLevel' && value) {
                filters.accessLevel = value;
                newActiveFilters.push('Access Level');
            } else if (filterType === 'branchId' && value) {
                filters.branchId = value;
                newActiveFilters.push('Branch');
            }

            setActiveFilters(newActiveFilters);
            onApplyFilters(filters);
        },
        [search, status, accessLevel, branchId, onApplyFilters],
    );

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setAccessLevel(undefined);
        setBranchId(undefined);
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

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
                    value={search}
                    onChange={handleSearchChange}
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-border placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-thin placeholder:font-body"
                />
                {search && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 w-8 h-8 transform -translate-y-1/2"
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

            {/* Status Filter */}
            <div className="w-[180px]" id="user-status-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
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
                                            className={`font-thin text-[10px] font-body ${statusColors[status]}`}
                                        >
                                            {statusLabels[status]}
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
                                return (
                                    <DropdownMenuItem
                                        key={key}
                                        className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                        onClick={() => {
                                            const newStatus =
                                                status === (key as UserStatus)
                                                    ? undefined
                                                    : (key as UserStatus);
                                            setStatus(newStatus);
                                            applyFilter('status', newStatus);
                                        }}
                                    >
                                        <Icon
                                            className={`mr-2 w-4 h-4 ${ statusColors[key as UserStatus] }`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                status === key
                                                    ? statusColors[key as UserStatus]
                                                    : ''
                                            }`}
                                        >
                                            {label}
                                        </span>
                                        {status === key && (
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
                                {accessLevel ? (
                                    <>
                                        <Shield
                                            className={`w-4 h-4 ${accessLevelColors[accessLevel]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`font-thin text-[10px] font-body ${accessLevelColors[accessLevel]}`}
                                        >
                                            {accessLevel.toUpperCase()}
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
                                    onClick={() => {
                                        const newAccessLevel =
                                            accessLevel === level ? undefined : level;
                                        setAccessLevel(newAccessLevel);
                                        applyFilter('accessLevel', newAccessLevel);
                                    }}
                                >
                                    <Shield
                                        className={`mr-2 w-4 h-4 ${accessLevelColors[level]}`}
                                        strokeWidth={1.5}
                                    />
                                    <span
                                        className={`text-[10px] font-normal font-body ${
                                            accessLevel === level
                                                ? accessLevelColors[level]
                                                : ''
                                        }`}
                                    >
                                        {level.toUpperCase()}
                                    </span>
                                    {accessLevel === level && (
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
                                {branchId ? (
                                    <>
                                        <Building
                                            className="w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin text-blue-600 font-body">
                                            {branches?.find(b => b.uid === branchId)?.name?.toUpperCase() || 'BRANCH'}
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
                                        onClick={() => {
                                            const newBranchId =
                                                branchId === branch.uid ? undefined : branch.uid;
                                            setBranchId(newBranchId);
                                            applyFilter('branchId', newBranchId);
                                        }}
                                    >
                                        <Building
                                            className="mr-2 w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                branchId === branch.uid
                                                    ? 'text-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            {branch.name.toUpperCase()}
                                        </span>
                                        {branchId === branch.uid && (
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
            {activeFilters.length > 0 && (
                <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] hover:text-red-500 font-normal uppercase border border-red-500 rounded h-9 font-body text-red-400"
                    onClick={handleClearFilters}
                >
                    <X className="mr-1 w-4 h-4" strokeWidth={1.5} />
                    Clear All
                </Button>
            )}
        </div>
    );
}
