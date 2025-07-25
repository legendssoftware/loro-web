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
                        // Token is invalid on rehydration, sign out immediately
                        console.warn('AuthStore: Invalid token on rehydration. Signing out.');
                        // Need to call signOut via the store's own action for proper state reset
                        // Directly calling state.signOut() might cause issues if called during rehydration
                        // Instead, we set initial state and rely on other mechanisms (middleware/interceptors) to handle it.
                        // Or better: Schedule the signOut after rehydration completes.
                        // However, the middleware redirect should handle this case anyway.
                        // For simplicity, let's just clear the store state here directly.
                        state.setAuthState(initialState);
                        // Also clear the authService tokens
                        authService.clearTokens();
                        // Clear the sessionStorage explicitly again just in case
                        window.sessionStorage.removeItem('auth-storage');
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
