'use client';

import { useState } from 'react';
import { PageTransition } from '@/components/animations/page-transition';
import { ProductsHeader } from '@/modules/inventory/components/products-header';
import {
    useProductsQuery,
    ProductFilterParams,
    Product,
} from '@/hooks/use-products-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { UsersTabGroup } from '@/modules/users/components/users-tab-group';
import { ProductsTabContent } from '@/modules/inventory/components/products-tab-content';

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

// Create Product Modal Component
function CreateProductModal({
    isOpen,
    onClose,
    onCreateProduct,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateProduct?: (productData: any) => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-thin uppercase font-body"></DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center h-64">
                    <h2 className="text-xs font-thin uppercase font-body">
                        Activating Soon
                    </h2>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function InventoryPage() {
    const [activeTab, setActiveTab] = useState<string>('grid');
    const [filters, setFilters] = useState<ProductFilterParams>({
        page: 1,
        limit: 20,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

    // Handle adding a new product
    const handleAddProduct = () => {
        setIsCreateDialogOpen(true);
    };

    // Handle submitting a new product
    const handleSubmitCreateProduct = async (productData: any) => {
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
                        <ProductsHeader
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={handleClearFilters}
                            onAddProduct={handleAddProduct}
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

            {/* Render the CreateProductModal */}
            <CreateProductModal
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreateProduct={handleSubmitCreateProduct}
            />
        </PageTransition>
    );
}
