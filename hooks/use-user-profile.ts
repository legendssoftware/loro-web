import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';

export interface ExtendedProfileData {
    uid: number;
    name: string;
    surname: string;
    email: string;
    photoURL?: string;
    username?: string;
    phone?: string;
    accessLevel: string;
    status: string;
    userref: string;
    createdAt: string;
    updatedAt: string;
    // Profile information
    profile?: {
        height?: string;
        weight?: string;
        hairColor?: string;
        eyeColor?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        dateOfBirth?: string;
        address?: string;
        city?: string;
        country?: string;
    };
    // Employment profile
    employmentProfile?: {
        position?: string;
        department?: string;
        hireDate?: string;
    };
    // Organization info (loaded via relations)
    organisation?: {
        uid: number;
        name: string;
        logoURL?: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        industry?: string;
        foundedDate?: string;
        description?: string;
    };
    // Branch info
    branch?: {
        uid: number;
        name: string;
    };
}

interface UserResponse {
    data: ExtendedProfileData;
    message: string;
}

/**
 * Hook for fetching extended user profile data including organization details
 * Uses the /user/:ref endpoint from the server which includes all user data
 */
export const useUserProfile = (userId?: number) => {
    const { profileData, accessToken } = useAuthStore();
    const targetUserId = userId || profileData?.uid;

    const fetchExtendedProfile = async (): Promise<ExtendedProfileData | null> => {
        if (!targetUserId || !accessToken) {
            throw new Error('User ID or access token not available.');
        }

        // Use the correct endpoint that exists on the server
        const response = await axiosInstance.get<UserResponse>(
            `/user/${targetUserId}`
        );

        if (response.data && response.data.data) {
            return response.data.data;
        }

        return null;
    };

    const { data, isLoading, error, refetch, isError } = useQuery<ExtendedProfileData | null, Error>({
        queryKey: ['extendedProfile', targetUserId],
        queryFn: fetchExtendedProfile,
        enabled: !!targetUserId && !!accessToken,
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes (profile data changes less frequently)
        refetchOnWindowFocus: false, // Don't auto-refetch profile on window focus
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Fallback to basic profile data from auth store if extended profile is not available
    const profileData_ = data || profileData;

    return {
        data: profileData_,
        extendedData: data,
        isLoading,
        error: error?.message || null,
        isError,
        refetch,
        hasExtendedData: !!data,
    };
};
