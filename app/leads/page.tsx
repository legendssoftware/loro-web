'use client';

import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/utils/animations';
import { PageTransition } from '@/components/animations/page-transition';

export default function MapPage() {
    return (
        <PageTransition>
            <div className='flex flex-col items-center justify-center h-screen gap-3 p-4'>
                <motion.p className='text-sm uppercase font-body' variants={itemVariants}>
                    Leads Page
                </motion.p>
            </div>
        </PageTransition>
    );
}
