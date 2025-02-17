export type ProductStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "ACTIVE";

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
};

export type UpdateProductDTO = Partial<Omit<Product, "uid" | "createdAt" | "updatedAt">>;

export type CreateProductDTO = Omit<Product, "uid" | "createdAt" | "updatedAt">;

export interface RequestConfig {
  headers: {
    token: string;
  };
} 