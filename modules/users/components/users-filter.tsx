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
    Search,
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

// Date range presets
enum DateRangePreset {
    TODAY = 'TODAY',
    YESTERDAY = 'YESTERDAY',
    LAST_WEEK = 'LAST_WEEK',
    LAST_MONTH = 'LAST_MONTH',
    CUSTOM = 'CUSTOM',
}

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
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Collect unique branches from users
    const branches = users
        ? Array.from(
              new Set(
                  users
                      .filter((user) => user.branch && user.branch.id)
                      .map((user) => ({
                          id: user.branch!.id,
                          name: user.branch!.name,
                      })),
              ),
          )
        : [];

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
    }, [
        search,
        status,
        accessLevel,
        branchId,
        startDate,
        endDate,
        onApplyFilters,
    ]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setAccessLevel(undefined);
        setBranchId(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        setDateRangePreset(undefined);
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

    const statusLabels = {
        [UserStatus.ACTIVE]: 'ACTIVE',
        [UserStatus.INACTIVE]: 'INACTIVE',
        [UserStatus.SUSPENDED]: 'SUSPENDED',
        [UserStatus.PENDING]: 'PENDING',
        [UserStatus.DELETED]: 'DELETED',
    };

    const statusIcons = {
        [UserStatus.ACTIVE]: UserCheck,
        [UserStatus.INACTIVE]: UserX,
        [UserStatus.SUSPENDED]: UserMinus,
        [UserStatus.PENDING]: AlertCircle,
        [UserStatus.DELETED]: UserCog,
    };

    const statusColors = {
        [UserStatus.ACTIVE]: 'text-green-600',
        [UserStatus.INACTIVE]: 'text-gray-600',
        [UserStatus.SUSPENDED]: 'text-red-600',
        [UserStatus.PENDING]: 'text-yellow-600',
        [UserStatus.DELETED]: 'text-purple-600',
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
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
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
                        <X className="w-4 h-4" />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>
            {/* User Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
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
                    <DropdownMenuContent className="w-56" align="start">
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

            {/* Access Level Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
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
                                        setAccessLevel(
                                            accessLevel === levelOption
                                                ? undefined
                                                : levelOption,
                                        );
                                        setTimeout(handleApplyFilters, 0);
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
                            <DropdownMenuItem
                                onClick={() => {
                                    setAccessLevel(undefined);
                                    if (
                                        activeFilters.includes('Access Level')
                                    ) {
                                        handleApplyFilters();
                                    }
                                }}
                                className="flex items-center justify-center w-full"
                            >
                                <span className="text-[10px] font-normal text-red-500 font-body">
                                    Clear Access Level Filter
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Branch Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {branchId &&
                                branches.find((b) => b.id === branchId) ? (
                                    <>
                                        <Building
                                            className="w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin text-blue-600 font-body">
                                            {branches
                                                .find((b) => b.id === branchId)
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
                            {branches.map((branch) => (
                                <DropdownMenuItem
                                    key={branch.id}
                                    className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                    onClick={() => {
                                        setBranchId(
                                            branchId === branch.id
                                                ? undefined
                                                : branch.id,
                                        );
                                        setTimeout(handleApplyFilters, 0);
                                    }}
                                >
                                    <Building
                                        className="w-4 h-4 mr-2 text-blue-600"
                                        strokeWidth={1.5}
                                    />
                                    <span className="text-[10px] font-normal font-body">
                                        {branch.name.toUpperCase()}
                                    </span>
                                    {branchId === branch.id && (
                                        <Check
                                            className="w-4 h-4 ml-auto text-primary"
                                            strokeWidth={1.5}
                                        />
                                    )}
                                </DropdownMenuItem>
                            ))}
                            {branches.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setBranchId(undefined);
                                            if (
                                                activeFilters.includes('Branch')
                                            ) {
                                                handleApplyFilters();
                                            }
                                        }}
                                        className="flex items-center justify-center w-full"
                                    >
                                        <span className="text-[10px] font-normal text-red-500 font-body">
                                            Clear Branch Filter
                                        </span>
                                    </DropdownMenuItem>
                                </>
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
