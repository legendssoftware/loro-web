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

interface ApiResponse<T> {
    data: T | null;
    message: string;
    success: boolean;
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
            } catch (error: any) {
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
                    message: error?.response?.data?.message || (error instanceof Error ? error.message : 'Unknown error'),
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
    const createClient = useCallback(async (clientData: Partial<Client>): Promise<ApiResponse<Client>> => {
        try {
            const response = await axiosInstance.post('/clients', clientData);
            return {
                data: response.data.client || null,
                message: response.data.message || 'Client created successfully',
                success: true
            };
        } catch (error: any) {
            console.error('Error creating client:', error);
            return {
                data: null,
                message: error?.response?.data?.message || 'Failed to create client',
                success: false
            };
        }
    }, []);

    // Update an existing client
    const updateClient = useCallback(
        async (clientId: number, clientData: Partial<Client>): Promise<ApiResponse<Client>> => {
            try {
                const response = await axiosInstance.patch(`/clients/${clientId}`, clientData);
                return {
                    data: response.data.client || null,
                    message: response.data.message || 'Client updated successfully',
                    success: true
                };
            } catch (error: any) {
                console.error(`Error updating client ${clientId}:`, error);
                return {
                    data: null,
                    message: error?.response?.data?.message || 'Failed to update client',
                    success: false
                };
            }
        },
        [],
    );

    // Delete a client
    const deleteClient = useCallback(async (clientId: number): Promise<ApiResponse<null>> => {
        try {
            const response = await axiosInstance.delete(`/clients/${clientId}`);
            return {
                data: null,
                message: response.data.message || 'Client deleted successfully',
                success: true
            };
        } catch (error: any) {
            console.error(`Error deleting client ${clientId}:`, error);
            return {
                data: null,
                message: error?.response?.data?.message || 'Failed to delete client',
                success: false
            };
        }
    }, []);

    // Restore a deleted client
    const restoreClient = useCallback(async (clientId: number): Promise<ApiResponse<null>> => {
        try {
            const response = await axiosInstance.patch(`/clients/restore/${clientId}`);
            return {
                data: null,
                message: response.data.message || 'Client restored successfully',
                success: true
            };
        } catch (error: any) {
            console.error(`Error restoring client ${clientId}:`, error);
            return {
                data: null,
                message: error?.response?.data?.message || 'Failed to restore client',
                success: false
            };
        }
    }, []);

    // Generate a client quotation report
    const generateClientReport = useCallback(async (clientId: number, params: {
        startDate?: string;
        endDate?: string;
        additionalFilters?: Record<string, any>;
    } = {}): Promise<ApiResponse<any>> => {
        try {
            const response = await axiosInstance.post(`/reports/client/${clientId}`, {
                name: 'Client Quotation Report',
                startDate: params.startDate,
                endDate: params.endDate,
                additionalFilters: params.additionalFilters
            });
            return {
                data: response.data,
                message: 'Report generated successfully',
                success: true
            };
        } catch (error: any) {
            console.error(`Error generating report for client ${clientId}:`, error);
            return {
                data: null,
                message: error?.response?.data?.message || 'Failed to generate report',
                success: false
            };
        }
    }, []);

    return {
        getClients,
        getClient,
        createClient,
        updateClient,
        deleteClient,
        restoreClient,
        generateClientReport,
    };
};
