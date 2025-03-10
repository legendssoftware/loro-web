'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { LeadFilterParams } from '@/lib/types/lead';
import { useLeadsQuery } from '@/hooks/use-leads-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import { LeadsTabGroup } from '@/modules/leads/components/leads-tab-group';
import { LeadsTabContent } from '@/modules/leads/components/leads-tab-content';
import { LeadsHeader } from '@/modules/leads/components/leads-header';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Tab configuration
const tabs = [
    { id: 'leads', label: 'Leads' },
    { id: 'reports', label: 'Reports' },
    { id: 'analytics', label: 'Analytics' },
];

// Create Lead Modal Component
function CreateLeadModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateLead?: (leadData: any) => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-thin uppercase font-body">
                        Lead Creation
                    </DialogTitle>
                </DialogHeader>
                <div className="flex items-center justify-center h-64">
                    <h2 className="text-xs font-thin uppercase font-body">
                        Activating Soon
                    </h2>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function LeadsPage() {
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
    const [activeTab, setActiveTab] = useState<string>('leads');
    const [filterParams, setFilterParams] = useState<LeadFilterParams>({
        page: 1,
        limit: 500,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const {
        leadsByStatus,
        isLoading,
        error,
        updateLeadStatus,
        deleteLead,
        createLead,
        refetch,
    } = useLeadsQuery(isAuthenticated ? currentFilters : {});

    // Refetch data when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    // Handlers
    const handleUpdateLeadStatus = useCallback(
        async (leadId: number, newStatus: string) => {
            await updateLeadStatus(leadId, newStatus);
        },
        [updateLeadStatus],
    );

    const handleDeleteLead = useCallback(
        async (leadId: number) => {
            await deleteLead(leadId);
        },
        [deleteLead],
    );

    const handleCreateLead = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleSubmitCreateLead = useCallback(
        async (leadData: any) => {
            await createLead(leadData);
        },
        [createLead],
    );

    // Apply filters handler
    const handleApplyFilters = useCallback((newFilters: LeadFilterParams) => {
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
                <LeadsTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {activeTab === 'leads' && (
                        <LeadsHeader
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={handleClearFilters}
                            onAddLead={handleCreateLead}
                        />
                    )}
                    <div className="flex items-center justify-center flex-1 px-3 py-3 overflow-hidden xl:px-8 xl:px-4">
                        <LeadsTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            leadsByStatus={leadsByStatus}
                            onUpdateLeadStatus={handleUpdateLeadStatus}
                            onDeleteLead={handleDeleteLead}
                            onAddLead={handleCreateLead}
                        />
                    </div>
                </div>
            </div>

            {/* Render the CreateLeadModal */}
            <CreateLeadModal
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreateLead={handleSubmitCreateLead}
            />
        </PageTransition>
    );
}
