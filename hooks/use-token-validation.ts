'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authService } from '@/lib/services/auth-service';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Hook to validate token expiration and handle automatic sign-out
 * Checks token validity:
 * - On mount
 * - When page becomes visible (user returns to tab)
 * - Periodically (every 5 minutes)
 */
export function useTokenValidation() {
    const accessToken = useAuthStore((state) => state.accessToken);
    const refreshToken = useAuthStore((state) => state.refreshToken);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const signOut = useAuthStore((state) => state.signOut);
    const setAuthState = useAuthStore((state) => state.setAuthState);
    const router = useRouter();
    const pathname = usePathname();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Public paths that don't require authentication
    const publicPaths = ['/sign-in', '/sign-up', '/forgot-password', '/new-password', '/verify-email', '/verify-otp', '/'];

    const validateAndHandleExpiration = useCallback(() => {
        // Skip validation if not authenticated or no tokens
        if (!isAuthenticated || !accessToken) {
            return;
        }

        // Skip validation on public paths
        if (publicPaths.includes(pathname) || pathname.startsWith('/api')) {
            return;
        }

        // Validate token
        const isValid = authService.validateToken(accessToken);

        if (!isValid) {
            console.warn('Token validation failed: Token expired or invalid. Attempting refresh...');

            // Try to refresh token if refresh token is available
            const currentRefreshToken = useAuthStore.getState().refreshToken;
            if (currentRefreshToken) {
                authService.refreshAccessToken(currentRefreshToken)
                    .then((tokens) => {
                        if (tokens && authService.validateToken(tokens.accessToken)) {
                            // Token refreshed successfully
                            useAuthStore.getState().setAuthState({
                                accessToken: tokens.accessToken,
                                refreshToken: tokens.refreshToken,
                                isAuthenticated: true,
                            });
                            authService.setTokens(tokens.accessToken, tokens.refreshToken);
                        } else {
                            // Refresh failed, sign out
                            handleSignOut();
                        }
                    })
                    .catch(() => {
                        // Refresh failed, sign out
                        handleSignOut();
                    });
            } else {
                // No refresh token, sign out immediately
                handleSignOut();
            }
        }
    }, [accessToken, isAuthenticated, pathname]);

    const handleSignOut = useCallback(() => {
        useAuthStore.getState().signOut();

        // Redirect to sign-in page if not already there
        const currentPath = window.location.pathname;
        if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/api')) {
            const callbackUrl = encodeURIComponent(window.location.href);
            router.push(`/sign-in?callbackUrl=${callbackUrl}&token_expired=true`);
        }
    }, [router]);

    useEffect(() => {
        // Skip validation on public paths
        if (publicPaths.includes(pathname) || pathname.startsWith('/api')) {
            return;
        }

        // Validate token on mount
        validateAndHandleExpiration();

        // Set up periodic validation (every 5 minutes)
        intervalRef.current = setInterval(() => {
            validateAndHandleExpiration();
        }, 5 * 60 * 1000); // 5 minutes

        // Validate token when page becomes visible (user returns to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                validateAndHandleExpiration();
            }
        };

        // Validate token when window gains focus
        const handleFocus = () => {
            validateAndHandleExpiration();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [validateAndHandleExpiration, pathname]);

    return null;
}

