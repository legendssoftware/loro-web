'use client';

import { useState } from 'react';
import { PageTransition } from '@/components/animations/page-transition';
import { ProductsHeaderWithDialog } from '@/modules/inventory/components/products-header-with-dialog';
import {
    useProductsQuery,
    ProductFilterParams,
    Product,
} from '@/hooks/use-products-query';
import { UsersTabGroup } from '@/modules/users/components/users-tab-group';
import { ProductsTabContent } from '@/modules/inventory/components/products-tab-content';
import { ProductFormValues } from '@/modules/inventory/components/product-form';

// Utility function to safely convert products
const ensureCorrectProductType = (products: any[]): Product[] => {
    return products || [];
};

// Tab configuration, similar to users
const tabs = [
    { id: 'grid', label: 'Inventory' },
    { id: 'kanban', label: 'Reports' },
    { id: 'chart', label: 'Analytics' },
];

export default function InventoryWithDialogPage() {
    const [activeTab, setActiveTab] = useState<string>('grid');
    const [filters, setFilters] = useState<ProductFilterParams>({
        page: 1,
        limit: 20,
    });

    const {
        data: productsData,
        meta,
        productsByStatus,
        isLoading,
        isError,
        error,
        createProduct,
        deleteProduct,
        updateProductStatus,
    } = useProductsQuery(filters);

    // Ensure products are correctly typed
    const products = ensureCorrectProductType(productsData);

    // Handle applying filters
    const handleApplyFilters = (newFilters: ProductFilterParams) => {
        console.log('Applying filters:', newFilters);
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            page: 1,
            limit: 20,
        }));
    };

    // Handle clearing filters
    const handleClearFilters = () => {
        console.log('Clearing all filters');
        setFilters({
            page: 1,
            limit: 20,
        });
    };

    // Handle submitting a new product
    const handleSubmitCreateProduct = async (productData: ProductFormValues) => {
        await createProduct(productData);
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
    const handleUpdateProductStatus = (
        productId: number,
        newStatus: string,
    ) => {
        updateProductStatus(productId, newStatus);
    };

    // Handle page change for pagination
    const handlePageChange = (page: number) => {
        console.log(`Changing to page ${page}`);
        setFilters((prev) => ({ ...prev, page }));
    };

    return (
        <PageTransition>
            <div className="flex flex-col h-screen gap-2 overflow-hidden">
                <UsersTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center justify-end px-2">
                        {/* Using our ProductsHeaderWithDialog component */}
                        <ProductsHeaderWithDialog
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={handleClearFilters}
                            onCreateProduct={handleSubmitCreateProduct}
                        />
                    </div>
                    <div className="flex items-center justify-center flex-1 px-3 py-3 overflow-hidden xl:px-8 xl:px-4">
                        <ProductsTabContent
                            products={products}
                            productsByStatus={productsByStatus || {}}
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={
                                isError
                                    ? new Error('Failed to load products')
                                    : null
                            }
                            onEditProduct={handleEditProduct}
                            onDeleteProduct={handleDeleteProduct}
                            onUpdateProductStatus={handleUpdateProductStatus}
                            currentPage={meta?.page || 1}
                            totalPages={meta?.totalPages || 1}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
