export type ProductStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Product {
  uid: number;
  name: string;
  description: string;
  category: string;
  price: number;
  status: ProductStatus;
  imageUrl?: string;
  sku: string;
  warehouseLocation?: string;
  stockQuantity: number;
  productReferenceCode: string;
  reorderPoint?: number;
  reseller: { uid: number };
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  status?: ProductStatus;
  imageUrl?: string;
  sku?: string;
  warehouseLocation?: string;
  stockQuantity?: number;
  productReferenceCode: string;
  reorderPoint?: number;
  reseller: { uid: number };
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  status?: ProductStatus;
  imageUrl?: string;
  sku?: string;
  warehouseLocation?: string;
  stockQuantity?: number;
  productReferenceCode?: string;
  reorderPoint?: number;
  reseller?: { uid: number };
  isDeleted?: boolean;
}

export interface RequestConfig {
  headers: {
    token: string;
  };
} 