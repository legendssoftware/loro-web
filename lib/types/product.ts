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
}
