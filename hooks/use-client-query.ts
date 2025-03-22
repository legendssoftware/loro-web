import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { Client, ClientStatus } from './use-clients-query';
import { useClientApi } from './use-client-api';

const CLIENT_QUERY_KEY = 'client';

/**
 * Hook for fetching and managing a single client using React Query
 * @param clientId The ID of the client to fetch
 * @returns Client data, loading state, error state, and mutation functions
 */
export function useClientQuery(clientId: string | number) {
    const queryClient = useQueryClient();
    const clientApi = useClientApi();

    // Convert clientId to number if it's a string
    const id = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;

    // Fetch client with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [CLIENT_QUERY_KEY, id],
        queryFn: () => clientApi.getClient(id),
        staleTime: 1000 * 60, // 1 minute
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: !!id && !isNaN(id),
    });

    // Update client mutation
    const updateClientMutation = useMutation({
        mutationFn: async (updates: Partial<Client>) => {
            try {
                await clientApi.updateClient(id, updates);
                showSuccessToast('Client updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to update client. Please try again.',
                    toast,
                );
                console.error('Update client error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate client query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEY, id] });
        },
    });

    // Delete client mutation
    const deleteClientMutation = useMutation({
        mutationFn: async () => {
            try {
                await clientApi.deleteClient(id);
                showSuccessToast('Client deleted successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to delete client. Please try again.',
                    toast,
                );
                console.error('Delete client error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate client queries to trigger a refetch of the list
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });

    // Update client wrapper function
    const updateClient = useCallback(
        async (updates: Partial<Client>) => {
            return updateClientMutation.mutate(updates);
        },
        [updateClientMutation],
    );

    // Delete client wrapper function
    const deleteClient = useCallback(
        async () => {
            return deleteClientMutation.mutate();
        },
        [deleteClientMutation],
    );

    // Update client status wrapper function
    const updateClientStatus = useCallback(
        async (newStatus: string) => {
            return updateClientMutation.mutate({ status: newStatus as ClientStatus });
        },
        [updateClientMutation],
    );

    return {
        client: data,
        loading: isLoading,
        error: error as Error | null,
        refetch,
        updateClient,
        deleteClient,
        updateClientStatus,
    };
}
