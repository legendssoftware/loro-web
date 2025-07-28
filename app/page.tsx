'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { useState } from 'react';
import { HRReportsDashboard } from '@/components/hr/hr-reports-dashboard';
import { PersonalReportsDashboard } from '@/components/reports/personal-reports-dashboard';

export default function Home() {
    const [activeTab, setActiveTab] = useState<string>('hr');

    const tabs = [
        { id: 'hr', label: 'HR' },
        { id: 'my-reports', label: 'My Reports' },
    ];

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'hr':
                return <HRReportsDashboard />;
            case 'my-reports':
                return <PersonalReportsDashboard />;
            default:
                return null;
        }
    };

    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div id="tour-step-home-content" className="container p-6 mx-auto">
                    <div className="mb-8">
                        <h1 className="mb-2 text-2xl font-semibold font-body">Reports Dashboard</h1>
                        <p className="text-sm text-muted-foreground font-body">
                            Access comprehensive reports and analytics across different departments
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex overflow-x-auto items-center mb-6 border-b border-border/10">
                        {tabs.map((tab) => (
                            <div
                                key={tab?.id}
                                className="flex relative gap-1 justify-center items-center mr-8 w-28 cursor-pointer"
                            >
                                <div
                                    className={`mb-3 font-body px-0 font-normal ${
                                        activeTab === tab.id
                                            ? 'text-primary dark:text-primary'
                                            : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                    onClick={() => handleTabChange(tab?.id)}
                                >
                                    <span className="text-xs font-thin uppercase font-body">
                                        {tab?.label}
                                    </span>
                                </div>
                                {activeTab === tab?.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {renderTabContent()}
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
