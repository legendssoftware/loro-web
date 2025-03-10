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
import { User, UserStatus, AccessLevel, UserFilterParams } from '@/lib/types/user';
import {
    Search,
    X,
    ChevronDown,
    Calendar,
    Users,
    Shield,
    Building,
    Check,
    CalendarIcon,
    UserCheck,
    UserX,
    AlertCircle,
    UserMinus,
    UserCog,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
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
    const [accessLevel, setAccessLevel] = useState<AccessLevel | undefined>(undefined);
    const [branchId, setBranchId] = useState<number | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset | undefined>(undefined);
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
                      }))
              )
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
    }, [search, status, accessLevel, branchId, startDate, endDate, onApplyFilters]);

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

            {/* Date Range Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {getDateRangeLabel()}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            DATE RANGE
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(DateRangePreset.TODAY)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    TODAY
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.TODAY && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(DateRangePreset.YESTERDAY)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    YESTERDAY
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.YESTERDAY && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(DateRangePreset.LAST_WEEK)
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    LAST WEEK
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.LAST_WEEK && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() =>
                                handleDateRangeSelect(
                                    DateRangePreset.LAST_MONTH,
                                )
                            }
                        >
                            <div className="flex items-center gap-1">
                                <Calendar
                                    size={16}
                                    color="black"
                                    strokeWidth={1.2}
                                />
                                <span className="uppercase text-[10px] font-normal">
                                    LAST MONTH
                                </span>
                            </div>
                            {dateRangePreset === DateRangePreset.LAST_MONTH && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                                                    className: `w-3 h-3 ${statusColors[status]}`,
                                                },
                                            )}
                                    </>
                                ) : (
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {status ? statusLabels[status] : 'STATUS'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            USER STATUS
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(UserStatus).map((statusOption) => {
                                const StatusIcon = statusIcons[statusOption];

                                return (
                                    <DropdownMenuItem
                                        key={statusOption}
                                        className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                        onClick={() => {
                                            setStatus(
                                                status === statusOption
                                                    ? undefined
                                                    : statusOption,
                                            );
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            {StatusIcon && (
                                                <>
                                                    <StatusIcon
                                                        className={`w-4 h-4 ${statusColors[statusOption]}`}
                                                    />
                                                </>
                                            )}
                                            <span
                                                className={`uppercase text-[10px] font-normal ml-1 ${
                                                    status === statusOption
                                                        ? statusColors[
                                                              statusOption
                                                          ]
                                                        : ''
                                                }`}
                                            >
                                                {statusLabels[statusOption]}
                                            </span>
                                        </div>
                                        {status === statusOption && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
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
                                            className={`h-3 w-3 ${accessLevelColors[accessLevel]}`}
                                        />
                                    </>
                                ) : (
                                    <Shield className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {accessLevel
                                        ? accessLevel.toUpperCase()
                                        : 'ACCESS LEVEL'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            ACCESS LEVEL
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(AccessLevel).map(
                                (levelOption) => (
                                    <DropdownMenuItem
                                        key={levelOption}
                                        className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                        onClick={() => {
                                            setAccessLevel(
                                                accessLevel === levelOption
                                                    ? undefined
                                                    : levelOption,
                                            );
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        <div className="flex items-center gap-1">
                                            <>
                                                <Shield
                                                    className={`h-4 w-4 ${accessLevelColors[levelOption]}`}
                                                />
                                            </>
                                            <span
                                                className={`uppercase text-[10px] font-normal ml-1 ${
                                                    accessLevel === levelOption
                                                        ? accessLevelColors[
                                                              levelOption
                                                          ]
                                                        : ''
                                                }`}
                                            >
                                                {levelOption.toUpperCase()}
                                            </span>
                                        </div>
                                        {accessLevel === levelOption && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ),
                            )}
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
                                <Building className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {branchId ? 'BRANCH' : 'BRANCH'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="p-1 w-[180px]"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-semibold uppercase">
                            BRANCH
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {branches.map((branch) => (
                                <DropdownMenuItem
                                    key={branch.id}
                                    className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                    onClick={() => {
                                        setBranchId(
                                            branchId === branch.id
                                                ? undefined
                                                : branch.id,
                                        );
                                        setTimeout(handleApplyFilters, 0);
                                    }}
                                >
                                    <div className="flex items-center gap-1">
                                        <Building className="w-4 h-4 mr-2 text-gray-600" />
                                        <span className="uppercase text-[10px] font-normal">
                                            {branch.name}
                                        </span>
                                    </div>
                                    {branchId === branch.id && (
                                        <Check className="w-4 h-4 text-primary" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear Filters Button - Only show when filters are active */}
            {activeFilters.length > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10"
                    onClick={handleClearFilters}
                >
                    <X className="w-5 h-5 text-red-500" />
                    <span className="sr-only">Clear all filters</span>
                </Button>
            )}
        </div>
    );
}
