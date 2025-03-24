'use client';

import { ClientCard } from './client-card';
import { Client } from '@/hooks/use-clients-query';
import { memo, useState, useEffect } from 'react';
import { FloatingPagination } from '@/components/ui/floating-pagination';
import { FolderMinus } from 'lucide-react';

interface ClientsGridProps {
    clients: Client[];
    onEditClient?: (client: Client) => void;
    onDeleteClient?: (clientId: number) => void;
    onUpdateClientStatus?: (clientId: number, newStatus: string) => void;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

function ClientsGridComponent({
    clients,
    onEditClient,
    onDeleteClient,
    onUpdateClientStatus,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
}: ClientsGridProps) {
    // Local pagination state if not provided by parent
    const [localCurrentPage, setLocalCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Set to 5 for testing or adjust as needed
    const [paginatedClients, setPaginatedClients] = useState<Client[]>([]);

    // Handle parent-controlled or local pagination
    const isExternalPagination = !!onPageChange;
    const effectiveCurrentPage = isExternalPagination
        ? currentPage
        : localCurrentPage;
    const effectiveTotalPages = isExternalPagination
        ? totalPages
        : Math.max(1, Math.ceil(clients.length / itemsPerPage));

    // Update paginated clients when clients array or page changes
    useEffect(() => {
        if (!isExternalPagination) {
            const startIndex = (localCurrentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            setPaginatedClients(clients.slice(startIndex, endIndex));
        } else {
            setPaginatedClients(clients);
        }
    }, [clients, localCurrentPage, itemsPerPage, isExternalPagination]);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (isExternalPagination && onPageChange) {
            onPageChange(page);
        } else {
            setLocalCurrentPage(page);
        }
    };

    // Only show clients if we have some
    const displayedClients = isExternalPagination ? clients : paginatedClients;

    return (
        <div className="relative flex-1 w-full overflow-hidden">
            <div className="grid grid-cols-1 gap-2 px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {displayedClients.map((client, index) => (
                    <ClientCard
                        key={client.uid}
                        client={client}
                        onEdit={onEditClient}
                        onDelete={onDeleteClient}
                        onUpdateStatus={onUpdateClientStatus}
                        index={index}
                    />
                ))}
                {displayedClients.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-screen text-sm font-normal uppercase rounded-md col-span-full border-border text-muted-foreground font-body animate-fade-in">
                        <FolderMinus size={50} strokeWidth={1.2} />
                        <span className="text-xs uppercase text-muted-foreground font-body">
                            No clients found
                        </span>
                    </div>
                )}
            </div>

            {/* Always show pagination regardless of number of items */}
            <FloatingPagination
                currentPage={effectiveCurrentPage}
                totalPages={effectiveTotalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export const ClientsGrid = memo(ClientsGridComponent);
