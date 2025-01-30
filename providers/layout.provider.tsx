'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInVariants = {
    hidden: {
        opacity: 0,
        scale: 0.98,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: {
            duration: 0.2,
            ease: "easeIn",
        },
    },
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 5000,
            retry: 10,
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 10,
        },
    },
});

export function LayoutProvider({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AnimatePresence mode="wait">
                <motion.div
                    key="layout"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={fadeInVariants}
                    className="w-full h-screen overflow-y-scroll"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
            <ReactQueryDevtools initialIsOpen={false} />
            <Toaster position="bottom-center" reverseOrder={false} />
        </QueryClientProvider >
    );
}