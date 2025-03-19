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
    ProductStatus,
    ProductFilterParams,
} from '@/hooks/use-products-query';
import {
    X,
    ChevronDown,
    Package,
    Tag,
    DollarSign,
    Check,
    PackageCheck,
    PackageX,
    AlertCircle,
    PackageMinus,
} from 'lucide-react';
import { useCallback, useState, useMemo } from 'react';
import React from 'react';

// Mapping of status values to their display labels
const statusLabels: Record<string, string> = {
    [ProductStatus.ACTIVE]: 'ACTIVE',
    [ProductStatus.INACTIVE]: 'INACTIVE',
    [ProductStatus.OUTOFSTOCK]: 'OUT OF STOCK',
    [ProductStatus.NEW]: 'NEW',
    [ProductStatus.DISCONTINUED]: 'DISCONTINUED',
    [ProductStatus.BEST_SELLER]: 'BEST SELLER',
    [ProductStatus.HOTDEALS]: 'HOT DEALS',
    [ProductStatus.SPECIAL]: 'SPECIAL',
    [ProductStatus.HIDDEN]: 'HIDDEN',
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
    products?: any[];
}

export function ProductsFilter({
    onApplyFilters,
    onClearFilters,
    products = [],
}: ProductsFilterProps) {
    // State for filter values
    const [status, setStatus] = useState<ProductStatus | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
    const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    // Get unique categories from products
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

    // Apply filters
    const handleApplyFilters = useCallback(() => {
        const filters: ProductFilterParams = {};
        const newActiveFilters: string[] = [];

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

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [status, category, minPrice, maxPrice, onApplyFilters]);

    // Adding direct filter application helper to avoid setTimeout issues
    const applyFilter = useCallback(
        (
            filterType: 'status' | 'category' | 'price',
            value: any,
            minVal?: number,
            maxVal?: number,
        ) => {
            const filters: ProductFilterParams = {};
            const newActiveFilters: string[] = [];

            // Preserve existing filters
            if (status && filterType !== 'status') {
                filters.status = status;
                newActiveFilters.push('Status');
            }

            if (category && filterType !== 'category') {
                filters.category = category;
                newActiveFilters.push('Category');
            }

            if (minPrice !== undefined && filterType !== 'price') {
                filters.minPrice = minPrice;
                if (!newActiveFilters.includes('Price')) {
                    newActiveFilters.push('Price');
                }
            }

            if (maxPrice !== undefined && filterType !== 'price') {
                filters.maxPrice = maxPrice;
                if (!newActiveFilters.includes('Price')) {
                    newActiveFilters.push('Price');
                }
            }

            // Add the new filter value
            if (filterType === 'status' && value) {
                filters.status = value;
                newActiveFilters.push('Status');
            } else if (filterType === 'category' && value) {
                filters.category = value;
                newActiveFilters.push('Category');
            } else if (filterType === 'price') {
                if (minVal !== undefined) {
                    filters.minPrice = minVal;
                    if (!newActiveFilters.includes('Price')) {
                        newActiveFilters.push('Price');
                    }
                }
                if (maxVal !== undefined) {
                    filters.maxPrice = maxVal;
                    if (!newActiveFilters.includes('Price')) {
                        newActiveFilters.push('Price');
                    }
                }
            }

            setActiveFilters(newActiveFilters);
            onApplyFilters(filters);
        },
        [status, category, minPrice, maxPrice, onApplyFilters],
    );

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setStatus(undefined);
        setCategory(undefined);
        setMinPrice(undefined);
        setMaxPrice(undefined);
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

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
        <div className="flex items-center justify-end flex-1 gap-2 px-2">
            {/* Status Filter */}
            <div className="w-[180px]">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                            <div className="flex items-center gap-2">
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
                            {Object.entries(statusLabels).map(
                                ([key, label]) => {
                                    const Icon =
                                        statusIcons[key as ProductStatus];
                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                            onClick={() => {
                                                const newStatus =
                                                    status === (key as ProductStatus)
                                                        ? undefined
                                                        : (key as ProductStatus);
                                                setStatus(newStatus);
                                                applyFilter('status', newStatus);
                                            }}
                                        >
                                            <Icon
                                                className={`w-4 h-4 mr-2 ${
                                                    statusColors[
                                                        key as ProductStatus
                                                    ]
                                                }`}
                                                strokeWidth={1.5}
                                            />
                                            <span
                                                className={`text-[10px] font-normal font-body ${
                                                    status === key
                                                        ? statusColors[key as ProductStatus]
                                                        : ''
                                                }`}
                                            >
                                                {label}
                                            </span>
                                            {status === key && (
                                                <Check
                                                    className="w-4 h-4 ml-auto text-primary"
                                                    strokeWidth={1.5}
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                },
                            )}
                            <DropdownMenuSeparator />
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
                                        <Tag
                                            className="w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin text-blue-600 font-body">
                                            {category.toUpperCase()}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Tag
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            CATEGORY
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
                            Filter by Category
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {categories.length > 0 ? (
                                categories.map((cat) => (
                                    <DropdownMenuItem
                                        key={cat}
                                        className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                        onClick={() => {
                                            const newCategory =
                                                category === cat
                                                    ? undefined
                                                    : cat;
                                            setCategory(newCategory);
                                            applyFilter('category', newCategory);
                                        }}
                                    >
                                        <Tag
                                            className="w-4 h-4 mr-2 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                category === cat
                                                    ? 'text-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            {cat.toUpperCase()}
                                        </span>
                                        {category === cat && (
                                            <Check
                                                className="w-4 h-4 ml-auto text-primary"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="px-2 py-1 text-xs text-gray-400">
                                    <span className="text-[10px] font-normal font-body uppercase">
                                        No categories available
                                    </span>
                                </div>
                            )}
                            <DropdownMenuSeparator />
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
                                {minPrice !== undefined || maxPrice !== undefined ? (
                                    <>
                                        <DollarSign
                                            className="w-4 h-4 text-purple-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin text-purple-600 font-body">
                                            {`R${minPrice || 0} - R${maxPrice || '∞'}`}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <DollarSign
                                            className="w-4 h-4 text-muted-foreground"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin font-body">
                                            PRICE RANGE
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
                            Select Price Range
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            {priceRanges.map((range, index) => (
                                <DropdownMenuItem
                                    key={index}
                                    className="flex items-center gap-2 px-2 text-xs font-normal font-body"
                                    onClick={() => {
                                        const newMinPrice =
                                            minPrice === range.min && maxPrice === range.max
                                                ? undefined
                                                : range.min;
                                        const newMaxPrice =
                                            minPrice === range.min && maxPrice === range.max
                                                ? undefined
                                                : range.max;
                                        setMinPrice(newMinPrice);
                                        setMaxPrice(newMaxPrice);
                                        applyFilter('price', null, newMinPrice, newMaxPrice);
                                    }}
                                >
                                    <span
                                        className={`text-[10px] font-normal font-body ${
                                            minPrice === range.min && maxPrice === range.max
                                                ? 'text-purple-600'
                                                : ''
                                        }`}
                                    >
                                        {range.label}
                                    </span>
                                    {minPrice === range.min && maxPrice === range.max && (
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
