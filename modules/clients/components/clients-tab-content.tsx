'use client';

import { memo } from 'react';
import { ClientsGrid } from './clients-grid';
import { Loader2 } from 'lucide-react';
import {
    Client,
    ClientsByStatus,
} from '@/hooks/use-clients-query';

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
                <p className="text-lg font-thin uppercase font-body">
                    Client Reports
                </p>
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Client reports functionality activating soon
                </p>
            </div>
        </div>
    );
});

ReportsContent.displayName = 'ReportsContent';

// Analytics tab content
const AnalyticsContent = memo(() => {
    return (
        <div className="w-full h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-lg font-thin uppercase font-body">
                    Client Analytics
                </p>
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    Client analytics functionality activating soon
                </p>
            </div>
        </div>
    );
});

AnalyticsContent.displayName = 'AnalyticsContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-xs font-thin uppercase font-body">
                Loading clients...
            </span>
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(({ message }: { message: string }) => {
    return (
        <div className="py-12 text-center">
            <p className="text-xs font-normal uppercase text-destructive font-body">
                {message || 'Failed to load clients. Please try again.'}
            </p>
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
        return <ErrorContent message={`Error loading clients: ${error.message}`} />;
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
        case 'analytics':
            return <AnalyticsContent />;
        default:
            return (
                <div className="flex items-center justify-center w-full h-full">
                    <span className="text-xs font-thin uppercase font-body">
                        Unknown Tab
                    </span>
                </div>
            );
    }
}

export const ClientsTabContent = memo(ClientsTabContentComponent);
