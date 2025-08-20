'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth.provider';
import { LicenseProvider } from './license.provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { RouteGuard } from '@/components/rbac/route-guard';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
        },
    },
});

interface LayoutProviderProps {
    children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
    // Use pathname as a unique key for AnimatePresence
    const pathname = usePathname();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
                <AuthProvider>
                    <RouteGuard>
                        <LicenseProvider>
                            <AnimatePresence mode="wait">
                                {/* Add key based on pathname to ensure proper AnimatePresence behavior */}
                                <div key={pathname} className="w-full h-full" id="layout-provider">
                                    {children}
                                </div>
                            </AnimatePresence>
                        </LicenseProvider>
                    </RouteGuard>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
