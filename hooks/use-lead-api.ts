import { useCallback } from 'react';
import { Lead, LeadFilterParams, PaginatedLeadsResponse } from '@/lib/types/lead';
import { axiosInstance } from '@/lib/services/api-client';

/**
 * A hook that provides lead API methods
 * Relies on axios interceptors for token handling
 */
export const useLeadApi = () => {
    // Get leads with pagination and filtering
    const getLeads = useCallback(async (filters: LeadFilterParams = {}): Promise<PaginatedLeadsResponse> => {
        try {
            const queryParams = new URLSearchParams();

            // Map frontend filter parameters to backend expectations
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.ownerUid) queryParams.append('ownerUid', String(filters.ownerUid));
            if (filters.branchUid) queryParams.append('branchUid', String(filters.branchUid));
            if (filters.clientUid) queryParams.append('clientUid', String(filters.clientUid));
            if (filters.search) queryParams.append('search', filters.search);

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

            const response = await axiosInstance.get(`/leads?${queryParams.toString()}`);

            // Process response based on server format from leads.controller.ts
            if (response.data) {
                return {
                    items: response.data.data || [],
                    total: response.data.meta?.total || 0,
                    page: response.data.meta?.page || 1,
                    limit: response.data.meta?.limit || 10,
                    totalPages: response.data.meta?.totalPages || 1,
                };
            } else {
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
    }, []);

    // Get a single lead by ID
    const getLead = useCallback(async (leadId: number): Promise<Lead> => {
        try {
            // The controller endpoint is /leads/:ref
            const response = await axiosInstance.get(`/leads/${leadId}`);

            // From leads.controller.ts, the response should contain { message, lead }
            if (response.data && response.data.lead) {
                return response.data.lead;
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            throw error;
        }
    }, []);

    // Update a lead
    const updateLead = useCallback(async (leadId: number, updates: Partial<Lead>): Promise<void> => {
        try {
            // The controller endpoint is /leads/:ref for PATCH
            const response = await axiosInstance.patch(`/leads/${leadId}`, updates);

            if (!response.data) {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            throw error;
        }
    }, []);

    // Delete a lead
    const deleteLead = useCallback(async (leadId: number): Promise<void> => {
        try {
            // The controller endpoint is /leads/:ref for DELETE
            const response = await axiosInstance.delete(`/leads/${leadId}`);

            if (!response.data) {
                throw new Error('Invalid API response format');
            }

        } catch (error) {
            throw error;
        }
    }, []);

    // Add a lead
    const createLead = useCallback(async (leadData: Partial<Lead>): Promise<void> => {
        try {
            // The controller endpoint is /leads for POST
            const response = await axiosInstance.post('/leads', leadData);

            if (!response.data) {
                throw new Error('Invalid API response format');
            }

        } catch (error) {
            console.error('Error creating lead:', error);
            throw error;
        }
    }, []);

    return {
        getLeads,
        getLead,
        updateLead,
        deleteLead,
        createLead,
    };
};
