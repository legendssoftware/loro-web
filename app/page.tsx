'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { LiveOverviewReport } from '@/modules/reports/components/live-overview-report';

export default function Home() {
    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div id="tour-step-home-content" className="container mx-auto">
                    <LiveOverviewReport />
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
