'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from './auth.provider';
import { LicenseProvider } from './license.provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            retry: 1,
        },
    },
});

interface LayoutProviderProps {
    children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
                <AuthProvider>
                    <LicenseProvider>
                        {children}
                        <Toaster />
                    </LicenseProvider>
                </AuthProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
