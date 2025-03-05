import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    authService,
    ProfileData,
    SignInCredentials,
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

            signIn: async credentials => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await authService.signIn(credentials);

                    set({
                        isAuthenticated: true,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        profileData: response.profileData,
                        isLoading: false,
                    });

                    return response;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';

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

            setAuthState: state => {
                set(currentState => {
                    // If we're setting a new access token, update the auth service
                    if (
                        state.accessToken &&
                        state.refreshToken &&
                        (state.accessToken !== currentState.accessToken ||
                            state.refreshToken !== currentState.refreshToken)
                    ) {
                        authService.setTokens(state.accessToken, state.refreshToken);
                    }

                    return { ...currentState, ...state };
                });
            },

            clearAuthError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => sessionStorage),
            partialize: state => ({
                isAuthenticated: state.isAuthenticated,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                profileData: state.profileData,
            }),
            onRehydrateStorage: () => state => {
                // After rehydration, validate token and setup auth service
                if (state?.accessToken && state?.refreshToken) {
                    if (authService.validateToken(state.accessToken)) {
                        authService.setTokens(state.accessToken, state.refreshToken);
                    } else {
                        // Token is invalid, try to refresh or sign out
                        state.signOut();
                    }
                }
            },
        },
    ),
);

// Selectors for specific parts of the auth state
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;
export const selectProfileData = (state: AuthState) => state.profileData;
export const selectUserRole = (state: AuthState) => state.profileData?.accessLevel;
