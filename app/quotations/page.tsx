'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { QuotationFilterParams } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { useQuotationsQuery } from '@/hooks/use-quotations-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import { QuotationsTabGroup } from '@/modules/quotations/components/quotations-tab-group';
import { QuotationsTabContent } from '@/modules/quotations/components/quotations-tab-content';
import { QuotationsFilter } from '@/modules/quotations/components/quotations-filter';
import { QuotationDetailsModal } from '@/modules/quotations/components/quotation-details-modal';
import { QuotationsHeader } from '@/modules/quotations/components/quotations-header';

// Tab configuration
const tabs = [
    { id: 'quotations', label: 'Quotations' },
    { id: 'reports', label: 'Reports' },
    { id: 'analytics', label: 'Analytics' },
];

export default function QuotationsPage() {
    const router = useRouter();
    const { isAuthenticated, checkStatus } = useAuthStatus();

    // Check authentication on component mount
    useEffect(() => {
        const status = checkStatus();
        if (!status.isAuthenticated) {
            console.warn('User not authenticated. Redirecting to login page.');
            router.push('/sign-in');
        }
    }, [checkStatus, router]);

    // State
    const [activeTab, setActiveTab] = useState<string>('quotations');
    const [filterParams, setFilterParams] = useState<QuotationFilterParams>({
        page: 1,
        limit: 500,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const {
        quotationsByStatus,
        isLoading,
        error,
        updateQuotationStatus,
        pagination,
        refetch,
        quotations,
        applyFilters,
        clearFilters,
    } = useQuotationsQuery(isAuthenticated ? currentFilters : {});

    // Refetch data when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    // Handlers
    const handleUpdateQuotationStatus = useCallback(
        async (quotationId: number, newStatus: OrderStatus) => {
            await updateQuotationStatus(quotationId, newStatus);
        },
        [updateQuotationStatus],
    );

    const handleCreateQuotation = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleApplyFilters = useCallback((newFilters: QuotationFilterParams) => {
        setFilterParams((prev) => ({
            ...prev,
            ...newFilters,
            limit: 500, // Always keep the limit at 500
        }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilterParams({
            page: 1,
            limit: 500,
        });
    }, []);

    const handleDeleteQuotation = useCallback(async (id: number) => {
        /* Implement delete functionality */
    }, []);

    const handleSubmitCreateQuotation = useCallback((quotation: any) => {
        // Implement the logic to submit a new quotation
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col h-screen overflow-hidden">
                <QuotationsTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {activeTab === 'quotations' && (
                        <QuotationsHeader
                                onApplyFilters={handleApplyFilters}
                                onClearFilters={handleClearFilters}
                            onAddQuotation={handleCreateQuotation}
                            />
                    )}
                    <div className="flex items-center justify-center flex-1 px-8 py-4 overflow-hidden">
                        <QuotationsTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            quotationsByStatus={quotationsByStatus}
                            onUpdateQuotationStatus={handleUpdateQuotationStatus}
                            onDeleteQuotation={handleDeleteQuotation}
                            onAddQuotation={handleCreateQuotation}
                        />
                    </div>
                </div>
            </div>

            {/* Render the CreateQuotationModal */}
            <QuotationDetailsModal
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={handleSubmitCreateQuotation}
            />
        </PageTransition>
    );
}
