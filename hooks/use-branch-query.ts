import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { axiosInstance } from '@/lib/services/api-client';

// Define Branch interface
export interface Branch {
    uid: number;
    id?: number; // Some components might use id instead of uid
    name: string;
    ref?: string;
}

/**
 * Fetch branches from the API
 */
const fetchBranches = async (): Promise<Branch[]> => {
    const accessToken = useAuthStore.getState().accessToken;
    const profileData = useAuthStore.getState().profileData;

    // Validate required data
    if (!accessToken) {
        throw new Error('No access token available');
    }

    if (!profileData?.organisationRef) {
        throw new Error('No organization reference available');
    }

    // Make API call to get branches for the current organization
    const response = await axiosInstance.get('/branch', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            organisationRef: profileData.organisationRef,
        },
    });

    if (response.data && Array.isArray(response.data.branches)) {
        // Normalize branch data to have both uid and id (for compatibility with different components)
        const normalizedBranches =
            response.data.branches?.map((branch: any) => ({
                ...branch,
                id: branch.uid, // Add id as alias of uid for components expecting id
            })) || [];

        return normalizedBranches;
    } else {
        return [];
    }
};

/**
 * Custom hook to fetch branch data using TanStack Query
 * @returns Object containing branches data and loading state
 */
export function useBranchQuery() {
    const { accessToken, profileData } = useAuthStore();

    const {
        data: branches = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['branches', profileData?.organisationRef],
        queryFn: fetchBranches,
        enabled: !!accessToken && !!profileData?.organisationRef,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return {
        branches,
        isLoading,
        error,
        refetch,
    };
}
