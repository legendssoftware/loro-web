import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Claim, CreateClaimDTO, UpdateClaimDTO } from "../types/claims";
import { createClaim, deleteClaim, fetchClaims, restoreClaim, updateClaim } from "../helpers/claims";

export function useClaims() {
    const queryClient = useQueryClient();

    const { data: claims, isLoading } = useQuery<Claim[]>({
        queryKey: ["claims"],
        queryFn: fetchClaims
    });

    const { mutate: createClaimMutation, isPending: isCreating } = useMutation({
        mutationFn: (data: CreateClaimDTO) => createClaim(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["claims"] });
            toast.success("Claim created successfully");
        },
        onError: (error: Error) => {
            toast.error(`Error creating claim: ${error.message}`);
        }
    });

    const { mutate: updateClaimMutation, isPending: isUpdating } = useMutation({
        mutationFn: (data: UpdateClaimDTO & { id: number }) => updateClaim(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["claims"] });
            toast.success("Claim updated successfully");
        },
        onError: (error: Error) => {
            toast.error(`Error updating claim: ${error.message}`);
        }
    });

    const { mutate: deleteClaimMutation, isPending: isDeleting } = useMutation({
        mutationFn: (uid: number) => deleteClaim(uid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["claims"] });
            toast.success("Claim deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(`Error deleting claim: ${error.message}`);
        }
    });

    const { mutate: restoreClaimMutation, isPending: isRestoring } = useMutation({
        mutationFn: (uid: number) => restoreClaim(uid),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["claims"] });
            toast.success("Claim restored successfully");
        },
        onError: (error: Error) => {
            toast.error(`Error restoring claim: ${error.message}`);
        }
    });

    return {
        claims,
        isLoading,
        createClaim: createClaimMutation,
        updateClaim: updateClaimMutation,
        deleteClaim: deleteClaimMutation,
        restoreClaim: restoreClaimMutation,
        isCreating,
        isUpdating,
        isDeleting,
        isRestoring
    };
} 