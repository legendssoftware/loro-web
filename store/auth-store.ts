import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    authService,
    ProfileData,
    SignInCredentials,
    ClientSignInCredentials,
    AuthResponse,
} from '@/lib/services/auth-service';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    profileData: ProfileData | null;
}

interface AuthActions {
    signIn: (credentials: SignInCredentials) => Promise<AuthResponse>;
    clientSignIn: (credentials: ClientSignInCredentials) => Promise<AuthResponse>;
    signOut: () => void;
    setAuthState: (state: Partial<AuthState>) => void;
    clearAuthError: () => void;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    accessToken: null,
    refreshToken: null,
    profileData: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            signIn: async (credentials) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.signIn(credentials);

                    // If we received a response with a message but no tokens, it's an error
                    if (
                        response.message &&
                        !response.accessToken &&
                        !response.refreshToken
                    ) {
                        set({
                            isLoading: false,
                            error: response.message,
                        });
                        throw new Error(response.message);
                    }

                    set({
                        isAuthenticated: true,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        profileData: response.profileData,
                        isLoading: false,
                    });

                    return response;
                } catch (error) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : 'Failed to sign in';

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });

                    throw error;
                }
            },

            clientSignIn: async (credentials) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.clientSignIn(credentials);

                    // If we received a response with a message but no tokens, it's an error
                    if (
                        response.message &&
                        !response.accessToken &&
                        !response.refreshToken
                    ) {
                        set({
                            isLoading: false,
                            error: response.message,
                        });
                        throw new Error(response.message);
                    }

                    // For client authentication, ensure the profile data has the correct accessLevel
                    if (response.profileData && !response.profileData.accessLevel) {
                        try {
                            // Extract role from JWT token
                            const token = response.accessToken;
                            const base64Url = token.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(
                                atob(base64)
                                    .split('')
                                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                                    .join('')
                            );
                            const payload = JSON.parse(jsonPayload);

                            // Add accessLevel to profileData
                            response.profileData.accessLevel = payload.role;
                        } catch (e) {
                            console.error("Failed to extract role from token:", e);
                        }
                    }

                    set({
                        isAuthenticated: true,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        profileData: response.profileData,
                        isLoading: false,
                    });

                    return response;
                } catch (error) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : 'Failed to sign in';

                    set({
                        isLoading: false,
                        error: errorMessage,
                    });

                    throw error;
                }
            },

            signOut: () => {
                // Call the auth service to clear tokens and cookies
                authService.signOut();

                // Clear session storage completely for a clean state
                window.sessionStorage.removeItem('auth-storage');

                // Also remove any older storage keys that might exist
                window.sessionStorage.removeItem('session-storage');

                // Reset the store state
                set(initialState);
            },

            setAuthState: (state) => {
                set((currentState) => {
                    // If we're setting a new access token, update the auth service
                    if (
                        state.accessToken &&
                        state.refreshToken &&
                        (state.accessToken !== currentState.accessToken ||
                            state.refreshToken !== currentState.refreshToken)
                    ) {
                        authService.setTokens(
                            state.accessToken,
                            state.refreshToken,
                        );
                    }

                    return { ...currentState, ...state };
                });
            },

            clearAuthError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                profileData: state.profileData,
            }),
            onRehydrateStorage: () => (state) => {
                // After rehydration, validate token and setup auth service
                if (!state) return; // Early return if state is undefined

                // Helper function to handle sign out and redirect
                const handleSignOut = (currentState: typeof state) => {
                    // Clear auth state
                    currentState.setAuthState(initialState);
                    // Also clear the authService tokens
                    authService.clearTokens();
                    // Clear the sessionStorage explicitly
                    if (typeof window !== 'undefined') {
                        window.sessionStorage.removeItem('auth-storage');
                        
                        // Schedule redirect to sign-in page after rehydration completes
                        // Use setTimeout to ensure this happens after React hydration
                        setTimeout(() => {
                            // Only redirect if we're not already on a public/auth page
                            const currentPath = window.location.pathname;
                            const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/new-password', '/verify-email', '/verify-otp', '/'];
                            
                            if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/api')) {
                                // Redirect to sign-in with callback URL
                                const callbackUrl = encodeURIComponent(window.location.href);
                                window.location.href = `/sign-in?callbackUrl=${callbackUrl}&token_expired=true`;
                            }
                        }, 100);
                    }
                };

                if (state.accessToken && state.refreshToken) {
                    // Set tokens in auth service immediately
                    authService.setTokens(
                        state.accessToken,
                        state.refreshToken,
                    );

                    // Validate the rehydrated access token
                    const isValid = authService.validateToken(state.accessToken);

                    if (isValid) {
                        // Token is valid, ensure auth state is correct
                        state.setAuthState({
                            isAuthenticated: true,
                            isLoading: false, // Ensure loading is false
                        });
                    } else {
                        // Token is invalid/expired on rehydration, attempt to refresh before signing out
                        console.warn('AuthStore: Token expired or invalid on rehydration. Attempting to refresh...');
                        
                        // Attempt to refresh the token using refreshToken
                        authService.refreshAccessToken(state.refreshToken)
                            .then((tokens) => {
                                if (tokens && authService.validateToken(tokens.accessToken)) {
                                    // Refresh successful, update state with new tokens
                                    console.log('AuthStore: Token refreshed successfully on rehydration');
                                    state.setAuthState({
                                        accessToken: tokens.accessToken,
                                        refreshToken: tokens.refreshToken,
                                        isAuthenticated: true,
                                        isLoading: false,
                                    });
                                    authService.setTokens(tokens.accessToken, tokens.refreshToken);
                                } else {
                                    // Refresh failed or returned invalid token, sign out
                                    console.warn('AuthStore: Token refresh failed on rehydration. Signing out and redirecting to sign-in.');
                                    handleSignOut(state);
                                }
                            })
                            .catch((error) => {
                                // Refresh failed, sign out
                                console.error('AuthStore: Token refresh error on rehydration:', error);
                                handleSignOut(state);
                            });
                    }
                } else {
                    // No tokens found, ensure clean initial state
                    state.setAuthState(initialState);
                }
            },
        },
    ),
);

// Selectors for specific parts of the auth state
export const selectIsAuthenticated = (state: AuthState) =>
    state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;
export const selectProfileData = (state: AuthState) => state.profileData;
export const selectUserRole = (state: AuthState) =>
    state.profileData?.accessLevel;
