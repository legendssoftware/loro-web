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
import { ProductStatus, ProductFilterParams } from '@/hooks/use-products-query';
import {
    X,
    ChevronDown,
    Package,
    Tag,
    Check,
    PackageCheck,
    PackageX,
    AlertCircle,
    PackageMinus,
    Search,
} from 'lucide-react';
import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import React from 'react';
import { Input } from '@/components/ui/input';

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

// Define initial filter state as a constant
const INITIAL_FILTERS = {
    search: '',
    status: undefined as ProductStatus | undefined,
    category: undefined as string | undefined,
};

export function ProductsFilter({
    onApplyFilters,
    onClearFilters,
    products = [],
}: ProductsFilterProps) {
    // Single consolidated filter state
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    // Ref to track the last applied filters to prevent unnecessary API calls
    const lastAppliedFiltersRef = useRef<ProductFilterParams>({});

    // Ref for debounce timer
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Derive active filter count from current filter state
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.search) count++;
        if (filters.status) count++;
        if (filters.category) count++;
        return count;
    }, [filters]);

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

    // Helper function to build filter params from state
    const buildFilterParams = useCallback((): ProductFilterParams => {
        const params: ProductFilterParams = {};

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.category) params.category = filters.category;

        return params;
    }, [filters]);

    // Check if filters have actually changed
    const hasFiltersChanged = useCallback((newParams: ProductFilterParams): boolean => {
        const lastParams = lastAppliedFiltersRef.current;

        return (
            lastParams.search !== newParams.search ||
            lastParams.status !== newParams.status ||
            lastParams.category !== newParams.category
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
    }, [filters.status, filters.category, applyFilters]);

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

    return (
        <div className="flex flex-1 gap-2 justify-end items-center px-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm" id="product-search-input">
                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="search products..."
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
            <div className="w-[180px]" id="product-status-filter-trigger">
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
                                            className={`text-[10px] font-thin font-body ${statusColors[filters.status]}`}
                                        >
                                            {statusLabels[filters.status]}
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
                            {Object.entries(statusLabels).map(
                                ([key, label]) => {
                                    const Icon =
                                        statusIcons[key as ProductStatus];
                                    const statusKey = key as ProductStatus;
                                    return (
                                        <DropdownMenuItem
                                            key={key}
                                            className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                            onClick={() => toggleFilter('status', statusKey)}
                                        >
                                            <Icon
                                                className={`mr-2 w-4 h-4 ${ statusColors[statusKey] }`}
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
                                },
                            )}
                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Category Filter */}
            <div className="w-[180px]" id="product-category-filter-trigger">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex gap-2 justify-between items-center px-3 w-full h-10 rounded border cursor-pointer bg-card border-border">
                            <div className="flex gap-2 items-center">
                                {filters.category ? (
                                    <>
                                        <Tag
                                            className="w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span className="text-[10px] font-thin text-blue-600 font-body">
                                            {filters.category.toUpperCase()}
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
                                className="ml-2 w-4 h-4 opacity-50"
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
                                        className="flex gap-2 items-center px-2 text-xs font-normal font-body"
                                        onClick={() => toggleFilter('category', cat)}
                                    >
                                        <Tag
                                            className="mr-2 w-4 h-4 text-blue-600"
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className={`text-[10px] font-normal font-body ${
                                                filters.category === cat
                                                    ? 'text-blue-600'
                                                    : ''
                                            }`}
                                        >
                                            {cat.toUpperCase()}
                                        </span>
                                        {filters.category === cat && (
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
                                        No categories available
                                    </span>
                                </div>
                            )}
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
