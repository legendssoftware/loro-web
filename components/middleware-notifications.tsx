'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth-store';
import { toastConfig } from '@/lib/utils/toast-config';

/**
 * Component that handles middleware notifications and provides user feedback
 * for authentication redirects, session expiry, and access control
 */
export function MiddlewareNotifications() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isAuthenticated, profileData } = useAuthStore();
    const lastRedirectRef = useRef<string | null>(null);

    useEffect(() => {
        // Check if we were redirected by middleware
        const checkMiddlewareRedirect = () => {
            // Check for middleware redirect headers (would be passed via query params or other means)
            const redirectReason = searchParams.get('middleware_redirect');
            const tokenStatus = searchParams.get('token_status');

            if (redirectReason && redirectReason !== lastRedirectRef.current) {
                lastRedirectRef.current = redirectReason;

                switch (redirectReason) {
                    case 'unauthenticated':
                        toast.error('🔐 Please sign in to access this page', {
                            ...toastConfig,
                            icon: '🔐',
                        });
                        break;

                    case 'unauthorized':
                        const deniedFeature = searchParams.get('denied_feature');
                        const message = deniedFeature && deniedFeature !== 'unknown'
                            ? `⚠️ You don't have access to the '${deniedFeature}' feature. Please upgrade your license or contact support.`
                            : "⚠️ You don't have permission to access this page";

                        toast.error(message, {
                            ...toastConfig,
                            duration: 6000,
                            icon: '⚠️',
                        });
                        break;

                    case 'token-expired':
                        toast.error(
                            '⏰ Your session has expired. Please sign in again.',
                            {
                                ...toastConfig,
                                duration: 5000,
                                icon: '⏰',
                            },
                        );
                        break;

                    case 'authenticated-user':
                        // Note: Welcome toasts are handled by the sign-in page to avoid duplicates
                        // This case is just for cleaning up the URL parameters
                        break;
                }

                // Clean up the URL parameters
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.delete('middleware_redirect');
                newUrl.searchParams.delete('token_status');

                // Replace the URL without triggering a navigation
                window.history.replaceState({}, '', newUrl.toString());
            }
        };

        // Check for specific token status indicators
        const checkTokenStatus = () => {
            const tokenStatus = searchParams.get('token_status');
            if (tokenStatus) {
                switch (tokenStatus) {
                    case 'expired':
                        toast.error(
                            '⏰ Your session has expired. Please sign in again.',
                            {
                                ...toastConfig,
                                duration: 5000,
                                icon: '⏰',
                            },
                        );
                        break;

                    case 'invalid':
                        toast.error(
                            '🚫 Invalid session detected. Please sign in again.',
                            {
                                ...toastConfig,
                                icon: '🚫',
                            },
                        );
                        break;

                    case 'refreshed':
                        toast.success('✅ Session refreshed successfully', {
                            ...toastConfig,
                            style: {
                                ...toastConfig.style,
                                background: '#10B981',
                            },
                            duration: 2000,
                            icon: '✅',
                        });
                        break;
                }
            }
        };

        checkMiddlewareRedirect();
        checkTokenStatus();
    }, [pathname, searchParams, profileData]);

    // Handle session timeout warnings
    useEffect(() => {
        if (isAuthenticated) {
            const checkSessionWarning = () => {
                // Check if we're close to session expiry (could be implemented with a token check)
                const token = document.cookie
                    .split(';')
                    .find((row) => row.trim().startsWith('accessToken='));

                if (token) {
                    try {
                        const tokenValue = token.split('=')[1];
                        const decodedToken = JSON.parse(
                            atob(tokenValue.split('.')[1]),
                        );
                        const currentTime = Math.floor(Date.now() / 1000);
                        const timeUntilExpiry = decodedToken.exp - currentTime;

                        // Show warning if less than 5 minutes until expiry
                        if (timeUntilExpiry > 0 && timeUntilExpiry <= 300) {
                            toast(
                                '⚠️ Your session will expire soon. Please save your work.',
                                {
                                    ...toastConfig,
                                    style: {
                                        ...toastConfig.style,
                                        background: '#F59E0B',
                                    },
                                    duration: 8000,
                                    icon: '⚠️',
                                },
                            );
                        }
                    } catch (error) {
                        // Silent fail - token might be malformed
                    }
                }
            };

            const interval = setInterval(checkSessionWarning, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    return null; // This component doesn't render anything
}
