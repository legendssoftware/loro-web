export type ProductStatus =
    | 'active'
    | 'inactive'
    | 'hidden'
    | 'special'
    | 'new'
    | 'discontinued'
    | 'bestseller'
    | 'hotdeals'
    | 'outofstock';

export interface Product {
    uid: number;
    name: string;
    description: string;
    price: number | null;
    category: string;
    status: ProductStatus;
    imageUrl: string | null;
    sku: string;
    warehouseLocation: string | null;
    stockQuantity: number;
    productRef: string;
    reorderPoint: number;
    salePrice: number | null;
    discount: number | null;
    barcode: string | null;
    packageQuantity: number;
    brand: string | null;
    weight: string;
    isOnPromotion: boolean;
    packageDetails: string | null;
    promotionStartDate: string | null;
    promotionEndDate: string | null;
    packageUnit: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

export type UpdateProductDTO = Partial<Omit<Product, 'uid' | 'createdAt' | 'updatedAt'>>;

export type CreateProductDTO = Omit<Product, 'uid' | 'createdAt' | 'updatedAt'>;

export interface RequestConfig {
    headers: {
        token: string;
    };
}
