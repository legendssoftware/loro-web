'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
    BreadcrumbPage
} from '@/components/ui/breadcrumb';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { itemVariants } from '@/lib/utils/animations';
import { ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
    const reportItems = [
        {
            id: 'live-overview',
            title: 'Live Organization Overview',
            description: 'Real-time metrics and performance analytics',
            icon: <Activity className="w-10 h-10 p-2 rounded-lg text-primary bg-primary/10" />,
            href: '/dashboard/reports/live-overview',
        },
        // More reports can be added here in the future
    ];

    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div className="container py-6 mx-auto">
                    <div className="mb-6">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Reports</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="mb-6">
                        <motion.h1
                            className="text-xl font-normal uppercase font-body"
                            variants={itemVariants}
                        >
                            Reports
                        </motion.h1>
                        <motion.p
                            className="text-xs font-thin uppercase text-muted-foreground font-body"
                            variants={itemVariants}
                        >
                            Analytics and insights for your organization
                        </motion.p>
                    </div>

                    <motion.div
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={itemVariants}
                    >
                        {reportItems.map((report) => (
                            <Link key={report.id} href={report.href} className="block group">
                                <Card className="transition-all border shadow-sm border-border/60 bg-card hover:border-primary/40 hover:shadow-md">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                        <div>
                                            <CardTitle className="text-lg font-normal uppercase font-body">{report.title}</CardTitle>
                                            <CardDescription className="text-xs font-thin uppercase font-body">{report.description}</CardDescription>
                                        </div>
                                        {report.icon}
                                    </CardHeader>
                                    <CardFooter className="flex justify-end pt-4 pb-4 border-t border-border/20">
                                        <span className="flex items-center gap-1 text-xs font-thin uppercase font-body group-hover:text-primary">
                                            View Report <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </motion.div>
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
