'use client';

import { useState } from 'react';
import { ProductsHeader } from './products-header';
import { ProductsTabGroup } from './products-tab-group';
import { ProductsTabContent } from './products-tab-content';
import { useProductsQuery, ProductFilterParams, ProductStatus, Product } from '@/hooks/use-products-query';

// Utility function to safely convert products
const ensureCorrectProductType = (products: any[]): Product[] => {
    return products || [];
};

export function InventoryPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFilters] = useState<ProductFilterParams>({});
    const {
        data: productsData,
        meta,
        productsByStatus,
        isLoading,
        isError,
        error,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductStatus,
        refetch
    } = useProductsQuery(filters);

    // Ensure products are correctly typed
    const products = ensureCorrectProductType(productsData);

    // Handle applying filters
    const handleApplyFilters = (newFilters: ProductFilterParams) => {
        setFilters(newFilters);
    };

    // Handle clearing filters
    const handleClearFilters = () => {
        setFilters({});
    };

    // Handle adding a new product
    const handleAddProduct = () => {
        // This would open a modal to add a new product
        console.log('Add product clicked');
    };

    // Handle editing a product
    const handleEditProduct = (product: Product) => {
        console.log('Edit product', product);
    };

    // Handle deleting a product
    const handleDeleteProduct = (productId: number) => {
        deleteProduct(productId);
    };

    // Handle updating a product's status
    const handleUpdateProductStatus = (productId: number, newStatus: string) => {
        updateProductStatus(productId, newStatus);
    };

    // Handle page change for pagination
    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    // Calculate product counts for each status
    const counts = {
        all: products?.length || 0,
        [ProductStatus.ACTIVE]: productsByStatus?.[ProductStatus.ACTIVE]?.length || 0,
        [ProductStatus.INACTIVE]: productsByStatus?.[ProductStatus.INACTIVE]?.length || 0,
        [ProductStatus.OUTOFSTOCK]: productsByStatus?.[ProductStatus.OUTOFSTOCK]?.length || 0,
        [ProductStatus.NEW]: productsByStatus?.[ProductStatus.NEW]?.length || 0,
        [ProductStatus.DISCONTINUED]: productsByStatus?.[ProductStatus.DISCONTINUED]?.length || 0,
        promotion: products?.filter(product => product.isOnPromotion)?.length || 0,
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <ProductsHeader
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    onAddProduct={handleAddProduct}
                />
            </div>

            <ProductsTabGroup
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={counts}
            />

            <ProductsTabContent
                products={products}
                productsByStatus={productsByStatus || {}}
                activeTab={activeTab}
                isLoading={isLoading}
                error={isError ? new Error('Failed to load products') : null}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateProductStatus={handleUpdateProductStatus}
                currentPage={meta?.page || 1}
                totalPages={meta?.totalPages || 1}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
