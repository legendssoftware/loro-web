'use client';

import { motion } from 'framer-motion';
import React from 'react';

// Animation variants
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
            initial='hidden'
            animate='show'
            variants={containerVariants}
            className='flex flex-col h-screen gap-6 p-6 overflow-y-scroll'
        >
            <div className='flex flex-col items-center justify-center w-full h-full'>
                <p className='text-[10px] text-white font-bold uppercase font-body'>Dashboard Coming Soon</p>
            </div>
        </motion.div>
    );
}
