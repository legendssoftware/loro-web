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
    Calendar,
    Package,
    Tag,
    DollarSign,
    Box,
    Percent,
    Check,
    CalendarIcon,
    PackageCheck,
    PackageX,
    AlertCircle,
    PackageMinus,
    TagIcon,
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
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            {/* Search input */}
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="search..."
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-input placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-normal placeholder:font-body"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleApplyFilters();
                        }
                    }}
                />
                {search && (
                    <X
                        className="absolute right-2.5 top-2.5 h-4 w-4 cursor-pointer text-muted-foreground"
                        onClick={() => {
                            setSearch('');
                            setTimeout(handleApplyFilters, 0);
                        }}
                    />
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
                                                    className: `h-3 w-3 ${statusColors[status]}`,
                                                },
                                            )}
                                    </>
                                ) : (
                                    <Package className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {status ? statusLabels[status] : 'Status'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            <Package className="inline-block w-4 h-4 mr-2" />
                            Status
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            {Object.keys(statusLabels).map((statusOption) => {
                                const StatusIcon = statusIcons[statusOption];
                                return (
                                    <DropdownMenuItem
                                        key={statusOption}
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => {
                                            setStatus(
                                                statusOption as ProductStatus,
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

            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="w-[180px]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-[10px] font-normal uppercase font-body">
                                        {category || 'Category'}
                                    </span>
                                </div>
                                <ChevronDown className="w-4 h-4 opacity-50" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                <Tag className="inline-block w-4 h-4 mr-2" />
                                Category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                                {categories.map((cat) => (
                                    <DropdownMenuItem
                                        key={cat}
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => {
                                            setCategory(cat);
                                            setTimeout(handleApplyFilters, 0);
                                        }}
                                    >
                                        <span className="text-[10px] font-normal uppercase">
                                            {cat}
                                        </span>
                                        {category === cat && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Price Range Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <TagIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {minPrice !== undefined ||
                                    maxPrice !== undefined
                                        ? `R${minPrice || 0} - ${maxPrice !== undefined ? `R${maxPrice}` : 'Any'}`
                                        : 'Price'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            <TagIcon className="inline-block w-4 h-4 mr-2" />
                            Price Range
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {priceRanges.map((range) => (
                                <DropdownMenuItem
                                    key={range.label}
                                    className="flex items-center justify-between cursor-pointer"
                                    onClick={() => {
                                        setMinPrice(range.min);
                                        setMaxPrice(range.max);
                                        setTimeout(handleApplyFilters, 0);
                                    }}
                                >
                                    <span className="text-[10px] font-normal">
                                        {range.label}
                                    </span>
                                    {minPrice === range.min &&
                                        maxPrice === range.max && (
                                            <Check className="w-4 h-4 text-primary" />
                                        )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Date Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {dateRangePreset
                                        ? dateRangePreset
                                              .replace(/_/g, ' ')
                                              .toLowerCase()
                                        : 'Date'}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            <Calendar className="inline-block w-4 h-4 mr-2" />
                            Date Range
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                    handleDateRangeSelect(DateRangePreset.TODAY)
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-normal uppercase">
                                        Today
                                    </span>
                                </div>
                                {dateRangePreset === DateRangePreset.TODAY && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.YESTERDAY,
                                    )
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-normal uppercase">
                                        Yesterday
                                    </span>
                                </div>
                                {dateRangePreset ===
                                    DateRangePreset.YESTERDAY && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_WEEK,
                                    )
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-normal uppercase">
                                        Last Week
                                    </span>
                                </div>
                                {dateRangePreset ===
                                    DateRangePreset.LAST_WEEK && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() =>
                                    handleDateRangeSelect(
                                        DateRangePreset.LAST_MONTH,
                                    )
                                }
                            >
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-normal uppercase">
                                        Last Month
                                    </span>
                                </div>
                                {dateRangePreset ===
                                    DateRangePreset.LAST_MONTH && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Stock and Promotion Quick Filters */}
            <div className="flex space-x-2">
                <Button
                    variant={inStock ? 'default' : 'outline'}
                    size="sm"
                    className="h-10 bg-card border-border"
                    onClick={() => {
                        setInStock((prev) => !prev);
                        setTimeout(handleApplyFilters, 0);
                    }}
                >
                    <Box className="w-4 h-4 mr-2" />
                    <span className="text-[10px] font-normal uppercase font-body">
                        In Stock
                    </span>
                </Button>

                <Button
                    variant={onPromotion ? 'default' : 'outline'}
                    size="sm"
                    className="h-10 bg-card border-border"
                    onClick={() => {
                        setOnPromotion((prev) => !prev);
                        setTimeout(handleApplyFilters, 0);
                    }}
                >
                    <Percent className="w-4 h-4 mr-2" />
                    <span className="text-[10px] font-normal uppercase font-body">
                        On Sale
                    </span>
                </Button>
            </div>

            {/* Clear filters button */}
            {activeFilters.length > 0 && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 bg-card border-border"
                    onClick={handleClearFilters}
                >
                    <X className="w-4 h-4 mr-2" />
                    <span className="text-[10px] font-normal uppercase font-body">
                        Clear Filters
                    </span>
                </Button>
            )}

            {/* Active filter badges */}
            {activeFilters.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1.5 items-center">
                    {activeFilters.map((filter) => (
                        <div
                            key={filter}
                            className="flex items-center px-2 py-1 text-xs rounded-md bg-primary/10 text-primary"
                        >
                            {filter}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
