import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { Product } from "@/lib/types/products";
import Image from "next/image";

interface InventoryCardProps {
  product: Product;
  onClick: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const InventoryCard = memo(({ product, onClick }: InventoryCardProps) => {
  console.log(product, 'map this product')
  return (
    <motion.div variants={itemVariants}>
      <Card
        className="overflow-hidden transition-all cursor-pointer hover:shadow-md"
        onClick={onClick}
      >
        <div className="relative w-full h-48">
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.isOnPromotion && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 text-[10px] font-normal uppercase font-body"
            >
              {product.discount}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium line-clamp-1 font-heading">
                  {product.name}
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  {product.brand}
                </p>
              </div>
              <div className="flex flex-col items-end">
                {product.isOnPromotion ? (
                  <>
                    <span className="text-sm font-medium text-destructive font-heading">
                      {formatCurrency(product.salePrice)}
                    </span>
                    <span className="text-xs line-through text-muted-foreground font-body">
                      {formatCurrency(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium font-heading">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  product.status === "AVAILABLE"
                    ? "success"
                    : product.status === "LOW_STOCK"
                    ? "warning"
                    : "destructive"
                }
                className="text-[10px] font-normal uppercase font-body"
              >
                {product.status}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] font-normal uppercase font-body"
              >
                {product.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
              <span>Stock: {product.packageQuantity}</span>
              <span>Weight: {product.weight}g</span>
            </div>
            {product.isOnPromotion && (
              <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
                <span>Sale ends: {new Date(product.saleEnd!).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

InventoryCard.displayName = "InventoryCard";
