export interface Product {
    uid: number;
    name: string;
    description: string;
    code: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    status: string;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    sku?: string;
    stockQuantity?: number;
    warehouseLocation?: string;
    reorderPoint?: number;
    packageQuantity?: number;
    packageUnit?: string;
    packageDetails?: string;
    barcode?: string;
    weight?: number;
    isOnPromotion?: boolean;
    promotionStartDate?: Date;
    promotionEndDate?: Date;
}
