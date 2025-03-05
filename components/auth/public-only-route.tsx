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
            router.push(redirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo]);

    // Show loader while checking authentication
    if (isLoading) {
        return (
            <div className='flex items-center justify-center w-full h-screen'>
                <AppLoader />
            </div>
        );
    }

    // If not authenticated, render children
    if (!isLoading && !isAuthenticated) {
        return <>{children}</>;
    }

    // Otherwise, render nothing (will be redirected by the useEffect)
    return (
        <div className='flex items-center justify-center w-full h-screen'>
            <AppLoader />
        </div>
    );
}
