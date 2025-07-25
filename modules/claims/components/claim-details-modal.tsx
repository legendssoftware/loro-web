'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Claim,
    ClaimStatus,
    StatusColors,
    ClaimCategory,
} from '@/lib/types/claim';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import {
    X,
    Calendar,
    Clock,
    CreditCard,
    FileText,
    Trash2,
    Pencil,
    CheckCheck,
    CalendarX2,
    Ban,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Download,
    File as FileIcon,
} from 'lucide-react';
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

interface ClaimDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    claim?: Claim | null;
    onSave?: (claimData: Partial<Claim>) => void;
    onUpdateStatus?: (claimId: number, newStatus: string) => void;
    onDelete?: (claimId: number) => void;
}

export function ClaimDetailsModal({
    isOpen,
    onClose,
    claim,
    onUpdateStatus,
    onDelete,
}: ClaimDetailsModalProps) {
    const [activeTab, setActiveTab] = useState('details');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] =
        useState(false);
    const [pendingStatusChange, setPendingStatusChange] =
        useState<ClaimStatus | null>(null);
    const [currentStatus, setCurrentStatus] = useState<ClaimStatus>(
        claim?.status || ClaimStatus.PENDING,
    );

    // Format date for display
    const formatDate = (date?: string | Date) => {
        if (!date) return 'Not specified';
        return format(new Date(date), 'MMM d, yyyy');
    };

    const formatTime = (date?: string | Date) => {
        if (!date) return '';
        return format(new Date(date), 'h:mm a');
    };

    // Get status colors
    const getStatusBadgeColor = (status: ClaimStatus) => {
        const colors = StatusColors[status];
        return `${colors.bg} ${colors.text}`;
    };

    // Get status button variant
    const getStatusButtonVariant = (status: ClaimStatus) => {
        switch (status) {
            case ClaimStatus.PENDING:
                return `text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${currentStatus === status ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`;
            case ClaimStatus.APPROVED:
                return `text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${currentStatus === status ? 'bg-green-100 dark:bg-green-900/30' : ''}`;
            case ClaimStatus.REJECTED:
                return `text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${currentStatus === status ? 'bg-red-100 dark:bg-red-900/30' : ''}`;
            case ClaimStatus.PAID:
                return `text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30 ${currentStatus === status ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`;
            case ClaimStatus.CANCELLED:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${currentStatus === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
            default:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${currentStatus === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
        }
    };

    // Handle status change
    const handleStatusChange = (newStatus: ClaimStatus) => {
        if (newStatus === currentStatus) return;
        setPendingStatusChange(newStatus);
        setConfirmStatusChangeOpen(true);
    };

    // Confirm status change
    const confirmStatusChange = () => {
        if (pendingStatusChange && claim && onUpdateStatus) {
            setCurrentStatus(pendingStatusChange);
            setConfirmStatusChangeOpen(false);
            onClose();
            onUpdateStatus(claim.uid, pendingStatusChange);
        }
    };

    // Handle delete
    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (claim && onDelete) {
            onDelete(claim.uid);
            setIsDeleteDialogOpen(false);
            onClose();
        }
    };

    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    // Get owner initials for avatar
    const getOwnerInitials = () => {
        if (!claim?.owner) return 'U';
        const name = claim.owner.name || '';
        const surname = claim.owner.surname || '';
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase() || 'U';
    };

    // Get category color
    const getCategoryColor = (category: ClaimCategory) => {
        switch (category) {
            case ClaimCategory.TRAVEL:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
            case ClaimCategory.ACCOMMODATION:
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300';
            case ClaimCategory.MEALS:
                return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300';
            case ClaimCategory.ENTERTAINMENT:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300';
            case ClaimCategory.TRANSPORT:
            case ClaimCategory.TRANSPORTATION:
                return 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-950/50 dark:text-gray-300';
        }
    };

    // Inside the component function, add this helper function
    const isImageUrl = (url?: string) => {
        if (!url) return false;
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };

    // Function to render tab content (placeholder for future implementation)
    const renderTabContent = () => {
        // If no claim provided, show nothing
        if (!claim) return null;

        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Description
                            </h3>
                            <p className="text-xs font-thin font-body">
                                {claim?.comments || 'No description provided'}
                            </p>
                        </div>

                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Claim Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-body">
                                        Amount
                                    </p>
                                    <p className="text-sm font-thin font-body">
                                        {claim?.amount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-body">
                                        Category
                                    </p>
                                    <p className="text-sm font-thin font-body">
                                        {claim?.category}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-body">
                                        Created Date
                                    </p>
                                    <p className="text-sm font-thin font-body">
                                        {formatDate(claim?.createdAt)}
                                    </p>
                                </div>
                                {claim?.verifiedAt && (
                                    <div>
                                        <p className="text-[10px] uppercase text-muted-foreground font-body">
                                            Verified Date
                                        </p>
                                        <p className="text-sm font-thin font-body">
                                            {formatDate(claim?.verifiedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Timeline
                            </h3>
                            <div className="p-4 space-y-3 rounded-lg bg-card/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-[10px] font-thin uppercase font-body">
                                            Created
                                        </span>
                                    </div>
                                    <span className="text-xs font-thin font-body">
                                        {formatDate(claim?.createdAt)}{' '}
                                        {formatTime(claim?.createdAt)}
                                    </span>
                                </div>

                                {claim?.verifiedAt && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-card-foreground/60" />
                                            <span className="text-[10px] font-thin uppercase font-body">
                                                Verified
                                            </span>
                                        </div>
                                        <span className="text-xs font-thin font-body">
                                            {formatDate(claim?.verifiedAt)}{' '}
                                            {formatTime(claim?.verifiedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {claim?.owner && (
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Owner Details
                                </h3>
                                <div className="flex items-center p-3 rounded-lg bg-card/50">
                                    <Avatar className="w-12 h-12 mr-3 border">
                                        <AvatarImage
                                            src={claim.owner.photoURL}
                                            alt={`${claim.owner.name} ${claim.owner.surname}`}
                                        />
                                        <AvatarFallback>
                                            {getOwnerInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-medium font-body">
                                            {claim.owner.name}{' '}
                                            {claim.owner.surname}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-body">
                                            {claim.owner.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {claim?.branch && (
                            <div>
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Branch Details
                                </h3>
                                <div className="p-3 rounded-lg bg-card/50">
                                    <p className="text-xs font-medium font-body">
                                        {claim.branch.name}
                                    </p>
                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                        {claim.branch.email}
                                    </p>
                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                        {claim.branch.phone}
                                    </p>
                                    {claim.branch.address && (
                                        <div className="mt-2">
                                            <p className="text-[10px] uppercase text-muted-foreground font-body">
                                                Address
                                            </p>
                                            <p className="text-xs font-thin font-body">
                                                {[
                                                    claim.branch.address.street,
                                                    claim.branch.address.suburb,
                                                    claim.branch.address.city,
                                                    claim.branch.address.state,
                                                    claim.branch.address
                                                        .postalCode,
                                                    claim.branch.address
                                                        .country,
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'history':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-thin uppercase font-body">
                                Activity Timeline
                            </h3>
                            <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-green-500 dark:before:bg-green-600">
                                {/* Created activity */}
                                <div className="relative">
                                    <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-green-500 dark:bg-green-600 text-white">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-normal uppercase font-body">
                                            Claim created
                                        </p>
                                        <p className="text-xs font-thin uppercase text-card-foreground/50 font-body">
                                            {formatDate(claim?.createdAt)}{' '}
                                            {formatTime(claim?.createdAt)}
                                        </p>
                                        <p className="text-[10px] font-normal text-card-foreground/60 uppercase font-body">
                                            Created by{' '}
                                            {claim?.owner?.name || 'System'}
                                        </p>
                                    </div>
                                </div>

                                {/* Updated activity */}
                                {claim?.updatedAt &&
                                    formatDate(claim?.updatedAt) !==
                                        formatDate(claim?.createdAt) && (
                                        <div className="relative">
                                            <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 dark:bg-blue-600 text-white">
                                                <Pencil className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-xs font-normal uppercase font-body">
                                                    Claim updated
                                                </p>
                                                <p className="text-xs font-thin uppercase text-card-foreground/50 font-body">
                                                    {formatDate(
                                                        claim?.updatedAt,
                                                    )}{' '}
                                                    {formatTime(
                                                        claim?.updatedAt,
                                                    )}
                                                </p>
                                                <p className="text-[10px] font-normal text-card-foreground/60 uppercase font-body">
                                                    Status: {claim?.status}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                {/* Verified activity */}
                                {claim?.verifiedAt && (
                                    <div className="relative">
                                        <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-green-500 dark:bg-green-600 text-white">
                                            <CheckCheck className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-normal uppercase font-body">
                                                Claim verified
                                            </p>
                                            <p className="text-xs font-thin uppercase text-card-foreground/50 font-body">
                                                {formatDate(claim?.verifiedAt)}{' '}
                                                {formatTime(claim?.verifiedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'documents':
                return (
                    <div className="space-y-6">
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Attached Documents & Media
                            </h3>
                            {claim && claim.documentUrl ? (
                                <div className="space-y-6">
                                    {isImageUrl(claim.documentUrl) ? (
                                        <div className="space-y-4">
                                            <div className="overflow-hidden border rounded-lg border-border">
                                                <img
                                                    src={claim.documentUrl}
                                                    alt="Claim image"
                                                    className="object-contain w-full max-h-[400px]"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 text-xs font-thin uppercase font-body"
                                                    onClick={() =>
                                                        window.open(
                                                            claim.documentUrl,
                                                            '_blank',
                                                        )
                                                    }
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    View Full Size
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 text-xs font-thin uppercase font-body"
                                                    onClick={() => {
                                                        const link =
                                                            document.createElement(
                                                                'a',
                                                            );
                                                        link.href =
                                                            claim.documentUrl!;
                                                        link.download = `claim-${claim.uid}-image`;
                                                        document.body.appendChild(
                                                            link,
                                                        );
                                                        link.click();
                                                        document.body.removeChild(
                                                            link,
                                                        );
                                                    }}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4 p-4 border rounded-lg border-border">
                                            <div className="flex items-center gap-3">
                                                <FileIcon className="w-10 h-10 text-primary" />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-normal truncate font-body">
                                                        {claim.documentUrl
                                                            ?.split('/')
                                                            .pop() || 'Document'}
                                                    </p>
                                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                                        Attached to claim #
                                                        {claim.uid}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 text-xs font-thin uppercase font-body"
                                                    onClick={() =>
                                                        window.open(
                                                            claim.documentUrl,
                                                            '_blank',
                                                        )
                                                    }
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Open Document
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-2 text-xs font-thin uppercase font-body"
                                                    onClick={() => {
                                                        const link =
                                                            document.createElement(
                                                                'a',
                                                            );
                                                        link.href =
                                                            claim.documentUrl!;
                                                        link.download = `claim-${claim.uid}-document`;
                                                        document.body.appendChild(
                                                            link,
                                                        );
                                                        link.click();
                                                        document.body.removeChild(
                                                            link,
                                                        );
                                                    }}
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-10 border rounded-lg border-border/10">
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        No documents or media attached to this claim
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // If no claim provided, show a message
    if (!claim) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
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
        );
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-lg font-thin uppercase font-body">
                                Claim #{claim.uid}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge
                                    variant="outline"
                                    className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getStatusBadgeColor(claim.status)}`}
                                >
                                    {claim.status}
                                </Badge>
                                {claim.category && (
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] font-normal uppercase font-body px-4 py-1 border-0 ${getCategoryColor(claim.category)}`}
                                    >
                                        {claim.category}
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
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        <div className="flex items-center mb-6 overflow-x-auto border-b border-border/10">
                            {['details', 'history', 'documents'].map((tab) => (
                                <div
                                    key={tab}
                                    className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
                                >
                                    <div
                                        className={`mb-3 font-body px-0 font-normal cursor-pointer ${
                                            activeTab === tab
                                                ? 'text-primary dark:text-primary'
                                                : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                        onClick={() => handleTabChange(tab)}
                                    >
                                        <span className="text-xs font-thin uppercase font-body">
                                            {tab.charAt(0).toUpperCase() +
                                                tab.slice(1)}
                                        </span>
                                    </div>
                                    {activeTab === tab && (
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
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(ClaimStatus.PENDING)}`}
                                onClick={() =>
                                    handleStatusChange(ClaimStatus.PENDING)
                                }
                                title="Set as Pending"
                            >
                                <AlertCircle
                                    strokeWidth={1.2}
                                    className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(ClaimStatus.APPROVED)}`}
                                onClick={() =>
                                    handleStatusChange(ClaimStatus.APPROVED)
                                }
                                title="Set as Approved"
                            >
                                <CheckCircle
                                    strokeWidth={1.2}
                                    className="text-green-600 w-7 h-7 dark:text-green-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(ClaimStatus.REJECTED)}`}
                                onClick={() =>
                                    handleStatusChange(ClaimStatus.REJECTED)
                                }
                                title="Set as Rejected"
                            >
                                <Ban
                                    strokeWidth={1.2}
                                    className="text-red-600 w-7 h-7 dark:text-red-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(ClaimStatus.PAID)}`}
                                onClick={() =>
                                    handleStatusChange(ClaimStatus.PAID)
                                }
                                title="Set as Paid"
                            >
                                <CreditCard
                                    strokeWidth={1.2}
                                    className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full ${getStatusButtonVariant(ClaimStatus.CANCELLED)}`}
                                onClick={() =>
                                    handleStatusChange(ClaimStatus.CANCELLED)
                                }
                                title="Set as Cancelled"
                            >
                                <CalendarX2
                                    strokeWidth={1.2}
                                    className="text-gray-600 w-7 h-7 dark:text-gray-400"
                                />
                            </Button>
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-800 border-red-200 rounded-full w-14 h-14 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30"
                                    onClick={handleDelete}
                                    title="Delete Claim"
                                >
                                    <Trash2
                                        strokeWidth={1.2}
                                        className="text-red-600 w-7 h-7 dark:text-red-400"
                                    />
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Change Confirmation Dialog */}
            <AlertDialog
                open={confirmStatusChangeOpen}
                onOpenChange={setConfirmStatusChangeOpen}
            >
                <AlertDialogContent className="font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-thin uppercase font-body">
                            Confirm Status Change
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-thin">
                            Are you sure you want to change the status of this
                            claim
                            {pendingStatusChange &&
                                ` to ${pendingStatusChange}`}
                            ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-thin font-body">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmStatusChange}
                            className="font-thin bg-primary hover:bg-primary/90 font-body"
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent className="font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-thin uppercase font-body">
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-thin font-body">
                            Are you sure you want to delete this claim? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="font-thin font-body">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="font-thin bg-destructive hover:bg-destructive/90 font-body"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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
