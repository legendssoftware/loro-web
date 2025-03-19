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
import { Product, ProductStatus } from '@/hooks/use-products-query';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { showErrorToast, showTokenSuccessToast, showTokenErrorToast } from '@/lib/utils/toast-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    CheckCircle,
    AlertCircle,
    PackageX,
    Warehouse,
    Star,
    Sparkles,
    Flame,
    BadgePlus,
    Trash,
} from 'lucide-react';
import Image from 'next/image';

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
    const [activeTab, setActiveTab] = useState<string>('details');
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showStatusChangeConfirmation, setShowStatusChangeConfirmation] = useState<boolean>(false);
    const [pendingStatus, setPendingStatus] = useState<ProductStatus | null>(null);

    // Format dates
    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    // Format price for display
    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return 'N/A';
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        }).format(price);
    };

    // Handle status change
    const initiateStatusChange = (status: ProductStatus) => {
        if (product.status === status) {
            return;
        }

        setPendingStatus(status);
        setShowStatusChangeConfirmation(true);
    };

    const confirmStatusChange = () => {
        if (pendingStatus && onUpdateStatus) {
            try {
                onUpdateStatus(product.uid, pendingStatus);
                setShowStatusChangeConfirmation(false);
                setPendingStatus(null);
                showTokenSuccessToast(`Product status updated to ${pendingStatus.replace('_', ' ')}`, toast);

                // Close the modal if this was a delete action
                if (pendingStatus === ProductStatus.DELETED) {
                    setTimeout(() => onClose(), 500);
                }
            } catch (error) {
                console.error('Error updating product status:', error);
                showTokenErrorToast('Failed to update product status', toast);
                setShowStatusChangeConfirmation(false);
                setPendingStatus(null);
            }
        } else {
            showTokenErrorToast('Update status function not available', toast);
            setShowStatusChangeConfirmation(false);
            setPendingStatus(null);
        }
    };

    const cancelStatusChange = () => {
        setShowStatusChangeConfirmation(false);
        setPendingStatus(null);
    };

    const getStatusDisplayName = (status: ProductStatus | null): string => {
        if (!status) return 'UNKNOWN';

        // Ensure we're dealing with a string that can be uppercased
        const statusString = String(status);
        return statusString.toUpperCase();
    };

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    // Get status badge color
    const getStatusBadgeColor = (status?: ProductStatus) => {
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
            case ProductStatus.DELETED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        }
    };

    // Get category badge color
    const getCategoryBadgeColor = (category?: string) => {
        if (!category)
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        // Map common categories to colors
        const categoryColors: Record<string, string> = {
            MEAT_POULTRY: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            SEAFOOD: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            DAIRY: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            BAKERY: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
            PRODUCE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            BEVERAGES: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            SNACKS: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            CANNED_GOODS: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
            FROZEN_FOODS: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
            CLEANING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            PERSONAL_CARE: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
            OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
        };

        return (
            categoryColors[category] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        );
    };

    // Handle delete product
    const handleDelete = useCallback(() => {
        if (onDelete) {
            try {
                onDelete(product.uid);
                setShowDeleteConfirmation(false);
                showTokenSuccessToast('Product deleted successfully', toast);
                onClose();
            } catch (error) {
                console.error('Error deleting product:', error);
                showTokenErrorToast('Failed to delete product. Please try again.', toast);
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

    // Update the delete confirmation logic to use a separate Dialog
    const handleInitiateDelete = () => {
        setShowDeleteConfirmation(true);
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'inventory', label: 'Inventory' },
        { id: 'analytics', label: 'Analytics' },
    ];

    console.log(product);

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
                                            width={150}
                                            height={150}
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <Package
                                            className="w-20 h-20 text-muted-foreground/30"
                                        />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="grid gap-2">
                                        <h2 className="text-xl font-bold font-body">
                                            {product.name}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            {product.category && (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-4 py-1 font-body border-0 ${getCategoryBadgeColor(
                                                        product.category,
                                                    )}`}
                                                >
                                                    {product.category.toUpperCase()}
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-4 py-1 font-body border-0 ${getStatusBadgeColor(
                                                    product.status,
                                                )}`}
                                            >
                                                {getStatusDisplayName(product.status)}
                                            </Badge>
                                        </div>

                                        {product.description && (
                                            <p className="mt-2 text-xs font-thin font-body">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Pricing */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Pricing Information
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

                        {/* Inventory Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Inventory Information
                            </h3>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Box className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Stock Quantity:{' '}
                                        {product.stockQuantity ?? 'N/A'} units
                                    </span>
                                </div>
                                {product.packageQuantity !== undefined && (
                                    <div className="flex items-center">
                                        <Package className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Package Quantity:{' '}
                                            {product.packageQuantity} units
                                        </span>
                                    </div>
                                )}
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
                                {product.code && (
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Product Code: {product.code}
                                        </span>
                                    </div>
                                )}
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

                        {/* Dates */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Dates
                            </h3>
                            <div className="grid gap-3">
                                {product.createdAt && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Created: {formatDate(product.createdAt)}
                                        </span>
                                    </div>
                                )}
                                {product.updatedAt && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Last Updated:{' '}
                                            {formatDate(product.updatedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'inventory':
                return (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Inventory History Coming Soon
                            </h3>
                            <p className="text-xs uppercase text-muted-foreground font-body">
                                This feature will be available in a future
                                update.
                            </p>
                        </div>
                    </div>
                );
            case 'analytics':
                return (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Product Analytics
                            </h3>
                            <p className="text-xs uppercase text-muted-foreground font-body">
                                Product analytics history will be displayed here in
                                future updates.
                            </p>
                        </div>
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
                                    className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getStatusBadgeColor(
                                        product.status,
                                    )}`}
                                >
                                    {getStatusDisplayName(product.status)}
                                </Badge>
                                {product.category && (
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getCategoryBadgeColor(
                                            product.category,
                                        )}`}
                                    >
                                        {product.category.toUpperCase()}
                                    </Badge>
                                )}
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

                    {/* Tabs */}
                    <div className="mt-4">
                        <div className="flex items-center mb-6 overflow-x-auto border-b border-border/10">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
                                >
                                    <div
                                        className={`mb-3 font-body px-0 font-normal ${
                                            activeTab === tab.id
                                                ? 'text-primary dark:text-primary'
                                                : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                        onClick={() => handleTabChange(tab.id)}
                                    >
                                        <span className="text-xs font-thin uppercase font-body">
                                            {tab.label}
                                        </span>
                                    </div>
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: 'calc(70vh - 100px)' }}
                        >
                            {renderTabContent()}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <DialogFooter className="flex flex-col flex-wrap gap-4 pt-4 mt-6 border-t dark:border-gray-700">
                        <div className="flex flex-col items-center justify-center w-full">
                            <p className="text-xs font-thin uppercase font-body">
                                Quick Actions
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center w-full gap-3">
                            {/* Active Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${product.status === ProductStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ProductStatus.ACTIVE)
                                }
                                title="Set as Active"
                            >
                                <CheckCircle
                                    strokeWidth={1.2}
                                    className="text-green-600 w-7 h-7 dark:text-green-400"
                                />
                            </Button>

                            {/* Inactive Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${product.status === ProductStatus.INACTIVE ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ProductStatus.INACTIVE)
                                }
                                title="Set as Inactive"
                            >
                                <AlertCircle
                                    strokeWidth={1.2}
                                    className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                />
                            </Button>

                            {/* Out of Stock Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${product.status === ProductStatus.OUTOFSTOCK ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ProductStatus.OUTOFSTOCK)
                                }
                                title="Set as Out of Stock"
                            >
                                <PackageX
                                    strokeWidth={1.2}
                                    className="text-red-600 w-7 h-7 dark:text-red-400"
                                />
                            </Button>

                            {/* Best Seller Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30 ${product.status === ProductStatus.BEST_SELLER ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ProductStatus.BEST_SELLER)
                                }
                                title="Set as Best Seller"
                            >
                                <Star
                                    strokeWidth={1.2}
                                    className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                />
                            </Button>

                            {/* Special Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30 ${product.status === ProductStatus.SPECIAL ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ProductStatus.SPECIAL)
                                }
                                title="Set as Special"
                            >
                                <Sparkles
                                    strokeWidth={1.2}
                                    className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                />
                            </Button>

                            {/* Hot Deals Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30 ${product.status === ProductStatus.HOTDEALS ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ProductStatus.HOTDEALS)
                                }
                                title="Set as Hot Deal"
                            >
                                <Flame
                                    strokeWidth={1.2}
                                    className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                />
                            </Button>

                            {/* New Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30 ${product.status === ProductStatus.NEW ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ProductStatus.NEW)
                                }
                                title="Set as New"
                            >
                                <BadgePlus
                                    strokeWidth={1.2}
                                    className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                />
                            </Button>

                            {/* Delete Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-red-800 border-red-200 rounded-full w-14 h-14 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30"
                                onClick={handleInitiateDelete}
                                title="Delete Product"
                            >
                                <Trash
                                    strokeWidth={1.2}
                                    className="text-red-600 w-7 h-7 dark:text-red-400"
                                />
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal (Placeholder) */}
            {showEditModal && (
                <Dialog
                    open={showEditModal}
                    onOpenChange={handleCloseEditModal}
                >
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
            )}

            {/* Status Change Confirmation Dialog */}
            {showStatusChangeConfirmation && (
                <Dialog
                    open={showStatusChangeConfirmation}
                    onOpenChange={() => setShowStatusChangeConfirmation(false)}
                >
                    <DialogContent className="max-w-md p-6 text-white border-0 bg-black/90">
                        <DialogTitle className="sr-only">
                            Confirm Status Change
                        </DialogTitle>
                        <div className="p-0">
                            <h2 className="mb-4 text-base font-semibold text-center uppercase font-body">
                                CONFIRM STATUS CHANGE
                            </h2>
                            <p className="mb-6 text-sm text-center uppercase font-body">
                                ARE YOU SURE YOU WANT TO CHANGE THE STATUS OF THIS PRODUCT TO{' '}
                                <span className="font-semibold">
                                    {pendingStatus && getStatusDisplayName(pendingStatus)}
                                </span>
                                ?
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    className="w-32 h-10 text-xs text-white uppercase bg-red-600 border-0 font-body hover:bg-red-700"
                                    onClick={cancelStatusChange}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="default"
                                    className="w-32 h-10 text-xs text-white uppercase bg-purple-600 font-body hover:bg-purple-700"
                                    onClick={confirmStatusChange}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirmation && (
                <Dialog
                    open={showDeleteConfirmation}
                    onOpenChange={() => setShowDeleteConfirmation(false)}
                >
                    <DialogContent className="max-w-md p-6 text-white border-0 bg-black/90">
                        <DialogTitle className="sr-only">
                            Confirm Delete Product
                        </DialogTitle>
                        <div className="p-0">
                            <h2 className="mb-4 text-base font-semibold text-center uppercase font-body">
                                CONFIRM DELETE PRODUCT
                            </h2>
                            <p className="mb-6 text-sm text-center uppercase font-body">
                                ARE YOU SURE YOU WANT TO DELETE THIS PRODUCT? THIS ACTION CANNOT BE UNDONE.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    className="w-32 h-10 text-xs text-white uppercase bg-red-600 border-0 font-body hover:bg-red-700"
                                    onClick={() => setShowDeleteConfirmation(false)}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="default"
                                    className="w-32 h-10 text-xs text-white uppercase bg-purple-600 font-body hover:bg-purple-700"
                                    onClick={handleDelete}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
