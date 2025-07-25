import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

// Create axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface LicenseInfo {
    licenseId: string;
    plan: string;
    status: string;
    features: string[];
}

export interface ProfileData {
    uid: string;
    accessLevel: string;
    name: string;
    organisationRef?: string;
    licenseInfo?: LicenseInfo;
    email: string;
    username: string;
    surname: string;
    phone: string;
    photoURL: string;
    userref: string;
}

interface User {
    uid: number;
    email: string;
    name: string;
    surname: string;
    role: string;
    photoURL?: string;
}

interface SessionState {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    profileData: ProfileData | null;
    loading: boolean;
    error: string | null;
    user: User | null;
}

interface SessionActions {
    signIn: (credentials: { username: string; password: string }) => Promise<void>;
    signOut: () => void;
    setSession: (session: Partial<SessionState>) => void;
    clearSession: () => void;
    setAccessToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
}

const initialState: SessionState = {
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    profileData: null,
    loading: false,
    error: null,
    user: null,
};

// API functions
const authAPI = {
    signIn: async (credentials: { username: string; password: string }) => {
        const { data } = await api.post('/auth/sign-in', credentials);
        return data;
    },
};

// Create the store
export const useSessionStore = create<SessionState & SessionActions>()(
    persist(
        set => ({
            ...initialState,

            signIn: async credentials => {
                try {
                    set({ loading: true, error: null });

                    const response = await authAPI.signIn(credentials);

                    if (response.profileData && response.accessToken && response.refreshToken) {
                        // Update axios default headers with the new token
                        api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;

                        set({
                            isAuthenticated: true,
                            accessToken: response.accessToken,
                            refreshToken: response.refreshToken,
                            profileData: response.profileData,
                            loading: false,
                            user: response.user,
                        });
                    } else {
                        throw new Error('Invalid response from server');
                    }
                } catch (error) {
                    const errorMessage = axios.isAxiosError(error)
                        ? error.response?.data?.message || error.message
                        : 'An error occurred';

                    set({
                        loading: false,
                        error: errorMessage,
                    });
                    throw error;
                }
            },

            signOut: () => {
                // Remove token from axios headers
                delete api.defaults.headers.common['Authorization'];
                set(initialState);
            },

            setSession: session => {
                set(state => {
                    // If we're setting a new access token, update axios headers
                    if (session.accessToken) {
                        api.defaults.headers.common['Authorization'] = `Bearer ${session.accessToken}`;
                    }
                    return { ...state, ...session };
                });
            },

            clearSession: () => {
                // Remove token from axios headers
                delete api.defaults.headers.common['Authorization'];
                set(initialState);
            },

            setAccessToken: token => set({ accessToken: token }),

            setUser: user => set({ user }),
        }),
        {
            name: 'session-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: state => ({
                isAuthenticated: state.isAuthenticated,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                profileData: state.profileData,
                user: state.user,
            }),
        },
    ),
);

interface SignInResponse {
    message: string;
    profileData: ProfileData;
    accessToken: string;
    refreshToken: string;
}

// Custom hook for sign-in mutation
export const useSignInMutation = () => {
    return useMutation<SignInResponse, Error, { username: string; password: string }>({
        mutationFn: async credentials => {
            const response = await authAPI.signIn(credentials);
            if (response.profileData && response.accessToken && response.refreshToken) {
                // Update axios default headers with the new token
                api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;

                const store = useSessionStore.getState();
                store.setSession({
                    isAuthenticated: true,
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken,
                    profileData: response.profileData,
                    user: response.user,
                });
            }
            return response;
        },
    });
};

// Axios interceptor for token refresh
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const store = useSessionStore.getState();
            const refreshToken = store.refreshToken;

            if (refreshToken) {
                try {
                    // Attempt to refresh token
                    const { data } = await api.post('/auth/refresh', {
                        refreshToken,
                    });

                    // Update session with new tokens
                    store.setSession({
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken,
                    });

                    // Retry original request with new token
                    originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // If refresh fails, sign out
                    store.signOut();
                    throw refreshError;
                }
            }
        }

        return Promise.reject(error);
    },
);
