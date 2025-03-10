'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { AppLoader } from '@/components/loaders/page-loader';

interface PublicOnlyRouteProps {
    children: ReactNode;
    redirectTo?: string;
}

/**
 * Component that only allows access to unauthenticated users
 * If a user is authenticated, they will be redirected to the specified path
 */
export function PublicOnlyRoute({ children, redirectTo = '/' }: PublicOnlyRouteProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        // Skip if still loading
        if (isLoading) return;

        // If authenticated, redirect to the specified path
        if (isAuthenticated) {
            // Sanitize and validate the redirect URL
            const sanitizedRedirect = typeof redirectTo === 'string' && redirectTo.startsWith('/')
                ? redirectTo
                : '/';

            // Use replace instead of push for faster redirection without adding to history
            router.replace(sanitizedRedirect);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    // Reduce loading time by not showing loader for too long
    if (isLoading) {
        return (
            <div className='flex items-center justify-center w-full h-screen'>
                <AppLoader />
            </div>
        );
    }

    // If not authenticated, render children immediately
    if (!isAuthenticated) {
        return <>{children}</>;
    }

    // Return minimal loading state for authenticated users being redirected
    return (
        <div className='flex items-center justify-center w-full h-screen'>
            <AppLoader />
        </div>
    );
}
