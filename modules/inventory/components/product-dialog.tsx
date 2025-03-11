import React, { useState } from 'react';
import { ProductForm, ProductFormValues } from './product-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductDialogProps {
    onCreateProduct?: (productData: ProductFormValues) => Promise<void>;
    buttonClassName?: string;
    buttonLabel?: string;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({
    onCreateProduct,
    buttonClassName = '',
    buttonLabel = 'Add Product',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenChange = (open: boolean) => {
        // Only allow closing if not currently submitting
        if (!isSubmitting) {
            setIsOpen(open);
        }
    };

    const handleSubmit = async (data: ProductFormValues) => {
        try {
            setIsSubmitting(true);
            if (onCreateProduct) {
                await onCreateProduct(data);
                // Only close the modal if product creation was successful
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error creating product:', error);
            // Error is already shown via toast in the onCreateProduct function
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className={buttonClassName}
            >
                <Plus className="h-4 w-4 mr-2" />
                {buttonLabel}
            </Button>

            <Dialog
                open={isOpen}
                onOpenChange={handleOpenChange}
            >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-thin uppercase font-body">
                            Add New Product
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-1 py-4">
                        {isOpen && (
                            <ProductForm
                                onSubmit={handleSubmit}
                                isLoading={isSubmitting}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProductDialog;
