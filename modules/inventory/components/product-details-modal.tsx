'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/use-products-query';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { showErrorToast } from '@/lib/utils/toast-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
    Package,
    Tag,
    DollarSign,
    Box,
    Calendar,
    Barcode,
    Truck,
    Percent,
    Edit,
    X,
    PackageCheck,
    PackageMinus,
    AlertCircle,
    PackageX,
    Warehouse,
} from 'lucide-react';
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

interface ProductDetailsModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (product: Product) => void;
    onUpdateStatus?: (productId: number, newStatus: string) => void;
    onDelete?: (productId: number) => void;
}

export function ProductDetailsModal({
    product,
    isOpen,
    onClose,
    onUpdate,
    onUpdateStatus,
    onDelete,
}: ProductDetailsModalProps) {
    const [editedProduct, setEditedProduct] = useState<Product>({ ...product });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('details');
    const [showEditModal, setShowEditModal] = useState<boolean>(false);

    // Format dates
    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    // Format price for display
    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    // Handle status change
    const handleStatusChange = (status: ProductStatus) => {
        if (onUpdateStatus) {
            onUpdateStatus(product.uid, status);
        }
    };

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    // Get status badge color
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

    // Handle delete product
    const handleDelete = useCallback(async () => {
        if (onDelete) {
            try {
                await onDelete(product.uid);
                onClose();
            } catch (error) {
                showErrorToast('Failed to delete product', toast);
            }
        }
    }, [product.uid, onDelete, onClose]);

    // Show the "Activating Soon" modal when Edit is clicked
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    // Close the edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'analytics', label: 'Analytics' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        {/* Product Basic Info */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Product Information
                            </h3>
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center w-40 h-40 p-1 overflow-hidden border rounded-md border-primary/20">
                                    {product?.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={80}
                                            height={80}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <Package className="w-12 h-12 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="grid gap-2">
                                        <h2 className="text-xl font-bold">
                                            {product.name}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-4 py-1 font-body border-0 ${getStatusBadgeColor(
                                                    product.status,
                                                )}`}
                                            >
                                                {product.status?.toUpperCase()}
                                            </Badge>
                                            {product.isOnPromotion && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-4 py-1 font-body border-0 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                                >
                                                    ON SALE
                                                </Badge>
                                            )}
                                        </div>

                                        {product.category && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Tag className="w-4 h-4 mr-1" />
                                                <span className="text-xs font-thin uppercase font-body">
                                                    {product.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Description */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Description
                            </h3>
                            <p className="text-xs font-thin font-body">
                                {product.description ||
                                    'No description available.'}
                            </p>
                        </div>

                        {/* Price Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Price Information
                            </h3>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Regular Price:{' '}
                                        {formatPrice(product.price)}
                                    </span>
                                </div>
                                {product.salePrice !== undefined && (
                                    <div className="flex items-center">
                                        <Percent className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Sale Price:{' '}
                                            {formatPrice(product.salePrice)}
                                        </span>
                                    </div>
                                )}
                                {product.discount !== undefined && (
                                    <div className="flex items-center">
                                        <Percent className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Discount: {product.discount}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'inventory':
                return (
                    <div className="space-y-6">
                        {/* Inventory Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Stock Information
                            </h3>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Box className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Current Stock:{' '}
                                        {product.stockQuantity || 0} units
                                    </span>
                                </div>
                                {product.reorderPoint !== undefined && (
                                    <div className="flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Reorder Point:{' '}
                                            {product.reorderPoint} units
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Identifiers */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Product Identifiers
                            </h3>
                            <div className="grid gap-3">
                                {product.sku && (
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            SKU: {product.sku}
                                        </span>
                                    </div>
                                )}
                                {product.barcode && (
                                    <div className="flex items-center">
                                        <Barcode className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Barcode: {product.barcode}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Location Information
                            </h3>
                            <div className="grid gap-3">
                                {product.warehouseLocation && (
                                    <div className="flex items-center">
                                        <Warehouse className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Warehouse Location:{' '}
                                            {product.warehouseLocation}
                                        </span>
                                    </div>
                                )}
                                {product.packageUnit && (
                                    <div className="flex items-center">
                                        <Box className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Package Unit: {product.packageUnit}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="p-4 rounded-lg bg-card/50">
                        <h3 className="mb-2 text-xs font-normal uppercase font-body">
                            Product Analytics
                        </h3>
                        <p className="text-xs font-thin font-body">
                            Product analytics history will be displayed here in
                            future updates.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold uppercase font-body">
                                {product.name}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] px-4 py-1 font-body border-0 ${getStatusBadgeColor(
                                        product.status,
                                    )}`}
                                >
                                    {product.status?.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={handleEditClick}
                            >
                                <Edit className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="flex items-center mb-6 overflow-x-auto border-b border-border/10">
                            {tabs.map((tab) => (
                                <div
                                    key={tab?.id}
                                    className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
                                >
                                    <div
                                        className={`mb-3 font-body px-0 font-normal ${
                                            activeTab === tab.id
                                                ? 'text-primary dark:text-primary'
                                                : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                        onClick={() => handleTabChange(tab?.id)}
                                    >
                                        <span className="text-xs font-thin uppercase font-body">
                                            {tab?.label}
                                        </span>
                                    </div>
                                    {activeTab === tab?.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                        {renderTabContent()}
                    </div>
                    <DialogFooter className="flex flex-col flex-wrap gap-4 pt-4 mt-6 border-t dark:border-gray-700">
                        <div className="flex flex-col items-center justify-center w-full">
                            <p className="text-xs font-thin uppercase font-body">
                                Quick Actions
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center w-full gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${product.status === ProductStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                                onClick={() =>
                                    handleStatusChange(ProductStatus.ACTIVE)
                                }
                                title="Set as Active"
                            >
                                <PackageCheck
                                    strokeWidth={1.2}
                                    className="text-green-600 w-7 h-7 dark:text-green-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${product.status === ProductStatus.INACTIVE ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                                onClick={() =>
                                    handleStatusChange(ProductStatus.INACTIVE)
                                }
                                title="Set as Inactive"
                            >
                                <AlertCircle
                                    strokeWidth={1.2}
                                    className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${product.status === ProductStatus.OUTOFSTOCK ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                                onClick={() =>
                                    handleStatusChange(ProductStatus.OUTOFSTOCK)
                                }
                                title="Set as Out of Stock"
                            >
                                <PackageX
                                    strokeWidth={1.2}
                                    className="text-red-600 w-7 h-7 dark:text-red-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${product.status === ProductStatus.DISCONTINUED ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`}
                                onClick={() =>
                                    handleStatusChange(
                                        ProductStatus.DISCONTINUED,
                                    )
                                }
                                title="Set as Discontinued"
                            >
                                <PackageMinus
                                    strokeWidth={1.2}
                                    className="text-gray-600 w-7 h-7 dark:text-gray-400"
                                />
                            </Button>
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-purple-800 border-purple-200 rounded-full w-14 h-14 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30"
                                    onClick={() =>
                                        setShowDeleteConfirmation(true)
                                    }
                                    title="Delete Product"
                                >
                                    <X
                                        strokeWidth={1.2}
                                        className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                    />
                                </Button>
                            )}
                        </div>
                    </DialogFooter>

                    {/* Delete Confirmation */}
                    {showDeleteConfirmation && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="w-4 h-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                Are you sure you want to delete this product?
                                This action cannot be undone.
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowDeleteConfirmation(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Product Modal - "Activating Soon" */}
            <Dialog open={showEditModal} onOpenChange={handleCloseEditModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-thin uppercase font-body"></DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-64">
                        <h2 className="text-xs font-thin uppercase font-body">
                            Activating Soon
                        </h2>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
