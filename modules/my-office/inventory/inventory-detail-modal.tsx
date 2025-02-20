import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { Product, UpdateProductDTO } from '@/lib/types/products';
import { EditInventoryForm } from './edit-inventory-form';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';
import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';

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
    const [pendingUpdate, setPendingUpdate] = useState<UpdateProductDTO | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const handleClose = () => {
        if (!isUpdating && !isDeleting) {
            setIsEditing(false);
            setPendingUpdate(null);
            onOpenChange(false);
        }
    };

    const handleUpdate = (data: UpdateProductDTO) => {
        setPendingUpdate(data);
    };

    const handleDelete = (uid: number) => {
        if (!isDeleting) {
            onDelete(uid);
            setIsDeleteAlertOpen(false);
            onOpenChange(false);
        }
    };

    if (!selectedProduct) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
                <DialogHeader className='flex flex-row items-center justify-between pb-4 space-y-0'>
                    <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center gap-2'>
                            <DialogTitle className='text-lg font-medium font-heading line-clamp-1'>
                                {selectedProduct?.name}
                            </DialogTitle>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Badge
                                variant={
                                    selectedProduct?.status === 'active'
                                        ? 'success'
                                        : selectedProduct?.status === 'outofstock'
                                          ? 'destructive'
                                          : selectedProduct?.status === 'inactive'
                                            ? 'secondary'
                                            : selectedProduct?.status === 'hotdeals' ||
                                                selectedProduct?.status === 'bestseller'
                                              ? 'warning'
                                              : 'outline'
                                }
                                className='text-[10px] font-normal uppercase font-body'
                            >
                                {selectedProduct?.status}
                            </Badge>
                            <Badge variant='outline' className='text-[10px] font-normal uppercase font-body'>
                                {selectedProduct?.category}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                {isEditing ? (
                    <EditInventoryForm product={selectedProduct} onSubmit={handleUpdate} />
                ) : (
                    <div className='flex flex-col gap-6'>
                        <div className='relative w-full h-64 overflow-hidden rounded-lg'>
                            <Image
                                src={selectedProduct?.imageUrl || '/placeholder.png'}
                                alt={selectedProduct?.name}
                                fill
                                className='object-contain'
                            />
                            {selectedProduct?.isOnPromotion && selectedProduct?.discount && (
                                <Badge
                                    variant='destructive'
                                    className='absolute top-2 right-2 text-[10px] font-normal uppercase font-body'
                                >
                                    {selectedProduct?.discount}% OFF
                                </Badge>
                            )}
                        </div>

                        <div className='flex flex-col gap-6'>
                            <div className='flex flex-col gap-1'>
                                <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Description
                                </h4>
                                <p className='text-sm font-body'>{selectedProduct?.description}</p>
                            </div>

                            <div className='flex flex-col gap-1'>
                                <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Pricing & Promotion
                                </h4>
                                <div className='flex flex-col gap-2'>
                                    <div className='flex items-baseline gap-2'>
                                        <p className='text-2xl font-medium font-heading'>
                                            {selectedProduct?.isOnPromotion && selectedProduct?.salePrice ? (
                                                <>
                                                    <span className='text-destructive'>
                                                        {formatCurrency(selectedProduct?.salePrice)}
                                                    </span>
                                                    <span className='ml-2 text-base line-through text-muted-foreground'>
                                                        {formatCurrency(selectedProduct?.price || 0)}
                                                    </span>
                                                </>
                                            ) : (
                                                formatCurrency(selectedProduct?.price || 0)
                                            )}
                                        </p>
                                        {selectedProduct?.isOnPromotion && selectedProduct?.discount && (
                                            <Badge
                                                variant='destructive'
                                                className='text-[10px] font-normal uppercase font-body'
                                            >
                                                {selectedProduct?.discount}% OFF
                                            </Badge>
                                        )}
                                    </div>
                                    {selectedProduct?.isOnPromotion && (
                                        <div className='flex flex-col gap-1'>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Promotion Period
                                            </p>
                                            <div className='flex items-center gap-2 text-sm font-body'>
                                                <span>
                                                    {selectedProduct?.promotionStartDate
                                                        ? format(new Date(selectedProduct.promotionStartDate), 'MMM dd, yyyy')
                                                        : 'Not set'}
                                                </span>
                                                <span>-</span>
                                                <span>
                                                    {selectedProduct?.promotionEndDate
                                                        ? format(new Date(selectedProduct.promotionEndDate), 'MMM dd, yyyy')
                                                        : 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                                <div className='flex flex-col gap-1'>
                                    <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        Product Details
                                    </h4>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                SKU
                                            </p>
                                            <p className='font-mono text-sm'>{selectedProduct?.sku || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Product Ref
                                            </p>
                                            <p className='font-mono text-sm'>{selectedProduct?.productRef || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Barcode
                                            </p>
                                            <p className='font-mono text-sm'>{selectedProduct?.barcode || 'Not set'}</p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Brand
                                            </p>
                                            <p className='text-sm font-body'>{selectedProduct?.brand || 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        Package Details
                                    </h4>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Weight
                                            </p>
                                            <p className='text-sm font-body'>{selectedProduct?.weight || '0'}g</p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Package Unit
                                            </p>
                                            <p className='text-sm font-body'>
                                                {selectedProduct?.packageUnit || 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Package Details
                                            </p>
                                            <p className='text-sm font-body'>
                                                {selectedProduct?.packageDetails || 'Not specified'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Package Quantity
                                            </p>
                                            <p className='text-sm font-body'>
                                                {selectedProduct?.packageQuantity || 0} per pack
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        Stock Information
                                    </h4>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Current Stock
                                            </p>
                                            <p className='text-sm font-body'>
                                                {selectedProduct?.stockQuantity || 0} units
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Reorder Point
                                            </p>
                                            <p className='text-sm font-body'>
                                                {selectedProduct?.reorderPoint || 0} units
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Warehouse
                                            </p>
                                            <p className='text-sm font-body'>
                                                {selectedProduct?.warehouseLocation || 'Not specified'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        Timestamps
                                    </h4>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Created
                                            </p>
                                            <p className='text-sm font-body'>
                                                {format(new Date(selectedProduct?.createdAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Last Updated
                                            </p>
                                            <p className='text-sm font-body'>
                                                {format(new Date(selectedProduct?.updatedAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center justify-between w-full gap-4 pt-4 mt-4 border-t'>
                            <div className='grid w-full grid-cols-2 gap-4'>
                                <Button
                                    variant='default'
                                    className='w-full text-[10px] font-normal text-white uppercase font-body bg-[#8B5CF6] hover:bg-[#7C3AED]'
                                    onClick={() => setIsEditing(true)}
                                >
                                    Update Product
                                </Button>
                                <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant='destructive'
                                            className='w-full text-[10px] font-normal text-white uppercase font-body'
                                        >
                                            Delete Product
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className='sm:max-w-[600px]'>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className='text-[14px] font-body uppercase font-normal'>
                                                Delete Product
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className='text-[10px] uppercase text-card-foreground font-body font-normal'>
                                                Are you sure you want to delete this product? This action cannot be
                                                undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <div className='grid w-full grid-cols-2 gap-4'>
                                                <AlertDialogCancel
                                                    className='w-full text-[10px] font-normal uppercase font-body'
                                                    disabled={isDeleting}
                                                >
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className='w-full text-[10px] font-normal text-white uppercase font-body'
                                                    onClick={() => handleDelete(selectedProduct.uid)}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? (
                                                        <div className='flex items-center justify-center w-full gap-2'>
                                                            <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                                                            <span>Deleting...</span>
                                                        </div>
                                                    ) : (
                                                        'Delete Product'
                                                    )}
                                                </AlertDialogAction>
                                            </div>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
