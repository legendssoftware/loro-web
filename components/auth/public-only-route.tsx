'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const { isAuthenticated, isLoading } = useAuthStore();

    useEffect(() => {
        // Skip if still loading
        if (isLoading) return;

        // If authenticated, redirect to the specified path
        if (isAuthenticated) {
            let finalRedirectTo = redirectTo;
            const callbackUrlFromParams = searchParams.get('callbackUrl');

            if (callbackUrlFromParams) {
                try {
                    // Attempt to parse callbackUrlFromParams relative to current origin if it's a path
                    // Or parse it as an absolute URL
                    const url = callbackUrlFromParams.startsWith('/')
                        ? new URL(callbackUrlFromParams, window.location.origin)
                        : new URL(callbackUrlFromParams);

                    // Ensure it's a relative path starting with / and on the same origin
                    if (url.origin === window.location.origin && url.pathname.startsWith('/')) {
                        finalRedirectTo = url.pathname + url.search + url.hash;
                    } else {
                        // Log if callbackUrl is from a different origin, but still use fallback (redirectTo)
                        console.warn('PublicOnlyRoute: callbackUrl from different origin, using fallback.');
                    }
                } catch (e) {
                    // Invalid callbackUrl format, use the default redirectTo
                    console.warn('PublicOnlyRoute: Invalid callbackUrl format, using fallback.', e);
                }
            }

            router.replace(finalRedirectTo);
        }
    }, [isAuthenticated, isLoading, router, redirectTo, searchParams]);

    // Reduce loading time by not showing loader for too long
    if (isLoading) {
        return (
            <div className='flex justify-center items-center w-full h-screen'>
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
        <div className='flex justify-center items-center w-full h-screen'>
            <AppLoader />
        </div>
    );
}
