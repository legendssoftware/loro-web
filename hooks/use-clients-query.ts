import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { Client as ClientBase, ClientAddress } from '@/lib/types/client';
import { useClientApi } from './use-client-api';

// Client status enum
export enum ClientStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    DELETED = 'deleted',
}

// Extended Client interface
export interface Client extends Omit<ClientBase, 'status'> {
    status?: ClientStatus;
    address?: ClientAddress;
}

// Client filter params interface
export interface ClientFilterParams {
    limit?: number;
    page?: number;
    search?: string;
    status?: ClientStatus;
    category?: string;
    from?: string; // Date range start
    to?: string;   // Date range end
}

// Clients by status interface
export interface ClientsByStatus {
    [ClientStatus.ACTIVE]: Client[];
    [ClientStatus.INACTIVE]: Client[];
    [ClientStatus.PENDING]: Client[];
    [ClientStatus.DELETED]: Client[];
}

// API response interface
interface ClientsApiResponse {
    data: Client[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

const CLIENTS_QUERY_KEY = 'clients';

/**
 * Hook for fetching and managing clients using React Query
 * @param options Query options for filtering clients
 * @returns Clients data, loading state, error state, and mutation functions
 */
export function useClientsQuery(options: ClientFilterParams = {}) {
    const queryClient = useQueryClient();
    const clientApi = useClientApi();

    // Ensure we use a reasonable limit
    const enhancedFilters = useMemo(
        () => ({
            ...options,
            limit: options.limit || 20,
        }),
        [options],
    );

    // Fetch clients with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [CLIENTS_QUERY_KEY, enhancedFilters],
        queryFn: () => clientApi.getClients(enhancedFilters),
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60, // 1 minute
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled:
            Object.keys(enhancedFilters)?.length > 0 ||
            !enhancedFilters?.hasOwnProperty('page'),
    });

    // Group clients by status
    const clientsByStatus = useMemo<ClientsByStatus>(() => {
        const statusGroups = {
            [ClientStatus.ACTIVE]: [],
            [ClientStatus.INACTIVE]: [],
            [ClientStatus.PENDING]: [],
            [ClientStatus.DELETED]: [],
        } as ClientsByStatus;

        if (data?.data) {
            data.data.forEach((client) => {
                const status = client.status || ClientStatus.PENDING;
                if (!client.isDeleted || status === ClientStatus.DELETED) {
                    statusGroups[status].push(client);
                }
            });
        }

        return statusGroups;
    }, [data?.data]);

    // Create client mutation
    const createClientMutation = useMutation({
        mutationFn: async (clientData: Partial<Client>) => {
            try {
                const result = await clientApi.createClient(clientData);
                showSuccessToast('Client created successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast(
                    'Failed to create client. Please try again.',
                    toast,
                );
                console.error('Create client error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate clients query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
        },
    });

    // Update client mutation
    const updateClientMutation = useMutation({
        mutationFn: async ({
            clientId,
            updates,
        }: {
            clientId: number;
            updates: Partial<Client>;
        }) => {
            try {
                await clientApi.updateClient(clientId, updates);
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
            // Invalidate clients query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
        },
    });

    // Delete client mutation
    const deleteClientMutation = useMutation({
        mutationFn: async (clientId: number) => {
            try {
                await clientApi.deleteClient(clientId);
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
            // Invalidate clients query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
        },
    });

    // Restore client mutation
    const restoreClientMutation = useMutation({
        mutationFn: async (clientId: number) => {
            try {
                await clientApi.restoreClient(clientId);
                showSuccessToast('Client restored successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to restore client. Please try again.',
                    toast,
                );
                console.error('Restore client error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate clients query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
        },
    });

    // Create client wrapper function
    const createClient = useCallback(
        async (clientData: Partial<Client>) => {
            return createClientMutation.mutate(clientData);
        },
        [createClientMutation],
    );

    // Update client wrapper function
    const updateClient = useCallback(
        async (clientId: number, updates: Partial<Client>) => {
            return updateClientMutation.mutate({ clientId, updates });
        },
        [updateClientMutation],
    );

    // Delete client wrapper function
    const deleteClient = useCallback(
        async (clientId: number) => {
            return deleteClientMutation.mutate(clientId);
        },
        [deleteClientMutation],
    );

    // Restore client wrapper function
    const restoreClient = useCallback(
        async (clientId: number) => {
            return restoreClientMutation.mutate(clientId);
        },
        [restoreClientMutation],
    );

    // Update client status wrapper function
    const updateClientStatus = useCallback(
        async (clientId: number, newStatus: string) => {
            return updateClientMutation.mutate({
                clientId,
                updates: { status: newStatus as ClientStatus },
            });
        },
        [updateClientMutation],
    );

    return {
        clients: data?.data || [],
        clientsByStatus,
        loading: isLoading,
        error: error as Error | null,
        refetch,
        createClient,
        updateClient,
        deleteClient,
        restoreClient,
        updateClientStatus,
        pagination: data?.meta || {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 1,
        },
    };
}
