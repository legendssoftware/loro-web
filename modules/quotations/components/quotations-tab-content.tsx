'use client';

import { QuotationsByStatus } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { QuotationsKanban } from './quotations-kanban';
import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';

interface QuotationsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    quotationsByStatus: QuotationsByStatus;
    onUpdateQuotationStatus: (
        quotationId: number,
        newStatus: OrderStatus,
    ) => Promise<void>;
    onDeleteQuotation?: (quotationId: number) => Promise<void>;
    onAddQuotation: () => void;
}

function QuotationsTabContentComponent({
    activeTab,
    isLoading,
    error,
    quotationsByStatus,
    onUpdateQuotationStatus,
    onDeleteQuotation,
    onAddQuotation,
}: QuotationsTabContentProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-64">
                <AppLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-64">
                <div className="text-lg font-semibold text-destructive">
                    Error loading quotations
                </div>
                <div className="text-sm text-muted-foreground">
                    {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            {activeTab === 'quotations' && (
                <div className="flex-1 w-full overflow-hidden">
                    <QuotationsKanban
                        quotationsByStatus={quotationsByStatus}
                        onUpdateStatus={onUpdateQuotationStatus}
                        onDeleteQuotation={onDeleteQuotation}
                        onAddNewQuotation={onAddQuotation}
                    />
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="w-full h-full overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-lg font-thin uppercase font-body">
                            Quotations Reports
                        </p>
                        <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                            Quotations reports functionality activating soon
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="w-full h-full overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-lg font-thin uppercase font-body">
                            Quotations Analytics
                        </p>
                        <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                            Quotations analytics functionality activating soon
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(QuotationsTabContentComponent);
export { QuotationsTabContentComponent as QuotationsTabContent };
