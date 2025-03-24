'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useClientsQuery, ClientFilterParams, Client } from '@/hooks/use-clients-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ClientsTabGroup } from '@/modules/clients/components/clients-tab-group';
import { ClientsHeader } from '@/modules/clients/components/clients-header';
import { ClientFormValues } from '@/modules/clients/components/client-form';
import { toast } from 'react-hot-toast';
import { AppLoader } from '@/components/ui/app-loader';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

// Dynamic imports for components that don't need to be loaded immediately
const ClientsTabContent = dynamic(
    () =>
        import('@/modules/clients/components/clients-tab-content').then(
            (mod) => ({ default: mod.ClientsTabContent }),
        ),
    {
        loading: () => (
            <div className="flex items-center justify-center w-full h-full">
                <AppLoader />
            </div>
        ),
    },
);

// Dynamically import UI components
const Dialog = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({ default: mod.Dialog })),
);
const DialogContent = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogContent,
    })),
);
const DialogHeader = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogHeader,
    })),
);
const DialogTitle = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogTitle,
    })),
);

// Dynamically import ClientForm
const ClientForm = dynamic(
    () =>
        import('@/modules/clients/components/client-form').then((mod) => ({
            default: mod.ClientForm,
        })),
    { ssr: false },
);

// Tab configuration
const tabs = [{ id: 'clients', label: 'CLIENTS' }];

// Create Client Modal Component
function CreateClientModal({
    isOpen,
    onClose,
    onCreateClient,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateClient?: (clientData: ClientFormValues) => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (data: ClientFormValues) => {
        setIsSubmitting(true);
        try {
            await onCreateClient?.(data);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl md:max-w-6xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-thin uppercase font-body">
                        Create New Client
                    </DialogTitle>
                </DialogHeader>
                <div className="px-1 py-4">
                    {/* Import and use our ClientForm component */}
                    {isOpen && (
                        <ClientForm
                            onSubmit={handleSubmit}
                            isLoading={isSubmitting}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function ClientsPage() {
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
    const [activeTab, setActiveTab] = useState<string>('clients');
    const [filterParams, setFilterParams] = useState<ClientFilterParams>({
        page: 1,
        limit: 20,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const {
        clients,
        clientsByStatus,
        loading: isLoading,
        error,
        refetch,
        createClient,
        updateClient,
        deleteClient,
        updateClientStatus,
        pagination,
    } = useClientsQuery(isAuthenticated ? currentFilters : {});

    // Refetch data when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    // Handlers
    const handleCreateClient = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleSubmitCreateClient = useCallback(
        async (clientData: ClientFormValues) => {
            try {
                const result = await createClient(clientData);
                
                // Toast messages are now handled in the createClient function in the useClientsQuery hook
                
                // Invalidate clients query to ensure UI is updated with the new client
                refetch();
                
                setIsCreateDialogOpen(false);
            } catch (error) {
                console.error('Error creating client:', error);
                // Error toast is already shown in the mutation
            }
        },
        [createClient, refetch],
    );

    const handleUpdateClientStatus = useCallback(
        async (clientId: number, newStatus: string) => {
            try {
                await updateClientStatus(clientId, newStatus);
                
                // Toast messages are now handled in the updateClientStatus function in the useClientsQuery hook
                
                // Explicitly refetch to ensure UI is updated
                refetch();
            } catch (error) {
                console.error('Error updating client status:', error);
                // Error toast is already shown in the mutation
            }
        },
        [updateClientStatus, refetch],
    );

    const handleDeleteClient = useCallback(
        async (clientId: number) => {
            try {
                await deleteClient(clientId);
                
                // Toast messages are now handled in the deleteClient function in the useClientsQuery hook
                
                // Explicitly refetch to ensure UI is updated
                refetch();
            } catch (error) {
                console.error('Error deleting client:', error);
                // Error toast is already shown in the mutation
            }
        },
        [deleteClient, refetch],
    );

    // Add handler for editing a client (navigating to detail page)
    const handleEditClient = useCallback(
        (client: Client) => {
            router.push(`/clients/${client.uid}`);
        },
        [router]
    );

    // Apply filters handler
    const handleApplyFilters = useCallback((newFilters: ClientFilterParams) => {
        setFilterParams((prev) => ({
            ...prev,
            ...newFilters,
            limit: 20,
        }));
    }, []);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
        setFilterParams({
            page: 1,
            limit: 20,
        });
    }, []);

    // Page change handler
    const handlePageChange = useCallback((page: number) => {
        setFilterParams((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col w-full h-screen gap-2 overflow-hidden bg-background">
                <div className="w-full">
                    <ClientsTabGroup
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
                <div className="flex flex-col flex-1 w-full overflow-hidden">
                    <div className="py-2">
                        <ClientsHeader
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={handleClearFilters}
                            onAddClient={handleCreateClient}
                        />
                    </div>
                    <div className="flex-1 w-full overflow-hidden">
                        <ClientsTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error as Error | null}
                            clients={filterParams.status ? clients : []}
                            clientsByStatus={clientsByStatus}
                            onAddClient={handleCreateClient}
                            onEditClient={handleEditClient}
                            onDeleteClient={handleDeleteClient}
                            onUpdateClientStatus={handleUpdateClientStatus}
                            pagination={{
                                currentPage: Math.max(1, pagination?.page || 1),
                                totalPages: Math.max(
                                    1,
                                    pagination?.totalPages || 1,
                                ),
                                onPageChange: handlePageChange,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Render the CreateClientModal */}
            <CreateClientModal
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreateClient={handleSubmitCreateClient}
            />
        </PageTransition>
    );
}
