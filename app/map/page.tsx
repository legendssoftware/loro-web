'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/utils/animations';
import { MapPin } from 'lucide-react';

export default function MapPage() {
    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div className="flex flex-col items-center justify-center h-screen gap-3 p-4">
                    <motion.div
                        className="flex items-center justify-center w-16 h-16 mb-4 text-primary"
                        variants={itemVariants}
                    >
                        <MapPin size={48} strokeWidth={1.5} />
                    </motion.div>
                    <motion.p
                        className="text-xs font-normal uppercase font-body"
                        variants={itemVariants}
                    >
                        map functionality coming soon
                    </motion.p>
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
