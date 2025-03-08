import { useCallback } from 'react';
import { Claim, ClaimFilterParams, PaginatedClaimsResponse } from '@/lib/types/claim';
import { axiosInstance } from '@/lib/services/api-client';

/**
 * A hook that provides claim API methods
 * Relies on axios interceptors for token handling
 */
export const useClaimApi = () => {
    // Get claims with pagination and filtering
    const getClaims = useCallback(async (filters: ClaimFilterParams = {}): Promise<PaginatedClaimsResponse> => {
        try {
            const queryParams = new URLSearchParams();

            // Map frontend filter parameters to backend expectations
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.ownerId) queryParams.append('ownerId', String(filters.ownerId));
            if (filters.verifiedById) queryParams.append('verifiedById', String(filters.verifiedById));

            // The backend expects these specific parameter names based on the controller
            if (filters.page) queryParams.append('page', String(filters.page));
            if (filters.limit) queryParams.append('limit', String(filters.limit));

            // Handle date parameters with proper formatting
            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate.toISOString());
            }

            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate.toISOString());
            }

            // The axios interceptor will add the token headers
            console.log(`Fetching claims with params: ${queryParams.toString()}`);
            const response = await axiosInstance.get(`/claims?${queryParams.toString()}`);

            console.log('API Response:', response.data);

            // Process response based on server format from claims.controller.ts
            if (response.data) {
                return {
                    items: response.data.data || [],
                    total: response.data.meta?.total || 0,
                    page: response.data.meta?.page || 1,
                    limit: response.data.meta?.limit || 10,
                    totalPages: response.data.meta?.totalPages || 1,
                };
            } else {
                console.error('Unexpected API response format:', response.data);
                return {
                    items: [],
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0,
                };
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
            throw error;
        }
    }, []);

    // Get a single claim by ID
    const getClaim = useCallback(async (claimId: number): Promise<Claim> => {
        try {
            // The controller endpoint is /claims/:id
            const response = await axiosInstance.get(`/claims/${claimId}`);

            // From claims.controller.ts, the response should contain { message, data }
            if (response.data && response.data.data) {
                return response.data.data;
            } else {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error(`Error fetching claim ${claimId}:`, error);
            throw error;
        }
    }, []);

    // Update a claim
    const updateClaim = useCallback(async (claimId: number, updates: Partial<Claim>): Promise<void> => {
        try {
            // The controller endpoint is /claims/:id for PATCH
            const response = await axiosInstance.patch(`/claims/${claimId}`, updates);

            if (!response.data) {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }

            console.log('Claim updated successfully:', response.data);
        } catch (error) {
            console.error(`Error updating claim ${claimId}:`, error);
            throw error;
        }
    }, []);

    // Delete a claim
    const deleteClaim = useCallback(async (claimId: number): Promise<void> => {
        try {
            // The controller endpoint is /claims/:id for DELETE
            const response = await axiosInstance.delete(`/claims/${claimId}`);

            if (!response.data) {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }

            console.log('Claim deleted successfully:', response.data);
        } catch (error) {
            console.error(`Error deleting claim ${claimId}:`, error);
            throw error;
        }
    }, []);

    // Add a claim
    const createClaim = useCallback(async (claimData: Partial<Claim>): Promise<void> => {
        try {
            // The controller endpoint is /claims for POST
            const response = await axiosInstance.post('/claims', claimData);

            if (!response.data) {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }

            console.log('Claim created successfully:', response.data);
        } catch (error) {
            console.error('Error creating claim:', error);
            throw error;
        }
    }, []);

    return {
        getClaims,
        getClaim,
        updateClaim,
        deleteClaim,
        createClaim,
    };
};
