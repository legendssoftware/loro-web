import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchQuotations, updateQuotation } from "@/helpers/quotations"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { Quotation, OrderStatus } from "@/lib/types/quotations"
import toast from 'react-hot-toast'
import { QuotationList } from "./quotation-list"
import { QuotationDetailModal } from "./quotation-detail-modal"

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
        mutationFn: ({ ref, status }: { ref: number; status: OrderStatus }) =>
            updateQuotation({ ref, updatedQuotation: { status }, config }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotations'] })
            toast.success('Quotation status updated successfully')
            setIsQuotationDetailModalOpen(false)
        },
        onError: () => {
            toast.error('Failed to update quotation status')
        }
    })

    const handleQuotationClick = (quotation: Quotation) => {
        setSelectedQuotation(quotation)
        setIsQuotationDetailModalOpen(true)
    }

    const handleStatusUpdate = (uid: number, status: OrderStatus) => {
        updateQuotationMutation.mutate({ ref: uid, status })
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
                onUpdate={handleStatusUpdate}
                isUpdating={updateQuotationMutation.isPending}
            />
        </div>
    )
} 