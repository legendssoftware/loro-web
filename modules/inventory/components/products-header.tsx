'use client';

import { ProductFilterParams } from '@/hooks/use-products-query';
import { Button } from '@/components/ui/button';
import { PackagePlus } from 'lucide-react';
import { ProductsFilter } from './products-filter';

interface ProductsHeaderProps {
    onApplyFilters: (filters: ProductFilterParams) => void;
    onClearFilters: () => void;
    onAddProduct: () => void;
}

export function ProductsHeader({
    onApplyFilters,
    onClearFilters,
    onAddProduct,
}: ProductsHeaderProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            <ProductsFilter
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
            />
            <Button onClick={onAddProduct} size="sm">
                <PackagePlus className="w-4 h-4 mr-2 text-white" />
                <span className="text-[10px] font-normal uppercase font-body text-white">
                    Add Product
                </span>
            </Button>
        </div>
    );
}
