import { useState, useEffect, useCallback } from 'react';
import { checkAuthStatus } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';

/**
 * Hook to check authentication status and provide debugging utilities
 */
export const useAuthStatus = () => {
    const [status, setStatus] = useState({
        isAuthenticated: false,
        authToken: null as string | null,
        refreshToken: null as string | null,
    });

    const {
        isAuthenticated: storeAuthenticated,
        accessToken,
        signOut,
    } = useAuthStore();

    // Check authentication status
    const checkStatus = useCallback(() => {
        const currentStatus = checkAuthStatus();
        setStatus(currentStatus);
        return currentStatus;
    }, []);

    // Force a logout and clear auth data
    const forceLogout = useCallback(() => {
        console.log('Forcing logout and clearing auth data');
        signOut();
        window.location.href = '/sign-in';
    }, [signOut]);

    // Handle authentication errors
    const handleAuthError = useCallback(
        (error: any) => {
            console.error('Authentication error:', error);
            const currentStatus = checkStatus();

            if (!currentStatus.isAuthenticated) {
                console.warn('Not authenticated. Redirecting to login page.');
                setTimeout(() => {
                    window.location.href = '/sign-in';
                }, 1000);
            }

            return currentStatus;
        },
        [checkStatus],
    );

    // Effect to check authentication status on mount
    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    return {
        ...status,
        storeAuthenticated,
        storeToken: accessToken,
        checkStatus,
        forceLogout,
        handleAuthError,
    };
};
