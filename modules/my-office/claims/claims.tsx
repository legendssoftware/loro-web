import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchClaims, deleteClaim, updateClaim } from "@/helpers/claims"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { Claim, UpdateClaimDTO } from "@/lib/types/claims"
import toast from 'react-hot-toast'
import { ClaimList } from "./claim-list"
import { ClaimDetailModal } from "./claim-detail-modal"

export const ClaimsModule = () => {
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()
    const [isClaimDetailModalOpen, setIsClaimDetailModalOpen] = useState(false)
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: claimsData, isLoading } = useQuery({
        queryKey: ['claims'],
        queryFn: () => fetchClaims(config),
        enabled: !!accessToken,
    })

    const updateClaimMutation = useMutation({
        mutationFn: ({ ref, updatedClaim }: { ref: number; updatedClaim: UpdateClaimDTO }) =>
            updateClaim({ ref, updatedClaim, config }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] })
            toast.success('Claim updated successfully')
            setIsClaimDetailModalOpen(false)
        },
        onError: () => {
            toast.error('Failed to update claim')
        }
    })

    const deleteClaimMutation = useMutation({
        mutationFn: (uid: number) => deleteClaim(uid, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['claims'] })
            toast.success('Claim deleted successfully')
            setIsClaimDetailModalOpen(false)
        },
        onError: () => {
            toast.error('Failed to delete claim')
        }
    })

    const handleClaimClick = (claim: Claim) => {
        setSelectedClaim(claim)
        setIsClaimDetailModalOpen(true)
    }

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <ClaimList  
                claims={claimsData?.claims || []}
                onClaimClick={handleClaimClick}
                isLoading={isLoading}
            />

            <ClaimDetailModal 
                isOpen={isClaimDetailModalOpen}
                onOpenChange={setIsClaimDetailModalOpen}
                selectedClaim={selectedClaim}
                onDelete={(uid) => deleteClaimMutation.mutate(uid)}
                isUpdating={updateClaimMutation.isPending}
                isDeleting={deleteClaimMutation.isPending}
            />
        </div>
    )
}
