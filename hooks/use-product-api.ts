import { useCallback } from 'react';
import { axiosInstance } from '@/lib/services/api-client';
import { ProductFilterParams } from './use-products-query';
import { Product } from '@/lib/types/product';

interface PaginatedProductsResponse {
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
 * A hook that provides product API methods
 * Relies on axios interceptors for token handling
 */
export const useProductApi = () => {
    // Get products with pagination and filtering
    const getProducts = useCallback(
        async (
            filters: ProductFilterParams = {},
        ): Promise<PaginatedProductsResponse> => {
            try {
                const queryParams = new URLSearchParams();

                // Map frontend filter parameters to backend expectations
                if (filters.status)
                    queryParams.append('status', filters.status);
                if (filters.category)
                    queryParams.append('category', filters.category);
                if (filters.search)
                    queryParams.append('search', filters.search);
                if (filters.minPrice)
                    queryParams.append('minPrice', String(filters.minPrice));
                if (filters.maxPrice)
                    queryParams.append('maxPrice', String(filters.maxPrice));
                if (filters.inStock !== undefined)
                    queryParams.append('inStock', String(filters.inStock));
                if (filters.onPromotion !== undefined)
                    queryParams.append('onPromotion', String(filters.onPromotion));

                // The backend expects these specific parameter names based on the controller
                // Always ensure page and limit are included, even if they're default values
                queryParams.append('page', String(filters.page || 1));
                queryParams.append('limit', String(filters.limit || 20));

                console.log(
                    `API call: Fetching products with params: ${queryParams.toString()}`,
                );

                const response = await axiosInstance.get(
                    `/products?${queryParams.toString()}`,
                );

                console.log(`API response meta: ${JSON.stringify(response.data.meta)}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching products:', error);
                throw error;
            }
        },
        [],
    );

    // Get a single product by ID
    const getProductById = useCallback(async (productId: number): Promise<Product> => {
        try {
            const response = await axiosInstance.get(`/products/${productId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            throw error;
        }
    }, []);

    // Create a new product
    const createProduct = useCallback(
        async (productData: Partial<Product>): Promise<Product> => {
            try {
                const response = await axiosInstance.post('/products', productData);
                return response.data.data;
            } catch (error) {
                console.error('Error creating product:', error);
                throw error;
            }
        },
        [],
    );

    // Update a product
    const updateProduct = useCallback(
        async (productId: number, productData: Partial<Product>): Promise<Product> => {
            try {
                const response = await axiosInstance.patch(
                    `/products/${productId}`,
                    productData,
                );
                return response.data.data;
            } catch (error) {
                console.error(`Error updating product ${productId}:`, error);
                throw error;
            }
        },
        [],
    );

    // Delete a product
    const deleteProduct = useCallback(
        async (productId: number): Promise<void> => {
            try {
                await axiosInstance.delete(`/products/${productId}`);
            } catch (error) {
                console.error(`Error deleting product ${productId}:`, error);
                throw error;
            }
        },
        [],
    );

    // Update product status
    const updateProductStatus = useCallback(
        async (
            productId: number,
            status: string,
        ): Promise<Product> => {
            try {
                const response = await axiosInstance.patch(
                    `/products/${productId}/status`,
                    { status },
                );
                return response.data.data;
            } catch (error) {
                console.error(
                    `Error updating product ${productId} status:`,
                    error,
                );
                throw error;
            }
        },
        [],
    );

    return {
        getProducts,
        getProductById,
        createProduct,
        updateProduct,
        deleteProduct,
        updateProductStatus,
    };
};
