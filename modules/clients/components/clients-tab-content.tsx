'use client';

import { memo } from 'react';
import { ClientsGrid } from './clients-grid';
import { Client, ClientsByStatus } from '@/hooks/use-clients-query';
import { AppHoneycombLoader } from '@/components/loaders/honeycomb-loader';
import { FolderMinus } from 'lucide-react';

interface ClientsTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    clients: Client[];
    clientsByStatus?: ClientsByStatus;
    onUpdateClientStatus?: (clientId: number, newStatus: string) => void;
    onDeleteClient?: (clientId: number) => void;
    onEditClient?: (client: Client) => void;
    onAddClient?: () => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
}

// Main Clients tab content component
const ClientsContent = memo(
    ({
        clients,
        onEditClient,
        onDeleteClient,
        onUpdateClientStatus,
        pagination,
    }: {
        clients: Client[];
        onEditClient?: (client: Client) => void;
        onDeleteClient?: (clientId: number) => void;
        onUpdateClientStatus?: (clientId: number, newStatus: string) => void;
        pagination?: {
            currentPage: number;
            totalPages: number;
            onPageChange: (page: number) => void;
        };
    }) => {
        return (
            <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex-1 w-full overflow-hidden">
                    <ClientsGrid
                        clients={clients}
                        onEditClient={onEditClient}
                        onDeleteClient={onDeleteClient}
                        onUpdateClientStatus={onUpdateClientStatus}
                        currentPage={pagination?.currentPage}
                        totalPages={pagination?.totalPages}
                        onPageChange={pagination?.onPageChange}
                    />
                </div>
            </div>
        );
    },
);

ClientsContent.displayName = 'ClientsContent';

// Reports tab content
const ReportsContent = memo(() => {
    return (
        <div className="h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Activating soon
                </p>
            </div>
        </div>
    );
});

ReportsContent.displayName = 'ReportsContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <AppHoneycombLoader size="sm" />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(({ message }: { message: string }) => {
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
});

ErrorContent.displayName = 'ErrorContent';

// Main component that switches between tab contents
function ClientsTabContentComponent({
    activeTab,
    isLoading,
    error,
    clients,
    clientsByStatus,
    onUpdateClientStatus,
    onDeleteClient,
    onEditClient,
    onAddClient,
    pagination,
}: ClientsTabContentProps) {
    if (isLoading) {
        return <LoadingContent />;
    }

    if (error) {
        return (
            <ErrorContent message={`Error loading clients: ${error.message}`} />
        );
    }

    // Get all clients from different statuses if clientsByStatus is provided
    const allClients = clientsByStatus
        ? Object.values(clientsByStatus).flat()
        : clients;

    switch (activeTab) {
        case 'clients':
            return (
                <ClientsContent
                    clients={allClients}
                    onEditClient={onEditClient}
                    onDeleteClient={onDeleteClient}
                    onUpdateClientStatus={onUpdateClientStatus}
                    pagination={pagination}
                />
            );
        case 'reports':
            return <ReportsContent />;
        default:
            return null;
    }
}

export const ClientsTabContent = memo(ClientsTabContentComponent);
