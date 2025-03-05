'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/utils/animations';

export default function SettingsPage() {
    return (
        <PageTransition>
            <div className='flex flex-col items-center justify-center h-screen gap-3 p-4'>
                <motion.p
                    className='text-sm uppercase font-body'
                    variants={itemVariants}
                >
                    Settings Page
                </motion.p>
            </div>
        </PageTransition>
    );
}