'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { useParams, useRouter } from 'next/navigation';
import { useClientQuery } from '@/hooks/use-client-query';
import { AppLoader } from '@/components/ui/app-loader';
import { FolderMinus } from 'lucide-react';
import { ClientDetail } from '@/modules/clients/components/client-detail';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.uid ? String(params.uid) : '';
    const {
        client,
        loading,
        error,
        updateClient,
        deleteClient,
        updateClientStatus
    } = useClientQuery(clientId);

    const handleClose = () => {
        router.push('/clients');
    };

    // Handle navigation to quotations page
    const handleViewQuotation = (quotationId: number) => {
        router.push(`/quotations?id=${quotationId}`);
    };

    // Handle client status update
    const handleUpdateStatus = (clientId: number, newStatus: string) => {
        updateClientStatus(newStatus);
    };

    // Handle client deletion
    const handleDelete = (clientId: number) => {
        deleteClient();
        // Navigate back to clients list after deletion
        router.push('/clients');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <AppLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <FolderMinus size={50} strokeWidth={1.5} />
                <p className="text-xs font-normal uppercase">
                    Please try again
                </p>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="flex items-center justify-center h-screen">
                <FolderMinus size={50} strokeWidth={1.5} />
                <p className="text-xs font-normal uppercase">
                    Client not found
                </p>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div className="flex flex-col items-center justify-center h-screen gap-3 p-4">
                    <ClientDetail
                        client={client}
                        isOpen={true}
                        onClose={handleClose}
                        onViewQuotation={handleViewQuotation}
                        onUpdateStatus={handleUpdateStatus}
                        onDelete={handleDelete}
                    />
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
