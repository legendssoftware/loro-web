import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchClaims, deleteClaim, updateClaim } from "@/helpers/claims"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { Claim, UpdateClaimDTO, ClaimCategory } from "@/lib/types/claims"
import toast from 'react-hot-toast'
import { ClaimList } from "./claim-list"
import { ClaimDetailModal } from "./claim-detail-modal"
import { PageLoader } from "@/components/page-loader"

export const ClaimsModule = () => {
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()
    const [isClaimDetailModalOpen, setIsClaimDetailModalOpen] = useState(false)
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: claimsData, isLoading } = useQuery({
        queryKey: ["claims", currentPage, statusFilter, searchQuery],
        queryFn: () =>
            fetchClaims({
                ...config,
                page: currentPage,
                limit: 25,
                filters: {
                    ...(statusFilter !== "all" && { status: statusFilter }),
                    ...(searchQuery && { search: searchQuery }),
                },
            }),
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleSearch = (query: string) => {
        setSearchQuery(query)
        setCurrentPage(1) // Reset to first page when searching
    }

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status)
        setCurrentPage(1) // Reset to first page when filtering
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <PageLoader />
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <ClaimList  
                claims={claimsData?.data || []}
                isLoading={isLoading}
                onClaimClick={handleClaimClick}
                currentPage={currentPage}
                totalPages={claimsData?.meta?.totalPages || 1}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                onStatusFilter={handleStatusFilter}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
            />

            <ClaimDetailModal 
                isOpen={isClaimDetailModalOpen}
                onOpenChange={setIsClaimDetailModalOpen}
                selectedClaim={selectedClaim}
                onDelete={(uid) => deleteClaimMutation.mutate(uid)}
                onUpdate={(uid, data) => updateClaimMutation.mutate({ 
                    ref: uid, 
                    updatedClaim: { 
                        ...data, 
                        amount: Number(data.amount),
                        category: data.category as ClaimCategory
                    } 
                })}
                isUpdating={updateClaimMutation.isPending}
                isDeleting={deleteClaimMutation.isPending}
            />
        </div>
    )
}
