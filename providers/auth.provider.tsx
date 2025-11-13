'use client';

import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authService, ProfileData } from '@/lib/services/auth-service';
import { AppLoader } from '@/components/loaders/page-loader';
import { useTokenValidation } from '@/hooks/use-token-validation';
import { useRouter, usePathname } from 'next/navigation';

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
        setAuthState,
        signOut
    } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // Use token validation hook to check expiration periodically
    useTokenValidation();

    // On mount, load tokens from store and set them in the auth service
    useEffect(() => {
        if (accessToken && refreshToken) {
            const isValid = authService.validateToken(accessToken);
            
            if (isValid) {
                // Token is valid, set it in auth service
                authService.setTokens(accessToken, refreshToken);
            } else {
                // Token is invalid/expired, try to refresh it
                console.warn('Access token expired, attempting to refresh...');
                authService.refreshAccessToken(refreshToken)
                    .then(tokens => {
                        if (tokens && authService.validateToken(tokens.accessToken)) {
                            // Refresh successful, update state
                            setAuthState({
                                accessToken: tokens.accessToken,
                                refreshToken: tokens.refreshToken,
                                isAuthenticated: true,
                            });
                            authService.setTokens(tokens.accessToken, tokens.refreshToken);
                        } else {
                            // Refresh failed or returned invalid token, sign out
                            console.warn('Token refresh failed or returned invalid token. Signing out.');
                            signOut();
                            
                            // Redirect to sign-in if not on public path
                            const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/new-password', '/verify-email', '/verify-otp', '/'];
                            if (!publicPaths.includes(pathname) && !pathname.startsWith('/api')) {
                                const callbackUrl = encodeURIComponent(window.location.href);
                                router.push(`/sign-in?callbackUrl=${callbackUrl}&token_expired=true`);
                            }
                        }
                    })
                    .catch((error) => {
                        console.error('Token refresh failed:', error);
                        // Refresh failed, clear auth state and redirect
                        signOut();
                        
                        // Redirect to sign-in if not on public path
                        const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/new-password', '/verify-email', '/verify-otp', '/'];
                        if (!publicPaths.includes(pathname) && !pathname.startsWith('/api')) {
                            const callbackUrl = encodeURIComponent(window.location.href);
                            router.push(`/sign-in?callbackUrl=${callbackUrl}&token_expired=true`);
                        }
                    });
            }
        } else if (!accessToken && !refreshToken && isAuthenticated) {
            // No tokens but still marked as authenticated - this shouldn't happen, but handle it
            console.warn('No tokens found but user is marked as authenticated. Signing out.');
            signOut();
        }
    }, [accessToken, refreshToken, setAuthState, signOut, router, pathname, isAuthenticated]);

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
