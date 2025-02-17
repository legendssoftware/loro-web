export type ProductStatus = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "ACTIVE";

export type Product = {
  uid: number;
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice: number;
  saleStart?: Date;
  saleEnd?: Date;
  discount: number;
  barcode: number;
  packageQuantity: number;
  brand: string;
  weight: number;
  status: "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK" | "ACTIVE";
  imageUrl?: string;
  isOnPromotion: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateProductDTO = Partial<Omit<Product, "uid" | "createdAt" | "updatedAt">>;

export type CreateProductDTO = Omit<Product, "uid" | "createdAt" | "updatedAt">;

export interface RequestConfig {
  headers: {
    token: string;
  };
} 