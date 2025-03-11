'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ClaimStatus, ClaimFilterParams } from '@/lib/types/claim';
import { useClaimsQuery } from '@/hooks/use-claims-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import { ClaimsTabGroup } from '@/modules/claims/components/claims-tab-group';
import { ClaimsTabContent } from '@/modules/claims/components/claims-tab-content';
import { ClaimDetailsModal } from '@/modules/claims/components/claim-details-modal';
import { ClaimsHeader } from '@/modules/claims/components/claims-header';

// Tab configuration
const tabs = [
    { id: 'claims', label: 'Claims' },
    { id: 'reports', label: 'Reports' },
    { id: 'analytics', label: 'Analytics' },
];

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
    const [filterParams, setFilterParams] = useState<ClaimFilterParams>({
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
        async (claimData: any) => {
            await createClaim(claimData);
            setIsCreateDialogOpen(false);
        },
        [createClaim],
    );

    // Apply filters handler
    const handleApplyFilters = useCallback((newFilters: ClaimFilterParams) => {
        setFilterParams((prev) => ({
            ...prev,
            ...newFilters,
            limit: 500, // Always keep the limit at 500
        }));
    }, []);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
        setFilterParams({
            page: 1,
            limit: 500,
        });
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col h-screen gap-2 overflow-hidden">
                <ClaimsTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {activeTab === 'claims' && (
                        <ClaimsHeader
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={handleClearFilters}
                            onAddClaim={handleCreateClaim}
                        />
                    )}
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
