'use client';

import { memo } from 'react';
import { ProductsGrid } from './products-grid';
import { Product } from '@/hooks/use-products-query';
import { Kanban } from '@/components/placeholders/kanban-placeholder';
import { BarChart } from '@/components/placeholders/chart-placeholder';
import { PieChart } from '@/components/placeholders/chart-placeholder';
import { AppHoneycombLoader } from '@/components/loaders/honeycomb-loader';

interface ProductsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    products: Product[];
    productsByStatus: Record<string, Product[]>;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (productId: number) => void;
    onUpdateProductStatus: (productId: number, newStatus: string) => void;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

// Main Grid content component
const GridContent = memo(
    ({
        products,
        onEditProduct,
        onDeleteProduct,
        onUpdateProductStatus,
        pagination,
    }: {
        products: Product[];
        onEditProduct: (product: Product) => void;
        onDeleteProduct: (productId: number) => void;
        onUpdateProductStatus: (productId: number, newStatus: string) => void;
        pagination?: {
            currentPage: number;
            totalPages: number;
            onPageChange: (page: number) => void;
        };
    }) => {
        return (
            <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex-1 w-full overflow-hidden">
                    <ProductsGrid
                        products={products}
                        onEditProduct={onEditProduct}
                        onDeleteProduct={onDeleteProduct}
                        onUpdateProductStatus={onUpdateProductStatus}
                        currentPage={pagination?.currentPage}
                        totalPages={pagination?.totalPages}
                        onPageChange={pagination?.onPageChange}
                    />
                </div>
            </div>
        );
    },
);

GridContent.displayName = 'GridContent';

// Kanban content
const KanbanContent = memo(() => {
    return (
        <div className="h-full overflow-hidden">
            <Kanban
                title="Inventory Reports"
                subtitle="Organize products by status"
            />
        </div>
    );
});

KanbanContent.displayName = 'KanbanContent';

// Chart content
const ChartContent = memo(() => {
    return (
        <div className="w-full h-full overflow-hidden">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="p-4 bg-card rounded-xl">
                    <BarChart title="Product Categories" />
                </div>
                <div className="p-4 bg-card rounded-xl">
                    <PieChart title="Product Status Distribution" />
                </div>
            </div>
        </div>
    );
});

ChartContent.displayName = 'ChartContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <AppHoneycombLoader size="sm" />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(() => {
    return (
        <div className="py-12 text-center">
            <p className="text-xs font-normal uppercase text-destructive font-body">
                Failed to load products. Please try again.
            </p>
        </div>
    );
});

ErrorContent.displayName = 'ErrorContent';

// Main component that switches between tab contents
export function ProductsTabContent({
    activeTab,
    isLoading,
    error,
    products,
    onEditProduct,
    onDeleteProduct,
    onUpdateProductStatus,
    currentPage,
    totalPages,
    onPageChange,
}: ProductsTabContentProps) {
    if (isLoading) {
        return <LoadingContent />;
    }

    if (error) {
        return <ErrorContent />;
    }

    // Set up pagination - ensure it's properly structured
    const pagination = {
        currentPage: Math.max(1, currentPage || 1),
        totalPages: Math.max(1, totalPages || 1),
        onPageChange: onPageChange || (() => {}),
    };

    // Filter products based on active tab
    const displayProducts = products;

    switch (activeTab) {
        case 'grid':
            return (
                <GridContent
                    products={displayProducts}
                    onEditProduct={onEditProduct}
                    onDeleteProduct={onDeleteProduct}
                    onUpdateProductStatus={onUpdateProductStatus}
                    pagination={pagination}
                />
            );
        case 'kanban':
            return <KanbanContent />;
        case 'chart':
            return <ChartContent />;
        default:
            return (
                <GridContent
                    products={displayProducts}
                    onEditProduct={onEditProduct}
                    onDeleteProduct={onDeleteProduct}
                    onUpdateProductStatus={onUpdateProductStatus}
                    pagination={pagination}
                />
            );
    }
}
