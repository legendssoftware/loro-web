import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateProductDTO } from '@/lib/types/products';
import { NewInventoryForm } from './new-inventory-form';

interface NewInventoryModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: CreateProductDTO) => void;
    isCreating: boolean;
}

export const NewInventoryModal = ({ isOpen, onOpenChange, onSubmit, isCreating }: NewInventoryModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='text-lg font-medium font-heading'>Add New Product</DialogTitle>
                </DialogHeader>
                <NewInventoryForm onSubmit={onSubmit} isSubmitting={isCreating} />
            </DialogContent>
        </Dialog>
    );
};
