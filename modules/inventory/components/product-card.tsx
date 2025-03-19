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
                                className="object-cover w-full h-full"
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
                <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {/* Product Meta Information */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Category */}
                        <div className="flex items-center col-span-2">
                            <Tag className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal font-body">
                                {product.category || 'Uncategorized'}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal font-body">
                                Sale: {formatPrice(product.price)}
                            </span>
                        </div>

                        {/* Cost Price */}
                        <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                            <span className="text-[10px] font-normal font-body">
                                Cost: {formatPrice((product as any).costPrice)}
                            </span>
                        </div>

                        {/* Stock */}
                        <div className="flex items-center">
                            <Box className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal font-body">
                                Stock: {product.stockQuantity || 0}
                            </span>
                        </div>

                        {/* Supplier */}
                        <div className="flex items-center">
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
                                className="w-4 h-4 mr-1"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span className="text-[10px] font-normal font-body truncate">
                                {(product as any).supplier || 'No Supplier'}
                            </span>
                        </div>

                        {/* SKU */}
                        <div className="flex items-center col-span-2">
                            <Barcode className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal font-body truncate">
                                {product.sku || 'No SKU'}
                            </span>
                        </div>
                    </div>

                    {/* Date Added */}
                    <div className="flex items-center justify-between pt-2 mt-2 text-[10px] border-t border-border/50">
                        <span className="font-normal font-body">
                            Added: {formatDate(product.createdAt)}
                        </span>
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
