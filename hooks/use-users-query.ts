import { useState, useEffect, useCallback } from 'react';

interface User {
    uid: number;
    name: string;
    surname: string;
    email: string;
    photoURL?: string;
    accessLevel?: string;
    status?: string;
}

interface UsersQueryResult {
    users: User[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UsersQueryOptions {
    limit?: number;
    page?: number;
    status?: string;
    accessLevel?: string;
    search?: string;
    branchId?: number;
    organisationId?: number;
}

/**
 * Hook for fetching users from the API
 * @param options Query options for filtering users
 * @returns Users data, loading state, error state, and refetch function
 */
export function useUsersQuery(options: UsersQueryOptions = {}): UsersQueryResult {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const buildQueryString = useCallback(() => {
        const params = new URLSearchParams();

        if (options.limit) params.append('limit', options.limit.toString());
        if (options.page) params.append('page', options.page.toString());
        if (options.status) params.append('status', options.status);
        if (options.accessLevel) params.append('accessLevel', options.accessLevel);
        if (options.search) params.append('search', options.search);
        if (options.branchId) params.append('branchId', options.branchId.toString());
        if (options.organisationId) params.append('organisationId', options.organisationId.toString());

        const queryString = params.toString();
        return queryString ? `?${queryString}` : '';
    }, [options]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const queryString = buildQueryString();
            const response = await fetch(`/api/user${queryString}`);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [buildQueryString]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, loading, error, refetch: fetchUsers };
}
