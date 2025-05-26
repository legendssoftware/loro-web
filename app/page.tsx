'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { LiveOverviewReport } from '@/modules/reports/components/live-overview-report';
import { UserReports } from '@/modules/reports/components/user-reports';
import { useAppStore } from '@/store/use-app-store';

export default function Home() {
    const { reportMode } = useAppStore();

    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div id="tour-step-home-content" className="container mx-auto">
                    {reportMode === 'user' ? (
                        <UserReports />
                    ) : (
                        <LiveOverviewReport />
                    )}
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
