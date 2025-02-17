import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import Image from "next/image";

interface InventoryCardProps {
  product: {
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
  onClick: () => void;
}

export const InventoryCard = memo(
  ({ product, onClick }: InventoryCardProps) => {
    return (
      <Card
        className="relative overflow-hidden transition-all border cursor-pointer hover:shadow-md hover:border-primary/20"
        onClick={onClick}
      >
        <div className="absolute top-2 right-2">
          <Badge
            variant={
              product.status.toUpperCase() === "ACTIVE"
                ? "success"
                : "destructive"
            }
            className="text-[10px] font-normal uppercase font-body"
          >
            {product.status}
          </Badge>
        </div>
        <div className="relative w-full h-40">
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-contain"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium line-clamp-1 font-heading">
                  {product?.name}
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  {product?.description}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium font-heading">
                  {product.price ? formatCurrency(product.price) : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

InventoryCard.displayName = "InventoryCard";
