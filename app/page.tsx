'use client';

import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/protected-route';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <motion.div
                className='flex flex-col items-center justify-center h-screen gap-3 p-4'
                initial='hidden'
                animate='show'
                variants={containerVariants}
            >
                <p className='text-sm uppercase font-body'>Dashboard</p>
            </motion.div>
        </ProtectedRoute>
    );
}
