'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Claim, ClaimStatus, StatusColors } from '@/lib/types/claim';
import {
    CreditCard,
    Calendar,
    Clock,
    MoreHorizontal,
    Trash2,
    FileText,
} from 'lucide-react';
import { memo, useState, useCallback } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { ClaimDetailsModal } from './claim-details-modal';
import { format } from 'date-fns';

interface ClaimCardProps {
    claim: Claim;
    onUpdateStatus: (claimId: number, newStatus: string) => void;
    onDelete: (claimId: number) => void;
    index?: number;
}

function ClaimCardComponent({
    claim,
    onUpdateStatus,
    onDelete,
    index = 0,
}: ClaimCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use CSS variables for animation delay
    const cardStyle = {
        '--claim-delay': `${Math.min(index * 50, 500)}ms`,
    } as React.CSSProperties;

    // Format date
    const formatDate = (date?: string | Date) => {
        if (!date) return null;
        return format(new Date(date), 'MMM d, yyyy');
    };

    // Generate initials for avatar
    const getOwnerInitials = () => {
        if (!claim?.owner) return 'U';
        const name = claim.owner.name || '';
        const surname = claim.owner.surname || '';
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase() || 'U';
    };

    // Handle status change
    const handleStatusChange = (newStatus: string) => {
        onUpdateStatus(claim.uid, newStatus);
    };

    // Handle deletion
    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        onDelete(claim.uid);
        setIsDeleteDialogOpen(false);
    };

    // Modal handlers
    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return (
        <>
            <div
                className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-claim-appear"
                style={cardStyle}
                onClick={openModal}
            >
                <div className="flex items-center justify-between mb-2">
                    {/* Amount & Title */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                            {claim.amount}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={`text-[9px] font-normal uppercase font-body px-4 py-1 border-0 ${StatusColors[claim.status].bg} ${StatusColors[claim.status].text}`}
                            >
                                {claim?.status?.toUpperCase()}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="p-1 rounded-full hover:bg-muted">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <h3 className="px-2 py-1.5 text-xs font-medium">
                                Change Status
                            </h3>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.PENDING);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Pending
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.APPROVED);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Approved
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.REJECTED);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Rejected
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.PAID);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Paid
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.CANCELLED);
                                }}
                            >
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Cancelled
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete();
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Delete
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Task Details */}
                <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {/* Category */}
                    <div className="flex items-center mb-2">
                        <CreditCard className="w-4 h-4 mr-1 text-blue-600" />
                        <span className="text-[12px] font-normal uppercase font-body text-blue-600">
                            {claim?.category}
                        </span>
                    </div>

                    {/* Comments/Description (if available) */}
                    {claim?.comments && (
                        <p className="text-xs font-normal line-clamp-2 font-body">
                            {claim?.comments}
                        </p>
                    )}

                    {/* Task Meta Information */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Verified Date (if available) */}
                        {claim?.verifiedAt && (
                            <div className="flex items-center col-span-2">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    Verified: {formatDate(claim?.verifiedAt)}
                                </span>
                            </div>
                        )}

                        {/* Created Date */}
                        <div className="flex items-center col-span-2">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-normal uppercase font-body">
                                Created: {formatDate(claim?.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Document URL indicator (if available) */}
                {claim?.documentUrl && (
                    <div className="flex items-center pt-2 mt-2 text-xs border-t border-border/20 text-muted-foreground">
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        <span className="font-normal uppercase font-body text-[10px]">
                            Document attached
                        </span>
                    </div>
                )}

                {/* Claim owner */}
                {claim?.owner && (
                    <div className="flex items-center justify-start gap-1 pt-2 mt-2 border-t border-border/20">
                        <div className="flex -space-x-2">
                            <Avatar className="border w-7 h-7 border-primary">
                                <AvatarImage
                                    src={claim?.owner?.photoURL}
                                    alt={claim?.owner?.name}
                                />
                                <AvatarFallback className="text-[7px] font-normal uppercase font-body">
                                    {getOwnerInitials()}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex items-center justify-center text-[10px]">
                            <span className="text-[10px] font-normal font-body text-muted-foreground">
                                {claim?.owner?.name} {claim?.owner?.surname}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this claim.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Claim Details Modal */}
            {isModalOpen && (
                <ClaimDetailsModal
                    claim={claim}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onUpdateStatus={onUpdateStatus}
                    onDelete={onDelete}
                />
            )}
        </>
    );
}

// Export a memoized version to prevent unnecessary re-renders
export const ClaimCard = memo(ClaimCardComponent);
