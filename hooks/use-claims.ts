import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/providers/auth.provider';
import { CreateClaimDTO, UpdateClaimDTO } from '@/lib/types/claims';
import {
    fetchClaims,
    fetchClaimByRef,
    fetchClaimsByUser,
    createClaim,
    updateClaim,
    deleteClaim,
    restoreClaim
} from '@/helpers/claims';
import { toast } from 'sonner';

export const useClaims = () => {
    const { session } = useSession();
    const queryClient = useQueryClient();

    const config = {
        headers: {
            token: session?.accessToken
        }
    };

    // Fetch all claims
    const { data: claimsData, isLoading: isLoadingClaims } = useQuery({
        queryKey: ['claims'],
        queryFn: () => fetchClaims(config),
        enabled: !!session?.accessToken
    });

    // Fetch a single claim
    const useClaimByRef = (ref: number) => useQuery({
        queryKey: ['claim', ref],
        queryFn: () => fetchClaimByRef(ref, config),
        enabled: !!ref && !!session?.accessToken
    });

    // Fetch claims by user
    const useClaimsByUser = (ref: number) => useQuery({
        queryKey: ['claims', ref],
        queryFn: () => fetchClaimsByUser(ref, config),
        enabled: !!ref && !!session?.accessToken
    });

    // Create claim mutation
    const createClaimMutation = useMutation({
        mutationFn: (newClaim: CreateClaimDTO) => createClaim(newClaim, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            toast.success('Claim created successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to create claim: ' + error.message);
        }
    });

    // Update claim mutation
    const updateClaimMutation = useMutation({
        mutationFn: ({ ref, updatedClaim }: { ref: number; updatedClaim: UpdateClaimDTO }) =>
            updateClaim({ ref, updatedClaim, config }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            toast.success('Claim updated successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to update claim: ' + error.message);
        }
    });

    // Delete claim mutation
    const deleteClaimMutation = useMutation({
        mutationFn: (ref: number) => deleteClaim(ref, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            toast.success('Claim deleted successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to delete claim: ' + error.message);
        }
    });

    // Restore claim mutation
    const restoreClaimMutation = useMutation({
        mutationFn: (ref: number) => restoreClaim(ref, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] });
            toast.success('Claim restored successfully');
        },
        onError: (error: Error) => {
            toast.error('Failed to restore claim: ' + error.message);
        }
    });

    return {
        claims: claimsData?.claims || [],
        stats: claimsData?.stats,
        isLoadingClaims,
        useClaimByRef,
        useClaimsByUser,
        createClaimMutation,
        updateClaimMutation,
        deleteClaimMutation,
        restoreClaimMutation
    };
}; 