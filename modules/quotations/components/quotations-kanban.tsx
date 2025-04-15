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
        (status: OrderStatus, title: string, count: number) => {
            const quotations = quotationsByStatus[status] || [];
            const colors = StatusColors[status];

            return (
                <div className="flex-1 min-w-[280px] max-w-[320px] flex flex-col">
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
        <div className="flex flex-row items-start w-full h-full gap-2 overflow-x-scroll overflow-y-hidden">
            {/* First group: Initial statuses */}
            {renderColumn(
                OrderStatus.DRAFT,
                'Draft',
                quotationsByStatus[OrderStatus.DRAFT]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.PENDING_INTERNAL,
                'Internal Review',
                quotationsByStatus[OrderStatus.PENDING_INTERNAL]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.PENDING_CLIENT,
                'Client Review',
                quotationsByStatus[OrderStatus.PENDING_CLIENT]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.NEGOTIATION,
                'Negotiation',
                quotationsByStatus[OrderStatus.NEGOTIATION]?.length || 0,
            )}

            {/* Approval/Rejection */}
            {renderColumn(
                OrderStatus.APPROVED,
                'Approved',
                quotationsByStatus[OrderStatus.APPROVED]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.REJECTED,
                'Rejected',
                quotationsByStatus[OrderStatus.REJECTED]?.length || 0,
            )}

            {/* Fulfillment process */}
            {renderColumn(
                OrderStatus.SOURCING,
                'Sourcing',
                quotationsByStatus[OrderStatus.SOURCING]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.PACKING,
                'Packing',
                quotationsByStatus[OrderStatus.PACKING]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.IN_FULFILLMENT,
                'In Fulfillment',
                quotationsByStatus[OrderStatus.IN_FULFILLMENT]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.PAID,
                'Paid',
                quotationsByStatus[OrderStatus.PAID]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.OUTFORDELIVERY,
                'Out for Delivery',
                quotationsByStatus[OrderStatus.OUTFORDELIVERY]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.DELIVERED,
                'Delivered',
                quotationsByStatus[OrderStatus.DELIVERED]?.length || 0,
            )}

            {/* Final statuses */}
            {renderColumn(
                OrderStatus.RETURNED,
                'Returned',
                quotationsByStatus[OrderStatus.RETURNED]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.COMPLETED,
                'Completed',
                quotationsByStatus[OrderStatus.COMPLETED]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.CANCELLED,
                'Cancelled',
                quotationsByStatus[OrderStatus.CANCELLED]?.length || 0,
            )}
            {renderColumn(
                OrderStatus.POSTPONED,
                'Postponed',
                quotationsByStatus[OrderStatus.POSTPONED]?.length || 0,
            )}
        </div>
    );
}
