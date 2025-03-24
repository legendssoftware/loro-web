import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Client } from '@/hooks/use-clients-query';
import { ClientService } from '../services/client-service';
import { EditClientForm } from './edit-client-form';
import { ClientFormValues } from './client-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

interface EditClientModalProps {
    client: Client;
    isOpen: boolean;
    onClose: () => void;
    onClientUpdated?: (updatedClient: Client) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
    client,
    isOpen,
    onClose,
    onClientUpdated,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleSubmit = async (data: ClientFormValues, clientId: number) => {
        try {
            setIsLoading(true);
            const result = await ClientService.updateClient(
                clientId,
                data,
            );

            if (!result.success) {
                showErrorToast(result.message, toast);
                return;
            }

            // Invalidate all client queries to update the UI
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            
            // Also invalidate the specific client query
            queryClient.invalidateQueries({ queryKey: ['client', clientId] });
            
            // Refetch the specific client to get the latest data
            queryClient.refetchQueries({ queryKey: ['client', clientId], type: 'active' });

            // Notify parent component of the update
            if (onClientUpdated && result.data) {
                onClientUpdated(result.data);
            }

            showSuccessToast(result.message, toast);
            onClose();
        } catch (error: any) {
            console.error('Error updating client:', error);
            showErrorToast(error?.message || 'Failed to update client', toast);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="text-xl font-thin uppercase font-body">
                        {client?.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <EditClientForm
                        client={client}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        isLoading={isLoading}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
