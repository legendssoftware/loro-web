'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ClaimStatus, ClaimFilterParams } from '@/lib/types/claim';
import { useClaimsQuery } from '@/hooks/use-claims-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import { ClaimsTabGroup } from '@/modules/claims/components/claims-tab-group';
import { ClaimsTabContent } from '@/modules/claims/components/claims-tab-content';
import { ClaimsFilter } from '@/modules/claims/components/claims-filter';
import { ClaimDetailsModal } from '@/modules/claims/components/claim-details-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
            console.warn('User not authenticated. Redirecting to login page.');
            router.push('/sign-in');
        }
    }, [checkStatus, router]);

    // State
    const [activeTab, setActiveTab] = useState<string>('claims');
    const [filterParams, setFilterParams] = useState<ClaimFilterParams>({
        page: 1,
        limit: 20,
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
        pagination,
        refetch,
        claims,
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
            page: 1, // Reset to first page when applying new filters
        }));
    }, []);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
        console.log('Clearing filters');
        setFilterParams({
            page: 1,
            limit: 20,
        });
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        console.log('Changing to page:', page);
        setFilterParams((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col h-screen overflow-hidden">
                <ClaimsTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {activeTab === 'claims' && (
                        <div className="flex items-center p-4">
                            <ClaimsFilter
                                onApplyFilters={handleApplyFilters}
                                onClearFilters={handleClearFilters}
                                claims={claims || []}
                            />
                            <Button
                                size="sm"
                                className="ml-2 bg-primary hover:bg-primary/90 text-[11px] uppercase font-normal font-body"
                                onClick={handleCreateClaim}
                            >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Claim
                            </Button>
                        </div>
                    )}
                    <div className="flex items-center justify-start flex-1 px-2 overflow-hidden">
                        <ClaimsTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            claimsByStatus={claimsByStatus}
                            pagination={pagination}
                            onUpdateClaimStatus={handleUpdateClaimStatus}
                            onDeleteClaim={handleDeleteClaim}
                            onAddClaim={handleCreateClaim}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>

            {/* Render the CreateClaimModal */}
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
