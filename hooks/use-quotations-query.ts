import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Quotation, QuotationFilterParams, QuotationsByStatus } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { useQuotationApi } from './use-quotation-api';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

const QUOTATIONS_QUERY_KEY = 'quotations';

export function useQuotationsQuery(filters: QuotationFilterParams = {}) {
    const queryClient = useQueryClient();
    const quotationApi = useQuotationApi();

    // Ensure we always use a limit of 500
    const enhancedFilters = useMemo(() => ({
        ...filters,
        limit: 500,
    }), [filters]);

    // Fetch quotations with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [QUOTATIONS_QUERY_KEY, enhancedFilters],
        queryFn: () => quotationApi.getQuotations(enhancedFilters),
        placeholderData: previousData => previousData,
        staleTime: 1000 * 60, // 1 minute
        // Add retry and error handling
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: Object.keys(enhancedFilters)?.length > 0 || !enhancedFilters?.hasOwnProperty('page'),
    });

    // Group quotations by status
    const quotationsByStatus = useMemo<QuotationsByStatus>(() => {
        const statusGroups = {
            'pending': [],
            'inprogress': [],
            'approved': [],
            'rejected': [],
            'completed': [],
            'cancelled': [],
            'postponed': [],
            'outfordelivery': [],
            'delivered': [],
        } as QuotationsByStatus;

        if (data?.items) {
            // Group quotations by status
            data.items.forEach(quotation => {
                if (!quotation.isDeleted) {
                    statusGroups[quotation.status.toLowerCase() as keyof QuotationsByStatus].push(quotation);
                }
            });
        }

        return statusGroups;
    }, [data?.items]);

    // Create a mutation for updating quotation status
    const updateStatusMutation = useMutation({
        mutationFn: async ({ quotationId, status }: { quotationId: number; status: OrderStatus }) => {
            try {
                await quotationApi.updateQuotationStatus(quotationId, status);
                showSuccessToast('Quotation status updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast('Failed to update quotation status. Please try again.', toast);
                console.error('Update quotation status error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate quotations query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
        },
    });

    // Create a mutation for creating a new quotation
    const createQuotationMutation = useMutation({
        mutationFn: async (quotationData: Partial<Quotation>) => {
            try {
                const result = await quotationApi.createQuotation(quotationData);
                showSuccessToast('Quotation created successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast('Failed to create quotation. Please try again.', toast);
                console.error('Create quotation error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate quotations query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
        },
    });

    // Helper function to update a quotation's status
    const updateQuotationStatus = useCallback(
        async (quotationId: number, newStatus: OrderStatus) => {
            await updateStatusMutation.mutateAsync({ quotationId, status: newStatus });
        },
        [updateStatusMutation],
    );

    // Helper function to create a quotation
    const createQuotation = useCallback(
        async (quotationData: Partial<Quotation>) => {
            await createQuotationMutation.mutateAsync(quotationData);
        },
        [createQuotationMutation],
    );

    // Helper function to apply filters
    const applyFilters = useCallback(
        (newFilters: QuotationFilterParams) => {
            // Combine the current filters with the new ones
            const updatedFilters = { ...filters, ...newFilters, page: 1 };
            return updatedFilters;
        },
        [filters],
    );

    // Helper function to clear filters
    const clearFilters = useCallback(() => {
        return { page: 1, limit: filters.limit || 10 };
    }, [filters]);

    return {
        quotations: data?.items || [],
        quotationsByStatus,
        isLoading,
        error: error as Error | null,
        createQuotation,
        updateQuotationStatus,
        applyFilters,
        clearFilters,
        refetch,
    };
}
