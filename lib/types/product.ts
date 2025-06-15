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
    // Enhanced product fields
    itemsPerPack?: number;
    packsPerPallet?: number;
    packPrice?: number;
    palletPrice?: number;
    packWeight?: number;
    palletWeight?: number;
    dimensions?: string;
    packDimensions?: string;
    palletDimensions?: string;
    manufacturer?: string;
    model?: string;
    color?: string;
    material?: string;
    warrantyPeriod?: number;
    warrantyUnit?: string;
    specifications?: string;
    features?: string;
    rating?: number;
    reviewCount?: number;
    origin?: string;
    isFragile?: boolean;
    requiresSpecialHandling?: boolean;
    storageConditions?: string;
    minimumOrderQuantity?: number;
    bulkDiscountPercentage?: number;
    bulkDiscountMinQty?: number;
    brand?: string;
}
