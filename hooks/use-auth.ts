import { useQuery } from '@tanstack/react-query';
import { User } from '@/lib/types/user';

interface UseAuthResult {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
}

export function useAuth(): UseAuthResult {
    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch('/api/auth/user');
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            return response.json();
        },
    });

    return {
        user: user || null,
        isLoading,
        error: error as Error | null,
    };
}
