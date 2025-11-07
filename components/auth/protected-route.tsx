'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AppLoader } from '@/components/loaders/page-loader';
import { hasPermission, PermissionValue } from '@/lib/permissions/permission-manager';
import { AccessLevel, rolePermissions } from '@/types/auth';
import { getAccessTokenFromCookie, getUserRole } from '@/lib/utils/token-utils';
import { authService } from '@/lib/services/auth-service';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPermissions?: PermissionValue[];
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, requiredPermissions = [], fallback }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, profileData, isLoading } = useAuthStore();

    // Track if we've checked cookies (to avoid redirect loops)
    const [hasCheckedCookies, setHasCheckedCookies] = useState(false);
    const [hasCookieAuth, setHasCookieAuth] = useState(false);

    // Use state to store user role (client-side only)
    // Initialize with profileData for SSR compatibility
    const [userRole, setUserRole] = useState<string | null>(
        profileData?.accessLevel || null
    );

    // Check if user is authenticated via cookies (fallback when store isn't hydrated)
    const checkAuthViaCookies = (): boolean => {
        if (typeof window === 'undefined') return false;

        const token = getAccessTokenFromCookie();
        if (!token) return false;

        // Validate token using auth service
        try {
            return authService.validateToken(token);
        } catch {
            return false;
        }
    };

    // Update user role from token when component mounts or auth state changes (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = getAccessTokenFromCookie();
        const role = getUserRole(token, profileData?.accessLevel);
        const cookieAuth = checkAuthViaCookies();

        setUserRole(role);
        setHasCookieAuth(cookieAuth);
        setHasCheckedCookies(true);
    }, [profileData?.accessLevel]);

    useEffect(() => {
        // Skip if still loading
        if (isLoading) return;

        // If store isn't hydrated yet but we have cookies, wait a bit
        // Middleware already validated the user, so trust that
        if (!hasCheckedCookies && typeof window !== 'undefined') {
            // Wait for cookie check to complete
            return;
        }

        // If not authenticated and no valid cookies, redirect to sign-in
        if (!isAuthenticated && !hasCookieAuth) {
            // Save the current URL to redirect back after sign-in
            if (typeof window !== 'undefined') {
                const callbackUrl = encodeURIComponent(window.location.href);
                router.push(`/sign-in?callbackUrl=${callbackUrl}`);
            }
            return;
        }

        // Special case: Allow CLIENT direct access to quotations page
        // Extract role from JWT token if not available in profileData
        if (pathname === '/quotations') {
            const token = getAccessTokenFromCookie();
            const tokenRole = getUserRole(token, profileData?.accessLevel);
            if (tokenRole === 'client') {
                // Always allow clients to access quotations
                return;
            }
        }

        // Check route access based on role
        if (userRole === AccessLevel.CLIENT) {
            // For client role, check if current path is in allowed routes
            const allowedRoutes = rolePermissions[AccessLevel.CLIENT]?.routes || [];
            const hasRouteAccess = allowedRoutes.includes(pathname) ||
                                  (pathname === '/dashboard' && allowedRoutes.some(route => route !== '/'));

            if (!hasRouteAccess) {
                // Redirect clients to quotations page if they don't have access
                router.push('/quotations');
                return;
            }
        }

        // If permissions are required, check if user has them
        if (requiredPermissions.length > 0 && userRole) {
            const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(userRole, permission));

            // If user doesn't have permission, show fallback or redirect
            if (!hasRequiredPermission) {
                if (!fallback) {
                    // Redirect based on role
                    if (userRole === AccessLevel.CLIENT) {
                        router.push('/quotations');
                    } else {
                        // Redirect to dashboard if no fallback is provided
                        router.push('/dashboard');
                    }
                }
            }
        }
    }, [isAuthenticated, isLoading, router, pathname, userRole, requiredPermissions, fallback, profileData?.accessLevel, hasCheckedCookies, hasCookieAuth]);

    // Show loader while checking authentication or if store is loading
    if (isLoading || !hasCheckedCookies) {
        return (
            <div className='flex justify-center items-center w-full h-screen'>
                <AppLoader />
            </div>
        );
    }

    // If we have cookies but store says not authenticated, trust cookies (middleware validated)
    const effectiveAuth = isAuthenticated || hasCookieAuth;

    // Show fallback if user doesn't have required permissions
    if (
        !isLoading &&
        effectiveAuth &&
        requiredPermissions.length > 0 &&
        userRole &&
        !requiredPermissions.some(permission => hasPermission(userRole, permission))
    ) {
        return fallback || null;
    }

    // If authenticated (via store or cookies) and has required permissions, render children
    if (!isLoading && effectiveAuth) {
        return <>{children}</>;
    }

    // Otherwise, render nothing (will be redirected by the useEffect)
    return (
        <div className='flex justify-center items-center w-full h-screen'>
            <AppLoader />
        </div>
    );
}
