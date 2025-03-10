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
import { Quotation, QuotationFilterParams } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import {
    CalendarIcon,
    Check,
    ChevronDown,
    Search,
    X,
    AlertCircle,
    CheckCircle,
    XCircle,
    Calendar,
    Users,
    User,
    Clock,
    Package,
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

interface QuotationsFilterProps {
    onApplyFilters: (filters: QuotationFilterParams) => void;
    onClearFilters: () => void;
    quotations?: Quotation[];
}

function QuotationsFilterComponent({
    onApplyFilters,
    onClearFilters,
    quotations = [],
}: QuotationsFilterProps) {
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
    const [clientId, setClientId] = useState<number | undefined>(undefined);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    const handleApplyFilters = useCallback(() => {
        const filters: QuotationFilterParams = {};
        const newActiveFilters: string[] = [];

        if (search) {
            filters.search = search;
            newActiveFilters.push('Search');
        }

        if (status) {
            filters.status = status;
            newActiveFilters.push('Status');
        }

        if (clientId) {
            filters.clientId = clientId;
            newActiveFilters.push('Client');
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
    }, [search, status, clientId, startDate, endDate, onApplyFilters]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setClientId(undefined);
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

    // Extract unique clients from quotations for dropdown options
    const uniqueClients = React.useMemo(() => {
        const clientsMap = new Map();

        quotations.forEach((quotation) => {
            if (
                quotation.client &&
                quotation.client.uid &&
                !clientsMap.has(quotation.client.uid)
            ) {
                clientsMap.set(quotation.client.uid, {
                    id: quotation.client.uid,
                    name: quotation.client.name || 'Unknown',
                    photo: quotation.client.photo || '',
                    email: quotation.client.email || '',
                });
            }
        });

        return Array.from(clientsMap.values());
    }, [quotations]);

    const statusLabels: Record<OrderStatus, string> = {
        [OrderStatus.PENDING]: 'PENDING',
        [OrderStatus.INPROGRESS]: 'IN PROGRESS',
        [OrderStatus.APPROVED]: 'APPROVED',
        [OrderStatus.REJECTED]: 'REJECTED',
        [OrderStatus.COMPLETED]: 'COMPLETED',
        [OrderStatus.CANCELLED]: 'CANCELLED',
        [OrderStatus.POSTPONED]: 'POSTPONED',
        [OrderStatus.OUTFORDELIVERY]: 'OUT FOR DELIVERY',
        [OrderStatus.DELIVERED]: 'DELIVERED',
    };

    type IconType = React.ForwardRefExoticComponent<
        Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
            ref?: React.Ref<SVGSVGElement>;
        }
    >;

    const statusIcons: Record<OrderStatus, IconType> = {
        [OrderStatus.PENDING]: AlertCircle,
        [OrderStatus.INPROGRESS]: Clock,
        [OrderStatus.APPROVED]: CheckCircle,
        [OrderStatus.REJECTED]: XCircle,
        [OrderStatus.COMPLETED]: Check,
        [OrderStatus.CANCELLED]: X,
        [OrderStatus.POSTPONED]: Clock,
        [OrderStatus.OUTFORDELIVERY]: Package,
        [OrderStatus.DELIVERED]: Package,
    };

    const statusColors: Record<OrderStatus, string> = {
        [OrderStatus.PENDING]: 'text-yellow-600',
        [OrderStatus.INPROGRESS]: 'text-blue-600',
        [OrderStatus.APPROVED]: 'text-green-600',
        [OrderStatus.REJECTED]: 'text-red-600',
        [OrderStatus.COMPLETED]: 'text-purple-600',
        [OrderStatus.CANCELLED]: 'text-gray-600',
        [OrderStatus.POSTPONED]: 'text-orange-600',
        [OrderStatus.OUTFORDELIVERY]: 'text-indigo-600',
        [OrderStatus.DELIVERED]: 'text-teal-600',
    };

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
                        <X className="w-4 h-4 text-red-500" />
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

            {/* Quotation Status Filter */}
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
                                    <Clock className="w-4 h-4 text-muted-foreground" />
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
                            QUOTATION STATUS
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {Object.values(OrderStatus).map((statusOption) => {
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

            {/* Client Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {clientId ? 'CLIENT' : 'CLIENT'}
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
                            CLIENT
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                            onClick={() => {
                                setClientId(undefined);
                                setTimeout(handleApplyFilters, 0);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
                                    <Users className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-normal">
                                    All Clients
                                </span>
                            </div>
                            {!clientId && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {uniqueClients.map((client) => (
                            <DropdownMenuItem
                                key={client.id}
                                className="flex items-center justify-between gap-2 px-2 rounded cursor-pointer h-9"
                                onClick={() => {
                                    setClientId(
                                        clientId === client.id
                                            ? undefined
                                            : client.id,
                                    );
                                    setTimeout(handleApplyFilters, 0);
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage
                                            src={client.photo}
                                            alt={client.name}
                                        />
                                        <AvatarFallback>
                                            {client.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[10px] font-normal">
                                        {client.name}
                                    </span>
                                </div>
                                {clientId === client.id && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
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

export const QuotationsFilter = memo(QuotationsFilterComponent);
