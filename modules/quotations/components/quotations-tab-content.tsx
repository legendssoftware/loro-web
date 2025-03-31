'use client';

import { QuotationsByStatus } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { QuotationsKanban } from './quotations-kanban';
import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';
import { FolderMinus } from 'lucide-react';
import { ClientQuotationReport } from '@/modules/reports/components/client-quotation-report';

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
            <div className="h-full overflow-hidden">
                <div className="flex flex-col items-center justify-center h-full gap-2">
                    <FolderMinus
                        className="text-red-500"
                        size={50}
                        strokeWidth={1}
                    />
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        Please re-try
                    </p>
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
                <div className="h-full pb-6 overflow-auto">
                    <ClientQuotationReport
                        clientId={1}
                        // We're setting a default client ID of 1 until we can properly extract the client ID
                        // This should be replaced with the actual logged-in client's ID
                    />
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="h-full overflow-hidden">
                    <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                            Activating soon
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(QuotationsTabContentComponent);
export { QuotationsTabContentComponent as QuotationsTabContent };
