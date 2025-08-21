'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AppLoader } from '@/components/loaders/page-loader';
import { hasPermission, PermissionValue } from '@/lib/permissions/permission-manager';
import { AccessLevel, rolePermissions } from '@/types/auth';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPermissions?: PermissionValue[];
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, requiredPermissions = [], fallback }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, profileData, isLoading } = useAuthStore();

    // Get user role - prioritize JWT token role over profile accessLevel for consistency with middleware
    const getUserRole = () => {
        // First, try to get role from JWT token (same as middleware)
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('accessToken='))
                ?.split('=')[1];

            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                const payload = JSON.parse(jsonPayload);
                if (payload.role) {
                    return payload.role;
                }
            }
        } catch (e) {
            console.error("Failed to extract role from token:", e);
        }

        // Fallback to profile data accessLevel
        return profileData?.accessLevel || null;
    };

    const userRole = getUserRole();

    useEffect(() => {
        // Skip if still loading
        if (isLoading) return;

        // If not authenticated, redirect to sign-in
        if (!isAuthenticated) {
            // Save the current URL to redirect back after sign-in
            const callbackUrl = encodeURIComponent(window.location.href);
            router.push(`/sign-in?callbackUrl=${callbackUrl}`);
            return;
        }

        // Special case: Allow CLIENT direct access to quotations page
        // Extract role from JWT token if not available in profileData
        const getClientRoleFromToken = () => {
            try {
                const token = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('accessToken='))
                    ?.split('=')[1];

                if (token) {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(
                        atob(base64)
                            .split('')
                            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                            .join('')
                    );
                    const payload = JSON.parse(jsonPayload);
                    return payload.role;
                }
            } catch (e) {
                console.error("Failed to extract role from token:", e);
            }
            return null;
        };

        // For quotations page, check if user is a client from token
        if (pathname === '/quotations') {
            const tokenRole = getClientRoleFromToken();
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
    }, [isAuthenticated, isLoading, router, pathname, userRole, requiredPermissions, fallback]);

    // Show loader while checking authentication
    if (isLoading) {
        return (
            <div className='flex justify-center items-center w-full h-screen'>
                <AppLoader />
            </div>
        );
    }

    // Show fallback if user doesn't have required permissions
    if (
        !isLoading &&
        isAuthenticated &&
        requiredPermissions.length > 0 &&
        userRole &&
        !requiredPermissions.some(permission => hasPermission(userRole, permission))
    ) {
        return fallback || null;
    }

    // If authenticated and has required permissions, render children
    if (!isLoading && isAuthenticated) {
        return <>{children}</>;
    }

    // Otherwise, render nothing (will be redirected by the useEffect)
    return (
        <div className='flex justify-center items-center w-full h-screen'>
            <AppLoader />
        </div>
    );
}
