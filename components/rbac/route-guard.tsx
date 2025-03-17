'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessLevel, rolePermissions } from '@/types/auth';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

/**
 * Component that redirects unauthorized users from protected routes
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { hasRole, hasPermission, userRole } = useRBAC();
    const { isAuthenticated, isLoading } = useAuthStore();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // Skip auth check on auth routes
        if (
            pathname === '/sign-in' ||
            pathname === '/sign-up' ||
            pathname === '/forgot-password' ||
            pathname === '/verify-email' ||
            pathname === '/verify-otp' ||
            pathname === '/landing-page' ||
            pathname === '/new-password'
        ) {
            setIsCheckingAuth(false);
            return;
        }

        // Don't perform redirects during initial loading to prevent flash
        if (isLoading) {
            return;
        }

        // Set checking state to false after initial auth check
        setIsCheckingAuth(false);

        // Redirect to sign-in if not authenticated, but don't redirect during refresh
        if (!isAuthenticated) {
            // Store current path in sessionStorage to restore after authentication
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('lastRoute', pathname);
            }

            // Short timeout to allow potential token refresh to complete
            const redirectTimer = setTimeout(() => {
                if (!useAuthStore.getState().isAuthenticated) {
                    router.push('/landing-page');
                }
            }, 200);

            return () => clearTimeout(redirectTimer);
        }

        // Check if the current pathname is accessible for the user's role
        let hasAccess = false;

        // Super users (admin, manager, owner) have access to all routes
        if (
            userRole === AccessLevel.ADMIN ||
            userRole === AccessLevel.MANAGER ||
            userRole === AccessLevel.OWNER
        ) {
            hasAccess = true;
        } else if (userRole) {
            // Check if the route is in the role's permitted routes
            const allowedRoutes =
                rolePermissions[userRole as AccessLevel]?.routes || [];

            // Check for wildcards or exact route matches
            hasAccess =
                allowedRoutes.includes('*') || allowedRoutes.includes(pathname);

            // For dashboard root access
            if (pathname === '/' && allowedRoutes.includes('/dashboard')) {
                hasAccess = true;
            }
        }

        // Redirect to home page if user doesn't have access
        if (!hasAccess && isAuthenticated) {
            toast.error(
                'Access denied. You do not have permission to view this page.',
                {
                    style: {
                        borderRadius: '5px',
                        background: '#333',
                        color: '#fff',
                        fontFamily: 'var(--font-unbounded)',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        fontWeight: '300',
                        padding: '16px',
                    },
                    duration: 5000,
                    position: 'bottom-center',
                    icon: '🔒',
                },
            );

            // Redirect to dashboard
            router.push('/');
        }
    }, [pathname, isAuthenticated, userRole, router, isLoading]);

    // Restore last route on app initialization if authenticated
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            isAuthenticated &&
            !isLoading &&
            pathname === '/'
        ) {
            const lastRoute = sessionStorage.getItem('lastRoute');
            if (lastRoute && lastRoute !== '/') {
                router.push(lastRoute);
                sessionStorage.removeItem('lastRoute');
            }
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show children without waiting for auth checks to complete
    // This prevents flickering during navigation
    return <>{children}</>;
}
