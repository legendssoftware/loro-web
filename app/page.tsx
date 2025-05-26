'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { LiveOverviewReport } from '@/modules/reports/components/live-overview-report';
import { UserReportPlaceholder } from '@/modules/reports/components/user-report-placeholder';
import { useAppStore } from '@/store/use-app-store';

export default function Home() {
    const { reportMode } = useAppStore();

    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div id="tour-step-home-content" className="container mx-auto">
                    {reportMode === 'user' ? (
                        <UserReportPlaceholder />
                    ) : (
                        <LiveOverviewReport />
                    )}
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
