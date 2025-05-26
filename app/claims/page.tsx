'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ClaimStatus, ClaimFilterParams, Claim } from '@/lib/types/claim';
import { useClaimsQuery } from '@/hooks/use-claims-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ClaimsTabGroup } from '@/modules/claims/components/claims-tab-group';
import { AppLoader } from '@/components/ui/app-loader';

// Dynamic imports for components that don't need to be loaded immediately
const ClaimsTabContent = dynamic(
    () =>
        import('@/modules/claims/components/claims-tab-content').then(
            (mod) => ({ default: mod.ClaimsTabContent }),
        ),
    {
        loading: () => (
            <div className="flex items-center justify-center w-full h-full">
                <AppLoader />
            </div>
        ),
    },
);

const ClaimDetailsModal = dynamic(
    () =>
        import('@/modules/claims/components/claim-details-modal').then(
            (mod) => ({ default: mod.ClaimDetailsModal }),
        ),
    { ssr: false },
);

// Tab configuration
const tabs = [{ id: 'claims', label: 'Claims' }];

export default function ClaimsPage() {
    const router = useRouter();
    const { isAuthenticated, checkStatus } = useAuthStatus();

    // Check authentication on component mount
    useEffect(() => {
        const status = checkStatus();
        if (!status.isAuthenticated) {
            router.push('/sign-in');
        }
    }, [checkStatus, router]);

    // State
    const [activeTab, setActiveTab] = useState<string>('claims');
    const [filterParams] = useState<ClaimFilterParams>({
        page: 1,
        limit: 500,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const {
        claimsByStatus,
        isLoading,
        error,
        updateClaim,
        deleteClaim,
        createClaim,
        refetch,
    } = useClaimsQuery(isAuthenticated ? currentFilters : {});

    // Refetch data when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    // Handlers
    const handleUpdateClaimStatus = useCallback(
        async (claimId: number, newStatus: string) => {
            await updateClaim(claimId, { status: newStatus as ClaimStatus });
        },
        [updateClaim],
    );

    const handleDeleteClaim = useCallback(
        async (claimId: number) => {
            await deleteClaim(claimId);
        },
        [deleteClaim],
    );

    const handleCreateClaim = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleSubmitCreateClaim = useCallback(
        async (claimData: Partial<Claim>) => {
            await createClaim(claimData);
            setIsCreateDialogOpen(false);
        },
        [createClaim],
    );

    return (
        <PageTransition>
            <div className="flex flex-col h-screen gap-2 overflow-hidden">
                <ClaimsTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center justify-center flex-1 px-3 py-3 overflow-hidden xl:px-8 xl:px-4">
                        <ClaimsTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            claimsByStatus={claimsByStatus}
                            onUpdateClaimStatus={handleUpdateClaimStatus}
                            onDeleteClaim={handleDeleteClaim}
                            onAddClaim={handleCreateClaim}
                        />
                    </div>
                </div>
            </div>

            {/* Render the Claim Modal */}
            <ClaimDetailsModal
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onSave={handleSubmitCreateClaim}
                onUpdateStatus={handleUpdateClaimStatus}
                onDelete={handleDeleteClaim}
            />
        </PageTransition>
    );
}
