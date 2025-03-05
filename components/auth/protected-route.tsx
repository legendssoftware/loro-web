'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AppLoader } from '@/components/loaders/page-loader';
import { hasPermission, PermissionValue } from '@/lib/permissions/permission-manager';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPermissions?: PermissionValue[];
    fallback?: ReactNode;
}

export function ProtectedRoute({ children, requiredPermissions = [], fallback }: ProtectedRouteProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, profileData, isLoading } = useAuthStore();

    // Get user role from profile data
    const userRole = profileData?.accessLevel || null;

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

        // If permissions are required, check if user has them
        if (requiredPermissions.length > 0 && userRole) {
            const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(userRole, permission));

            // If user doesn't have permission, show fallback or redirect
            if (!hasRequiredPermission) {
                if (!fallback) {
                    // Redirect to dashboard if no fallback is provided
                    router.push('/');
                }
            }
        }
    }, [isAuthenticated, isLoading, router, pathname, userRole, requiredPermissions, fallback]);

    // Show loader while checking authentication
    if (isLoading) {
        return (
            <div className='flex items-center justify-center w-full h-screen'>
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
        <div className='flex items-center justify-center w-full h-screen'>
            <AppLoader />
        </div>
    );
}
