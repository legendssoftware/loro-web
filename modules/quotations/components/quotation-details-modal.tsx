'use client';

import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quotation, StatusColors } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { formatDate, formatCurrency } from '@/lib/utils/formatters';
import {
    Trash2,
    ExternalLink,
    Calendar,
    User,
    Building,
    Phone,
    X,
    CheckCheck,
    CalendarX2,
    Ban,
    CheckCircle,
    AlertCircle,
    Mail,
    Clock,
    Edit,
} from 'lucide-react';
import { useQuotationDetailsModal } from '@/hooks/use-modal-store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import Image from 'next/image';

interface QuotationDetailsModalProps {
    onUpdateStatus: (
        quotationId: number,
        newStatus: OrderStatus,
    ) => Promise<void>;
    onDeleteQuotation?: (quotationId: number) => Promise<void>;
    onEditQuotation?: (
        quotationId: number,
        quotationData: Partial<Quotation>,
    ) => Promise<void>;
}

export function QuotationDetailsModal({
    onUpdateStatus,
    onDeleteQuotation,
    onEditQuotation,
}: QuotationDetailsModalProps) {
    const { isOpen, onClose, data } = useQuotationDetailsModal();
    const [activeTab, setActiveTab] = useState<string>('details');
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] =
        useState(false);
    const [pendingStatusChange, setPendingStatusChange] =
        useState<OrderStatus | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

    const quotation = data as Quotation;

    // If this is a new quotation (uid === 0), handle it accordingly
    const isNewQuotation = quotation?.uid === 0;

    // Use StatusColors from quotation types
    const getStatusColors = useMemo(() => {
        if (!quotation) return null;
        return (
            StatusColors[quotation.status] || StatusColors[OrderStatus.PENDING]
        );
    }, [quotation]);

    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    // Status change functions
    const handleStatusChange = (newStatus: OrderStatus) => {
        if (quotation && quotation.status !== newStatus) {
            setPendingStatusChange(newStatus);
            setConfirmStatusChangeOpen(true);
        }
    };

    const confirmStatusChange = async () => {
        if (pendingStatusChange && quotation) {
            setIsUpdating(true);
            try {
                await onUpdateStatus(quotation.uid, pendingStatusChange);
                // Close the confirmation dialog and modal
                setConfirmStatusChangeOpen(false);
                onClose();
            } catch (error) {
                console.error('Error updating quotation status:', error);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    // Delete functions
    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (quotation && onDeleteQuotation) {
            try {
                await onDeleteQuotation(quotation.uid);
                setIsDeleteDialogOpen(false);
                onClose();
            } catch (error) {
                console.error('Error deleting quotation:', error);
            }
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleEditFormSubmit = (
        quotationId: number,
        quotationData: Partial<Quotation>,
    ) => {
        if (onEditQuotation) {
            onEditQuotation(quotationId, quotationData);
        }
        setIsEditModalOpen(false);
    };

    // Get status button variant
    const getStatusButtonVariant = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING:
                return `text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${quotation.status === status ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`;
            case OrderStatus.INPROGRESS:
                return `text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30 ${quotation.status === status ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`;
            case OrderStatus.APPROVED:
                return `text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${quotation.status === status ? 'bg-green-100 dark:bg-green-900/30' : ''}`;
            case OrderStatus.REJECTED:
                return `text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${quotation.status === status ? 'bg-red-100 dark:bg-red-900/30' : ''}`;
            case OrderStatus.COMPLETED:
                return `text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30 ${quotation.status === status ? 'bg-purple-100 dark:bg-purple-900/30' : ''}`;
            case OrderStatus.CANCELLED:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${quotation.status === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
            default:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${quotation.status === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
        }
    };

    if (!isOpen || !quotation || !getStatusColors) return null;

    const getClientInitials = () => {
        if (!quotation.client?.name) return 'CL';
        const nameParts = quotation.client.name.trim().split(' ');
        return nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`
            : nameParts[0].substring(0, 2);
    };

    // Define tabs
    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'items', label: 'Items' },
        { id: 'client', label: 'Client' },
    ];

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-xl font-body">
                                Quotation #{quotation.quotationNumber}
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        'text-xs font-normal uppercase px-3 py-1 border-0 font-body',
                                        getStatusColors.bg,
                                        getStatusColors.text,
                                    )}
                                >
                                    {quotation.status}
                                </Badge>
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleEdit}
                                    className="w-8 h-8 rounded-full"
                                >
                                    <Edit className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs font-thin font-body">
                            <Calendar className="w-3 h-3" />
                            <span>
                                Created on {formatDate(quotation.createdAt)}
                            </span>
                            {quotation.placedBy?.name && (
                                <>
                                    <span className="text-muted-foreground">
                                        |
                                    </span>
                                    <User className="w-3 h-3" />
                                    <span>By {quotation.placedBy.name}</span>
                                </>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Tab Navigation */}
                    <div className="flex items-center mt-2 border-b border-border/10">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
                            >
                                <div
                                    className={`mb-3 font-body px-0 font-normal cursor-pointer ${
                                        activeTab === tab.id
                                            ? 'text-primary dark:text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                    onClick={() => handleTabChange(tab.id)}
                                >
                                    <span className="text-xs font-thin uppercase font-body">
                                        {tab?.label}
                                    </span>
                                </div>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Tab Content */}
                    <div className="py-4">
                        {activeTab === 'details' && (
                            <div className="space-y-6">
                                <div className="p-4 rounded-lg bg-card/50">
                                    <h3
                                        className="mb-2 text-xs font-normal uppercase cursor-pointer font-body hover:text-primary"
                                        onClick={handleEdit}
                                    >
                                        Quotation Summary
                                    </h3>
                                    <p
                                        className="text-xs font-thin cursor-pointer font-body hover:text-primary"
                                        onClick={handleEdit}
                                    >
                                        {quotation.notes ||
                                            'No notes provided for this quotation.'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 space-y-3 rounded-lg bg-card/50">
                                        <h3 className="text-xs font-normal uppercase font-body">
                                            Quotation Information
                                        </h3>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="font-semibold font-body">
                                                Reference:
                                            </div>
                                            <div className="font-body">
                                                {quotation.quotationNumber}
                                            </div>

                                            <div className="font-semibold font-body">
                                                Status:
                                            </div>
                                            <div>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'text-[10px] px-2 py-0.5 border-0 uppercase font-body',
                                                        getStatusColors.bg,
                                                        getStatusColors.text,
                                                    )}
                                                >
                                                    {quotation.status}
                                                </Badge>
                                            </div>

                                            <div className="font-semibold font-body">
                                                Date Created:
                                            </div>
                                            <div className="font-body">
                                                {formatDate(
                                                    quotation.createdAt,
                                                )}
                                            </div>

                                            <div className="font-semibold font-body">
                                                Valid Until:
                                            </div>
                                            <div className="font-body">
                                                {quotation.validUntil
                                                    ? formatDate(
                                                          quotation.validUntil,
                                                      )
                                                    : 'Not specified'}
                                            </div>

                                            <div className="font-semibold font-body">
                                                Total Items:
                                            </div>
                                            <div className="font-body">
                                                {quotation.totalItems}
                                            </div>

                                            <div className="font-semibold font-body">
                                                Total Amount:
                                            </div>
                                            <div className="font-medium font-body">
                                                {formatCurrency(
                                                    quotation.totalAmount,
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3 rounded-lg bg-card/50">
                                        <h3 className="text-xs font-normal uppercase font-body">
                                            Shipping Information
                                        </h3>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="font-semibold font-body">
                                                Shipping Method:
                                            </div>
                                            <div className="font-body">
                                                {quotation.shippingMethod ||
                                                    'Not specified'}
                                            </div>

                                            <div className="font-semibold font-body">
                                                Instructions:
                                            </div>
                                            <div className="font-body">
                                                {quotation.shippingInstructions ||
                                                    'None provided'}
                                            </div>

                                            <div className="font-semibold font-body">
                                                Packaging:
                                            </div>
                                            <div className="font-body">
                                                {quotation.packagingRequirements ||
                                                    'Standard packaging'}
                                            </div>

                                            {quotation.client?.address && (
                                                <>
                                                    <div className="font-semibold font-body">
                                                        Delivery Address:
                                                    </div>
                                                    <div className="font-body">
                                                        {
                                                            quotation.client
                                                                .address.street
                                                        }
                                                        ,
                                                        {quotation.client
                                                            .address.suburb &&
                                                            ` ${quotation.client.address.suburb},`}
                                                        {quotation.client
                                                            .address.city &&
                                                            ` ${quotation.client.address.city},`}
                                                        {quotation.client
                                                            .address.state &&
                                                            ` ${quotation.client.address.state}`}
                                                    </div>
                                                </>
                                            )}

                                            {quotation.resellerCommission !==
                                                null && (
                                                <>
                                                    <div className="font-semibold font-body">
                                                        Reseller Commission:
                                                    </div>
                                                    <div className="font-body">
                                                        {
                                                            quotation.resellerCommission
                                                        }
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-card/50">
                                    <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                        Created By
                                    </h3>
                                    {quotation?.placedBy ? (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 border border-primary">
                                                <AvatarImage
                                                    src={
                                                        quotation?.placedBy
                                                            .photoURL || ''
                                                    }
                                                />
                                                <AvatarFallback className="text-xs">
                                                    {quotation?.placedBy.name?.charAt(
                                                        0,
                                                    )}
                                                    {quotation?.placedBy.surname?.charAt(
                                                        0,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-xs font-normal font-body">
                                                    {quotation?.placedBy.name}{' '}
                                                    {
                                                        quotation?.placedBy
                                                            .surname
                                                    }
                                                </div>
                                                <div className="text-[10px] font-thin text-muted-foreground font-body">
                                                    {quotation?.placedBy?.email}{' '}
                                                    •{' '}
                                                    {quotation?.placedBy?.role}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-thin font-body">
                                            Information not available
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'items' && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-card/50">
                                    <h3 className="mb-2 font-normal uppercase text-md font-body">
                                        Quotation Items
                                    </h3>
                                    {quotation?.quotationItems &&
                                    quotation?.quotationItems?.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-12 px-2 mb-1 text-xs font-semibold uppercase font-body text-muted-foreground">
                                                <div className="col-span-6">
                                                    Product
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    Quantity
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    Unit Price
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    Total
                                                </div>
                                            </div>
                                            {quotation?.quotationItems?.map(
                                                (item, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 rounded-md bg-card/60"
                                                    >
                                                        <div className="grid items-center grid-cols-12">
                                                            <div className="col-span-6">
                                                                <div className="flex items-center gap-2">
                                                                    {item
                                                                        .product
                                                                        .imageUrl && (
                                                                        <Image
                                                                            src={
                                                                                item
                                                                                    .product
                                                                                    .imageUrl
                                                                            }
                                                                            alt={
                                                                                item
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                            className="object-cover rounded-md"
                                                                            height={
                                                                                60
                                                                            }
                                                                            width={
                                                                                60
                                                                            }
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <h4 className="text-xs font-medium font-body line-clamp-1">
                                                                            {
                                                                                item
                                                                                    ?.product
                                                                                    ?.name
                                                                            }
                                                                        </h4>
                                                                        {item
                                                                            .product
                                                                            .sku && (
                                                                            <p className="text-[10px] text-muted-foreground font-body">
                                                                                SKU:{' '}
                                                                                {
                                                                                    item
                                                                                        .product
                                                                                        .sku
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2 text-center">
                                                                <span className="text-sm font-medium font-body">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="col-span-2 text-right">
                                                                <span className="text-[10px] font-medium font-body">
                                                                    {item
                                                                        .product
                                                                        .price
                                                                        ? formatCurrency(
                                                                              item
                                                                                  .product
                                                                                  .price,
                                                                          )
                                                                        : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="col-span-2 text-right">
                                                                <span className="text-sm font-medium font-body">
                                                                    {formatCurrency(
                                                                        item.totalPrice ||
                                                                            0,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {item.product
                                                            .description && (
                                                            <span className="pl-10 pr-2 mt-2 text-[10px] font-thin text-muted-foreground font-body">
                                                                {
                                                                    item.product
                                                                        .description
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                            <div className="flex justify-end p-3 mt-2 border-t border-border/10">
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center justify-between w-48 ">
                                                        <span className="text-[10px] font-normal uppercase font-body">
                                                            Subtotal:
                                                        </span>
                                                        <span className="font-thin font-body">
                                                            {formatCurrency(
                                                                quotation?.totalAmount,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between w-48 font-semibold text-primary">
                                                        <span className="font-normal uppercase text-md font-body">
                                                            Total:
                                                        </span>
                                                        <span className="font-thin font-body text-md">
                                                            {formatCurrency(
                                                                quotation?.totalAmount,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs font-thin font-body">
                                            No items found in this quotation.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'client' && (
                            <div className="space-y-4">
                                <div className="p-4 space-y-4 rounded-lg bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage
                                                src={
                                                    quotation.client?.logo || ''
                                                }
                                            />
                                            <AvatarFallback
                                                className={cn(
                                                    'text-sm',
                                                    getStatusColors.bg,
                                                    getStatusColors.text,
                                                )}
                                            >
                                                {getClientInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-base font-thin font-body">
                                                {quotation.client?.name ||
                                                    'Unknown Client'}
                                                {quotation.client?.type && (
                                                    <span className="ml-2 px-2 py-0.5 text-[10px] uppercase bg-blue-100 text-blue-800 rounded-full font-body">
                                                        {quotation.client.type}
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs font-thin font-body text-muted-foreground">
                                                <span className="font-thin font-body">
                                                    Ref:{' '}
                                                    {quotation.client?.ref ||
                                                        'N/A'}
                                                </span>
                                                {quotation.client?.status && (
                                                    <span
                                                        className={`px-1.5 py-0.5 rounded-full ${
                                                            quotation.client
                                                                .status ===
                                                            'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {
                                                            quotation.client
                                                                .status
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                                Contact
                                            </h3>
                                            {quotation.client
                                                ?.contactPerson && (
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-normal font-body">
                                                        {
                                                            quotation.client
                                                                .contactPerson
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {quotation.client?.email && (
                                                <div className="flex items-center mt-1">
                                                    <Mail className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-normal font-body">
                                                        {quotation.client.email}
                                                    </span>
                                                </div>
                                            )}
                                            {quotation.client?.phone && (
                                                <div className="flex items-center mt-1">
                                                    <Phone className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-normal font-body">
                                                        {quotation.client.phone}
                                                    </span>
                                                </div>
                                            )}
                                            {quotation.client?.website && (
                                                <div className="flex items-center mt-1">
                                                    <ExternalLink className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <a
                                                        href={
                                                            quotation.client
                                                                .website
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-normal text-blue-600 font-body hover:underline"
                                                    >
                                                        {quotation.client.website.replace(
                                                            /^https?:\/\//,
                                                            '',
                                                        )}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                                Address
                                            </h3>
                                            {quotation.client?.address ? (
                                                <div className="space-y-1 text-xs font-normal font-body">
                                                    {quotation.client.address
                                                        .street && (
                                                        <p>
                                                            {
                                                                quotation.client
                                                                    .address
                                                                    .street
                                                            }
                                                        </p>
                                                    )}
                                                    {quotation.client.address
                                                        .suburb && (
                                                        <p>
                                                            {
                                                                quotation.client
                                                                    .address
                                                                    .suburb
                                                            }
                                                        </p>
                                                    )}
                                                    <p>
                                                        {quotation.client
                                                            .address.city &&
                                                            `${quotation.client.address.city}, `}
                                                        {
                                                            quotation.client
                                                                .address.state
                                                        }
                                                    </p>
                                                    <p>
                                                        {
                                                            quotation.client
                                                                .address
                                                                .postalCode
                                                        }{' '}
                                                        {
                                                            quotation.client
                                                                .address.country
                                                        }
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-xs font-thin font-body text-muted-foreground">
                                                    No address available
                                                </p>
                                            )}

                                            {quotation.client?.category && (
                                                <div className="flex items-center mt-3">
                                                    <Building className="w-4 h-4 mr-1 text-card-foreground/60" />
                                                    <span className="text-xs font-normal font-body">
                                                        {
                                                            quotation.client
                                                                .category
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {quotation.client?.description && (
                                        <div className="pt-3 mt-3 border-t border-border/10">
                                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                                Description
                                            </h3>
                                            <p className="text-xs font-thin font-body">
                                                {quotation.client.description}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col items-center gap-2 pt-4 border-t border-border/10">
                        <div className="w-full">
                            <h3 className="mb-4 text-xs font-thin text-center uppercase font-body">
                                Quick Actions
                            </h3>
                            <div className="flex items-center justify-center gap-4">
                                {/* Pending button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(OrderStatus.PENDING)}`}
                                    onClick={() =>
                                        quotation.status !==
                                            OrderStatus.PENDING &&
                                        handleStatusChange(OrderStatus.PENDING)
                                    }
                                    title="Set as Pending"
                                >
                                    <AlertCircle
                                        strokeWidth={1.2}
                                        className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                    />
                                </Button>

                                {/* In Progress button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(OrderStatus.INPROGRESS)}`}
                                    onClick={() =>
                                        quotation.status !==
                                            OrderStatus.INPROGRESS &&
                                        handleStatusChange(
                                            OrderStatus.INPROGRESS,
                                        )
                                    }
                                    title="Set as In Progress"
                                >
                                    <Clock
                                        strokeWidth={1.2}
                                        className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                    />
                                </Button>

                                {/* Approved button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(OrderStatus.APPROVED)}`}
                                    onClick={() =>
                                        quotation.status !==
                                            OrderStatus.APPROVED &&
                                        handleStatusChange(OrderStatus.APPROVED)
                                    }
                                    title="Set as Approved"
                                >
                                    <CheckCircle
                                        strokeWidth={1.2}
                                        className="text-green-600 w-7 h-7 dark:text-green-400"
                                    />
                                </Button>

                                {/* Rejected button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(OrderStatus.REJECTED)}`}
                                    onClick={() =>
                                        quotation.status !==
                                            OrderStatus.REJECTED &&
                                        handleStatusChange(OrderStatus.REJECTED)
                                    }
                                    title="Set as Rejected"
                                >
                                    <Ban
                                        strokeWidth={1.2}
                                        className="text-red-600 w-7 h-7 dark:text-red-400"
                                    />
                                </Button>

                                {/* Completed button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(OrderStatus.COMPLETED)}`}
                                    onClick={() =>
                                        quotation.status !==
                                            OrderStatus.COMPLETED &&
                                        handleStatusChange(
                                            OrderStatus.COMPLETED,
                                        )
                                    }
                                    title="Set as Completed"
                                >
                                    <CheckCheck
                                        strokeWidth={1.2}
                                        className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                    />
                                </Button>

                                {/* Cancelled button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(OrderStatus.CANCELLED)}`}
                                    onClick={() =>
                                        quotation.status !==
                                            OrderStatus.CANCELLED &&
                                        handleStatusChange(
                                            OrderStatus.CANCELLED,
                                        )
                                    }
                                    title="Set as Cancelled"
                                >
                                    <CalendarX2
                                        strokeWidth={1.2}
                                        className="text-orange-600 w-7 h-7 dark:text-orange-400"
                                    />
                                </Button>

                                {/* Delete button */}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="rounded-full w-14 h-14 dark:bg-red-900/80 dark:text-white dark:hover:bg-red-900 dark:border-none"
                                    onClick={handleDelete}
                                    title="Delete Quotation"
                                >
                                    <Trash2
                                        className="w-7 h-7"
                                        strokeWidth={1.5}
                                    />
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            {quotation && (
                <Dialog
                    open={isEditModalOpen}
                    onOpenChange={(open) => setIsEditModalOpen(open)}
                >
                    <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto bg-card">
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
            <AlertDialog
                open={confirmStatusChangeOpen}
                onOpenChange={setConfirmStatusChangeOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xs font-thin uppercase font-body">
                            Confirm Status Change
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-thin uppercase font-body">
                            Are you sure you want to change the status of this
                            quotation to{' '}
                            <span className="font-bold font-body">
                                {pendingStatusChange &&
                                    pendingStatusChange.toUpperCase()}
                            </span>
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Updating...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the quotation #{quotation?.quotationNumber}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
