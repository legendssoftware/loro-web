import { useCallback } from 'react';
import { Client, ClientFilterParams } from './use-clients-query';
import { axiosInstance } from '@/lib/services/api-client';

interface PaginatedClientsResponse {
    data: Client[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

/**
 * A hook that provides client API methods
 * Relies on axios interceptors for token handling
 */
export const useClientApi = () => {
    // Get clients with pagination and filtering
    const getClients = useCallback(
        async (
            filters: ClientFilterParams = {},
        ): Promise<PaginatedClientsResponse> => {
            try {
                const queryParams = new URLSearchParams();

                // Map frontend filter parameters to backend expectations
                if (filters.status)
                    queryParams.append('status', filters.status);
                if (filters.category)
                    queryParams.append('category', filters.category);
                if (filters.search)
                    queryParams.append('search', filters.search);

                // The backend expects these specific parameter names based on the controller
                if (filters.page)
                    queryParams.append('page', String(filters.page));
                if (filters.limit)
                    queryParams.append('limit', String(filters.limit));

                // The axios interceptor will add the token headers
                console.log(
                    `Fetching clients with params: ${queryParams.toString()}`,
                );
                const response = await axiosInstance.get(
                    `/clients?${queryParams.toString()}`,
                );

                if (!response.data) {
                    throw new Error('Failed to fetch clients data');
                }

                return response.data;
            } catch (error) {
                console.error('Error fetching clients:', error);
                // Return empty data structure on error
                return {
                    data: [],
                    meta: {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0,
                    },
                    message: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        },
        [],
    );

    // Get a single client by ID with comprehensive data
    const getClient = useCallback(async (clientId: number): Promise<Client | null> => {
        try {
            // The server-side findOne method already includes relations for
            // branch, organisation, assignedSalesRep, quotations, checkIns
            const response = await axiosInstance.get(`/clients/${clientId}`);

            // If we need additional related data that isn't included by default,
            // we could make additional requests here, but for now the backend
            // already provides the necessary relations

            return response.data.client;
        } catch (error) {
            console.error(`Error fetching client ${clientId}:`, error);
            return null;
        }
    }, []);

    // Create a new client
    const createClient = useCallback(async (clientData: Partial<Client>): Promise<Client | null> => {
        try {
            const response = await axiosInstance.post('/clients', clientData);
            return response.data;
        } catch (error) {
            console.error('Error creating client:', error);
            return null;
        }
    }, []);

    // Update an existing client
    const updateClient = useCallback(
        async (clientId: number, clientData: Partial<Client>): Promise<boolean> => {
            try {
                await axiosInstance.patch(`/clients/${clientId}`, clientData);
                return true;
            } catch (error) {
                console.error(`Error updating client ${clientId}:`, error);
                return false;
            }
        },
        [],
    );

    // Delete a client
    const deleteClient = useCallback(async (clientId: number): Promise<boolean> => {
        try {
            await axiosInstance.delete(`/clients/${clientId}`);
            return true;
        } catch (error) {
            console.error(`Error deleting client ${clientId}:`, error);
            return false;
        }
    }, []);

    // Restore a deleted client
    const restoreClient = useCallback(async (clientId: number): Promise<boolean> => {
        try {
            await axiosInstance.patch(`/clients/restore/${clientId}`);
            return true;
        } catch (error) {
            console.error(`Error restoring client ${clientId}:`, error);
            return false;
        }
    }, []);

    return {
        getClients,
        getClient,
        createClient,
        updateClient,
        deleteClient,
        restoreClient,
    };
};
