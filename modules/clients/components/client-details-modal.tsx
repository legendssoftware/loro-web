'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Building,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Edit,
    X,
    MapPin,
    Globe,
    FileText,
    Tag,
    UserCheck,
    UserX,
    AlertCircle,
    Trash,
    CheckCircle,
    Ban,
} from 'lucide-react';
import { Client, ClientStatus } from '@/hooks/use-clients-query';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { showErrorToast } from '@/lib/utils/toast-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

interface ClientDetailsModalProps {
    client: Client;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus?: (clientId: number, newStatus: string) => void;
    onDelete?: (clientId: number) => void;
}

export function ClientDetailsModal({
    client,
    isOpen,
    onClose,
    onUpdateStatus,
    onDelete,
}: ClientDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<string>('details');
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showStatusChangeConfirmation, setShowStatusChangeConfirmation] = useState<boolean>(false);
    const [pendingStatusChange, setPendingStatusChange] = useState<ClientStatus | null>(null);

    // Format dates
    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    // Handle status change
    const initiateStatusChange = (status: ClientStatus) => {
        if (client.status === status) {
            return;
        }

        setPendingStatusChange(status);
        setShowStatusChangeConfirmation(true);
    };

    const confirmStatusChange = () => {
        if (pendingStatusChange && onUpdateStatus) {
            onUpdateStatus(client.uid, pendingStatusChange);
            setShowStatusChangeConfirmation(false);
            setPendingStatusChange(null);
        }
    };

    const cancelStatusChange = () => {
        setShowStatusChangeConfirmation(false);
        setPendingStatusChange(null);
    };

    const getStatusDisplayName = (status: ClientStatus | null): string => {
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
    const getStatusBadgeColor = (status?: ClientStatus) => {
        if (!status)
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        switch (status) {
            case ClientStatus.ACTIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case ClientStatus.INACTIVE:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case ClientStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case ClientStatus.DELETED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    // Get category badge color
    const getCategoryBadgeColor = (category?: string) => {
        if (!category)
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';

        // Map common categories to colors
        const categoryColors: Record<string, string> = {
            contract:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            supplier:
                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            partner:
                'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
            distributor:
                'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
        };

        return (
            categoryColors[category.toLowerCase()] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        );
    };

    // Handle delete client
    const handleDelete = useCallback(() => {
        if (onDelete) {
            onDelete(client.uid);
            setShowDeleteConfirmation(false);
            toast.success('Client deleted successfully');
            onClose();
        }
    }, [client.uid, onDelete, onClose]);

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
        { id: 'quotes', label: 'Quotes' },
        { id: 'activity', label: 'Activity' },
    ];

    const statusIcons = {
        [ClientStatus.ACTIVE]: UserCheck,
        [ClientStatus.INACTIVE]: UserX,
        [ClientStatus.PENDING]: AlertCircle,
        [ClientStatus.DELETED]: Trash,
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        {/* Client Profile Info */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Client Information
                            </h3>
                            <div className="flex items-start gap-4">
                                <Avatar className="w-20 h-20 border-2 border-primary">
                                    <AvatarImage
                                        src={client.logo}
                                        alt={client.name}
                                    />
                                    <AvatarFallback className="text-2xl font-body">
                                        {client.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <div className="grid gap-2">
                                        <h2 className="text-xl font-bold font-body">
                                            {client.name}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            {client.category && (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-4 py-1 font-body border-0 ${getCategoryBadgeColor(
                                                        client.category,
                                                    )}`}
                                                >
                                                    {client.category.toUpperCase()}
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-4 py-1 font-body border-0 ${getStatusBadgeColor(
                                                    client.status,
                                                )}`}
                                            >
                                                {client.status?.toUpperCase() ||
                                                    'UNKNOWN'}
                                            </Badge>
                                        </div>

                                        {client.contactPerson && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Briefcase className="w-4 h-4 mr-1" />
                                                <span className="text-xs font-thin uppercase font-body">
                                                    Contact:{' '}
                                                    {client.contactPerson}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Contact Information
                            </h3>
                            <div className="grid gap-3">
                                {client.email && (
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            {client.email}
                                        </span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            {client.phone}
                                        </span>
                                    </div>
                                )}
                                {client.website && (
                                    <div className="flex items-center">
                                        <Globe className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            {client.website}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Address Information */}
                        {client.address && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Address
                                </h3>
                                <div className="grid gap-3">
                                    <div className="flex items-start">
                                        <MapPin className="w-4 h-4 mt-0.5 mr-2 text-card-foreground/60" />
                                        <div className="text-xs font-thin font-body">
                                            {client.address.street && (
                                                <div>
                                                    {client.address.street}
                                                </div>
                                            )}
                                            {client.address.suburb && (
                                                <div>
                                                    {client.address.suburb}
                                                </div>
                                            )}
                                            {client.address.city &&
                                                client.address.state && (
                                                    <div>
                                                        {client.address.city},{' '}
                                                        {client.address.state}
                                                    </div>
                                                )}
                                            {client.address.country && (
                                                <div>
                                                    {client.address.country}
                                                </div>
                                            )}
                                            {client.address.postalCode && (
                                                <div>
                                                    {client.address.postalCode}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Additional Information
                            </h3>
                            <div className="grid gap-3">
                                {client.type && (
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Type: {client.type}
                                        </span>
                                    </div>
                                )}
                                {client.industry && (
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Industry: {client.industry}
                                        </span>
                                    </div>
                                )}
                                {client.ref && (
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Reference: {client.ref}
                                        </span>
                                    </div>
                                )}
                                {client.createdAt && (
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Client since:{' '}
                                            {formatDate(client.createdAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {client.description && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Description
                                </h3>
                                <p className="text-xs text-muted-foreground font-body">
                                    {client.description}
                                </p>
                            </div>
                        )}

                        {/* Notes */}
                        {client.notes && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Notes
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {client.notes}
                                </p>
                            </div>
                        )}
                    </div>
                );
            case 'quotes':
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Quotes Coming Soon
                            </h3>
                            <p className="text-xs uppercase text-muted-foreground font-body">
                                This feature will be available in a future
                                update.
                            </p>
                        </div>
                    </div>
                );
            case 'activity':
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Activity Log Coming Soon
                            </h3>
                            <p className="text-xs uppercase text-muted-foreground font-body">
                                This feature will be available in a future
                                update.
                            </p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">
                            Select a tab to view details
                        </p>
                    </div>
                );
        }
    };

    // Render the main modal
    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold uppercase font-body">
                                {client.name}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getStatusBadgeColor(
                                        client.status,
                                    )}`}
                                >
                                    {client.status?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                                {client.category && (
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getCategoryBadgeColor(
                                            client.category,
                                        )}`}
                                    >
                                        {client.category.toUpperCase()}
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

                    {/* Action Buttons */}
                    <DialogFooter className="flex flex-col flex-wrap gap-4 pt-4 mt-6 border-t dark:border-gray-700">
                        <div className="flex flex-col items-center justify-center w-full">
                            <p className="text-xs font-thin uppercase font-body">
                                Quick Actions
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center w-full gap-3">
                            {/* Warning/Pending Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${client.status === ClientStatus.PENDING ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ClientStatus.PENDING)
                                }
                                title="Set as Pending"
                            >
                                <AlertCircle
                                    strokeWidth={1.2}
                                    className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                />
                            </Button>

                            {/* Active/Approved Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${client.status === ClientStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ClientStatus.ACTIVE)
                                }
                                title="Activate Client"
                            >
                                <CheckCircle
                                    strokeWidth={1.2}
                                    className="text-green-600 w-7 h-7 dark:text-green-400"
                                />
                            </Button>

                            {/* Inactive/Rejected Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${client.status === ClientStatus.INACTIVE ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(ClientStatus.INACTIVE)
                                }
                                title="Deactivate Client"
                            >
                                <Ban
                                    strokeWidth={1.2}
                                    className="text-red-600 w-7 h-7 dark:text-red-400"
                                />
                            </Button>

                            {/* Schedule/Calendar Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-purple-800 border-purple-200 rounded-full w-14 h-14 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30"
                                onClick={handleEditClick}
                                title="Schedule"
                            >
                                <Calendar
                                    strokeWidth={1.2}
                                    className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                />
                            </Button>

                            {/* Edit/Task Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-blue-800 border-blue-200 rounded-full w-14 h-14 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30"
                                onClick={handleEditClick}
                                title="Edit Client"
                            >
                                <Edit
                                    strokeWidth={1.2}
                                    className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                />
                            </Button>

                            {/* Delete Button */}
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-800 border-red-200 rounded-full w-14 h-14 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30"
                                    onClick={handleInitiateDelete}
                                    title="Delete Client"
                                >
                                    <Trash
                                        strokeWidth={1.2}
                                        className="text-red-600 w-7 h-7 dark:text-red-400"
                                    />
                                </Button>
                            )}
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
                                ARE YOU SURE YOU WANT TO CHANGE THE STATUS OF THIS CLIENT TO{' '}
                                <span className="font-semibold">
                                    {pendingStatusChange && getStatusDisplayName(pendingStatusChange)}
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
                            Confirm Delete Client
                        </DialogTitle>
                        <div className="p-0">
                            <h2 className="mb-4 text-base font-semibold text-center uppercase font-body">
                                CONFIRM DELETE CLIENT
                            </h2>
                            <p className="mb-6 text-sm text-center uppercase font-body">
                                ARE YOU SURE YOU WANT TO DELETE THIS CLIENT? THIS ACTION CANNOT BE UNDONE.
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
