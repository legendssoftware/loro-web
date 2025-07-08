import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { axiosInstance } from '@/lib/services/api-client';
import toast from 'react-hot-toast';
import { showErrorToast } from '@/lib/utils/toast-config';

// Define Branch interface
export interface Branch {
    uid: number;
    id?: number; // Some components might use id instead of uid
    name: string;
    ref?: string;
}

/**
 * Custom hook to fetch branch data
 * @returns Object containing branches data and loading state
 */
export function useBranchQuery() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Fetch branches from the API
     */
    const fetchBranches = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const accessToken = useAuthStore.getState().accessToken;
            const profileData = useAuthStore.getState().profileData;

            console.log('Fetching branches with:', {
                hasAccessToken: !!accessToken,
                organisationRef: profileData?.organisationRef,
                profileData: profileData
            });

            // Make API call to get branches for the current organization
            const response = await axiosInstance.get('/branch', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    organisationRef: profileData?.organisationRef,
                },
            });

            console.log('Branch API response:', response.data);

            if (response.data && Array.isArray(response.data.branches)) {
                // Normalize branch data to have both uid and id (for compatibility with different components)
                const normalizedBranches = response.data.branches.map((branch: any) => ({
                    ...branch,
                    id: branch.uid, // Add id as alias of uid for components expecting id
                }));

                setBranches(normalizedBranches);
            } else {
                setBranches([]);
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            setError(error as Error);
            showErrorToast('Failed to load branches', toast);
            setBranches([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load branches when hook is initialized
    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    return {
        branches,
        isLoading,
        error,
        refetch: fetchBranches
    };
}
