'use client';

import { useState, useMemo, useEffect } from 'react';
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
    FileDown,
    CalendarX2,
    Ban,
    CheckCircle,
    AlertCircle,
    Mail,
    Clock,
    Edit,
    Save,
    PenLine,
    UploadCloud,
    ShoppingBag,
    Package,
    TruckIcon,
    CreditCard,
    Archive,
    Undo,
    Truck,
    ArrowRight,
    Paperclip,
    Send,
    MessageSquare,
    FileIcon,
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
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import {
    useInteractionsQuery,
    InteractionType,
    Interaction,
} from '@/hooks/use-interactions-query';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { showErrorToast } from '@/lib/utils/toast-config';
import Link from 'next/link';
import { AccessLevel } from '@/types/auth';

interface QuotationDetailsModalProps {
    onUpdateStatus: (
        quotationId: number,
        newStatus: OrderStatus,
    ) => Promise<
        | { success: boolean; error?: unknown }
        | { success: boolean; message?: string; error?: unknown }
    >;
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
    const [editingItemId, setEditingItemId] = useState<number | null>(null);
    const [editingField, setEditingField] = useState<
        'quantity' | 'price' | 'discount' | null
    >(null);
    const [editValue, setEditValue] = useState<string>('');
    const [discountValue, setDiscountValue] = useState<string>('0');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editedItems, setEditedItems] = useState<
        Record<
            number,
            { quantity?: number; price?: number; totalPrice?: number }
        >
    >({});
    const [editedDiscount, setEditedDiscount] = useState<number>(0);

    // Chat state
    const [newMessage, setNewMessage] = useState<string>('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
    const profileData = useAuthStore(selectProfileData);
    const { accessToken } = useAuthStore();
    const [localInteractions, setLocalInteractions] = useState<any[]>([]); // Use any[] for optimistic updates

    const quotation = data as Quotation;

    // Determine if user is a client
    const isClient = useMemo(() => {
        // Check profileData first
        if (profileData?.accessLevel === AccessLevel.CLIENT) {
            return true;
        }

        // If not found in profileData, check JWT token
        if (accessToken) {
            try {
                const base64Url = accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(
                            (c) =>
                                '%' +
                                ('00' + c.charCodeAt(0).toString(16)).slice(-2),
                        )
                        .join(''),
                );
                const payload = JSON.parse(jsonPayload);
                return payload.role === 'client' || payload.accessLevel === AccessLevel.CLIENT;
            } catch (e) {
                console.error('Failed to extract role from token:', e);
            }
        }

        return false;
    }, [profileData, accessToken]);

    // Interactions Query Hook
    const {
        useQuotationInteractions,
        sendMessageWithAttachment,
        uploadProgress,
        isUploading,
    } = useInteractionsQuery();

    // Fetch interactions for the current quotation
    const {
        data: interactionsData = [], // Initialize as empty array
        isLoading: isLoadingInteractions,
        refetch: refetchInteractions,
    } = useQuotationInteractions(quotation?.uid);

    // Update local interactions when server data changes or is fetched
    useEffect(() => {
        // Only update local state if loading is finished and data has actually changed
        // This prevents infinite loops caused by new array references from useQuery
        if (!isLoadingInteractions) {
            // Check if data is substantially different (e.g., length change)
            // For more complex scenarios, a deep comparison might be needed, but length check is often sufficient
            if (
                interactionsData &&
                interactionsData.length !==
                    localInteractions.filter((i) => !i.isOptimistic).length
            ) {
                setLocalInteractions(interactionsData);
            } else if (!interactionsData || interactionsData.length === 0) {
                // Clear local interactions if fetched data is empty
                // setLocalInteractions([]);
            }
        }
    }, [interactionsData, isLoadingInteractions]); // Removed localInteractions from dependencies to break loop

    // Refetch interactions when the modal opens, but only if quotation exists
    useEffect(() => {
        if (isOpen && quotation?.uid) {
            refetchInteractions();
        }
    }, [isOpen, quotation?.uid, refetchInteractions]);

    // Set up polling to periodically check for new messages when chat tab is active
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout | null = null;

        if (isOpen && activeTab === 'chat' && quotation?.uid) {
            // Poll every 10 seconds
            pollingInterval = setInterval(() => {
                refetchInteractions();
            }, 10000);
        }

        // Cleanup function to clear the interval
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [isOpen, activeTab, quotation?.uid, refetchInteractions]);

    // Use StatusColors from quotation types
    const getStatusColors = useMemo(() => {
        if (!quotation) return null;
        return (
            StatusColors[quotation.status] || StatusColors[OrderStatus.DRAFT]
        );
    }, [quotation]);

    // Get available next status options based on current status
    const getAvailableNextStatuses = useMemo(() => {
        if (!quotation) return [];

        // Define allowed transitions for each status based on backend logic
        const allowedTransitions: Record<string, OrderStatus[]> = {
            [OrderStatus.DRAFT]: [
                OrderStatus.PENDING_INTERNAL,
                OrderStatus.PENDING_CLIENT,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.PENDING_INTERNAL]: [
                OrderStatus.PENDING_CLIENT,
                OrderStatus.DRAFT,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.PENDING_CLIENT]: [
                OrderStatus.APPROVED,
                OrderStatus.REJECTED,
                OrderStatus.NEGOTIATION,
                OrderStatus.PENDING_INTERNAL,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.NEGOTIATION]: [
                OrderStatus.PENDING_INTERNAL,
                OrderStatus.PENDING_CLIENT,
                OrderStatus.APPROVED,
                OrderStatus.REJECTED,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.APPROVED]: [
                OrderStatus.SOURCING,
                OrderStatus.PACKING,
                OrderStatus.IN_FULFILLMENT,
                OrderStatus.CANCELLED,
                OrderStatus.NEGOTIATION,
            ],
            [OrderStatus.SOURCING]: [
                OrderStatus.PACKING,
                OrderStatus.IN_FULFILLMENT,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.PACKING]: [
                OrderStatus.IN_FULFILLMENT,
                OrderStatus.OUTFORDELIVERY,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.IN_FULFILLMENT]: [
                OrderStatus.PAID,
                OrderStatus.PACKING,
                OrderStatus.OUTFORDELIVERY,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.PAID]: [
                OrderStatus.PACKING,
                OrderStatus.OUTFORDELIVERY,
                OrderStatus.DELIVERED,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.OUTFORDELIVERY]: [
                OrderStatus.DELIVERED,
                OrderStatus.RETURNED,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.DELIVERED]: [
                OrderStatus.COMPLETED,
                OrderStatus.RETURNED,
                OrderStatus.CANCELLED,
            ],
            [OrderStatus.RETURNED]: [
                OrderStatus.COMPLETED,
                OrderStatus.CANCELLED,
                OrderStatus.SOURCING,
                OrderStatus.PACKING,
            ],
            // Legacy statuses support - using string values instead of enum
            pending: [
                OrderStatus.INPROGRESS,
                OrderStatus.APPROVED,
                OrderStatus.REJECTED,
                OrderStatus.CANCELLED,
                OrderStatus.PENDING_INTERNAL,
                OrderStatus.PENDING_CLIENT,
            ],
            [OrderStatus.INPROGRESS]: [
                OrderStatus.COMPLETED,
                OrderStatus.CANCELLED,
                OrderStatus.IN_FULFILLMENT,
                OrderStatus.SOURCING,
                OrderStatus.PACKING,
                OrderStatus.OUTFORDELIVERY,
                OrderStatus.DELIVERED,
            ],
            // Default options for other statuses
            [OrderStatus.COMPLETED]: [OrderStatus.CANCELLED],
            [OrderStatus.REJECTED]: [
                OrderStatus.CANCELLED,
                OrderStatus.NEGOTIATION,
                OrderStatus.PENDING_INTERNAL,
            ],
            [OrderStatus.CANCELLED]: [],
        };

        return allowedTransitions[quotation.status] || [];
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
                const result = await onUpdateStatus(
                    quotation.uid,
                    pendingStatusChange,
                );
                if (result.success) {
                    // Close the confirmation dialog and modal
                    setConfirmStatusChangeOpen(false);
                    onClose();
                }
                // Error handling is now taken care of in the updateStatusMutation
            } catch (error) {
                // No need to throw here, as errors are handled in the mutation
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

    const handleEditClick = () => {
        setIsEditModalOpen(true);
    };

    // Update with a new function to switch to Items tab for editing
    const handleEditItemsClick = () => {
        // Switch to the items tab
        handleTabChange('items');
        // Enter editing mode
        setIsEditing(true);
        // Reset any previous edits when starting a new edit session
        setEditedItems({});
        setEditedDiscount(0);
    };

    // Add handlers for editing fields
    const handleStartEdit = (
        itemId: number,
        field: 'quantity' | 'price',
        value: string,
    ) => {
        // Prevent clients from editing prices
        if (isClient && field === 'price') {
            toast.error('Clients cannot edit item prices. Please contact your sales representative.');
            return;
        }
        
        setEditingItemId(itemId);
        setEditingField(field);
        setEditValue(value);
    };

    const handleStartDiscountEdit = () => {
        setEditingField('discount');
        setDiscountValue('0');
    };

    const handleSaveEdit = () => {
        if (!editingItemId || !editingField || !quotation.quotationItems)
            return;

        // Find the item being edited
        const itemToUpdate = quotation.quotationItems.find(
            (item) => item.uid === editingItemId,
        );
        if (!itemToUpdate) return;

        // Create updated item properties
        let updatedProps: {
            quantity?: number;
            price?: number;
            totalPrice?: number;
        } = {};

        // Update the appropriate field
        if (editingField === 'quantity') {
            const newQuantity =
                parseInt(editValue, 10) || itemToUpdate.quantity;
            updatedProps.quantity = newQuantity;

            // Get the current price (either from edited state or original)
            const currentPrice =
                editedItems[itemToUpdate.uid]?.price ??
                itemToUpdate.product?.price ??
                0;

            // Recalculate total price
            updatedProps.totalPrice = newQuantity * currentPrice;
        } else if (editingField === 'price' && itemToUpdate.product) {
            const newPrice =
                parseFloat(editValue) || itemToUpdate.product.price || 0;
            updatedProps.price = newPrice;

            // Get the current quantity (either from edited state or original)
            const currentQuantity =
                editedItems[itemToUpdate.uid]?.quantity ??
                itemToUpdate.quantity;

            // Recalculate total price
            updatedProps.totalPrice = currentQuantity * newPrice;
        }

        // Update the edited items state
        setEditedItems((prev) => ({
            ...prev,
            [editingItemId]: {
                ...prev[editingItemId],
                ...updatedProps,
            },
        }));

        // Reset editing states
        setEditingItemId(null);
        setEditingField(null);
        setEditValue('');
    };

    const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDiscountValue(e.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleSaveDiscountEdit = () => {
        const newDiscount = parseFloat(discountValue) || 0;
        setEditedDiscount(newDiscount);
        setEditingField(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (editingField === 'discount') {
                handleSaveDiscountEdit();
            } else {
                handleSaveEdit();
            }
        } else if (e.key === 'Escape') {
            setEditingItemId(null);
            setEditingField(null);
        }
    };

    // Get status button variant
    const getStatusButtonVariant = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.DRAFT:
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

    // Add a function to save all changes to the quotation
    const handleSaveQuotationChanges = async () => {
        if (!quotation || !onEditQuotation) return;

        // Create an object with all the updates
        const updatedQuotationData: Partial<Quotation> = {};

        // Add updated items if any were edited
        if (Object.keys(editedItems).length > 0 && quotation.quotationItems) {
            // Create a copy of the quotation items with updates applied
            const updatedItems = quotation.quotationItems.map((item) => {
                const edits = editedItems[item.uid];
                if (!edits) return item;

                const updatedItem = { ...item };

                // Update quantity if edited
                if (edits.quantity !== undefined) {
                    updatedItem.quantity = edits.quantity;
                }

                // Update price if edited
                if (edits.price !== undefined && updatedItem.product) {
                    updatedItem.product = {
                        ...updatedItem.product,
                        price: edits.price,
                    };
                }

                // Update total price
                if (edits.totalPrice !== undefined) {
                    updatedItem.totalPrice = edits.totalPrice;
                }

                return updatedItem;
            });

            updatedQuotationData.quotationItems = updatedItems;

            // Update total amount based on edited items
            updatedQuotationData.totalAmount =
                calculateUpdatedSubtotal() - editedDiscount;
        } else if (editedDiscount > 0) {
            // If only discount was changed, update the total amount accordingly
            updatedQuotationData.totalAmount =
                calculateUpdatedSubtotal() - editedDiscount;
        }

        // Add discount if it was changed
        if (editedDiscount > 0) {
            (updatedQuotationData as any).discount = editedDiscount;
        }

        try {
            // Call the onEditQuotation function with the updated data
            await onEditQuotation(quotation.uid, updatedQuotationData);

            // Exit editing mode
            setIsEditing(false);

            // Reset all editing states
            setEditingItemId(null);
            setEditingField(null);
            setEditValue('');
            setEditedItems({});
            setEditedDiscount(0);
        } catch (error) {
            console.error('Error updating quotation:', error);
        }
    };

    // Define handleSendMessage function
    const handleSendMessage = async () => {
        if (
            (!newMessage.trim() && attachments.length === 0) ||
            isLoadingChat ||
            isUploading ||
            !quotation?.uid
        ) {
            console.warn(
                'Cannot send message: Empty message/attachment, loading, or quotation UID missing.',
            );
            return;
        }

        setIsLoadingChat(true);

        try {
            // Optimistic update
            const optimisticMessage: Interaction & { isOptimistic: boolean } = {
                uid: Date.now(), // Temporary ID
                message: newMessage,
                attachmentUrl:
                    attachments.length > 0
                        ? URL.createObjectURL(attachments[0])
                        : undefined,
                type: InteractionType.MESSAGE,
                createdBy: {
                    uid: Number(profileData?.uid),
                    name: profileData?.name || 'Unknown',
                    surname: profileData?.surname,
                    photoURL: profileData?.photoURL,
                },
                createdAt: new Date(), // Use current date for optimistic update
                isOptimistic: true,
            };

            // Update local state immediately
            setLocalInteractions((prev) => [...prev, optimisticMessage]);

            const submittedAttachments = [...attachments];
            setNewMessage('');
            setAttachments([]);

            // Send message (with or without attachment)
            await sendMessageWithAttachment({
                message: newMessage,
                file:
                    submittedAttachments.length > 0
                        ? submittedAttachments[0]
                        : undefined,
                type: InteractionType.MESSAGE,
                quotationUid: quotation.uid, // Pass quotation UID
            });

            // Let the automatic refetch handle updating with the real message
            // await refetchInteractions(); // Optional: force immediate refetch if needed
        } catch (error) {
            console.error('Error sending message:', error);
            showErrorToast('Failed to send message. Please try again.', toast);

            // Remove optimistic message on failure
            setLocalInteractions((prev) =>
                prev.filter((msg) => !msg.isOptimistic),
            );

            // Restore message input on failure
            // Consider restoring attachments too if needed
            setNewMessage(newMessage);
        } finally {
            setIsLoadingChat(false);
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
        { id: 'chat', label: 'Chat' },
    ];

    // Add helper functions to calculate totals with edited values
    const calculateUpdatedSubtotal = () => {
        if (
            !quotation.quotationItems ||
            quotation.quotationItems.length === 0
        ) {
            return quotation?.totalAmount || 0;
        }

        return quotation.quotationItems.reduce((total, item) => {
            // Get the edited quantity or use original
            const quantity = editedItems[item.uid]?.quantity ?? item.quantity;

            // Get the edited price or use original
            const price =
                editedItems[item.uid]?.price ?? item.product?.price ?? 0;

            // Calculate the item total
            const itemTotal = quantity * price;

            return total + itemTotal;
        }, 0);
    };

    const calculateUpdatedTotal = () => {
        const subtotal = calculateUpdatedSubtotal();
        return subtotal - editedDiscount;
    };

    const hasEdits = () => {
        return Object.keys(editedItems).length > 0 || editedDiscount > 0;
    };

    // Map status to icon and title for quick actions
    const getStatusButtonConfig = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.DRAFT:
                return {
                    icon: (
                        <AlertCircle
                            strokeWidth={1.2}
                            className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                        />
                    ),
                    title: 'Set as Draft',
                    variant: getStatusButtonVariant(OrderStatus.DRAFT),
                };
            case OrderStatus.PENDING_INTERNAL:
                return {
                    icon: (
                        <Clock
                            strokeWidth={1.2}
                            className="text-orange-600 w-7 h-7 dark:text-orange-400"
                        />
                    ),
                    title: 'Send for Internal Review',
                    variant: getStatusButtonVariant(
                        OrderStatus.PENDING_INTERNAL,
                    ),
                };
            case OrderStatus.PENDING_CLIENT:
                return {
                    icon: (
                        <UploadCloud
                            strokeWidth={1.2}
                            className="text-blue-600 w-7 h-7 dark:text-blue-400"
                        />
                    ),
                    title: 'Send to Client',
                    variant: getStatusButtonVariant(OrderStatus.PENDING_CLIENT),
                };
            case OrderStatus.NEGOTIATION:
                return {
                    icon: (
                        <ArrowRight
                            strokeWidth={1.2}
                            className="text-indigo-600 w-7 h-7 dark:text-indigo-400"
                        />
                    ),
                    title: 'Mark as In Negotiation',
                    variant: getStatusButtonVariant(OrderStatus.NEGOTIATION),
                };
            case OrderStatus.APPROVED:
                return {
                    icon: (
                        <CheckCircle
                            strokeWidth={1.2}
                            className="text-green-600 w-7 h-7 dark:text-green-400"
                        />
                    ),
                    title: 'Set as Approved',
                    variant: getStatusButtonVariant(OrderStatus.APPROVED),
                };
            case OrderStatus.REJECTED:
                return {
                    icon: (
                        <Ban
                            strokeWidth={1.2}
                            className="text-red-600 w-7 h-7 dark:text-red-400"
                        />
                    ),
                    title: 'Set as Rejected',
                    variant: getStatusButtonVariant(OrderStatus.REJECTED),
                };
            case OrderStatus.SOURCING:
                return {
                    icon: (
                        <ShoppingBag
                            strokeWidth={1.2}
                            className="text-purple-600 w-7 h-7 dark:text-purple-400"
                        />
                    ),
                    title: 'Start Sourcing',
                    variant: getStatusButtonVariant(OrderStatus.SOURCING),
                };
            case OrderStatus.PACKING:
                return {
                    icon: (
                        <Package
                            strokeWidth={1.2}
                            className="text-blue-600 w-7 h-7 dark:text-blue-400"
                        />
                    ),
                    title: 'Start Packing',
                    variant: getStatusButtonVariant(OrderStatus.PACKING),
                };
            case OrderStatus.IN_FULFILLMENT:
                return {
                    icon: (
                        <Archive
                            strokeWidth={1.2}
                            className="text-indigo-600 w-7 h-7 dark:text-indigo-400"
                        />
                    ),
                    title: 'Mark as In Fulfillment',
                    variant: getStatusButtonVariant(OrderStatus.IN_FULFILLMENT),
                };
            case OrderStatus.PAID:
                return {
                    icon: (
                        <CreditCard
                            strokeWidth={1.2}
                            className="text-green-600 w-7 h-7 dark:text-green-400"
                        />
                    ),
                    title: 'Mark as Paid',
                    variant: getStatusButtonVariant(OrderStatus.PAID),
                };
            case OrderStatus.OUTFORDELIVERY:
                return {
                    icon: (
                        <Truck
                            strokeWidth={1.2}
                            className="text-blue-600 w-7 h-7 dark:text-blue-400"
                        />
                    ),
                    title: 'Mark as Out for Delivery',
                    variant: getStatusButtonVariant(OrderStatus.OUTFORDELIVERY),
                };
            case OrderStatus.DELIVERED:
                return {
                    icon: (
                        <TruckIcon
                            strokeWidth={1.2}
                            className="text-green-600 w-7 h-7 dark:text-green-400"
                        />
                    ),
                    title: 'Mark as Delivered',
                    variant: getStatusButtonVariant(OrderStatus.DELIVERED),
                };
            case OrderStatus.RETURNED:
                return {
                    icon: (
                        <Undo
                            strokeWidth={1.2}
                            className="text-orange-600 w-7 h-7 dark:text-orange-400"
                        />
                    ),
                    title: 'Mark as Returned',
                    variant: getStatusButtonVariant(OrderStatus.RETURNED),
                };
            case OrderStatus.COMPLETED:
                return {
                    icon: (
                        <CheckCheck
                            strokeWidth={1.2}
                            className="text-purple-600 w-7 h-7 dark:text-purple-400"
                        />
                    ),
                    title: 'Set as Completed',
                    variant: getStatusButtonVariant(OrderStatus.COMPLETED),
                };
            case OrderStatus.CANCELLED:
                return {
                    icon: (
                        <CalendarX2
                            strokeWidth={1.2}
                            className="text-orange-600 w-7 h-7 dark:text-orange-400"
                        />
                    ),
                    title: 'Set as Cancelled',
                    variant: getStatusButtonVariant(OrderStatus.CANCELLED),
                };
            case OrderStatus.INPROGRESS:
                return {
                    icon: (
                        <Clock
                            strokeWidth={1.2}
                            className="text-blue-600 w-7 h-7 dark:text-blue-400"
                        />
                    ),
                    title: 'Set as In Progress',
                    variant: getStatusButtonVariant(OrderStatus.INPROGRESS),
                };
            default:
                return {
                    icon: <AlertCircle strokeWidth={1.2} className="w-7 h-7" />,
                    title: `Change to ${status}`,
                    variant: getStatusButtonVariant(status),
                };
        }
    };

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
                                {quotation.pdfURL && (
                                    <Link
                                        href={quotation.pdfURL}
                                        target="_blank"
                                        className="cursor-pointer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FileDown
                                            size={18}
                                            strokeWidth={1.5}
                                            className="text-muted-foreground/50 hover:text-muted-foreground"
                                        />
                                    </Link>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full"
                                >
                                    <X className="w-5 h-5" />
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
                                                                <div className="flex items-center justify-center">
                                                                    {isEditing &&
                                                                    editingItemId ===
                                                                        item.uid &&
                                                                    editingField ===
                                                                        'quantity' ? (
                                                                        <div className="flex items-center">
                                                                            <input
                                                                                type="number"
                                                                                className="w-16 px-2 py-1 text-sm font-thin border rounded focus:outline-none focus:ring-1 focus:ring-primary font-body"
                                                                                value={
                                                                                    editValue
                                                                                }
                                                                                onChange={
                                                                                    handleInputChange
                                                                                }
                                                                                onKeyDown={
                                                                                    handleKeyDown
                                                                                }
                                                                                autoFocus
                                                                                min="1"
                                                                            />
                                                                            <button
                                                                                className="p-1 ml-1 text-primary hover:text-primary/80"
                                                                                onClick={
                                                                                    handleSaveEdit
                                                                                }
                                                                            >
                                                                                <Save className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            className={`flex items-center ${isEditing ? 'cursor-pointer group' : ''}`}
                                                                            onClick={() =>
                                                                                isEditing &&
                                                                                handleStartEdit(
                                                                                    item.uid,
                                                                                    'quantity',
                                                                                    item.quantity.toString(),
                                                                                )
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={`text-sm font-medium font-body ${
                                                                                    editedItems[
                                                                                        item
                                                                                            .uid
                                                                                    ]
                                                                                        ?.quantity !==
                                                                                    undefined
                                                                                        ? 'text-primary font-semibold'
                                                                                        : ''
                                                                                }`}
                                                                            >
                                                                                {editedItems[
                                                                                    item
                                                                                        .uid
                                                                                ]
                                                                                    ?.quantity ??
                                                                                    item.quantity}
                                                                            </span>
                                                                            {isEditing && (
                                                                                <PenLine
                                                                                    className="ml-1 text-primary"
                                                                                    size={
                                                                                        20
                                                                                    }
                                                                                    strokeWidth={
                                                                                        1.2
                                                                                    }
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2 text-right">
                                                                {isEditing &&
                                                                editingItemId ===
                                                                    item.uid &&
                                                                editingField ===
                                                                    'price' ? (
                                                                    <div className="flex items-center justify-end">
                                                                        <input
                                                                            type="number"
                                                                            className="w-20 px-2 py-1 text-sm font-thin border rounded focus:outline-none focus:ring-1 focus:ring-primary font-body"
                                                                            value={
                                                                                editValue
                                                                            }
                                                                            onChange={
                                                                                handleInputChange
                                                                            }
                                                                            onKeyDown={
                                                                                handleKeyDown
                                                                            }
                                                                            autoFocus
                                                                            min="0"
                                                                            step="0.01"
                                                                        />
                                                                        <button
                                                                            className="p-1 ml-1 text-primary hover:text-primary/80"
                                                                            onClick={
                                                                                handleSaveEdit
                                                                            }
                                                                        >
                                                                            <Save className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className={`flex items-center justify-end ${
                                                                            isEditing && !isClient 
                                                                                ? 'cursor-pointer group' 
                                                                                : isClient 
                                                                                    ? 'cursor-not-allowed opacity-60' 
                                                                                    : ''
                                                                        }`}
                                                                        onClick={() =>
                                                                            isEditing &&
                                                                            !isClient &&
                                                                            handleStartEdit(
                                                                                item.uid,
                                                                                'price',
                                                                                item.product.price?.toString() ||
                                                                                    '0',
                                                                            )
                                                                        }
                                                                        title={isClient ? 'Clients cannot edit item prices' : ''}
                                                                    >
                                                                        <span
                                                                            className={`text-[10px] font-medium font-body ${
                                                                                editedItems[
                                                                                    item
                                                                                        .uid
                                                                                ]
                                                                                    ?.price !==
                                                                                undefined
                                                                                    ? 'text-primary font-semibold'
                                                                                    : ''
                                                                            } ${isEditing ? 'group-hover:text-primary' : ''}`}
                                                                        >
                                                                            {formatCurrency(
                                                                                editedItems[
                                                                                    item
                                                                                        .uid
                                                                                ]
                                                                                    ?.price ??
                                                                                    item
                                                                                        .product
                                                                                        .price ??
                                                                                    0,
                                                                            )}
                                                                        </span>
                                                                        {isEditing && !isClient && (
                                                                            <PenLine
                                                                                className="ml-1 text-primary"
                                                                                size={
                                                                                    20
                                                                                }
                                                                                strokeWidth={
                                                                                    1.2
                                                                                }
                                                                            />
                                                                        )}
                                                                        {isEditing && isClient && (
                                                                            <span className="ml-1 text-xs text-muted-foreground">(Read Only)</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="col-span-2 text-right">
                                                                <span
                                                                    className={`text-sm font-medium font-body ${
                                                                        editedItems[
                                                                            item
                                                                                .uid
                                                                        ]
                                                                            ?.totalPrice !==
                                                                        undefined
                                                                            ? 'text-primary font-semibold'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {formatCurrency(
                                                                        editedItems[
                                                                            item
                                                                                .uid
                                                                        ]
                                                                            ?.totalPrice ??
                                                                            (item.totalPrice ||
                                                                                0),
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
                                                                calculateUpdatedSubtotal(),
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between w-48">
                                                        <span className="text-[10px] font-normal uppercase font-body">
                                                            Discount:
                                                        </span>
                                                        {isEditing &&
                                                        editingField ===
                                                            'discount' ? (
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="number"
                                                                    className="w-20 px-2 py-1 text-sm font-thin border rounded focus:outline-none focus:ring-1 focus:ring-primary font-body"
                                                                    value={
                                                                        discountValue
                                                                    }
                                                                    onChange={
                                                                        handleDiscountChange
                                                                    }
                                                                    onKeyDown={
                                                                        handleKeyDown
                                                                    }
                                                                    autoFocus
                                                                    min="0"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                />
                                                                <button
                                                                    className="p-1 ml-1 text-primary hover:text-primary/80"
                                                                    onClick={
                                                                        handleSaveDiscountEdit
                                                                    }
                                                                >
                                                                    <Save className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className={`flex items-center ${isEditing ? 'cursor-pointer group' : ''}`}
                                                                onClick={() =>
                                                                    isEditing &&
                                                                    handleStartDiscountEdit()
                                                                }
                                                            >
                                                                <span
                                                                    className={`font-thin font-body ${isEditing ? 'group-hover:text-primary' : ''}`}
                                                                >
                                                                    {formatCurrency(
                                                                        editedDiscount,
                                                                    )}
                                                                </span>
                                                                {isEditing && (
                                                                    <PenLine
                                                                        className="ml-1 text-primary"
                                                                        size={
                                                                            20
                                                                        }
                                                                        strokeWidth={
                                                                            1.2
                                                                        }
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between w-48 font-semibold text-primary">
                                                        <span className="font-normal uppercase text-md font-body">
                                                            Total:
                                                        </span>
                                                        <span
                                                            className={`font-thin font-body text-md ${
                                                                hasEdits()
                                                                    ? 'text-primary font-semibold'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {formatCurrency(
                                                                calculateUpdatedTotal(),
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
                                    <div className="flex items-center gap-3 rounded-md border-primary">
                                        <Avatar className="w-12 h-12 border rounded-full border-primary">
                                            <AvatarImage
                                                src={
                                                    quotation.client?.logo || ''
                                                }
                                                className="object-contain p-1"
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

                        {activeTab === 'chat' && (
                            <div className="flex flex-col h-full">
                                {/* Chat Messages */}
                                <div className="flex flex-col flex-1 gap-3 py-3 overflow-y-auto max-h-[50vh]">
                                    {isLoadingInteractions &&
                                    localInteractions.length === 0 ? (
                                        <div className="flex items-center justify-center h-20">
                                            <svg
                                                className="w-8 h-8 animate-spin text-primary"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                        </div>
                                    ) : localInteractions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-32">
                                            <MessageSquare
                                                className="w-10 h-10 mb-2 text-muted-foreground"
                                                strokeWidth={1}
                                            />
                                            <p className="text-xs font-light text-muted-foreground font-body">
                                                No messages yet. Start the
                                                conversation!
                                            </p>
                                        </div>
                                    ) : (
                                        localInteractions.map(
                                            (
                                                interaction: Interaction & {
                                                    isOptimistic?: boolean;
                                                },
                                            ) => {
                                                const isCurrentUser =
                                                    interaction?.createdBy
                                                        ?.uid ===
                                                    Number(profileData?.uid);
                                                const senderName = isCurrentUser
                                                    ? 'You'
                                                    : `${interaction?.createdBy?.name || ''} ${interaction?.createdBy?.surname || ''}`.trim() ||
                                                      'Unknown User';

                                                const senderInitial =
                                                    (interaction?.createdBy?.name?.charAt(
                                                        0,
                                                    ) || '') +
                                                    (interaction?.createdBy?.surname?.charAt(
                                                        0,
                                                    ) || '');

                                                return (
                                                    <div
                                                        key={interaction.uid} // Use uid which should be unique
                                                        className={`flex gap-2 flex-row ${isCurrentUser ? 'justify-end' : 'items-end'} ${interaction?.isOptimistic ? 'opacity-70' : ''}`}
                                                    >
                                                        {/* Avatar for other users (left) */}
                                                        {!isCurrentUser && (
                                                            <Avatar className="w-8 h-8 bg-gray-700">
                                                                <AvatarImage
                                                                    src={
                                                                        interaction
                                                                            ?.createdBy
                                                                            ?.photoURL ||
                                                                        '/images/placeholder-avatar.jpg'
                                                                    }
                                                                    alt={
                                                                        senderName
                                                                    }
                                                                />
                                                                <AvatarFallback className="text-xs font-normal text-white uppercase font-body">
                                                                    {senderInitial.toUpperCase() ||
                                                                        'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}

                                                        {/* Message Content Column */}
                                                        <div
                                                            className={`flex flex-col max-w-[80%] ${isCurrentUser ? 'items-end' : 'items-start'}`}
                                                        >
                                                            {/* Sender Name (only for other users) */}
                                                            {!isCurrentUser && (
                                                                <p className="mb-1 text-[10px] font-medium text-muted-foreground font-body ml-3">
                                                                    {senderName}
                                                                </p>
                                                            )}

                                                            {/* Message Bubble */}
                                                            <div
                                                                className={`px-4 py-2 rounded-lg ${
                                                                    isCurrentUser
                                                                        ? 'bg-purple-600 text-white rounded-br-none' // Current user bubble style
                                                                        : 'bg-gray-800 text-white rounded-bl-none' // Other user bubble style
                                                                }`}
                                                            >
                                                                <p className="text-xs font-thin break-words font-body md:text-sm">
                                                                    {
                                                                        interaction.message
                                                                    }
                                                                </p>
                                                                {interaction.attachmentUrl && (
                                                                    <div className="mt-2">
                                                                        {interaction.attachmentUrl.match(
                                                                            /\.(jpeg|jpg|gif|png)$/i,
                                                                        ) ? (
                                                                            <img
                                                                                src={
                                                                                    interaction.attachmentUrl
                                                                                }
                                                                                alt="Attachment"
                                                                                className="object-cover max-w-full rounded-md max-h-48"
                                                                            />
                                                                        ) : (
                                                                            <a
                                                                                href={
                                                                                    interaction.attachmentUrl
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex items-center gap-2 p-2 text-white rounded bg-black/30 hover:bg-black/50"
                                                                            >
                                                                                <FileIcon className="w-4 h-4" />
                                                                                <span className="text-xs underline">
                                                                                    View
                                                                                    Attachment
                                                                                </span>
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <p className="mt-1 text-[10px] font-normal text-white/70 font-body uppercase">
                                                                    {format(
                                                                        new Date(
                                                                            interaction.createdAt,
                                                                        ),
                                                                        'MMM d, h:mm a',
                                                                    )}
                                                                    {interaction.isOptimistic &&
                                                                        ' (sending...)'}
                                                                </p>
                                                            </div>
                                                            {/* Avatar for current user (right, appears below bubble) */}
                                                            {isCurrentUser && (
                                                                <Avatar className="w-8 h-8 mt-2 ml-auto">
                                                                    {' '}
                                                                    {/* Added ml-auto */}
                                                                    <AvatarImage
                                                                        src={
                                                                            interaction
                                                                                ?.createdBy
                                                                                ?.photoURL ||
                                                                            '/images/placeholder-avatar.jpg'
                                                                        }
                                                                        alt={
                                                                            senderName
                                                                        }
                                                                    />
                                                                    <AvatarFallback className="text-xs font-normal text-white uppercase bg-gray-700 font-body">
                                                                        {senderInitial.toUpperCase() ||
                                                                            'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="pt-4 mt-auto">
                                    <div className="p-3 border border-gray-800 rounded-md bg-gray-950">
                                        <textarea
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            placeholder="type your message here..."
                                            className="w-full min-h-[80px] bg-transparent placeholder:text-xs placeholder:font-thin border-0 focus:ring-0 text-[13px] text-white resize-none font-normal focus:outline-none font-body"
                                        />

                                        {/* Selected attachment preview */}
                                        {attachments.length > 0 && (
                                            <div className="p-2 mt-2 border border-gray-700 rounded">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <FileIcon
                                                            className="w-4 h-4 mr-2 text-muted-foreground"
                                                            strokeWidth={1.5}
                                                        />
                                                        <span className="text-xs font-light font-body truncate max-w-[150px] text-white">
                                                            {
                                                                attachments[0]
                                                                    .name
                                                            }
                                                        </span>
                                                        <span className="ml-2 text-xs text-muted-foreground">
                                                            (
                                                            {Math.round(
                                                                attachments[0]
                                                                    .size /
                                                                    1024,
                                                            )}{' '}
                                                            KB)
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="p-1 text-gray-400 rounded hover:bg-gray-800"
                                                        onClick={() =>
                                                            setAttachments([])
                                                        }
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Progress bar */}
                                                {isUploading &&
                                                    uploadProgress[
                                                        attachments[0].name
                                                    ] !== undefined && (
                                                        <Progress
                                                            value={
                                                                uploadProgress[
                                                                    attachments[0]
                                                                        .name
                                                                ]
                                                            }
                                                            className="h-1 mt-2 bg-gray-700"
                                                        />
                                                    )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-800">
                                            <div className="flex items-center gap-2">
                                                <label className="flex items-center justify-center w-8 h-8 text-gray-400 transition rounded-full cursor-pointer hover:bg-gray-800">
                                                    <Paperclip className="w-4 h-4" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            if (
                                                                e.target
                                                                    .files &&
                                                                e.target.files
                                                                    .length > 0
                                                            ) {
                                                                setAttachments([
                                                                    e.target
                                                                        .files[0],
                                                                ]); // Allow only one attachment
                                                            }
                                                        }}
                                                        disabled={
                                                            isLoadingChat ||
                                                            isUploading
                                                        }
                                                    />
                                                </label>
                                            </div>
                                            <button
                                                onClick={handleSendMessage} // Ensure this function is defined
                                                disabled={
                                                    (!newMessage.trim() &&
                                                        attachments.length ===
                                                            0) ||
                                                    isLoadingChat ||
                                                    isUploading
                                                }
                                                className="px-8 py-2 text-[10px] font-normal text-white transition-colors rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            >
                                                {isLoadingChat ||
                                                isUploading ? (
                                                    <>
                                                        <span className="text-xs font-normal uppercase font-body">
                                                            Sending...
                                                        </span>
                                                        <svg
                                                            className="w-3 h-3 ml-1 animate-spin"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-xs font-normal uppercase font-body">
                                                            Send
                                                        </p>
                                                        <Send
                                                            className="w-4 h-4 ml-1"
                                                            strokeWidth={1.2}
                                                        />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col items-center gap-2 pt-4 border-t border-border/10">
                        <div className="w-full">
                            {/* Hide footer actions when chat tab is active */}
                            {activeTab !== 'chat' &&
                                (isEditing ? (
                                    <>
                                        <h3 className="mb-4 text-xs font-thin text-center uppercase font-body">
                                            Editing Quotation
                                        </h3>
                                        <div className="flex items-center justify-center gap-4">
                                            <Button
                                                variant="default"
                                                className="w-[250px] px-6 py-2 bg-primary hover:bg-primary/90"
                                                onClick={
                                                    handleSaveQuotationChanges
                                                }
                                            >
                                                <Save className="w-4 h-4 mr-2 text-white" />
                                                <span className="text-xs font-thin text-white uppercase font-body">
                                                    Update Quotation
                                                </span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-[250px] px-6 py-2"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    // Clear all editing states
                                                    setEditingItemId(null);
                                                    setEditingField(null);
                                                    setEditValue('');
                                                    setEditedItems({});
                                                    setEditedDiscount(0);
                                                }}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                <span className="text-xs font-thin uppercase font-body">
                                                    Cancel
                                                </span>
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="mb-4 text-xs font-thin text-center uppercase font-body">
                                            Quick Actions
                                        </h3>
                                        <div className="flex flex-wrap items-center justify-center gap-4">
                                            {/* Dynamically render available status actions */}
                                            {getAvailableNextStatuses.map(
                                                (nextStatus: OrderStatus) => {
                                                    const config =
                                                        getStatusButtonConfig(
                                                            nextStatus,
                                                        );
                                                    return (
                                                        <Button
                                                            key={nextStatus}
                                                            variant="outline"
                                                            size="icon"
                                                            className={`w-14 h-14 rounded-full ${config.variant}`}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    nextStatus,
                                                                )
                                                            }
                                                            title={config.title}
                                                        >
                                                            {config.icon}
                                                        </Button>
                                                    );
                                                },
                                            )}

                                            {/* Edit button - always available */}
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-blue-800 border-blue-200 rounded-full w-14 h-14 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30"
                                                onClick={handleEditItemsClick}
                                                title="Edit Quotation Items"
                                            >
                                                <Edit
                                                    strokeWidth={1.2}
                                                    className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                                />
                                            </Button>

                                            {/* Delete button - always available */}
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
                                    </>
                                ))}
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
