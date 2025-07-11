'use client';

import { ProductCard } from './product-card';
import { Product } from '@/hooks/use-products-query';
import { memo, useState, useEffect } from 'react';
import { FloatingPagination } from '@/components/ui/floating-pagination';

interface ProductsGridProps {
    products: Product[];
    onEditProduct?: (product: Product) => void;
    onDeleteProduct?: (productId: number) => void;
    onUpdateProductStatus?: (productId: number, newStatus: string) => void;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

function ProductsGridComponent({
    products,
    onEditProduct,
    onDeleteProduct,
    onUpdateProductStatus,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
}: ProductsGridProps) {
    // Local pagination state if not provided by parent
    const [localCurrentPage, setLocalCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20); // Set to 20 items per page
    const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);

    // Handle parent-controlled or local pagination
    const isExternalPagination = !!onPageChange;
    const effectiveCurrentPage = isExternalPagination
        ? currentPage
        : localCurrentPage;
    const effectiveTotalPages = isExternalPagination
        ? totalPages
        : Math.max(1, Math.ceil(products.length / itemsPerPage));

    // Update paginated products when products array or page changes
    useEffect(() => {
        if (!isExternalPagination) {
            const startIndex = (localCurrentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            setPaginatedProducts(products.slice(startIndex, endIndex));
        } else {
            setPaginatedProducts(products);
        }
    }, [products, localCurrentPage, itemsPerPage, isExternalPagination]);

    // Handle page change
    const handlePageChange = (page: number) => {
        console.log(`Products grid: page change requested to ${page}`);
        if (isExternalPagination && onPageChange) {
            // Explicitly call the onPageChange passed from parent
            onPageChange(page);
        } else {
            setLocalCurrentPage(page);
        }
    };

    // Only show products if we have some
    const displayedProducts = isExternalPagination
        ? products
        : paginatedProducts;

    console.log(`Products grid: Showing page ${effectiveCurrentPage} of ${effectiveTotalPages}, ${displayedProducts.length} items`);

    return (
        <div className="relative flex-1 w-full overflow-hidden" id="inventory-table">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {displayedProducts?.map((product, index) => (
                    <ProductCard
                        key={product?.uid || index}
                        product={product}
                        onEdit={onEditProduct}
                        onDelete={onDeleteProduct}
                        onUpdateStatus={onUpdateProductStatus}
                        index={index}
                    />
                ))}
                {displayedProducts.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-sm font-normal uppercase border border-dashed rounded-md col-span-full border-border text-muted-foreground font-body animate-fade-in">
                        No products found
                    </div>
                )}
            </div>

            {/* Always show pagination regardless of number of items */}
            <FloatingPagination
                currentPage={effectiveCurrentPage}
                totalPages={effectiveTotalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export const ProductsGrid = memo(ProductsGridComponent);
