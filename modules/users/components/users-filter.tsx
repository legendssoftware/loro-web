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
} from 'lucide-react';
import { useCallback, useState } from 'react';
import React from 'react';
import { useBranchQuery } from '@/hooks/use-branch-query';

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

    // Use the global branch query hook instead of generating branches from users
    const { branches, isLoading: isLoadingBranches } = useBranchQuery();

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

    const accessLevelColors = {
        [AccessLevel.ADMIN]: 'text-purple-600',
        [AccessLevel.MANAGER]: 'text-blue-600',
        [AccessLevel.SUPPORT]: 'text-teal-600',
        [AccessLevel.DEVELOPER]: 'text-indigo-600',
        [AccessLevel.USER]: 'text-gray-600',
    };

    return (
        <div className="flex items-center justify-end flex-1 gap-2 px-2">
            {/* User Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div
                            className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border"
                            id="user-status-filter-trigger"
                        >
                            <div className="flex items-center gap-2">
                                {status ? (
                                    <>
                                        {statusIcons[status] &&
                                            React.createElement(
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
                    <DropdownMenuContent
                        className="w-56"
                        align="start"
                        id="user-status-filter-content"
                    >
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(UserStatus).map((statusOption) => {
                                const StatusIcon = statusIcons[statusOption];

                                return (
                                    <DropdownMenuItem
                                        key={statusOption}
                                        className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                        onClick={() => {
                                            const newStatus =
                                                status === statusOption
                                                    ? undefined
                                                    : statusOption;
                                            setStatus(newStatus);
                                            applyFilter('status', newStatus);
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
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Access Level Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div
                            className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border"
                            id="user-access-level-filter-trigger"
                        >
                            <div className="flex items-center gap-2">
                                {accessLevel ? (
                                    <>
                                        <Shield
                                            className={`w-4 h-4 ${accessLevelColors[accessLevel]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-thin font-body ${accessLevelColors[accessLevel]}`}
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
                                className="w-4 h-4 ml-2 opacity-50"
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
                            {Object.values(AccessLevel).map((levelOption) => (
                                <DropdownMenuItem
                                    key={levelOption}
                                    className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                    onClick={() => {
                                        const newAccessLevel =
                                            accessLevel === levelOption
                                                ? undefined
                                                : levelOption;
                                        setAccessLevel(newAccessLevel);
                                        applyFilter(
                                            'accessLevel',
                                            newAccessLevel,
                                        );
                                    }}
                                >
                                    <Shield
                                        className={`w-4 h-4 mr-2 ${accessLevelColors[levelOption]}`}
                                        strokeWidth={1.5}
                                    />
                                    <span
                                        className={`text-[10px] font-normal font-body ${
                                            accessLevel === levelOption
                                                ? accessLevelColors[levelOption]
                                                : ''
                                        }`}
                                    >
                                        {levelOption.toUpperCase()}
                                    </span>
                                    {accessLevel === levelOption && (
                                        <Check
                                            className="w-4 h-4 ml-auto text-primary"
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
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div
                            className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border"
                            id="user-branch-filter-trigger"
                        >
                            <div className="flex items-center gap-2">
                                {branchId &&
                                branches.find(
                                    (b) =>
                                        b.uid === branchId || b.id === branchId,
                                ) ? (
                                    <>
                                        <Building
                                            className="w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin text-blue-600 font-body">
                                            {branches
                                                .find(
                                                    (b) =>
                                                        b.uid === branchId ||
                                                        b.id === branchId,
                                                )
                                                ?.name.toUpperCase()}
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
                                className="w-4 h-4 ml-2 opacity-50"
                                strokeWidth={1.5}
                            />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Branch
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {isLoadingBranches ? (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    Loading branches...
                                </div>
                            ) : branches.length > 0 ? (
                                branches.map((branch) => (
                                    <DropdownMenuItem
                                        key={branch.uid || branch.id}
                                        className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                        onClick={() => {
                                            const newBranchId =
                                                branchId ===
                                                (branch.uid || branch.id)
                                                    ? undefined
                                                    : branch.uid || branch.id;
                                            setBranchId(newBranchId);
                                            applyFilter(
                                                'branchId',
                                                newBranchId,
                                            );
                                        }}
                                    >
                                        <Building
                                            className="w-4 h-4 mr-2 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-normal font-body">
                                            {branch.name.toUpperCase()}
                                        </span>
                                        {branchId ===
                                            (branch.uid || branch.id) && (
                                            <Check
                                                className="w-4 h-4 ml-auto text-primary"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    No branches available
                                </div>
                            )}
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
