'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClientQuotationReport } from './client-quotation-report';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ClientReportPage() {
    const params = useParams();
    const [clientId, setClientId] = useState<number | null>(null);

    useEffect(() => {
        if (params.clientId) {
            setClientId(Number(params.clientId));
        }
    }, [params]);

    if (!clientId) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-bold">
                        Client ID is required
                    </h2>
                    <p className="mb-4 text-muted-foreground">
                        Please provide a valid client ID to view the report.
                    </p>
                    <Link href="/dashboard/clients">
                        <Button>Return to Clients</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-6">
            <div className="mb-6">
                <Link href="/dashboard/clients">
                    <Button variant="ghost" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clients
                    </Button>
                </Link>
            </div>

            <ClientQuotationReport clientId={clientId} />
        </div>
    );
}
