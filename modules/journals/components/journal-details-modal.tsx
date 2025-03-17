'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Journal, JournalStatus } from '@/lib/types/journal';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Calendar,
    Clock,
    User,
    Building,
    Mail,
    Phone,
    Trash2,
    Check,
    X,
    Download,
    Plus,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Package,
    FileText,
    ExternalLink,
    MapPin,
    File as FileIcon,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface JournalDetailsModalProps {
    journal: Journal | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus?: (journalId: number, newStatus: string) => void;
    onDelete?: (journalId: number) => void;
}

export function JournalDetailsModal({
    journal,
    isOpen,
    onClose,
    onUpdateStatus,
    onDelete,
}: JournalDetailsModalProps) {
    if (!journal) return null;

    const [currentStatus, setCurrentStatus] = useState<JournalStatus>(
        journal.status,
    );
    const [activeTab, setActiveTab] = useState<string>('details');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
    const [confirmStatusChangeOpen, setConfirmStatusChangeOpen] =
        useState<boolean>(false);
    const [pendingStatusChange, setPendingStatusChange] =
        useState<JournalStatus | null>(null);

    // Format dates for display
    const formatDate = (date?: string | Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    const formatTime = (date?: string | Date) => {
        if (!date) return '';
        return format(new Date(date), 'h:mm a');
    };

    // Get status badge colors
    const getStatusBadgeColor = (status: JournalStatus) => {
        switch (status) {
            case JournalStatus.PENDING_REVIEW:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case JournalStatus.PUBLISHED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case JournalStatus.DRAFT:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case JournalStatus.REJECTED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case JournalStatus.ARCHIVED:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status button styling
    const getStatusButtonVariant = (status: JournalStatus) => {
        switch (status) {
            case JournalStatus.PENDING_REVIEW:
                return `text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-yellow-900/30 ${currentStatus === status ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''}`;
            case JournalStatus.PUBLISHED:
                return `text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${currentStatus === status ? 'bg-green-100 dark:bg-green-900/30' : ''}`;
            case JournalStatus.DRAFT:
                return `text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30 ${currentStatus === status ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`;
            case JournalStatus.REJECTED:
                return `text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${currentStatus === status ? 'bg-red-100 dark:bg-red-900/30' : ''}`;
            case JournalStatus.ARCHIVED:
                return `text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${currentStatus === status ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`;
            default:
                return '';
        }
    };

    // Check if URL is an image
    const isImageUrl = (url?: string) => {
        if (!url) return false;
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };

    // Format address for display
    const formatAddress = (address?: any) => {
        if (!address) return 'No address provided';

        const parts = [];
        if (address?.street) parts.push(address.street);
        if (address?.suburb) parts.push(address.suburb);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.postalCode) parts.push(address.postalCode);
        if (address.country) parts.push(address.country);

        return parts.join(', ') || 'No address details provided';
    };

    // Status change handlers
    const handleStatusChange = (newStatus: JournalStatus) => {
        if (newStatus === currentStatus) return;
        setPendingStatusChange(newStatus);
        setConfirmStatusChangeOpen(true);
    };

    const confirmStatusChange = () => {
        if (pendingStatusChange && onUpdateStatus) {
            setCurrentStatus(pendingStatusChange);
            setConfirmStatusChangeOpen(false);
            onClose();
            onUpdateStatus(journal.uid, pendingStatusChange);
        }
    };

    // Delete handlers
    const handleDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = () => {
        if (onDelete) {
            onDelete(journal.uid);
            setConfirmDeleteOpen(false);
            onClose();
        }
    };

    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'history', label: 'History' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        {/* Comments */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Comments
                            </h3>
                            <p className="text-xs font-thin whitespace-pre-wrap font-body">
                                {journal.comments || 'No comments provided'}
                            </p>
                        </div>

                        {/* File/Document Display */}
                        {journal.fileURL && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Attached Document
                                </h3>
                                {isImageUrl(journal.fileURL) ? (
                                    <div className="space-y-2">
                                        <div className="overflow-hidden border rounded-md border-border">
                                            <img
                                                src={journal.fileURL}
                                                alt="Journal image"
                                                className="object-contain w-full max-h-[300px]"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 text-[10px] uppercase font-thin font-body"
                                                onClick={() =>
                                                    window.open(
                                                        journal.fileURL,
                                                        '_blank',
                                                    )
                                                }
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View Full Size
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 text-[10px] uppercase font-thin font-body"
                                                onClick={() => {
                                                    const link =
                                                        document.createElement(
                                                            'a',
                                                        );
                                                    link.href = journal.fileURL;
                                                    link.download = `journal-${journal.uid}-image`;
                                                    document.body.appendChild(
                                                        link,
                                                    );
                                                    link.click();
                                                    document.body.removeChild(
                                                        link,
                                                    );
                                                }}
                                            >
                                                <Download className="w-3 h-3" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 p-4 border rounded-md border-border">
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="w-8 h-8 text-primary" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-xs font-normal truncate font-body">
                                                    {journal.fileURL
                                                        .split('/')
                                                        .pop() || 'Document'}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-thin font-body">
                                                    Attached to journal #
                                                    {journal.uid}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 text-[10px] uppercase font-thin font-body"
                                                onClick={() =>
                                                    window.open(
                                                        journal.fileURL,
                                                        '_blank',
                                                    )
                                                }
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Open Document
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 text-[10px] uppercase font-thin font-body"
                                                onClick={() => {
                                                    const link =
                                                        document.createElement(
                                                            'a',
                                                        );
                                                    link.href = journal.fileURL;
                                                    link.download = `journal-${journal.uid}-document`;
                                                    document.body.appendChild(
                                                        link,
                                                    );
                                                    link.click();
                                                    document.body.removeChild(
                                                        link,
                                                    );
                                                }}
                                            >
                                                <Download className="w-3 h-3" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Journal Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Journal Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-body">
                                        Client Reference
                                    </p>
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-1 text-card-foreground/60" />
                                        <span className="text-xs font-thin uppercase font-body">
                                            {journal.clientRef}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-body">
                                        Created Date
                                    </p>
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1 text-card-foreground/60" />
                                        <span className="text-xs font-thin uppercase font-body">
                                            {formatDate(journal.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase text-muted-foreground font-body">
                                        Timestamp
                                    </p>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1 text-card-foreground/60" />
                                        <span className="text-xs font-thin uppercase font-body">
                                            {formatDate(journal.timestamp)}{' '}
                                            {formatTime(journal.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
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
                                        {formatDate(journal.createdAt)}{' '}
                                        {formatTime(journal.createdAt)}
                                    </span>
                                </div>

                                {journal?.updatedAt &&
                                    formatDate(journal?.updatedAt) !==
                                        formatDate(journal?.createdAt) && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <RefreshCw className="w-4 h-4 mr-2 text-card-foreground/60" />
                                                <span className="text-[10px] font-thin uppercase font-body">
                                                    Last Updated
                                                </span>
                                            </div>
                                            <span className="text-xs font-thin font-body">
                                                {formatDate(journal?.updatedAt)}{' '}
                                                {formatTime(journal?.updatedAt)}
                                            </span>
                                        </div>
                                    )}
                            </div>
                        </div>

                        {/* Journal Organization */}
                        {journal.organisation && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Organization
                                </h3>
                                <div className="p-3 border rounded-md border-border/30">
                                    <p className="text-sm font-medium font-body">
                                        {journal.organisation.name}
                                    </p>
                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                        {journal.organisation.email}
                                    </p>
                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                        {journal.organisation.phone}
                                    </p>
                                    {journal.organisation.address && (
                                        <div className="mt-2">
                                            <p className="text-[10px] uppercase text-muted-foreground font-body">
                                                Address
                                            </p>
                                            <p className="text-xs font-thin font-body">
                                                {formatAddress(
                                                    journal.organisation
                                                        .address,
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Journal Branch */}
                        {journal.branch && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Branch Details
                                </h3>
                                <div className="p-3 border rounded-md border-border/30">
                                    <p className="text-sm font-medium font-body">
                                        {journal.branch.name}
                                    </p>
                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                        {journal.branch.email}
                                    </p>
                                    <p className="text-xs font-thin text-muted-foreground font-body">
                                        {journal.branch.phone}
                                    </p>
                                    {journal.branch.address && (
                                        <div className="mt-2">
                                            <p className="text-[10px] uppercase text-muted-foreground font-body">
                                                Address
                                            </p>
                                            <p className="text-xs font-thin font-body">
                                                {formatAddress(
                                                    journal.branch.address,
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Journal Owner */}
                        {journal.owner && (
                            <div className="p-4 rounded-lg bg-card/50">
                                <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                    Owner
                                </h3>
                                <div className="flex items-center gap-3 p-3 border rounded-md border-border/30">
                                    <Avatar className="w-12 h-12 border border-primary/30">
                                        <AvatarImage
                                            src={journal.owner.photoURL}
                                            alt={journal.owner.name}
                                        />
                                        <AvatarFallback>
                                            {journal.owner.name?.charAt(0)}
                                            {journal.owner.surname?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium font-body">
                                            {journal.owner.name}{' '}
                                            {journal.owner.surname}
                                        </p>
                                        <p className="text-xs font-thin text-muted-foreground font-body">
                                            {journal.owner.email}
                                        </p>
                                        {journal.owner.phone && (
                                            <p className="text-xs font-thin text-muted-foreground font-body">
                                                {journal.owner.phone}
                                            </p>
                                        )}
                                    </div>
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
                                <div className="relative">
                                    <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-green-500 dark:bg-green-600 text-white">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-xs font-normal uppercase font-body">
                                            Journal created
                                        </p>
                                        <p className="text-xs font-thin uppercase text-card-foreground/50 dark:text-gray-400 font-body">
                                            {formatDate(journal.createdAt)}{' '}
                                            {formatTime(journal.createdAt)}
                                        </p>
                                        <p className="text-[10px] font-normal text-card-foreground/60 uppercase dark:text-gray-400 font-body">
                                            Created by{' '}
                                            {journal?.owner?.name || 'System'}
                                        </p>
                                    </div>
                                </div>
                                {journal?.updatedAt &&
                                    formatDate(journal?.updatedAt) !==
                                        formatDate(journal?.createdAt) && (
                                        <div className="relative">
                                            <div className="absolute left-[-32px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 dark:bg-blue-600 text-white">
                                                <RefreshCw className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-xs font-normal uppercase font-body">
                                                    Journal updated
                                                </p>
                                                <p className="text-xs font-thin uppercase text-card-foreground/50 dark:text-gray-400 font-body">
                                                    {formatDate(
                                                        journal?.updatedAt,
                                                    )}{' '}
                                                    {formatTime(
                                                        journal?.updatedAt,
                                                    )}
                                                </p>
                                                <p className="text-[10px] font-normal text-card-foreground/60 uppercase dark:text-gray-400 font-body">
                                                    Status: {journal?.status}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-lg font-thin uppercase font-body">
                                Journal #{journal.uid}
                            </DialogTitle>
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

                    {/* Tab Navigation */}
                    <div className="mt-4">
                        <div className="flex items-center mb-6 overflow-x-auto border-b border-border/10">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
                                >
                                    <div
                                        className={`mb-3 font-body px-0 font-normal cursor-pointer ${
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
                        {renderTabContent()}
                    </div>

                    {/* Status Change Section */}
                    <DialogFooter className="flex-col items-center gap-6 pt-4 mt-6 border-t sm:gap-4">
                        <div className="flex flex-col items-center w-full gap-4">
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-thin uppercase font-body">
                                    Quick Actions
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center w-full gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(JournalStatus.PENDING_REVIEW)}`}
                                    onClick={() =>
                                        handleStatusChange(JournalStatus.PENDING_REVIEW)
                                    }
                                    title="Set to Pending Review"
                                >
                                    <Clock
                                        strokeWidth={1.2}
                                        className="text-yellow-600 w-7 h-7 dark:text-yellow-400"
                                    />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(JournalStatus.PUBLISHED)}`}
                                    onClick={() =>
                                        handleStatusChange(JournalStatus.PUBLISHED)
                                    }
                                    title="Set as Published"
                                >
                                    <CheckCircle2
                                        strokeWidth={1.2}
                                        className="text-green-600 w-7 h-7 dark:text-green-400"
                                    />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(JournalStatus.DRAFT)}`}
                                    onClick={() =>
                                        handleStatusChange(JournalStatus.DRAFT)
                                    }
                                    title="Set as Draft"
                                >
                                    <RefreshCw
                                        strokeWidth={1.2}
                                        className="text-blue-600 w-7 h-7 dark:text-blue-400"
                                    />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(JournalStatus.REJECTED)}`}
                                    onClick={() =>
                                        handleStatusChange(JournalStatus.REJECTED)
                                    }
                                    title="Set as Rejected"
                                >
                                    <XCircle
                                        strokeWidth={1.2}
                                        className="text-red-600 w-7 h-7 dark:text-red-400"
                                    />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`w-14 h-14 rounded-full ${getStatusButtonVariant(JournalStatus.ARCHIVED)}`}
                                    onClick={() =>
                                        handleStatusChange(JournalStatus.ARCHIVED)
                                    }
                                    title="Set as Archived"
                                >
                                    <Package
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
                                        title="Delete Journal"
                                    >
                                        <Trash2
                                            strokeWidth={1.2}
                                            className="text-red-600 w-7 h-7 dark:text-red-400"
                                        />
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full w-14 h-14"
                                    asChild
                                    title="Download Journal"
                                >
                                    <a
                                        href={journal.fileURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        <Download
                                            strokeWidth={1.2}
                                            className="w-7 h-7 text-primary"
                                        />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for Status Change */}
            <AlertDialog
                open={confirmStatusChangeOpen}
                onOpenChange={setConfirmStatusChangeOpen}
            >
                <AlertDialogContent className="font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-thin uppercase font-body">
                            Confirm Status Change
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-thin font-body">
                            Are you sure you want to change the status of this
                            journal
                            {pendingStatusChange &&
                                ` to ${pendingStatusChange}`}
                            ? This action cannot be undone.
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

            {/* Confirmation Dialog for Delete */}
            <AlertDialog
                open={confirmDeleteOpen}
                onOpenChange={setConfirmDeleteOpen}
            >
                <AlertDialogContent className="font-body">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-thin uppercase font-body">
                            Confirm Deletion
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-thin font-body">
                            Are you sure you want to delete this journal? This
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
        </>
    );
}
