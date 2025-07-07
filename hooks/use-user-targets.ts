import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';

export interface UserTarget {
    id: number;
    targetSalesAmount?: number;
    currentSalesAmount?: number;
    targetQuotationsAmount?: number;
    currentQuotationsAmount?: number;

    currentOrdersAmount?: number;
    targetCurrency?: string;
    targetHoursWorked?: number;
    currentHoursWorked?: number;
    targetNewClients?: number;
    currentNewClients?: number;
    targetNewLeads?: number;
    currentNewLeads?: number;
    targetCheckIns?: number;
    currentCheckIns?: number;
    targetCalls?: number;
    currentCalls?: number;
    targetPeriod?: string;
    periodStartDate?: string;
    periodEndDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface UserTargetResponse {
    message: string;
    userTarget: UserTarget;
}

/**
 * Hook for fetching user targets data from the web dashboard
 * Mirrors the mobile useUserTargets hook functionality
 */
export const useUserTargets = (userId?: number) => {
    const { profileData, accessToken } = useAuthStore();
    const targetUserId = userId || profileData?.uid;

    const fetchUserTargets = async (): Promise<UserTarget | null> => {
        if (!targetUserId || !accessToken) {
            throw new Error('User ID or access token not available.');
        }

        const response = await axiosInstance.get<UserTargetResponse>(
            `/user/${targetUserId}/target`
        );

        if (response.data && response.data.userTarget) {
            return response.data.userTarget;
        }

        return null;
    };

    const { data, isLoading, error, refetch, isError } = useQuery<UserTarget | null, Error>({
        queryKey: ['userTarget', targetUserId],
        queryFn: fetchUserTargets,
        enabled: !!targetUserId && !!accessToken,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        refetchOnWindowFocus: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return {
        data,
        isLoading,
        error: error?.message || null,
        isError,
        refetch,
    };
};