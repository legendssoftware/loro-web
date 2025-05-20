'use client';

import { useCallback, memo, useState } from 'react';
import { QuotationsByStatus, StatusColors } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { QuotationCard } from './quotation-card';
import { cn } from '@/lib/utils';

interface QuotationsKanbanProps {
    quotationsByStatus: QuotationsByStatus;
    onUpdateStatus: (
        quotationId: number,
        newStatus: OrderStatus,
    ) => Promise<
        | { success: boolean; error?: unknown }
        | { success: boolean; message?: string; error?: unknown }
    >;
    onDeleteQuotation?: (quotationId: number) => Promise<void>;
    onAddNewQuotation?: () => void;
}

// Memoized quotation card to prevent unnecessary re-renders
const MemoizedQuotationCard = memo(QuotationCard);

// Memoized empty state component
const EmptyColumn = memo(() => (
    <div className="flex items-center justify-center h-24 text-[10px] font-normal uppercase border border-dashed rounded-md border-border text-muted-foreground font-body animate-fade-in">
        No quotations in this column
    </div>
));

export function QuotationsKanban({
    quotationsByStatus,
    onUpdateStatus,
    onDeleteQuotation,
    onAddNewQuotation,
}: QuotationsKanbanProps) {
    const [draggingId, setDraggingId] = useState<number | null>(null);

    // Handle drag start - store the dragged quotation ID
    const handleDragStart = useCallback((quotationId: number) => {
        setDraggingId(quotationId);
    }, []);

    // Handle drop of a quotation on a status column
    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>, newStatus: OrderStatus) => {
            e.preventDefault();
            if (draggingId) {
                try {
                    await onUpdateStatus(draggingId, newStatus);
                } catch (error) {
                    console.error('Error updating quotation status:', error);
                } finally {
                    setDraggingId(null);
                }
            }
        },
        [draggingId, onUpdateStatus],
    );

    // Handle drag over to allow dropping
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    // Render a column for a status
    const renderColumn = useCallback(
        (status: OrderStatus, title: string, count: number, columnId?: string, exampleCard?: boolean) => {
            const quotations = quotationsByStatus[status] || [];
            const colors = StatusColors[status];

            return (
                <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col" id={columnId}>
                    <div className="flex items-center justify-between mb-2">
                        <div
                            className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-normal flex items-center flex-row justify-between',
                                colors?.bg,
                                colors?.text,
                            )}
                        >
                            <span className="uppercase font-body">{title}</span>
                            <span className="ml-2 px-1.5 py-0.5 bg-background/30 rounded-full font-body uppercase text-xl">
                                {count}
                            </span>
                        </div>
                    </div>
                    <div
                        className="space-y-3 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-240px)] pr-1 pb-2"
                        onDrop={(e) => handleDrop(e, status)}
                        onDragOver={handleDragOver}
                    >
                        {quotations?.map((quotation, index) => (
                            <MemoizedQuotationCard
                                key={quotation?.uid}
                                quotation={quotation}
                                onDragStart={handleDragStart}
                                index={index}
                                id={exampleCard && index === 0 ? 'quotation-card-example' : undefined}
                            />
                        ))}
                        {quotations?.length === 0 && <EmptyColumn />}
                    </div>
                </div>
            );
        },
        [
            quotationsByStatus,
            onUpdateStatus,
            onDeleteQuotation,
            onAddNewQuotation,
            handleDrop,
            handleDragOver,
            handleDragStart,
        ],
    );

    return (
        <div className="flex flex-row items-start w-full h-full gap-2 overflow-x-scroll overflow-y-hidden" id="quotations-table">
            {/* First group: Initial statuses */}
            {renderColumn(
                OrderStatus.DRAFT,
                'Draft',
                quotationsByStatus[OrderStatus.DRAFT]?.length || 0,
                'draft-quotations-column',
                true
            )}
            {renderColumn(
                OrderStatus.PENDING_INTERNAL,
                'Internal Review',
                quotationsByStatus[OrderStatus.PENDING_INTERNAL]?.length || 0,
                'pendinginternal-quotations-column'
            )}
            {renderColumn(
                OrderStatus.PENDING_CLIENT,
                'Client Review',
                quotationsByStatus[OrderStatus.PENDING_CLIENT]?.length || 0,
                'pendingclient-quotations-column'
            )}
            {renderColumn(
                OrderStatus.NEGOTIATION,
                'Negotiation',
                quotationsByStatus[OrderStatus.NEGOTIATION]?.length || 0,
                'negotiation-quotations-column'
            )}
            {renderColumn(
                OrderStatus.APPROVED,
                'Approved',
                quotationsByStatus[OrderStatus.APPROVED]?.length || 0,
                'approved-quotations-column'
            )}
            {renderColumn(
                OrderStatus.REJECTED,
                'Rejected',
                quotationsByStatus[OrderStatus.REJECTED]?.length || 0,
                'rejected-quotations-column'
            )}
            {renderColumn(
                OrderStatus.SOURCING,
                'Sourcing',
                quotationsByStatus[OrderStatus.SOURCING]?.length || 0,
                'sourcing-quotations-column'
            )}
            {renderColumn(
                OrderStatus.PACKING,
                'Packing',
                quotationsByStatus[OrderStatus.PACKING]?.length || 0,
                'packing-quotations-column'
            )}
            {renderColumn(
                OrderStatus.IN_FULFILLMENT,
                'In Fulfillment',
                quotationsByStatus[OrderStatus.IN_FULFILLMENT]?.length || 0,
                'infulfillment-quotations-column'
            )}
            {renderColumn(
                OrderStatus.PAID,
                'Paid',
                quotationsByStatus[OrderStatus.PAID]?.length || 0,
                'paid-quotations-column'
            )}
            {renderColumn(
                OrderStatus.OUTFORDELIVERY,
                'Out for Delivery',
                quotationsByStatus[OrderStatus.OUTFORDELIVERY]?.length || 0,
                'outfordelivery-quotations-column'
            )}
            {renderColumn(
                OrderStatus.DELIVERED,
                'Delivered',
                quotationsByStatus[OrderStatus.DELIVERED]?.length || 0,
                'delivered-quotations-column'
            )}
            {renderColumn(
                OrderStatus.RETURNED,
                'Returned',
                quotationsByStatus[OrderStatus.RETURNED]?.length || 0,
                'returned-quotations-column'
            )}
            {renderColumn(
                OrderStatus.COMPLETED,
                'Completed',
                quotationsByStatus[OrderStatus.COMPLETED]?.length || 0,
                'completed-quotations-column'
            )}
            {renderColumn(
                OrderStatus.CANCELLED,
                'Cancelled',
                quotationsByStatus[OrderStatus.CANCELLED]?.length || 0,
                'cancelled-quotations-column'
            )}
            {renderColumn(
                OrderStatus.POSTPONED,
                'Postponed',
                quotationsByStatus[OrderStatus.POSTPONED]?.length || 0,
                'postponed-quotations-column'
            )}
        </div>
    );
}
