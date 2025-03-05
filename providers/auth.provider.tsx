'use client';

import { createContext, useContext, useEffect, useMemo, ReactNode, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSessionStore, type ProfileData } from '@/store/use-session-store';
import { tokenValidator } from '@/lib/tools/tokenValidator';
import { AppLoader } from '@/components/loaders/page-loader';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: ProfileData | null;
    signIn: (credentials: { username: string; password: string }) => Promise<void>;
    signOut: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const {
        isAuthenticated,
        loading: isLoading,
        profileData: user,
        error,
        signIn,
        signOut,
        accessToken,
    } = useSessionStore();

    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(async () => {
            const publicPaths = [
                '/sign-in',
                '/sign-up',
                '/forgot-password',
                '/new-password',
                '/landing-page',
                'download',
            ];
            const isPublicPath = publicPaths.includes(pathname);

            if (!isPublicPath) {
                if (!accessToken || !tokenValidator(accessToken)) {
                    signOut();
                    router.push('/landing-page');
                }
            }

            setIsInitialLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [accessToken, signOut, router, pathname]);

    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            isLoading,
            user,
            error,
            signIn,
            signOut,
        }),
        [isAuthenticated, isLoading, user, error, signIn, signOut],
    );

    if (isInitialLoading) {
        return (
            <div className='flex items-center justify-center w-full h-screen'>
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
