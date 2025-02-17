import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Edit, X } from "lucide-react";
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
                {selectedProduct.name}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selectedProduct.status === "AVAILABLE"
                    ? "success"
                    : selectedProduct.status === "LOW_STOCK"
                    ? "warning"
                    : "destructive"
                }
                className="text-[10px] font-normal uppercase font-body"
              >
                {selectedProduct.status}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] font-normal uppercase font-body"
              >
                {selectedProduct.category}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="w-6 h-6"
              >
                <X className="w-4 h-4" />
              </Button>
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
                src={selectedProduct.imageUrl || "/placeholder.png"}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
              {selectedProduct.isOnPromotion && (
                <Badge
                  variant="destructive"
                  className="absolute top-2 right-2 text-[10px] font-normal uppercase font-body"
                >
                  {selectedProduct.discount}% OFF
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-normal text-muted-foreground uppercase font-body">Description</h4>
                  <p className="text-sm font-body">{selectedProduct.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-normal text-muted-foreground uppercase font-body">Brand</h4>
                  <p className="text-sm font-body">{selectedProduct.brand}</p>
                </div>
                <div>
                  <h4 className="text-xs font-normal text-muted-foreground uppercase font-body">Package Details</h4>
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-body">Weight: {selectedProduct.weight}g</p>
                    <p className="text-sm font-body">Quantity: {selectedProduct.packageQuantity}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-xs font-normal text-muted-foreground uppercase font-body">Pricing</h4>
                  <div className="flex flex-col">
                    <p className="text-lg font-medium font-heading">
                      {selectedProduct.isOnPromotion ? (
                        <>
                          <span className="text-destructive">{formatCurrency(selectedProduct.salePrice)}</span>
                          <span className="ml-2 text-sm line-through text-muted-foreground">
                            {formatCurrency(selectedProduct.price)}
                          </span>
                        </>
                      ) : (
                        formatCurrency(selectedProduct.price)
                      )}
                    </p>
                    {selectedProduct.isOnPromotion && (
                      <p className="text-sm text-muted-foreground font-body">
                        Sale ends: {new Date(selectedProduct.saleEnd!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-normal text-muted-foreground uppercase font-body">Barcode</h4>
                  <p className="text-sm font-mono">{selectedProduct.barcode}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="text-xs font-normal uppercase font-body"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the
                      product and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="text-xs font-normal uppercase font-body">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="text-xs font-normal text-white uppercase bg-destructive font-body hover:bg-destructive/90"
                      onClick={() => onDelete(selectedProduct.uid)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="default"
                size="sm"
                className="text-xs font-normal text-white uppercase font-body bg-primary hover:bg-primary/90"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
