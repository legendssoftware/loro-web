'use client';

import { ProductFilterParams } from '@/hooks/use-products-query';
import { ProductsFilter } from './products-filter';
import { ProductDialog } from './product-dialog';
import { ProductFormValues } from './product-form';

interface ProductsHeaderWithDialogProps {
    onApplyFilters: (filters: ProductFilterParams) => void;
    onClearFilters: () => void;
    onCreateProduct: (productData: ProductFormValues) => Promise<void>;
}

export function ProductsHeaderWithDialog({
    onApplyFilters,
    onClearFilters,
    onCreateProduct,
}: ProductsHeaderWithDialogProps) {
    return (
        <div className="flex items-center justify-end gap-2">
            <ProductsFilter
                onApplyFilters={onApplyFilters}
                onClearFilters={onClearFilters}
            />
            <ProductDialog
                onCreateProduct={onCreateProduct}
                buttonClassName="size-sm"
                buttonLabel="Add Product"
            />
        </div>
    );
}
