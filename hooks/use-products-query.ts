import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { useProductApi } from './use-product-api';

// Product status enum matching the server's enum
export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    HIDDEN = 'hidden',
    SPECIAL = 'special',
    NEW = 'new',
    DISCONTINUED = 'discontinued',
    BEST_SELLER = 'bestseller',
    HOTDEALS = 'hotdeals',
    OUTOFSTOCK = 'outofstock',
    DELETED = 'deleted',
}

// Complete Product interface
export interface Product {
    uid: number;
    name: string;
    description?: string;
    code?: string;
    category?: string;
    imageUrl?: string;
    price?: number;
    salePrice?: number;
    discount?: number;
    quantity?: number;
    isOnPromotion?: boolean;
    stockQuantity?: number;
    reorderPoint?: number;
    sku?: string;
    barcode?: string;
    warehouseLocation?: string;
    packageUnit?: string;
    status: ProductStatus;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
    packageQuantity?: number;
    packageDetails?: string;
    weight?: number;
    promotionStartDate?: Date;
    promotionEndDate?: Date;
}

// Product filter params interface
export interface ProductFilterParams {
    limit?: number;
    page?: number;
    search?: string;
    status?: ProductStatus;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onPromotion?: boolean;
    from?: string; // Date range start
    to?: string; // Date range end
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

// Products by status interface
export interface ProductsByStatus {
    [ProductStatus.NEW]: Product[];
    [ProductStatus.ACTIVE]: Product[];
    [ProductStatus.INACTIVE]: Product[];
    [ProductStatus.OUTOFSTOCK]: Product[];
    [ProductStatus.DISCONTINUED]: Product[];
    [ProductStatus.BEST_SELLER]: Product[];
    [ProductStatus.HOTDEALS]: Product[];
    [ProductStatus.SPECIAL]: Product[];
    [ProductStatus.HIDDEN]: Product[];
    [ProductStatus.DELETED]: Product[];
    [key: string]: Product[]; // Add index signature for dynamic access
}

// API response interface
interface ProductsApiResponse {
    data: Product[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

/**
 * Hook for querying products with pagination and filtering
 */
export function useProductsQuery(options: ProductFilterParams = {}) {
    const productApi = useProductApi();
    const queryClient = useQueryClient();

    // Build the query key based on filter options
    const queryKey = useMemo(() => {
        return ['products', options];
    }, [options]);

    // Fetch products using the API
    const productsQuery = useQuery({
        queryKey,
        queryFn: () => productApi.getProducts(options),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Extract pagination metadata from the response
    const paginationMeta = useMemo(() => {
        if (!productsQuery.data?.meta) {
            return {
                total: 0,
                page: 1,
                limit: options.limit || 20,
                totalPages: 1,
            };
        }

        return {
            total: productsQuery.data.meta.total,
            page: productsQuery.data.meta.page,
            limit: productsQuery.data.meta.limit,
            totalPages: productsQuery.data.meta.totalPages,
        };
    }, [productsQuery.data?.meta, options.limit]);

    // Separate products by status
    const productsByStatus = useMemo<ProductsByStatus>(() => {
        if (!productsQuery.data?.data) {
            return {
                [ProductStatus.NEW]: [],
                [ProductStatus.ACTIVE]: [],
                [ProductStatus.INACTIVE]: [],
                [ProductStatus.OUTOFSTOCK]: [],
                [ProductStatus.DISCONTINUED]: [],
                [ProductStatus.BEST_SELLER]: [],
                [ProductStatus.HOTDEALS]: [],
                [ProductStatus.SPECIAL]: [],
                [ProductStatus.HIDDEN]: [],
                [ProductStatus.DELETED]: [],
            };
        }

        return productsQuery.data.data.reduce<ProductsByStatus>(
            (acc, product) => {
                const status = product.status || ProductStatus.NEW;
                if (!acc[status]) {
                    acc[status] = [];
                }
                acc[status].push(product as Product);
                return acc;
            },
            {
                [ProductStatus.NEW]: [],
                [ProductStatus.ACTIVE]: [],
                [ProductStatus.INACTIVE]: [],
                [ProductStatus.OUTOFSTOCK]: [],
                [ProductStatus.DISCONTINUED]: [],
                [ProductStatus.BEST_SELLER]: [],
                [ProductStatus.HOTDEALS]: [],
                [ProductStatus.SPECIAL]: [],
                [ProductStatus.HIDDEN]: [],
                [ProductStatus.DELETED]: [],
            },
        );
    }, [productsQuery.data?.data]);

    // Create product mutation
    const createProductMutation = useMutation({
        mutationFn: async (productData: Partial<Product>) => {
            try {
                const result = await productApi.createProduct(productData);
                showSuccessToast('Product created successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast(
                    'Failed to create product. Please try again.',
                    toast,
                );
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    // Update product mutation
    const updateProductMutation = useMutation({
        mutationFn: async ({
            productId,
            product,
        }: {
            productId: number;
            product: Partial<Product>;
        }) => {
            try {
                const result = await productApi.updateProduct(
                    productId,
                    product,
                );
                showSuccessToast('Product updated successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast(
                    'Failed to update product. Please try again.',
                    toast,
                );
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    // Delete product mutation
    const deleteProductMutation = useMutation({
        mutationFn: async (productId: number) => {
            try {
                await productApi.deleteProduct(productId);
                showSuccessToast('Product deleted successfully.', toast);
            } catch (error) {
                showErrorToast(
                    'Failed to delete product. Please try again.',
                    toast,
                );
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    // Update product status mutation
    const updateProductStatusMutation = useMutation({
        mutationFn: async ({
            productId,
            status,
        }: {
            productId: number;
            status: string;
        }) => {
            try {
                const result = await productApi.updateProductStatus(
                    productId,
                    status,
                );
                showSuccessToast('Product status updated successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast(
                    'Failed to update product status. Please try again.',
                    toast,
                );
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    // Create a product
    const createProduct = useCallback(
        (product: Partial<Product>) => {
            return createProductMutation.mutate(product);
        },
        [createProductMutation],
    );

    // Update a product
    const updateProduct = useCallback(
        (productId: number, product: Partial<Product>) => {
            return updateProductMutation.mutate({ productId, product });
        },
        [updateProductMutation],
    );

    // Delete a product
    const deleteProduct = useCallback(
        (productId: number) => {
            return deleteProductMutation.mutate(productId);
        },
        [deleteProductMutation],
    );

    // Update product status
    const updateProductStatus = useCallback(
        (productId: number, status: string) => {
            return updateProductStatusMutation.mutate({ productId, status });
        },
        [updateProductStatusMutation],
    );

    return {
        data: productsQuery.data?.data || [],
        meta: paginationMeta,
        productsByStatus,
        isLoading: productsQuery.isLoading,
        isError: productsQuery.isError,
        error: productsQuery.error,
        refetch: productsQuery.refetch,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductStatus,
    };
}
