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
import { useCallback, useState, useMemo } from 'react';
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

export function ProductsFilter({
    onApplyFilters,
    onClearFilters,
    products = [],
}: ProductsFilterProps) {
    // State for filter values
    const [status, setStatus] = useState<ProductStatus | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>('');
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

    // Handle search input changes
    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            // Apply search filter with slight delay to avoid too many requests during typing
            setTimeout(() => {
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

                if (e.target.value) {
                    filters.search = e.target.value;
                    newActiveFilters.push('Search');
                }

                setActiveFilters(newActiveFilters);
                onApplyFilters(filters);
            }, 300);
        },
        [status, category, onApplyFilters],
    );

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

        if (search) {
            filters.search = search;
            newActiveFilters.push('Search');
        }

        setActiveFilters(newActiveFilters);
        onApplyFilters(filters);
    }, [status, category, search, onApplyFilters]);

    // Adding direct filter application helper to avoid setTimeout issues
    const applyFilter = useCallback(
        (filterType: 'status' | 'category' | 'search', value: any) => {
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

            if (search && filterType !== 'search') {
                filters.search = search;
                newActiveFilters.push('Search');
            }

            // Add the new filter value
            if (filterType === 'status' && value) {
                filters.status = value;
                newActiveFilters.push('Status');
            } else if (filterType === 'category' && value) {
                filters.category = value;
                newActiveFilters.push('Category');
            } else if (filterType === 'search' && value) {
                filters.search = value;
                newActiveFilters.push('Search');
            }

            setActiveFilters(newActiveFilters);
            onApplyFilters(filters);
        },
        [status, category, search, onApplyFilters],
    );

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setStatus(undefined);
        setCategory(undefined);
        setSearch('');
        setActiveFilters([]);
        onClearFilters();
    }, [onClearFilters]);

    return (
        <div className="flex items-center justify-end flex-1 gap-2 px-2">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm" id="product-search-input">
                <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                <Input
                    placeholder="search products..."
                    value={search}
                    onChange={handleSearchChange}
                    className="h-10 rounded-md pl-9 pr-9 bg-card border-border placeholder:text-muted-foreground placeholder:text-[10px] placeholder:font-thin placeholder:font-body"
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

            {/* Status Filter */}
            <div className="w-[180px]" id="product-status-filter-trigger">
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
                                                    status ===
                                                    (key as ProductStatus)
                                                        ? undefined
                                                        : (key as ProductStatus);
                                                setStatus(newStatus);
                                                applyFilter(
                                                    'status',
                                                    newStatus,
                                                );
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
                                                        ? statusColors[
                                                              key as ProductStatus
                                                          ]
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
            <div className="w-[180px]" id="product-category-filter-trigger">
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
                                            applyFilter(
                                                'category',
                                                newCategory,
                                            );
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
