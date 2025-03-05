'use client';

import { motion } from 'framer-motion';

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
        <motion.div
            className='flex flex-col items-center justify-center h-screen gap-3 p-4'
            initial='hidden'
            animate='show'
            variants={containerVariants}
        >
            <p className='text-sm uppercase font-body'>Dashboard</p>
        </motion.div>
    );
}
