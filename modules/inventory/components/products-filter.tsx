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
    Product,
    ProductStatus,
    ProductFilterParams,
} from '@/hooks/use-products-query';
import {
    Search,
    X,
    ChevronDown,
    Package,
    Tag,
    DollarSign,
    Check,
    CalendarIcon,
    PackageCheck,
    PackageX,
    AlertCircle,
    PackageMinus,
} from 'lucide-react';
import { useCallback, useState, useMemo } from 'react';
import {
    format,
    subDays,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
} from 'date-fns';
import React from 'react';

// Date range presets
enum DateRangePreset {
    TODAY = 'TODAY',
    YESTERDAY = 'YESTERDAY',
    LAST_WEEK = 'LAST_WEEK',
    LAST_MONTH = 'LAST_MONTH',
    CUSTOM = 'CUSTOM',
}

// Mapping of status values to their display labels
const statusLabels: Record<string, string> = {
    [ProductStatus.ACTIVE]: 'Active',
    [ProductStatus.INACTIVE]: 'Inactive',
    [ProductStatus.OUTOFSTOCK]: 'Out of Stock',
    [ProductStatus.NEW]: 'New',
    [ProductStatus.DISCONTINUED]: 'Discontinued',
    [ProductStatus.BEST_SELLER]: 'Best Seller',
    [ProductStatus.HOTDEALS]: 'Hot Deals',
    [ProductStatus.SPECIAL]: 'Special',
    [ProductStatus.HIDDEN]: 'Hidden',
};

// Mapping of status values to their icons
const statusIcons: Record<string, React.ElementType> = {
    [ProductStatus.ACTIVE]: PackageCheck,
    [ProductStatus.INACTIVE]: AlertCircle,
    [ProductStatus.OUTOFSTOCK]: PackageX,
    [ProductStatus.NEW]: Package,
    [ProductStatus.DISCONTINUED]: PackageMinus,
    [ProductStatus.BEST_SELLER]: Package,
    [ProductStatus.HOTDEALS]: Package,
    [ProductStatus.SPECIAL]: Package,
    [ProductStatus.HIDDEN]: Package,
};

// Mapping of status values to their colors
const statusColors: Record<string, string> = {
    [ProductStatus.ACTIVE]: 'text-green-600',
    [ProductStatus.INACTIVE]: 'text-yellow-600',
    [ProductStatus.OUTOFSTOCK]: 'text-red-600',
    [ProductStatus.NEW]: 'text-blue-600',
    [ProductStatus.DISCONTINUED]: 'text-gray-600',
    [ProductStatus.BEST_SELLER]: 'text-purple-600',
    [ProductStatus.HOTDEALS]: 'text-orange-600',
    [ProductStatus.SPECIAL]: 'text-purple-600',
    [ProductStatus.HIDDEN]: 'text-gray-600',
};

interface ProductsFilterProps {
    onApplyFilters: (filters: ProductFilterParams) => void;
    onClearFilters: () => void;
    products?: Product[];
}

export function ProductsFilter({
    onApplyFilters,
    onClearFilters,
    products = [],
}: ProductsFilterProps) {
    const [search, setSearch] = useState<string>('');
    const [status, setStatus] = useState<ProductStatus | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [inStock, setInStock] = useState<boolean | undefined>(undefined);
    const [onPromotion, setOnPromotion] = useState<boolean | undefined>(
        undefined,
    );
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [dateRangePreset, setDateRangePreset] = useState<
        DateRangePreset | undefined
    >(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Collect unique categories from products
    const categories = useMemo(() => {
        if (!products) return [];
        return Array.from(
            new Set(
                products
                    .filter((product) => product.category)
                    .map((product) => product.category as string),
            ),
        ).sort();
    }, [products]);

    const handleApplyFilters = useCallback(() => {
        const filters: ProductFilterParams = {};
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

        if (minPrice !== undefined) {
            filters.minPrice = minPrice;
            if (!newActiveFilters.includes('Price')) {
                newActiveFilters.push('Price');
            }
        }

        if (maxPrice !== undefined) {
            filters.maxPrice = maxPrice;
            if (!newActiveFilters.includes('Price')) {
                newActiveFilters.push('Price');
            }
        }

        if (inStock !== undefined) {
            filters.inStock = inStock;
            newActiveFilters.push('In Stock');
        }

        if (onPromotion !== undefined) {
            filters.onPromotion = onPromotion;
            newActiveFilters.push('On Promotion');
        }

        if (startDate) {
            filters.from = format(startDate, 'yyyy-MM-dd');
            if (!newActiveFilters.includes('Date Range')) {
                newActiveFilters.push('Date Range');
            }
        }

        if (endDate) {
            filters.to = format(endDate, 'yyyy-MM-dd');
            if (!newActiveFilters.includes('Date Range')) {
                newActiveFilters.push('Date Range');
            }
        }

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [
        search,
        status,
        category,
        minPrice,
        maxPrice,
        inStock,
        onPromotion,
        startDate,
        endDate,
        onApplyFilters,
    ]);

    const handleClearFilters = useCallback(() => {
        setSearch('');
        setStatus(undefined);
        setCategory(undefined);
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setInStock(undefined);
        setOnPromotion(undefined);
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
            setTimeout(handleApplyFilters, 0);
        },
        [handleApplyFilters],
    );

    // Get date range label
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

    // Price range options
    const priceRanges = [
        { label: 'All Prices', min: undefined, max: undefined },
        { label: 'Under R50', min: 0, max: 50 },
        { label: 'R50 - R100', min: 50, max: 100 },
        { label: 'R100 - R250', min: 100, max: 250 },
        { label: 'R250 - R500', min: 250, max: 500 },
        { label: 'Over R500', min: 500, max: undefined },
    ];

    return (
        <div className="flex items-center justify-end flex-1 gap-2">
            {/* Search input */}
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" strokeWidth={1.5} />
                <Input
                    type="search"
                    placeholder="search..."
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-input placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-thin placeholder:font-body"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleApplyFilters();
                        }
                    }}
                />
                {search && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute w-8 h-8 transform -translate-y-1/2 right-1 top-1/2"
                        onClick={() => {
                            setSearch('');
                            setTimeout(handleApplyFilters, 0);
                        }}
                    >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                        <span className="sr-only">Clear search</span>
                    </Button>
                )}
            </div>

            {/* Status Filter */}
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
                                                    strokeWidth: 1.5
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
                                        <Package
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            STATUS
                                        </span>
                                    </>
                                )}
                            </div>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Filter by Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {Object.keys(statusLabels).map((statusOption) => {
                                const StatusIcon = statusIcons[statusOption];
                                return (
                                    <DropdownMenuItem
                                        key={statusOption}
                                        className="text-xs font-normal font-body"
                                        onClick={() => {
                                            setStatus(
                                                statusOption as ProductStatus,
                                            );
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        <StatusIcon
                                            className={`w-4 h-4 mr-2 ${statusColors[statusOption]}`}
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-normal font-body">
                                            {statusLabels[statusOption]}
                                        </span>
                                        {status === statusOption && (
                                            <Check className="w-4 h-4 ml-auto" strokeWidth={1.5} />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setStatus(undefined);
                                    if (activeFilters.includes('Status')) {
                                        setTimeout(handleApplyFilters, 0);
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
            {categories.length > 0 && (
                <div className="w-[180px]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                <div className="flex items-center gap-2">
                                    <Tag
                                        className="w-4 h-4 text-muted-foreground"
                                        strokeWidth={1.5}
                                    />
                                    <span className="text-[10px] font-thin font-body">
                                        {category || 'CATEGORY'}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="start">
                            <DropdownMenuLabel className="text-[10px] font-thin font-body">
                                Filter by Category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                                {categories.map((cat) => (
                                    <DropdownMenuItem
                                        key={cat}
                                        onClick={() => {
                                            setCategory(cat);
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                        className="text-xs font-normal font-body"
                                    >
                                        <Tag className="w-4 h-4 mr-2 text-muted-foreground" strokeWidth={1.5} />
                                        <span className="text-[10px] font-normal font-body">
                                            {cat}
                                        </span>
                                        {category === cat && (
                                            <Check className="w-4 h-4 ml-auto" strokeWidth={1.5} />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCategory(undefined);
                                        if (
                                            activeFilters.includes('Category')
                                        ) {
                                            setTimeout(handleApplyFilters, 0);
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
            )}

            {/* Date Range Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <CalendarIcon
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
                                onClick={() =>
                                    handleDateRangeSelect(DateRangePreset.TODAY)
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Today
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.YESTERDAY,
                                    )
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Yesterday
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_WEEK,
                                    )
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Last Week
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_MONTH,
                                    )
                                }
                                className="text-[10px] font-normal font-body"
                            >
                                Last Month
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

            {/* Price Range Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <DollarSign
                                    className="w-4 h-4 text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin font-body">
                                    {minPrice !== undefined ||
                                    maxPrice !== undefined
                                        ? `${minPrice || 0} - ${maxPrice || '∞'}`
                                        : 'PRICE RANGE'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" strokeWidth={1.5} />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className="text-[10px] font-thin font-body">
                            Select Price Range
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {priceRanges.map((range, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    onClick={() => {
                                        setMinPrice(range.min);
                                        setMaxPrice(range.max);
                                        setTimeout(handleApplyFilters, 0);
                                    }}
                                    className="text-[10px] font-normal font-body"
                                >
                                    {range.label}
                                    {minPrice === range.min &&
                                        maxPrice === range.max && (
                                            <Check className="w-4 h-4 ml-auto" strokeWidth={1.5} />
                                        )}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setMinPrice(undefined);
                                    setMaxPrice(undefined);
                                    if (activeFilters.includes('Price')) {
                                        setTimeout(handleApplyFilters, 0);
                                    }
                                }}
                                className="flex items-center justify-center w-full"
                            >
                                <span className="text-[10px] font-normal text-red-500 font-body">
                                    Clear Price Filter
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Clear All Filters */}
            {activeFilters.length > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-10 px-3 text-[10px] font-thin font-body text-red-500"
                >
                    CLEAR ALL
                </Button>
            )}
        </div>
    );
}
