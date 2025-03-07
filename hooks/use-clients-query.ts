import { useState, useEffect, useCallback } from 'react';

interface Client {
    uid: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    contactPerson?: string;
}

interface ClientsQueryResult {
    clients: Client[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface ClientsQueryOptions {
    limit?: number;
    page?: number;
    search?: string;
    branchId?: number;
    organisationId?: number;
}

/**
 * Hook for fetching clients from the API
 * @param options Query options for filtering clients
 * @returns Clients data, loading state, error state, and refetch function
 */
export function useClientsQuery(options: ClientsQueryOptions = {}): ClientsQueryResult {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const buildQueryString = useCallback(() => {
        const params = new URLSearchParams();

        if (options.limit) params.append('limit', options.limit.toString());
        if (options.page) params.append('page', options.page.toString());
        if (options.search) params.append('search', options.search);
        if (options.branchId) params.append('branchId', options.branchId.toString());
        if (options.organisationId) params.append('organisationId', options.organisationId.toString());

        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }, [options]);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const queryString = buildQueryString();
            const response = await fetch(`/api/clients${queryString}`);

            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }

            const data = await response.json();
            setClients(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load clients');
        } finally {
            setLoading(false);
        }
    }, [buildQueryString]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return { clients, loading, error, refetch: fetchClients };
}
