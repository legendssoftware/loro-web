import axios from 'axios';

// Get base URL from environment variables or default to localhost
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 50000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Define public endpoints that don't need authentication
        const publicEndpoints = ['/feedback/validate-token', '/feedback'];

        // Skip token for public endpoints
        const isPublicEndpoint = publicEndpoints.some((endpoint) =>
            config.url?.includes(endpoint),
        );

        if (isPublicEndpoint) {
            return config;
        }

        // Get token from sessionStorage in client-side only
        if (typeof window !== 'undefined') {
            let accessToken = null;

            // Try to get token from auth-storage first (newer implementation)
            try {
                const authData = sessionStorage.getItem('auth-storage');
                if (authData) {
                    const parsedData = JSON.parse(authData);
                    accessToken = parsedData?.state?.accessToken;
                }
            } catch (error) {
                console.error('Error accessing auth storage:', error);
            }

            // If not found, try the older session-storage
            if (!accessToken) {
                try {
                    const sessionData =
                        sessionStorage.getItem('session-storage');
                    if (sessionData) {
                        const parsedData = JSON.parse(sessionData);
                        accessToken = parsedData?.state?.accessToken;
                    }
                } catch (error) {
                    console.error('Error accessing session storage:', error);
                }
            }

            if (accessToken) {
                // Set both header formats to ensure compatibility
                config.headers.token = accessToken; // Primary format expected by server
                config.headers.Authorization = `Bearer ${accessToken}`; // Fallback format
            } else {
                console.warn('No access token found in session storage');
            }
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const isAuthError = error.response?.status === 401;
        const isTokenError =
            error.response?.data?.message === 'No token provided' ||
            error.response?.data?.message === 'Invalid token' ||
            error.response?.data?.message === 'Token expired';

        // Handle auth errors with token refresh if not already trying to refresh
        if ((isAuthError || isTokenError) && !originalRequest._retry) {
            originalRequest._retry = true;
            console.warn(
                'Authentication error detected:',
                error.response?.data?.message,
            );

            try {
                // Get token from sessionStorage in client-side only
                if (typeof window !== 'undefined') {
                    let refreshToken = null;
                    let authStorageData = null;
                    let sessionStorageData = null;

                    // Try to get refresh token from auth-storage first (newer implementation)
                    try {
                        const authData = sessionStorage.getItem('auth-storage');
                        if (authData) {
                            authStorageData = JSON.parse(authData);
                            refreshToken = authStorageData?.state?.refreshToken;
                        }
                    } catch (authError) {
                        console.error(
                            'Error accessing auth storage:',
                            authError,
                        );
                    }

                    // If not found, try the older session-storage
                    if (!refreshToken) {
                        try {
                            const sessionData =
                                sessionStorage.getItem('session-storage');
                            if (sessionData) {
                                sessionStorageData = JSON.parse(sessionData);
                                refreshToken =
                                    sessionStorageData?.state?.refreshToken;
                            }
                        } catch (sessionError) {
                            console.error(
                                'Error accessing session storage:',
                                sessionError,
                            );
                        }
                    }

                    if (refreshToken) {
                        console.log('Attempting to refresh token...');
                        // Call token refresh endpoint
                        const response = await axios.post(
                            `${API_BASE_URL}/auth/refresh`,
                            {
                                refreshToken,
                            },
                        );

                        if (!response.data.accessToken) {
                            throw new Error(
                                'No access token returned from refresh endpoint',
                            );
                        }

                        const { accessToken } = response.data;
                        console.log('Token refreshed successfully');

                        // Update token in auth storage if it exists
                        if (authStorageData) {
                            try {
                                authStorageData.state.accessToken = accessToken;
                                sessionStorage.setItem(
                                    'auth-storage',
                                    JSON.stringify(authStorageData),
                                );
                            } catch (storageError) {
                                console.error(
                                    'Error updating auth storage:',
                                    storageError,
                                );
                            }
                        }

                        // Update token in session storage if it exists
                        if (sessionStorageData) {
                            try {
                                sessionStorageData.state.accessToken =
                                    accessToken;
                                sessionStorage.setItem(
                                    'session-storage',
                                    JSON.stringify(sessionStorageData),
                                );
                            } catch (storageError) {
                                console.error(
                                    'Error updating session storage:',
                                    storageError,
                                );
                            }
                        }

                        // Update the headers for the original request
                        originalRequest.headers.token = accessToken;
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                        // Retry the original request
                        return axiosInstance(originalRequest);
                    } else {
                        console.error(
                            'No refresh token available, cannot refresh session',
                        );
                        // Redirect to login page after a small delay
                        setTimeout(() => {
                            window.location.href =
                                '/sign-in?reason=token_expired';
                        }, 1000);
                    }
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);

                // Clear tokens on refresh failure
                if (typeof window !== 'undefined') {
                    // Remove storage items before redirect
                    try {
                        sessionStorage.removeItem('auth-storage');
                        sessionStorage.removeItem('session-storage');
                    } catch (clearError) {
                        console.error('Error clearing storage:', clearError);
                    }

                    // Redirect to login page
                    window.location.href = '/sign-in?reason=refresh_failed';
                }
            }
        }

        return Promise.reject(error);
    },
);

// Utility function to check authentication status - helpful for debugging
export const checkAuthStatus = () => {
    if (typeof window !== 'undefined') {
        let authData = null;
        let sessionData = null;
        let authToken = null;
        let refreshToken = null;

        try {
            const authStorage = sessionStorage.getItem('auth-storage');
            if (authStorage) {
                authData = JSON.parse(authStorage);
                authToken = authData?.state?.accessToken;
                refreshToken = authData?.state?.refreshToken;
            } else {
                console.log('No auth-storage found');
            }
        } catch (error) {
            console.error('Error checking auth-storage:', error);
        }

        try {
            const sessionStorage2 = sessionStorage.getItem('session-storage');
            if (sessionStorage2) {
                sessionData = JSON.parse(sessionStorage2);
                const sessionToken = sessionData?.state?.accessToken;
                const sessionRefresh = sessionData?.state?.refreshToken;
                console.log('Session storage found:', {
                    isAuthenticated: sessionData?.state?.isAuthenticated,
                    hasAccessToken: !!sessionToken,
                    hasRefreshToken: !!sessionRefresh,
                });
            } else {
                console.log('No session-storage found');
            }
        } catch (error) {
            console.error('Error checking session-storage:', error);
        }

        return {
            isAuthenticated: !!(authToken || sessionData?.state?.accessToken),
            authToken,
            refreshToken,
        };
    }
    return { isAuthenticated: false, authToken: null, refreshToken: null };
};

// Export the API_BASE_URL for use in other modules
export { API_BASE_URL };
