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

export type Product = {
    uid: number;
    name: string;
    description: string;
    price: number | null;
    category: string;
    status: string;
    imageUrl: string | null;
    sku: string;
    warehouseLocation: string | null;
    stockQuantity: number;
    productRef: string;
    reorderPoint: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    barcode: string;
    brand: string;
    weight: number;
    packageDetails: string;
    isOnPromotion: boolean;
    salePrice: number | null;
    promotionStartDate: Date | null;
    promotionEndDate: Date | null;
    discount: number | null;
    packageQuantity: number;
    packageUnit: string;
};

export type UpdateProductDTO = Partial<Omit<Product, 'uid' | 'createdAt' | 'updatedAt'>>;

export type CreateProductDTO = Omit<Product, 'uid' | 'createdAt' | 'updatedAt'>;

export interface RequestConfig {
    headers: {
        token: string;
    };
}
