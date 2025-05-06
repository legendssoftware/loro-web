import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Lead, LeadStatus, LeadFilterParams, LeadsByStatus } from '@/lib/types/lead';
import toast from 'react-hot-toast';
import { useLeadApi } from './use-lead-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

// Branch type with uid as required by the API
interface BranchRef {
    uid: number;
}

const LEADS_QUERY_KEY = 'leads';

export function useLeadsQuery(filters: LeadFilterParams = {}) {
    const queryClient = useQueryClient();
    const leadApi = useLeadApi();

    // Ensure we always use a limit of 500
    const enhancedFilters = useMemo(() => ({
        ...filters,
        limit: 500,
    }), [filters]);

    // Fetch leads with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [LEADS_QUERY_KEY, enhancedFilters],
        queryFn: () => leadApi.getLeads(enhancedFilters),
        placeholderData: previousData => previousData,
        staleTime: 1000 * 60, // 1 minute
        // Add retry and error handling
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: Object.keys(enhancedFilters)?.length > 0 || !enhancedFilters?.hasOwnProperty('page'),
    });

    // Group leads by status
    const leadsByStatus = useMemo<LeadsByStatus>(() => {
        const statusGroups = {
            [LeadStatus.PENDING]: [],
            [LeadStatus.APPROVED]: [],
            [LeadStatus.REVIEW]: [],
            [LeadStatus.DECLINED]: [],
            [LeadStatus.CONVERTED]: [],
            [LeadStatus.CANCELLED]: [],
        } as LeadsByStatus;

        if (data?.items) {
            // Group leads by status
            data.items.forEach(lead => {
                if (!lead.isDeleted) {
                    statusGroups[lead.status].push(lead);
                }
            });
        }

        return statusGroups;
    }, [data?.items]);

    // Create lead mutation
    const createLeadMutation = useMutation({
        mutationFn: async (leadData: Partial<Lead>) => {
            try {
                const result = await leadApi.createLead(leadData);
                showSuccessToast('Lead created successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast('Failed to create lead. Please try again.', toast);
                console.error('Create lead error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate leads query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
        },
    });

    // Update lead mutation
    const updateLeadMutation = useMutation({
        mutationFn: async ({ leadId, updates }: { leadId: number; updates: Partial<Lead> }) => {
            try {
                await leadApi.updateLead(leadId, updates);
                showSuccessToast('Lead updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast('Failed to update lead. Please try again.', toast);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate leads query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
        },
    });

    // Delete lead mutation
    const deleteLeadMutation = useMutation({
        mutationFn: async (leadId: number) => {
            try {
                await leadApi.deleteLead(leadId);
                showSuccessToast('Lead deleted successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast('Failed to delete lead. Please try again.', toast);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate leads query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
        },
    });

    // Create lead wrapper function
    const createLead = useCallback(
        async (leadData: Partial<Lead>) => {
            return createLeadMutation.mutate(leadData);
        },
        [createLeadMutation],
    );

    // Update lead wrapper function
    const updateLead = useCallback(
        async (leadId: number, updates: Partial<Lead>) => {
            return updateLeadMutation.mutate({ leadId, updates });
        },
        [updateLeadMutation],
    );

    // Delete lead wrapper function
    const deleteLead = useCallback(
        async (leadId: number) => {
            return deleteLeadMutation.mutate(leadId);
        },
        [deleteLeadMutation],
    );

    // Update lead status wrapper function
    const updateLeadStatus = useCallback(
        async (leadId: number, newStatus: string) => {
            return updateLeadMutation.mutate({
                leadId,
                updates: { status: newStatus as LeadStatus }
            });
        },
        [updateLeadMutation],
    );

    // Apply filters
    const applyFilters = useCallback((newFilters: LeadFilterParams) => {
        // This doesn't directly modify state as the hook will be called with new filters
        return newFilters;
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        // Returns empty object to clear filters
        return {};
    }, []);

    return {
        leads: data?.items || [],
        leadsByStatus,
        isLoading,
        error: error as Error | null,
        createLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        applyFilters,
        clearFilters,
        refetch,
    };
}
