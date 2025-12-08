'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { useState } from 'react';
import { HRReportsDashboard } from '@/components/hr/hr-reports-dashboard';
import { PersonalReportsDashboard } from '@/components/hr/personal-reports-dashboard';
import { SalesDashboard } from '@/components/hr/sales-dashboard';
import { useAuthStore } from '@/store/auth-store';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessLevel } from '@/types/auth';

export default function Home() {
    const { profileData } = useAuthStore();
    const { hasRole, userRole } = useRBAC();

    // Define all possible tabs with role-based access
    const allTabs = [
        {
            id: 'hr',
            label: 'Main Dashboard',
            allowedRoles: [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPERVISOR, AccessLevel.HR, AccessLevel.OWNER, AccessLevel.EXECUTIVE]
        },
        {
            id: 'my-reports',
            label: 'Personal',
            allowedRoles: [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPERVISOR, AccessLevel.HR, AccessLevel.USER, AccessLevel.OWNER, AccessLevel.TECHNICIAN, AccessLevel.SUPPORT, AccessLevel.DEVELOPER, AccessLevel.EXECUTIVE]
        },
        {
            id: 'sales',
            label: 'Sales',
            allowedRoles: [AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPERVISOR, AccessLevel.HR, AccessLevel.OWNER, AccessLevel.EXECUTIVE]
        },
    ];

    // Filter tabs based on user role using RBAC
    const tabs = allTabs.filter(tab => hasRole(tab.allowedRoles));

    // Set default active tab based on user permissions
    const getDefaultTab = () => {
        const normalizedRole = userRole?.toLowerCase() as AccessLevel;

        // USER role and similar roles only get personal dashboard
        if (normalizedRole === AccessLevel.USER ||
            normalizedRole === AccessLevel.TECHNICIAN ||
            normalizedRole === AccessLevel.SUPPORT ||
            normalizedRole === AccessLevel.DEVELOPER) {
            return 'my-reports';
        }

        // Admin and higher roles default to main dashboard if available
        if (hasRole([AccessLevel.ADMIN, AccessLevel.MANAGER, AccessLevel.SUPERVISOR, AccessLevel.HR, AccessLevel.OWNER, AccessLevel.EXECUTIVE])) {
            return 'hr';
        }

        // Fallback to personal reports
        return 'my-reports';
    };

    const [activeTab, setActiveTab] = useState<string>(getDefaultTab);

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    const renderTabContent = () => {
        // Check if user has access to the active tab
        const hasAccessToTab = tabs.some(tab => tab.id === activeTab);

        // If user doesn't have access to current tab, switch to first available tab
        if (!hasAccessToTab && tabs.length > 0) {
            setActiveTab(tabs[0].id);
            return null; // Re-render will happen with correct tab
        }

        switch (activeTab) {
            case 'hr':
                return <HRReportsDashboard />;
            case 'my-reports':
                return <PersonalReportsDashboard />;
            case 'sales':
                return <SalesDashboard />;
            default:
                return null;
        }
    };

    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div
                    id="tour-step-home-content"
                    className="container p-6 mx-auto"
                >
                    <div className="mb-8">
                        <h1 className="mb-2 text-2xl font-semibold font-body">
                            {userRole?.toLowerCase() === AccessLevel.USER
                                ? 'Personal Dashboard'
                                : 'Reports Dashboard'
                            }
                        </h1>
                        <p className="text-sm text-muted-foreground font-body">
                            {userRole?.toLowerCase() === AccessLevel.USER
                                ? 'Your personal attendance analytics and performance insights'
                                : 'Access comprehensive reports and analytics across different departments'
                            }
                        </p>
                    </div>

                    {/* Tab Navigation - Show when user has access to multiple tabs */}
                    {tabs.length > 1 && (
                        <div className="flex overflow-x-auto items-center mb-6 border-b border-border/10">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className="flex relative gap-1 justify-center items-center mr-8 w-28 cursor-pointer"
                                >
                                    <div
                                        className={`mb-3 font-body px-0 font-normal ${
                                            activeTab === tab.id
                                                ? 'text-primary dark:text-primary'
                                                : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                        onClick={() => handleTabChange(tab.id)}
                                    >
                                        <span className="text-xs font-thin uppercase font-body">
                                            {tab.label}
                                        </span>
                                    </div>
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Tab Content */}
                    {renderTabContent()}
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
