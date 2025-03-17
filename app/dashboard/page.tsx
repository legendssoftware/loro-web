'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/utils/animations';

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div className="flex flex-col items-center justify-center h-screen gap-3 p-4">
                    <motion.p
                        className="text-xs font-normal uppercase font-body"
                        variants={itemVariants}
                    >
                        dashboard coming soon
                    </motion.p>
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
