import { CreateProductDTO, RequestConfig, UpdateProductDTO } from '@/lib/types/products';

export const fetchProducts = async (config: RequestConfig, page: number = 1, limit: number = 20) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.headers.token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }

    return response.json();
};

export const createProduct = async (data: CreateProductDTO, config: RequestConfig) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.headers.token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to create product');
    }

    return response.json();
};

export const updateProduct = async ({
    ref,
    updatedProduct,
    config,
}: {
    ref: number;
    updatedProduct: UpdateProductDTO;
    config: RequestConfig;
}) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${ref}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.headers.token}`,
        },
        body: JSON.stringify(updatedProduct),
    });

    if (!response.ok) {
        throw new Error('Failed to update product');
    }

    return response.json();
};

export const deleteProduct = async (ref: number, config: RequestConfig) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${ref}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.headers.token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to delete product');
    }

    return response.json();
};
