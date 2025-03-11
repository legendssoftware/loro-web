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
import { useCallback, useState, memo } from 'react';
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

function ClaimsFilterComponent({
    onApplyFilters,
    onClearFilters,
    claims = [],
}: ClaimsFilterProps) {
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<ClaimStatus | undefined>(undefined);
    const [category, setCategory] = useState<ClaimCategory | undefined>(
        undefined,
    );
    const [ownerId, setOwnerId] = useState<number | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const handleApplyFilters = useCallback(() => {
        const filters: ExtendedClaimFilterParams = {};
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

        if (ownerId) {
            filters.ownerId = ownerId;
            newActiveFilters.push('Owner');
        }

        if (startDate || endDate) {
            if (startDate) {
                filters.startDate = startDate;
                newActiveFilters.push('Date Range');
            }
            if (endDate) {
                filters.endDate = endDate;
            }
        }

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [search, status, category, ownerId, startDate, endDate, onApplyFilters]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setCategory(undefined);
        setOwnerId(undefined);
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
        <div className="flex items-center justify-end flex-1 gap-2">
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
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-input placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-normal placeholder:font-body"
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
                                <Calendar
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
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.TODAY)}
                            >
                                Today
                                {dateRangePreset === DateRangePreset.TODAY && (
                                    <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.YESTERDAY)}
                            >
                                Yesterday
                                {dateRangePreset === DateRangePreset.YESTERDAY && (
                                    <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.LAST_WEEK)}
                            >
                                Last Week
                                {dateRangePreset === DateRangePreset.LAST_WEEK && (
                                    <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-[10px] font-normal font-body"
                                onClick={() => handleDateRangeSelect(DateRangePreset.LAST_MONTH)}
                            >
                                Last Month
                                {dateRangePreset === DateRangePreset.LAST_MONTH && (
                                    <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                                )}
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

            {/* Claim Status Filter */}
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
                                        <span className={`text-[10px] font-thin font-body ${statusColors[status]}`}>
                                            {statusLabels[status]}
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
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-56 p-1"
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
                                        className="flex items-center gap-2 px-2 text-xs font-normal rounded cursor-pointer font-body"
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
                                            <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
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

            {/* Category Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                {category ? (
                                    <>
                                        {categoryIcons[category] &&
                                            React.createElement(
                                                categoryIcons[category],
                                                {
                                                    className: `w-4 h-4 ${categoryColors[category]}`,
                                                    strokeWidth: 1.5,
                                                },
                                            )}
                                        <span className={`text-[10px] font-thin font-body ${categoryColors[category]}`}>
                                            {categoryLabels[category].toUpperCase()}
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
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-56 p-1"
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
                                            className="flex items-center gap-2 px-2 text-xs font-normal rounded cursor-pointer font-body"
                                            onClick={() => {
                                                setCategory(
                                                    category === categoryOption
                                                        ? undefined
                                                        : categoryOption,
                                                );
                                                setTimeout(
                                                    handleApplyFilters,
                                                    0,
                                                );
                                            }}
                                        >
                                            <CategoryIcon
                                                className={`w-4 h-4 mr-2 ${categoryColors[categoryOption]}`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    category === categoryOption
                                                        ? categoryColors[categoryOption]
                                                        : ''
                                                }`}
                                            >
                                                {categoryLabels[categoryOption].toUpperCase()}
                                            </span>
                                            {category === categoryOption && (
                                                <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                },
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setCategory(undefined);
                                    if (activeFilters.includes('Category')) {
                                        handleApplyFilters();
                                    }
                                }}
                                className="flex items-center justify-center w-full"
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
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                <span className="text-[10px] font-thin font-body">
                                    {ownerId ? 'OWNER' : 'ASSIGNEE'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-56 p-1"
                    >
                        <DropdownMenuLabel className="px-2 mb-1 text-[10px] font-thin uppercase font-body">
                            Filter by Owner
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center gap-2 px-2 text-xs font-normal rounded cursor-pointer font-body"
                            onClick={() => {
                                setOwnerId(ownerId === -1 ? undefined : -1);
                                setTimeout(handleApplyFilters, 0);
                            }}
                        >
                            <Avatar className="w-6 h-6 mr-2">
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-normal font-body">
                                My Claims
                            </span>
                            {ownerId === -1 && (
                                <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="flex items-center gap-2 px-2 text-xs font-normal rounded cursor-pointer font-body"
                            onClick={() => {
                                setOwnerId(ownerId === 0 ? undefined : 0);
                                setTimeout(handleApplyFilters, 0);
                            }}
                        >
                            <div className="flex items-center justify-center w-6 h-6 mr-2 rounded-full bg-muted">
                                <X className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-normal font-body">
                                No Owner
                            </span>
                            {ownerId === 0 && (
                                <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {owners.map((owner) => (
                            <DropdownMenuItem
                                key={owner.id}
                                className="flex items-center gap-2 px-2 text-xs font-normal rounded cursor-pointer font-body"
                                onClick={() => {
                                    setOwnerId(
                                        ownerId === owner.id
                                            ? undefined
                                            : owner.id,
                                    );
                                    setTimeout(handleApplyFilters, 0);
                                }}
                            >
                                <Avatar className="w-6 h-6 mr-2">
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
                                {ownerId === owner.id && (
                                    <Check className="w-4 h-4 ml-auto text-primary" strokeWidth={1.5} />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                setOwnerId(undefined);
                                if (activeFilters.includes('Owner')) {
                                    handleApplyFilters();
                                }
                            }}
                            className="flex items-center justify-center w-full"
                        >
                            <span className="text-[10px] font-normal text-red-500 font-body">
                                Clear Owner Filter
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear Filters Button - Only show when filters are active */}
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
    );
}

export const ClaimsFilter = memo(ClaimsFilterComponent);
