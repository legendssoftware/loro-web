'use client';

import { Claim, ClaimStatus, StatusColors } from '@/lib/types/claim';
import { format } from 'date-fns';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ClaimDetailsModal } from './claim-details-modal';

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
                <div className="flex items-center justify-between">
                    {/* Amount */}
                    <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                        {claim.amount}
                    </h3>

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
                                <span className="text-[10px] font-medium uppercase font-body">
                                    Pending
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.APPROVED);
                                }}
                            >
                                <span className="text-[10px] font-medium uppercase font-body">
                                    Approved
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.REJECTED);
                                }}
                            >
                                <span className="text-[10px] font-medium uppercase font-body">
                                    Rejected
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.PAID);
                                }}
                            >
                                <span className="text-[10px] font-medium uppercase font-body">
                                    Paid
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusChange(ClaimStatus.CANCELLED);
                                }}
                            >
                                <span className="text-[10px] font-medium uppercase font-body">
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
                                <span className="text-[10px] font-medium uppercase font-body">
                                    Delete
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Status Badge */}
                <div className="mt-1">
                    <Badge
                        variant="outline"
                        className={`text-[9px] font-medium uppercase font-body px-3 py-0.5 border-0 ${StatusColors[claim.status].bg} ${StatusColors[claim.status].text}`}
                    >
                        {claim?.status?.toUpperCase()}
                    </Badge>
                </div>

                {/* Category */}
                <div className="flex items-center mt-3 mb-2">
                    <CreditCard className="w-4 h-4 mr-1 text-blue-600" />
                    <span className="text-[12px] font-medium uppercase font-body text-blue-600">
                        {claim?.category}
                    </span>
                </div>

                {/* Comments/Description (if available) */}
                {claim?.comments && (
                    <p className="mb-2 text-xs font-normal line-clamp-2 font-body">
                        {claim?.comments}
                    </p>
                )}

                {/* Verified Date (if available) */}
                {claim?.verifiedAt && (
                    <div className="flex items-center mb-1">
                        <Calendar className="w-3 h-3 mr-1 text-muted-foreground" />
                        <span className="text-[10px] font-normal uppercase font-body text-muted-foreground">
                            Verified: {formatDate(claim?.verifiedAt)}
                        </span>
                    </div>
                )}
                {/* Created Date */}
                <div className="flex items-center mb-1">
                    <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                    <span className="text-[10px] font-normal uppercase font-body text-muted-foreground">
                        Created: {formatDate(claim?.createdAt)}
                    </span>
                </div>
                {/* Document URL indicator (if available) */}
                {claim?.documentUrl && (
                    <div className="flex items-center pt-2 mt-1 text-xs border-t border-border/20 text-muted-foreground">
                        <FileText className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                        <span className="font-normal uppercase font-body text-[10px]">
                            Document attached
                        </span>
                    </div>
                )}
                {/* Claim owner */}
                {claim?.owner && (
                    <div className="flex flex-row items-center justify-start pt-2 mt-1 border-t border-border/20">
                        <Avatar className="w-8 h-8 border border-teal-200">
                            <AvatarImage
                                src={claim?.owner?.photoURL}
                                alt={claim?.owner?.name}
                            />
                            <AvatarFallback className="text-[9px] font-normal text-white bg-teal-500 uppercase font-body">
                                {getOwnerInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <p className="ml-1 text-[10px] font-thin uppercase font-body">
                            {claim?.owner?.name}
                        </p>
                    </div>
                )}
            </div>
            {/* Delete confirmation dialog */}
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold font-heading">
                            Delete Claim
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-body">
                            Are you sure you want to delete this claim? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="text-xs font-medium font-body">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                        >
                            Delete
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
                    onSave={(updatedClaim) =>
                        onUpdateStatus(claim.uid, updatedClaim.status as string)
                    }
                    onUpdateStatus={onUpdateStatus}
                    onDelete={onDelete}
                />
            )}
        </>
    );
}

export const ClaimCard = memo(ClaimCardComponent);
