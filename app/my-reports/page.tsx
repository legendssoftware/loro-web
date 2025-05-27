'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { UserReports } from '@/modules/reports/components/user-reports';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, BarChart3 } from 'lucide-react';

export default function MyReportsPage() {
    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div className="container mx-auto space-y-6">
                    {/* Page Header */}
                    <Card className="border-border/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg font-medium">
                                <User className="w-5 h-5" strokeWidth={1.5} />
                                <span className="font-light uppercase font-body">
                                    My Reports
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
                                <span className="font-light font-body">
                                    Personal performance metrics, attendance analytics, targets progress, and rewards tracking
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Reports Component */}
                    <UserReports />
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
