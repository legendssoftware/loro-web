import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Claim, UpdateClaimDTO } from '@/lib/types/claims';
import { EditClaimForm } from './edit-claim-form';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

const toastStyle = {
    style: {
        borderRadius: '5px',
        background: '#333',
        color: '#fff',
        fontFamily: 'var(--font-unbounded)',
        fontSize: '12px',
        textTransform: 'uppercase',
        fontWeight: '300',
        padding: '16px',
    },
    duration: 2000,
    position: 'bottom-center',
} as const;

interface ClaimDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedClaim: Claim | null;
    onDelete: (uid: number) => Promise<void>;
    onUpdate: (ref: number, data: UpdateClaimDTO) => Promise<void>;
    isUpdating: boolean;
    isDeleting: boolean;
}

export const ClaimDetailModal = ({
    isOpen,
    onOpenChange,
    selectedClaim,
    onDelete,
    onUpdate,
    isUpdating,
    isDeleting,
}: ClaimDetailModalProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    const handleClose = () => {
        if (!isUpdating && !isDeleting) {
            setIsEditing(false);
            onOpenChange(false);
        }
    };

    const handleUpdate = async (data: UpdateClaimDTO) => {
        if (!selectedClaim) return;
        try {
            await onUpdate(selectedClaim.uid, data);
            setIsEditing(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update claim';
            toast.error(errorMessage, { ...toastStyle, duration: 5000 });
        }
    };

    const handleDelete = async () => {
        if (!selectedClaim || isDeleting) return;
        try {
            await onDelete(selectedClaim.uid);
            setIsDeleteAlertOpen(false);
            onOpenChange(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete claim';
            toast.error(errorMessage, { ...toastStyle, duration: 5000 });
        }
    };

    if (!selectedClaim) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
                <DialogHeader className='flex flex-row items-center justify-between pb-4 space-y-0'>
                    <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center gap-2'>
                            <DialogTitle className='text-lg font-normal uppercase line-clamp-1 font-body'>
                                Claim Details
                            </DialogTitle>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Badge
                                variant={
                                    selectedClaim.status === 'APPROVED'
                                        ? 'success'
                                        : selectedClaim.status === 'REJECTED'
                                        ? 'destructive'
                                        : selectedClaim.status === 'IN_REVIEW'
                                        ? 'warning'
                                        : selectedClaim.status === 'VERIFIED'
                                        ? 'success'
                                        : 'outline'
                                }
                                className='text-[10px] font-normal uppercase font-body'
                            >
                                {selectedClaim.status}
                            </Badge>
                            <Badge variant='outline' className='text-[10px] font-normal uppercase font-body'>
                                {selectedClaim.category}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                {isEditing ? (
                    <EditClaimForm
                        claim={selectedClaim}
                        onSubmit={handleUpdate}
                        onCancel={() => setIsEditing(false)}
                        isUpdating={isUpdating}
                    />
                ) : (
                    <div className='flex flex-col gap-6'>
                        <div className='flex items-center justify-center w-full h-40 gap-2 p-2 border rounded-lg cursor-not-allowed hover:border-[#8B5CF6]'>
                            <p className='text-[10px] font-normal uppercase font-body text-white/50'>Click here to view claim attachment</p>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>Amount</h4>
                            <p className='text-2xl font-medium font-heading'>{selectedClaim.amount}</p>
                        </div>

                        {selectedClaim.documentUrl && (
                            <div className='flex flex-col gap-1'>
                                <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Document
                                </h4>
                                <div className='relative w-full h-48 overflow-hidden rounded-lg'>
                                    <Image
                                        src={selectedClaim.documentUrl}
                                        alt='Claim Document'
                                        fill
                                        className='object-contain'
                                    />
                                </div>
                            </div>
                        )}

                        <div className='flex flex-col gap-1'>
                            <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>Comments</h4>
                            <p className='text-sm font-body'>{selectedClaim.comments}</p>
                        </div>

                        <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
                            <div className='flex flex-col gap-1'>
                                <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Created By
                                </h4>
                                <div className='grid grid-cols-1 gap-2'>
                                    <div className='flex items-center gap-2'>
                                        <Avatar className='w-8 h-8'>
                                            {selectedClaim.owner.photoURL ? (
                                                <AvatarImage src={selectedClaim.owner.photoURL} />
                                            ) : (
                                                <AvatarFallback>
                                                    {selectedClaim.owner.name.charAt(0)}
                                                    {selectedClaim.owner.surname.charAt(0)}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div>
                                            <p className='text-sm font-body'>
                                                {selectedClaim.owner.name} {selectedClaim.owner.surname}
                                            </p>
                                            <p className='text-xs text-muted-foreground font-body'>
                                                {selectedClaim.owner.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className='text-[10px] text-muted-foreground font-body uppercase'>Phone</p>
                                        <p className='text-sm font-body'>{selectedClaim.owner.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col gap-1'>
                                <h4 className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Timestamps
                                </h4>
                                <div className='grid grid-cols-1 gap-2'>
                                    <div>
                                        <p className='text-[10px] text-muted-foreground font-body uppercase'>Created</p>
                                        <p className='text-sm font-body'>
                                            {format(new Date(selectedClaim.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                            Last Updated
                                        </p>
                                        <p className='text-sm font-body'>
                                            {format(new Date(selectedClaim.updatedAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                    {selectedClaim.verifiedAt && (
                                        <div>
                                            <p className='text-[10px] text-muted-foreground font-body uppercase'>
                                                Verified At
                                            </p>
                                            <p className='text-sm font-body'>
                                                {format(new Date(selectedClaim.verifiedAt), 'MMM dd, yyyy')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='flex items-center justify-between w-full gap-4 pt-4 mt-4 border-t'>
                            <div className='grid w-full grid-cols-2 gap-4'>
                                <Button
                                    variant='default'
                                    className='w-full text-[10px] font-normal text-white uppercase font-body bg-[#8B5CF6] hover:bg-[#7C3AED]'
                                    onClick={() => setIsEditing(true)}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Updating...' : 'Update Claim'}
                                </Button>
                                <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant='destructive'
                                            className='w-full text-[10px] font-normal text-white uppercase font-body'
                                            disabled={isDeleting}
                                        >
                                            Delete Claim
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className='text-[14px] font-body uppercase font-normal'>
                                                Delete Claim
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className='text-[10px] uppercase text-card-foreground font-body font-normal'>
                                                Are you sure you want to delete this claim? This action cannot be
                                                undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <div className='grid w-full grid-cols-2 gap-4'>
                                                <AlertDialogCancel
                                                    className='w-full text-[10px] font-normal uppercase font-body'
                                                    disabled={isDeleting}
                                                >
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className='w-full text-[10px] font-normal text-white uppercase font-body'
                                                    onClick={handleDelete}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? (
                                                        <div className='flex items-center justify-center w-full gap-2'>
                                                            <span className='w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin' />
                                                            <span>Deleting...</span>
                                                        </div>
                                                    ) : (
                                                        'Delete Claim'
                                                    )}
                                                </AlertDialogAction>
                                            </div>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
