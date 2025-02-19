import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Product, UpdateProductDTO } from "@/lib/types/products";
import { EditInventoryForm } from "./edit-inventory-form";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { useState } from "react";
import Image from "next/image";

interface InventoryDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  onDelete: (uid: number) => void;
  onUpdate: (ref: number, data: UpdateProductDTO) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const InventoryDetailModal = ({
  isOpen,
  onOpenChange,
  selectedProduct,
  onDelete,
  onUpdate,
  isUpdating,
  isDeleting,
}: InventoryDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!selectedProduct) return null;

  const handleUpdate = (data: UpdateProductDTO) => {
    onUpdate(selectedProduct.uid, data);
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-medium font-heading line-clamp-1">
                {selectedProduct?.name}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selectedProduct?.status === "active"
                    ? "success"
                    : selectedProduct?.status === "outofstock"
                    ? "destructive"
                    : selectedProduct?.status === "inactive"
                    ? "secondary"
                    : selectedProduct?.status === "hotdeals" || selectedProduct?.status === "bestseller"
                    ? "warning"
                    : "outline"
                }
                className="text-[10px] font-normal uppercase font-body"
              >
                {selectedProduct?.status}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] font-normal uppercase font-body"
              >
                {selectedProduct?.category}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {isEditing ? (
          <EditInventoryForm
            product={selectedProduct}
            isSubmitting={isUpdating}
            onSubmit={handleUpdate}
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="relative w-full h-64 overflow-hidden rounded-lg">
              <Image
                src={selectedProduct?.imageUrl || "/placeholder.png"}
                alt={selectedProduct?.name}
                fill
                className="object-contain"
              />
              {selectedProduct?.isOnPromotion && (
                <Badge
                  variant="destructive"
                  className="absolute top-2 right-2 text-[10px] font-normal uppercase font-body"
                >
                  {selectedProduct?.discount}% OFF
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                  Description
                </h4>
                <p className="text-sm font-body">
                  {selectedProduct?.description}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                  Pricing & Promotion
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-medium font-heading">
                      {selectedProduct?.isOnPromotion ? (
                        <>
                          <span className="text-destructive">
                            {formatCurrency(selectedProduct?.salePrice || 0)}
                          </span>
                          <span className="ml-2 text-base line-through text-muted-foreground">
                            {formatCurrency(selectedProduct?.price || 0)}
                          </span>
                        </>
                      ) : (
                        formatCurrency(selectedProduct?.price || 0)
                      )}
                    </p>
                    {selectedProduct?.isOnPromotion && (
                      <Badge variant="destructive" className="text-[10px] font-normal uppercase font-body">
                        {selectedProduct?.discount}% OFF
                      </Badge>
                    )}
                  </div>
                  {selectedProduct?.isOnPromotion && (
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] text-muted-foreground font-body uppercase">
                        Promotion Period
                      </p>
                      <div className="flex items-center gap-2 text-sm font-body">
                        <span>
                          {selectedProduct?.promotionStartDate ? 
                            new Date(selectedProduct.promotionStartDate).toLocaleDateString() 
                            : 'Not set'}
                        </span>
                        <span>-</span>
                        <span>
                          {selectedProduct?.promotionEndDate ? 
                            new Date(selectedProduct.promotionEndDate).toLocaleDateString() 
                            : 'Not set'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                    Product Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">SKU</p>
                      <p className="font-mono text-sm">{selectedProduct?.sku}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Product Ref</p>
                      <p className="font-mono text-sm">{selectedProduct?.productRef}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Barcode</p>
                      <p className="font-mono text-sm">{selectedProduct?.barcode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Brand</p>
                      <p className="text-sm font-body">{selectedProduct?.brand}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                    Package Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Weight</p>
                      <p className="text-sm font-body">{selectedProduct?.weight}g</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Package Details</p>
                      <p className="text-sm font-body">{selectedProduct?.packageDetails || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                    Stock Information
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Current Stock</p>
                      <p className="text-sm font-body">{selectedProduct?.stockQuantity} units</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Reorder Point</p>
                      <p className="text-sm font-body">{selectedProduct?.reorderPoint} units</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Location</p>
                      <p className="text-sm font-body">{selectedProduct?.warehouseLocation || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Package Quantity</p>
                      <p className="text-sm font-body">{selectedProduct?.packageQuantity} per pack</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h4 className="text-xs font-normal uppercase text-muted-foreground font-body">
                    Timestamps
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Created</p>
                      <p className="text-sm font-body">
                        {new Date(selectedProduct?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-body uppercase">Last Updated</p>
                      <p className="text-sm font-body">
                        {new Date(selectedProduct?.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full gap-4 pt-4 mt-4 border-t">
              <Button
                variant="default"
                className="flex-1 text-[10px] font-normal text-white uppercase font-body bg-[#8B5CF6] hover:bg-[#7C3AED]"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating}
              >
                Update Product
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1 text-[10px] font-normal text-white uppercase font-body bg-[#EF4444] hover:bg-[#DC2626]"
                    disabled={isDeleting}
                  >
                    Delete Product
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-normal uppercase text-md font-body" >Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-[10px] font-normal uppercase font-body">
                      This action cannot be undone. This will permanently delete
                      the product and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs font-normal uppercase font-body">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="text-[10px] font-normal text-white uppercase bg-destructive font-body hover:bg-destructive/90"
                      onClick={() => onDelete(selectedProduct.uid)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
