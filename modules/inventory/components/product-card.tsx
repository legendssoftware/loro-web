'use client';

import { Product } from '@/hooks/use-products-query';
import { Tag, Box, Package, Barcode, DollarSign } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductDetailsModal } from './product-details-modal';
import Image from 'next/image';

// Define enum that matches the server's ProductStatus
enum ProductStatus {
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

interface ProductCardProps {
    product: Product;
    onEdit?: (product: Product) => void;
    onDelete?: (productId: number) => void;
    onUpdateStatus?: (productId: number, newStatus: string) => void;
    index?: number;
}

// Create the ProductCard as a standard component
function ProductCardComponent({
    product,
    onEdit,
    onDelete,
    onUpdateStatus,
    index = 0,
}: ProductCardProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use CSS variables for animation delay - match tasks component's variable name
    const cardStyle = {
        '--task-delay': `${Math.min(index * 50, 500)}ms`,
    } as React.CSSProperties;

    const getStatusBadgeColor = (status?: string) => {
        if (!status)
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        switch (status) {
            case ProductStatus.ACTIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case ProductStatus.INACTIVE:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case ProductStatus.OUTOFSTOCK:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case ProductStatus.DISCONTINUED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            case ProductStatus.NEW:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case ProductStatus.BEST_SELLER:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case ProductStatus.HOTDEALS:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case ProductStatus.SPECIAL:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case ProductStatus.HIDDEN:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        }
    };

    const formatDate = (date?: Date) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'MMM dd, yyyy');
    };

    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return 'N/A';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(price);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleDelete = useCallback(() => {
        setIsDeleteAlertOpen(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (onDelete) {
            onDelete(product.uid);
        }
        setIsDeleteAlertOpen(false);
    }, [onDelete, product.uid]);

    const handleStatusChange = useCallback(
        (productId: number, newStatus: string) => {
            if (onUpdateStatus) {
                onUpdateStatus(productId, newStatus);
            }
        },
        [onUpdateStatus],
    );

    return (
        <>
            <div
                className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-task-appear"
                style={cardStyle}
                onClick={openModal}
            >
                {/* Product image */}
                <div className="flex items-center justify-between mb-2">
                    <div className="w-[100px] h-[100px] mr-3 overflow-hidden rounded-md">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={100}
                                height={100}
                                className="object-contain w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-muted">
                                <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Product Name & Status Badge */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={`text-[9px] font-normal uppercase font-body px-2 py-1 border-0 ${getStatusBadgeColor(
                                    product.status,
                                )}`}
                            >
                                {product.status?.replace('_', ' ')}
                            </Badge>
                            {product.isOnPromotion && (
                                <Badge
                                    variant="outline"
                                    className="text-[9px] font-normal uppercase font-body px-2 py-1 border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                >
                                    On Sale
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="mt-2 space-y-3 text-xs text-muted-foreground">
                    {/* Product Meta Information */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Category */}
                        <div className="flex items-center col-span-2 mb-1">
                            <Tag className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-medium font-body text-primary">
                                {product.category || 'Uncategorized'}
                            </span>
                        </div>

                        {/* Brand & Manufacturer */}
                        {(product.brand || (product as any).manufacturer) && (
                            <div className="flex items-center col-span-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-4 h-4 mr-1 text-blue-500"
                                >
                                    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                                </svg>
                                <span className="text-[10px] font-normal font-body truncate">
                                    {product.brand || (product as any).manufacturer}
                                    {(product as any).model && ` - ${(product as any).model}`}
                                </span>
                            </div>
                        )}

                        {/* Price Row */}
                        <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="text-[10px] font-medium font-body text-green-700">
                                {formatPrice(product.salePrice || product.price)}
                            </span>
                        </div>

                        {/* Original Price (if on sale) */}
                        {product.salePrice && product.price && product.salePrice < product.price && (
                            <div className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                                <span className="text-[10px] font-normal font-body line-through text-muted-foreground">
                                    {formatPrice(product.price)}
                                </span>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center">
                            <Box className="w-4 h-4 mr-1" />
                            <span className={`text-[10px] font-medium font-body ${
                                (product.stockQuantity || 0) <= (product.reorderPoint || 10)
                                    ? 'text-red-600'
                                    : (product.stockQuantity || 0) > 50
                                    ? 'text-green-600'
                                    : 'text-yellow-600'
                            }`}>
                                {product.stockQuantity || 0} units
                            </span>
                        </div>

                        {/* Rating */}
                        {(product as any).rating && (
                            <div className="flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4 mr-1 text-yellow-500"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                <span className="text-[10px] font-normal font-body">
                                    {(product as any).rating} ({(product as any).reviewCount || 0})
                                </span>
                            </div>
                        )}

                        {/* SKU */}
                        <div className="flex items-center col-span-2">
                            <Barcode className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal font-body truncate">
                                {product.sku || 'No SKU'}
                            </span>
                        </div>
                    </div>

                    {/* Advanced Product Information */}
                    {((product as any).specifications || (product as any).features || (product as any).warrantyPeriod) && (
                        <div className="pt-2 mt-2 border-t border-border/30">
                            {/* Specifications Preview */}
                            {(product as any).specifications && (
                                <div className="mb-2">
                                    <div className="flex items-center mb-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="w-3 h-3 mr-1 text-purple-500"
                                        >
                                            <path d="M9 12l2 2 4-4"/>
                                            <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                                            <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                                            <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                                            <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
                                        </svg>
                                        <span className="text-[9px] font-medium font-body text-purple-600 uppercase">
                                            Specs
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-normal font-body text-muted-foreground line-clamp-2">
                                        {(product as any).specifications}
                                    </p>
                                </div>
                            )}

                            {/* Features Preview */}
                            {(product as any).features && (
                                <div className="mb-2">
                                    <div className="flex items-center mb-1">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="w-3 h-3 mr-1 text-blue-500"
                                        >
                                            <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4"/>
                                            <path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4"/>
                                            <path d="M14 11h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4"/>
                                            <path d="M14 7h4a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-4"/>
                                            <path d="M9 12h6"/>
                                        </svg>
                                        <span className="text-[9px] font-medium font-body text-blue-600 uppercase">
                                            Features
                                        </span>
                                    </div>
                                    <p className="text-[9px] font-normal font-body text-muted-foreground line-clamp-2">
                                        {(product as any).features}
                                    </p>
                                </div>
                            )}

                            {/* Warranty & Additional Info */}
                            <div className="grid grid-cols-2 gap-1 text-[9px]">
                                {(product as any).warrantyPeriod && (
                                    <div className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="w-3 h-3 mr-1 text-green-500"
                                        >
                                            <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                                            <path d="M9 12l2 2 4-4"/>
                                        </svg>
                                        <span className="font-normal text-green-600 font-body">
                                            {(product as any).warrantyPeriod} {(product as any).warrantyUnit || 'months'}
                                        </span>
                                    </div>
                                )}

                                {(product as any).origin && (
                                    <div className="flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="w-3 h-3 mr-1 text-gray-500"
                                        >
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="2" y1="12" x2="22" y2="12"/>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                        </svg>
                                        <span className="font-normal font-body text-muted-foreground">
                                            {(product as any).origin}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Promotion Banner */}
                    {product.isOnPromotion && (
                        <div className="pt-2 mt-2 border-t border-border/30">
                            <div className="px-2 py-1 text-center rounded-md bg-gradient-to-r from-orange-100 to-red-100">
                                <span className="text-[9px] font-bold font-body text-orange-700 uppercase">
                                    🔥 Limited Time Offer
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Date Added */}
                    <div className="flex items-center justify-between pt-2 mt-2 text-[10px] border-t border-border/50">
                        <span className="font-normal font-body">
                            Added: {formatDate(product.createdAt)}
                        </span>
                        {((product as any).bulkDiscountPercentage && (product as any).bulkDiscountMinQty) && (
                            <span className="font-normal text-blue-600 font-body">
                                Bulk: {(product as any).bulkDiscountPercentage}% off {(product as any).bulkDiscountMinQty}+
                            </span>
                        )}
                    </div>
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 flex items-end justify-end p-2 transition-opacity opacity-0 group-hover:opacity-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        className="p-1 transition-colors rounded-sm bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <AlertDialog
                open={isDeleteAlertOpen}
                onOpenChange={setIsDeleteAlertOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the product &quot;
                            {product.name}
                            &quot; and remove it from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Product details modal */}
            {isModalOpen && (
                <ProductDetailsModal
                    product={product}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={onEdit}
                    onUpdateStatus={handleStatusChange}
                />
            )}
        </>
    );
}

export const ProductCard = memo(ProductCardComponent);
