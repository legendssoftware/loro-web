import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchQuotations, deleteQuotation, updateQuotation } from "@/helpers/quotations"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { Quotation } from "@/lib/types/quotations"
import toast from 'react-hot-toast'
import { QuotationDetailModal } from "../components/quotation-detail-modal"
import { QuotationList } from "../components/quotation-list"

export const QuotationsModule = () => {
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()
    const [isQuotationDetailModalOpen, setIsQuotationDetailModalOpen] = useState(false)
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: quotationsData, isLoading } = useQuery({
        queryKey: ['quotations'],
        queryFn: () => fetchQuotations(config),
        enabled: !!accessToken,
    })

    const updateQuotationMutation = useMutation({
        mutationFn: ({ ref, updatedQuotation }: { ref: number; updatedQuotation: Partial<Quotation> }) =>
            updateQuotation({ ref, updatedQuotation, config }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotations'] })
            toast.success('Quotation updated successfully')
            setIsQuotationDetailModalOpen(false)
        },
        onError: () => {
            toast.error('Failed to update quotation')
        }
    })

    const deleteQuotationMutation = useMutation({
        mutationFn: (uid: number) => deleteQuotation(uid, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotations'] })
            toast.success('Quotation deleted successfully')
            setIsQuotationDetailModalOpen(false)
        },
        onError: () => {
            toast.error('Failed to delete quotation')
        }
    })

    const handleQuotationClick = (quotation: Quotation) => {
        setSelectedQuotation(quotation)
        setIsQuotationDetailModalOpen(true)
    }

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <QuotationList 
                quotations={quotationsData?.quotations || []}
                onQuotationClick={handleQuotationClick}
                isLoading={isLoading}
            />

            <QuotationDetailModal 
                isOpen={isQuotationDetailModalOpen}
                onOpenChange={setIsQuotationDetailModalOpen}
                selectedQuotation={selectedQuotation}
                onDelete={(uid) => deleteQuotationMutation.mutate(uid)}
                isUpdating={updateQuotationMutation.isPending}
                isDeleting={deleteQuotationMutation.isPending}
            />
        </div>
    )
} 