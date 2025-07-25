import { useCallback } from 'react';
import {
    Quotation,
    QuotationFilterParams,
    PaginatedQuotationsResponse,
} from '@/lib/types/quotation';
import { axiosInstance } from '@/lib/services/api-client';
import { OrderStatus } from '@/lib/enums/status.enums';

/**
 * A hook that provides quotation API methods
 * Relies on axios interceptors for token handling
 */
export const useQuotationApi = () => {
    // Get quotations with pagination and filtering
    const getQuotations = useCallback(
        async (
            filters: QuotationFilterParams = {},
        ): Promise<PaginatedQuotationsResponse> => {
            try {
                const queryParams = new URLSearchParams();

                // Map frontend filter parameters to backend expectations
                if (filters.status)
                    queryParams.append('status', filters.status);
                if (filters.clientId)
                    queryParams.append('clientId', String(filters.clientId));
                if (filters.placedById)
                    queryParams.append(
                        'placedById',
                        String(filters.placedById),
                    );
                if (filters.search)
                    queryParams.append('search', filters.search);

                // The backend expects these specific parameter names based on the controller
                if (filters.page)
                    queryParams.append('page', String(filters.page));
                if (filters.limit)
                    queryParams.append('limit', String(filters.limit));

                // Handle date parameters with proper formatting
                if (filters.startDate) {
                    queryParams.append(
                        'startDate',
                        filters.startDate.toISOString(),
                    );
                }

                if (filters.endDate) {
                    queryParams.append(
                        'endDate',
                        filters.endDate.toISOString(),
                    );
                }

                const response = await axiosInstance.get(
                    `/shop/quotations?${queryParams.toString()}`,
                );

                console.log(response?.data?.quotations, 'db response');

                // Process response based on server format
                if (response.data && response.data.quotations) {
                    // The API returns an array of quotations in a 'quotations' property

                    const responseObject = {
                        items: response.data.quotations || [],
                        total:
                            response.data.meta?.total ||
                            response.data.quotations.length,
                        page: response.data.meta?.page || 1,
                        limit: response.data.meta?.limit || 10,
                        totalPages: response.data.meta?.totalPages || 1,
                    };

                    console.log(responseObject, 'quotations data');

                    return responseObject;
                } else {
                    console.error(
                        'Unexpected API response format:',
                        response.data,
                    );
                    return {
                        items: [],
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0,
                    };
                }
            } catch (error) {
                throw error;
            }
        },
        [],
    );

    // Get client quotations
    const getClientQuotations = useCallback(
        async (
            clientId: number,
            filters: QuotationFilterParams = {},
        ): Promise<PaginatedQuotationsResponse> => {
            try {
                const queryParams = new URLSearchParams();

                // Map frontend filter parameters to backend expectations
                if (filters.status)
                    queryParams.append('status', filters.status);
                if (filters.search)
                    queryParams.append('search', filters.search);

                // The backend expects these specific parameter names based on the controller
                if (filters.page)
                    queryParams.append('page', String(filters.page));
                if (filters.limit)
                    queryParams.append('limit', String(filters.limit));

                // Handle date parameters with proper formatting
                if (filters.startDate) {
                    queryParams.append(
                        'startDate',
                        filters.startDate.toISOString(),
                    );
                }

                if (filters.endDate) {
                    queryParams.append(
                        'endDate',
                        filters.endDate.toISOString(),
                    );
                }

                // The axios interceptor will add the token headers
                console.log(
                    `Fetching client quotations with params: ${queryParams.toString()}`,
                );

                // Use the shop/quotations/user/:ref endpoint for client-specific quotations
                const response = await axiosInstance.get(
                    `/shop/quotations/user/${clientId}?${queryParams.toString()}`,
                );

                console.log('Client Quotations API Response:', response.data);

                // Process response based on server format
                if (response.data && response.data.quotations) {
                    // The API returns an array of quotations in a 'quotations' property
                    return {
                        items: response.data.quotations || [],
                        total:
                            response.data.meta?.total ||
                            response.data.quotations.length,
                        page: response.data.meta?.page || 1,
                        limit: response.data.meta?.limit || 10,
                        totalPages: response.data.meta?.totalPages || 1,
                    };
                } else {
                    console.error(
                        'Unexpected API response format:',
                        response.data,
                    );
                    return {
                        items: [],
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0,
                    };
                }
            } catch (error) {
                console.error(
                    `Error fetching quotations for client ${clientId}:`,
                    error,
                );
                throw error;
            }
        },
        [],
    );

    // Get a single quotation by ID
    const getQuotation = useCallback(
        async (quotationId: number): Promise<Quotation> => {
            try {
                // The controller endpoint is /shop/quotation/:ref
                const response = await axiosInstance.get(
                    `/shop/quotation/${quotationId}`,
                );

                // From shop.controller.ts, the response should contain { message, quotation }
                if (response.data && response.data.quotation) {
                    return response.data.quotation;
                } else {
                    console.error(
                        'Unexpected API response format:',
                        response.data,
                    );
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                console.error(
                    `Error fetching quotation ${quotationId}:`,
                    error,
                );
                throw error;
            }
        },
        [],
    );

    // Update a quotation status
    const updateQuotationStatus = useCallback(
        async (quotationId: number, status: OrderStatus): Promise<{success: boolean; message?: string; error?: unknown}> => {
            try {
                // The controller endpoint is /shop/quotation/:ref/status for PATCH
                const response = await axiosInstance.patch(
                    `/shop/quotation/${quotationId}/status`,
                    { status },
                );

                if (!response.data) {
                    console.error(
                        'Unexpected API response format:',
                        response.data,
                    );
                    return {
                        success: false,
                        message: 'Invalid API response format',
                        error: new Error('Invalid API response format')
                    };
                }

                console.log(
                    'Quotation status updated successfully:',
                    response.data,
                );

                return {
                    success: true,
                    message: response.data.message || 'Quotation status updated successfully'
                };
            } catch (error) {
                console.error(
                    `Error updating quotation ${quotationId} status:`,
                    error,
                );

                let errorMessage = 'Failed to update quotation status';
                if (error instanceof Error) {
                    errorMessage = error.message;
                } else if (typeof error === 'object' && error !== null && 'response' in error) {
                    const axiosError = error as { response?: { data?: { message?: string } } };
                    errorMessage = axiosError.response?.data?.message || errorMessage;
                }

                return {
                    success: false,
                    message: errorMessage,
                    error
                };
            }
        },
        [],
    );

    // Create a quotation
    const createQuotation = useCallback(
        async (quotationData: Partial<Quotation>): Promise<void> => {
            try {
                // The controller endpoint is /shop/quotation for POST
                const response = await axiosInstance.post(
                    '/shop/quotation',
                    quotationData,
                );

                if (!response.data) {
                    console.error(
                        'Unexpected API response format:',
                        response.data,
                    );
                    throw new Error('Invalid API response format');
                }

                console.log('Quotation created successfully:', response.data);
            } catch (error) {
                console.error('Error creating quotation:', error);
                throw error;
            }
        },
        [],
    );

    return {
        getQuotations,
        getClientQuotations,
        getQuotation,
        updateQuotationStatus,
        createQuotation,
    };
};
