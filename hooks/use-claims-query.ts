import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Claim, ClaimStatus, ClaimFilterParams, ClaimsByStatus } from '@/lib/types/claim';
import toast from 'react-hot-toast';
import { useClaimApi } from './use-claim-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

const CLAIMS_QUERY_KEY = 'claims';

export function useClaimsQuery(filters: ClaimFilterParams = {}) {
    const queryClient = useQueryClient();
    const claimApi = useClaimApi();

    // Ensure we always use a limit of 500
    const enhancedFilters = useMemo(() => ({
        ...filters,
        limit: 500,
    }), [filters]);

    // Fetch claims with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [CLAIMS_QUERY_KEY, enhancedFilters],
        queryFn: () => claimApi.getClaims(enhancedFilters),
        placeholderData: previousData => previousData,
        staleTime: 1000 * 60, // 1 minute
        // Add retry and error handling
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: Object.keys(enhancedFilters)?.length > 0 || !enhancedFilters?.hasOwnProperty('page'),
    });

    // Group claims by status
    const claimsByStatus = useMemo<ClaimsByStatus>(() => {
        const statusGroups = {
            [ClaimStatus.PENDING]: [],
            [ClaimStatus.APPROVED]: [],
            [ClaimStatus.REJECTED]: [],
            [ClaimStatus.PAID]: [],
            [ClaimStatus.CANCELLED]: [],
            [ClaimStatus.DECLINED]: [],
            [ClaimStatus.DELETED]: [],
        } as ClaimsByStatus;

        if (data?.items) {
            // Group claims by status
            data.items.forEach(claim => {
                if (!claim.isDeleted) {
                    statusGroups[claim.status].push(claim);
                }
            });
        }

        return statusGroups;
    }, [data?.items]);

    // Create claim mutation
    const createClaimMutation = useMutation({
        mutationFn: async (claimData: Partial<Claim>) => {
            try {
                const result = await claimApi.createClaim(claimData);
                showSuccessToast('Claim created successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast('Failed to create claim. Please try again.', toast);
                console.error('Create claim error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate claims query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [CLAIMS_QUERY_KEY] });
        },
    });

    // Update claim mutation
    const updateClaimMutation = useMutation({
        mutationFn: async ({ claimId, updates }: { claimId: number; updates: Partial<Claim> }) => {
            try {
                await claimApi.updateClaim(claimId, updates);
                showSuccessToast('Claim updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast('Failed to update claim. Please try again.', toast);
                console.error('Update claim error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate claims query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [CLAIMS_QUERY_KEY] });
        },
    });

    // Delete claim mutation
    const deleteClaimMutation = useMutation({
        mutationFn: async (claimId: number) => {
            try {
                await claimApi.deleteClaim(claimId);
                showSuccessToast('Claim deleted successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast('Failed to delete claim. Please try again.', toast);
                console.error('Delete claim error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate claims query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [CLAIMS_QUERY_KEY] });
        },
    });

    // Create claim wrapper function
    const createClaim = useCallback(
        async (claimData: Partial<Claim>) => {
            return createClaimMutation.mutate(claimData);
        },
        [createClaimMutation],
    );

    // Update claim wrapper function
    const updateClaim = useCallback(
        async (claimId: number, updates: Partial<Claim>) => {
            return updateClaimMutation.mutate({ claimId, updates });
        },
        [updateClaimMutation],
    );

    // Delete claim wrapper function
    const deleteClaim = useCallback(
        async (claimId: number) => {
            return deleteClaimMutation.mutate(claimId);
        },
        [deleteClaimMutation],
    );

    // Apply filters
    const applyFilters = useCallback((newFilters: ClaimFilterParams) => {
        // This doesn't directly modify state as the hook will be called with new filters
        return newFilters;
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        // Returns empty object to clear filters
        return {};
    }, []);

    return {
        claims: data?.items || [],
        claimsByStatus,
        isLoading,
        error: error as Error | null,
        createClaim,
        updateClaim,
        deleteClaim,
        applyFilters,
        clearFilters,
        refetch,
    };
}
