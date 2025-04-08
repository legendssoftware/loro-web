'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/utils/animations';
import { LiveOverviewReport } from '@/modules/reports/components/live-overview-report';
import { Button } from '@/components/ui/button';
import { ChevronRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div className="container py-6 mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <motion.h1
                            className="text-xl font-normal uppercase font-body"
                            variants={itemVariants}
                        >
                            Dashboard
                        </motion.h1>
                        <motion.div variants={itemVariants}>
                            <Link href="/dashboard/reports">
                                <Button variant="outline" className="flex items-center gap-1.5 h-8" size="sm">
                                    <BarChart2 className="w-3.5 h-3.5" />
                                    <span className="text-xs uppercase font-body">Reports</span>
                                    <ChevronRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                    <LiveOverviewReport />
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
