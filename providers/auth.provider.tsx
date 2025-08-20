'use client';

import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authService, ProfileData } from '@/lib/services/auth-service';
import { AppLoader } from '@/components/loaders/page-loader';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: ProfileData | null;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const {
        isAuthenticated,
        isLoading,
        profileData: user,
        error,
        accessToken,
        refreshToken,
        setAuthState
    } = useAuthStore();

    // On mount, load tokens from store and set them in the auth service
    useEffect(() => {
        if (accessToken && refreshToken) {
            if (authService.validateToken(accessToken)) {
                authService.setTokens(accessToken, refreshToken);
            } else {
                // Token is invalid, try to refresh it
                authService.refreshAccessToken(refreshToken)
                    .then(tokens => {
                        if (tokens) {
                            setAuthState({
                                accessToken: tokens.accessToken,
                                refreshToken: tokens.refreshToken,
                            });
                        } else {
                            // Refresh failed, clear auth state
                            useAuthStore.getState().signOut();
                        }
                    })
                    .catch((error) => {
                        console.error('Token refresh failed:', error);
                        // Refresh failed, clear auth state
                        useAuthStore.getState().signOut();
                    });
            }
        }
    }, [accessToken, refreshToken, setAuthState]);

    const contextValue = useMemo<AuthContextType>(
        () => ({
            isAuthenticated,
            isLoading,
            user,
            error,
        }),
        [isAuthenticated, isLoading, user, error],
    );

    // Show loading indicator only on initial load
    if (isLoading && !user && !error) {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <AppLoader />
            </div>
        );
    }

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
