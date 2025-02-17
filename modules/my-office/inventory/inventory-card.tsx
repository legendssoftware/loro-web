import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin } from "lucide-react";
import { Product } from "@/lib/types/products";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils/format";

interface InventoryCardProps {
  product: Product; 
  onClick: () => void;
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const InventoryCardComponent = ({ product, onClick }: InventoryCardProps) => {
  return (
    <motion.div variants={itemVariants}>
      <Card
        onClick={onClick}
        className="relative flex flex-col gap-4 p-4 transition-all duration-300 cursor-pointer hover:shadow-md bg-card"
      >
        {product.imageUrl && (
          <div className="relative w-full h-32 overflow-hidden rounded-md">
            <Image
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full"
              fill
            />
          </div>
        )}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} strokeWidth={1.5} className="text-primary" />
            <h3 className="text-sm font-medium font-heading">{product.name}</h3>
          </div>
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
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground font-body">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className="text-[10px] font-normal uppercase font-body"
            >
              {product.category}
            </Badge>
            <p className="text-sm font-medium text-primary font-heading">
              {formatCurrency(product.price)}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-body">
              Stock: {product.stockQuantity}
              {product.reorderPoint && ` (Min: ${product.reorderPoint})`}
            </p>
            <p className="text-xs text-muted-foreground font-body">
              SKU: {product.sku}
            </p>
          </div>
          {product.warehouseLocation && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground font-body">
                {product.warehouseLocation}
              </p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export const InventoryCard = memo(InventoryCardComponent); 