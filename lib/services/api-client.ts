import axios from 'axios';

// Get base URL from environment variables or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage in client-side only
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors with token refresh if not already trying to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get token from localStorage in client-side only
                if (typeof window !== 'undefined') {
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (refreshToken) {
                        // Call token refresh endpoint
                        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                            refreshToken,
                        });

                        const { accessToken } = response.data;

                        // Update token in localStorage
                        localStorage.setItem('accessToken', accessToken);

                        // Update the header for the original request
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                        // Retry the original request
                        return axiosInstance(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);

                // Clear tokens on refresh failure
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    // Redirect to login page
                    window.location.href = '/sign-in';
                }
            }
        }

        return Promise.reject(error);
    }
);
