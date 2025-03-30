'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { QuotationFilterParams } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { useQuotationsQuery } from '@/hooks/use-quotations-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { QuotationsTabGroup } from '@/modules/quotations/components/quotations-tab-group';
import { useQuotationDetailsModal } from '@/hooks/use-modal-store';
import { AppLoader } from '@/components/ui/app-loader';

// Dynamic imports for components that don't need to be loaded immediately
const QuotationsTabContent = dynamic(
    () =>
        import('@/modules/quotations/components/quotations-tab-content').then(
            (mod) => ({ default: mod.QuotationsTabContent }),
        ),
    {
        loading: () => (
            <div className="flex items-center justify-center w-full h-full">
                <AppLoader />
            </div>
        ),
    },
);

const QuotationDetailsModal = dynamic(
    () =>
        import('@/modules/quotations/components/quotation-details-modal').then(
            (mod) => ({ default: mod.QuotationDetailsModal }),
        ),
    { ssr: false },
);

// Tab configuration
const tabs = [{ id: 'quotations', label: 'Quotations' }];

export default function QuotationsPage() {
    const router = useRouter();
    const { isAuthenticated, checkStatus } = useAuthStatus();

    // Check authentication on component mount
    useEffect(() => {
        const status = checkStatus();
        if (!status.isAuthenticated) {
            console.warn('User not authenticated. Redirecting to login page.');
            router.push('/sign-in');
        } else {
            // For client authentication, extract role from JWT token
            const getClientRoleFromToken = () => {
                const token = sessionStorage.getItem('auth-storage');
                if (token) {
                    try {
                        const authData = JSON.parse(token);
                        const accessToken = authData?.state?.accessToken;

                        if (accessToken) {
                            const base64Url = accessToken.split('.')[1];
                            const base64 = base64Url
                                .replace(/-/g, '+')
                                .replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(
                                atob(base64)
                                    .split('')
                                    .map(
                                        (c) =>
                                            '%' +
                                            (
                                                '00' +
                                                c.charCodeAt(0).toString(16)
                                            ).slice(-2),
                                    )
                                    .join(''),
                            );
                            const payload = JSON.parse(jsonPayload);
                            return payload.role;
                        }
                    } catch (e) {
                        console.error('Failed to extract role from token:', e);
                    }
                }
                return null;
            };

            // If client role is detected, make sure we're on the quotations page
            const role = getClientRoleFromToken();
            if (role === 'client') {
                console.log(
                    'Client role detected, ensuring access to quotations page',
                );
            }
        }
    }, [checkStatus, router]);

    // State
    const [activeTab, setActiveTab] = useState<string>('quotations');
    const [filterParams, setFilterParams] = useState<QuotationFilterParams>({
        page: 1,
        limit: 500,
    });

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const {
        quotationsByStatus,
        isLoading,
        error,
        refetch,
        updateQuotationStatus,
    } = useQuotationsQuery(currentFilters);

    // Get the quotation modal hook
    const quotationModal = useQuotationDetailsModal();

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
        // Create an empty quotation object and open the modal
        const emptyQuotation = {
            uid: 0, // Temporary ID for new quotation
            status: OrderStatus.PENDING,
            // Include any other required fields with default values
        };
        quotationModal.onOpen(emptyQuotation as any);
    }, [quotationModal]);

    const handleDeleteQuotation = useCallback(async (id: number) => {
        /* Implement delete functionality */
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
                    <div className="flex items-center justify-center flex-1 px-3 py-3 overflow-hidden xl:px-8 xl:px-4">
                        <QuotationsTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            quotationsByStatus={quotationsByStatus}
                            onUpdateQuotationStatus={
                                handleUpdateQuotationStatus
                            }
                            onDeleteQuotation={handleDeleteQuotation}
                            onAddQuotation={handleCreateQuotation}
                        />
                    </div>
                </div>
            </div>

            {/* Render the CreateQuotationModal */}
            <QuotationDetailsModal
                onUpdateStatus={handleUpdateQuotationStatus}
                onDeleteQuotation={handleDeleteQuotation}
            />
        </PageTransition>
    );
}
