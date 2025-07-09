'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { QuotationFilterParams } from '@/lib/types/quotation';
import { OrderStatus } from '@/lib/enums/status.enums';
import { useQuotationsQuery } from '@/hooks/use-quotations-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { QuotationsTabGroup } from '@/modules/quotations/components/quotations-tab-group';
import { useQuotationDetailsModal } from '@/hooks/use-modal-store';
import { AppLoader } from '@/components/ui/app-loader';
import { useAuthStore, selectProfileData } from '@/store/auth-store';

// Dynamic imports for components that don't need to be loaded immediately
const QuotationsTabContent = dynamic(
    () =>
        import('@/modules/quotations/components/quotations-tab-content').then(
            (mod) => ({ default: mod.QuotationsTabContent }),
        ),
    {
        loading: () => (
            <div className="flex justify-center items-center w-full h-full">
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

function QuotationsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, checkStatus } = useAuthStatus();
    const profileData = useAuthStore(selectProfileData);

    // Determine if user is a client based on auth store profile data
    const isClientRole = useMemo(() => {
        return profileData?.accessLevel === 'client';
    }, [profileData?.accessLevel]);

    // State
    const [activeTab, setActiveTab] = useState<string>(isClientRole ? 'quotations' : 'quotations');

    // Tabs based on user role
    const clientTabs = useMemo(
        () => [
            { id: 'quotations', label: 'Quotations' },
            { id: 'reports', label: 'Reports' },
            { id: 'settings', label: 'Settings' },
        ],
        [],
    );

    const displayTabs = useMemo(
        () => (isClientRole ? clientTabs : tabs),
        [isClientRole, clientTabs],
    );

    // Check authentication on component mount
    useEffect(() => {
        const status = checkStatus();
        if (!status.isAuthenticated) {
            console.warn('User not authenticated. Redirecting to login page.');
            router.push('/sign-in');
        }
    }, [checkStatus, router]);

    // Set appropriate initial tab when client role changes
    useEffect(() => {
        if (isClientRole) {
            setActiveTab('quotations');
        } else {
            setActiveTab('quotations');
        }
    }, [isClientRole]);

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

    // Handle URL parameters for opening specific quotations
    useEffect(() => {
        const quotationId = searchParams.get('id');
        
        if (quotationId && isAuthenticated && quotationsByStatus) {
            // Find the quotation in the loaded data
            const findQuotationInStatus = (statusGroups: any) => {
                if (!statusGroups) return null;
                
                for (const statusGroup of Object.values(statusGroups)) {
                    const quotations = (statusGroup as any)?.quotations || [];
                    const foundQuotation = quotations.find((q: any) => q.uid === parseInt(quotationId));
                    if (foundQuotation) {
                        return foundQuotation;
                    }
                }
                return null;
            };

            const quotation = findQuotationInStatus(quotationsByStatus);
            
            if (quotation) {
                // Switch to quotations tab and open the modal
                setActiveTab('quotations');
                quotationModal.onOpen(quotation);
                
                // Clean up the URL parameter
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete('id');
                window.history.replaceState({}, '', newUrl.toString());
            }
        }
    }, [searchParams, isAuthenticated, quotationsByStatus, quotationModal, setActiveTab]);

    // Handlers
    const handleUpdateQuotationStatus = useCallback(
        async (quotationId: number, newStatus: OrderStatus) => {
            return await updateQuotationStatus(quotationId, newStatus);
        },
        [updateQuotationStatus],
    );

    const handleCreateQuotation = useCallback(() => {
        // Create an empty quotation object and open the modal
        const emptyQuotation = {
            uid: 0, // Temporary ID for new quotation
            status: OrderStatus.DRAFT,
            // Include any other required fields with default values
        };
        quotationModal.onOpen(emptyQuotation as any);
    }, [quotationModal]);

    const handleDeleteQuotation = useCallback(async (id: number) => {
        /* Implement delete functionality */
    }, []);

    return (
        <PageTransition>
            <div className="flex overflow-hidden flex-col h-screen">
                <QuotationsTabGroup
                    tabs={displayTabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex overflow-hidden flex-col flex-1">
                    <div className="flex overflow-hidden flex-1 justify-center items-center px-3 py-3 xl:px-8 xl:px-4">
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

export default function QuotationsPage() {
    return (
        <Suspense fallback={<AppLoader />}>
            <QuotationsPageContent />
        </Suspense>
    );
}
