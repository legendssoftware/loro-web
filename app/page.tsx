'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { useState } from 'react';
import { Users, TrendingUp, FileText, BarChart3, Calendar, Target } from 'lucide-react';
import { SalesAnalyticsDashboard } from '@/components/analytics/sales-analytics-dashboard';

export default function Home() {
    const [activeTab, setActiveTab] = useState<string>('sales');

    const tabs = [
        { id: 'hr', label: 'HR' },
        { id: 'sales', label: 'Sales' },
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
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <Users className="w-8 h-8 text-blue-500" />
                                    <h3 className="text-lg font-medium font-body">Employee Management</h3>
                                </div>
                                <p className="text-sm text-muted-foreground font-body mb-4">
                                    Comprehensive employee reports including attendance, performance, and demographics.
                                </p>
                                <div className="space-y-2">
                                    <div className="text-xs font-body text-muted-foreground">• Staff attendance reports</div>
                                    <div className="text-xs font-body text-muted-foreground">• Performance evaluations</div>
                                    <div className="text-xs font-body text-muted-foreground">• Employee demographics</div>
                                </div>
                            </div>

                            <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="w-8 h-8 text-green-500" />
                                    <h3 className="text-lg font-medium font-body">Payroll & Benefits</h3>
                                </div>
                                <p className="text-sm text-muted-foreground font-body mb-4">
                                    Detailed payroll reports, benefits utilization, and compensation analysis.
                                </p>
                                <div className="space-y-2">
                                    <div className="text-xs font-body text-muted-foreground">• Monthly payroll summaries</div>
                                    <div className="text-xs font-body text-muted-foreground">• Benefits enrollment</div>
                                    <div className="text-xs font-body text-muted-foreground">• Compensation analysis</div>
                                </div>
                            </div>

                            <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <Target className="w-8 h-8 text-purple-500" />
                                    <h3 className="text-lg font-medium font-body">Recruitment</h3>
                                </div>
                                <p className="text-sm text-muted-foreground font-body mb-4">
                                    Hiring metrics, candidate pipeline, and recruitment effectiveness reports.
                                </p>
                                <div className="space-y-2">
                                    <div className="text-xs font-body text-muted-foreground">• Candidate pipeline</div>
                                    <div className="text-xs font-body text-muted-foreground">• Time-to-hire metrics</div>
                                    <div className="text-xs font-body text-muted-foreground">• Recruitment costs</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart3 className="w-6 h-6 text-muted-foreground" />
                                <h3 className="text-base font-medium font-body">HR Analytics Dashboard</h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-body">
                                Advanced HR analytics and insights will be available here. Monitor employee satisfaction,
                                turnover rates, and organizational health metrics.
                            </p>
                        </div>
                    </div>
                );
            case 'sales':
                return <SalesAnalyticsDashboard />;
            case 'my-reports':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileText className="w-8 h-8 text-indigo-500" />
                                    <h3 className="text-lg font-medium font-body">Personal Dashboard</h3>
                                </div>
                                <p className="text-sm text-muted-foreground font-body mb-4">
                                    Your personalized reports and performance metrics.
                                </p>
                                <div className="space-y-2">
                                    <div className="text-xs font-body text-muted-foreground">• Personal KPIs</div>
                                    <div className="text-xs font-body text-muted-foreground">• Activity summary</div>
                                    <div className="text-xs font-body text-muted-foreground">• Goal tracking</div>
                                </div>
                            </div>

                            <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="w-8 h-8 text-teal-500" />
                                    <h3 className="text-lg font-medium font-body">Time & Attendance</h3>
                                </div>
                                <p className="text-sm text-muted-foreground font-body mb-4">
                                    Track your time, attendance, and productivity metrics.
                                </p>
                                <div className="space-y-2">
                                    <div className="text-xs font-body text-muted-foreground">• Hours worked</div>
                                    <div className="text-xs font-body text-muted-foreground">• Attendance record</div>
                                    <div className="text-xs font-body text-muted-foreground">• Break analysis</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-8 h-8 text-purple-500" />
                                <h3 className="text-lg font-medium font-body">My Targets & Goals</h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-body mb-4">
                                Monitor your personal targets, goals, and achievement progress.
                            </p>
                            <div className="space-y-2">
                                <div className="text-xs font-body text-muted-foreground">• Sales targets</div>
                                <div className="text-xs font-body text-muted-foreground">• Performance goals</div>
                                <div className="text-xs font-body text-muted-foreground">• Achievement history</div>
                            </div>
                        </div>

                        <div className="p-6 rounded-lg bg-card/50 border border-border/20">
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart3 className="w-6 h-6 text-muted-foreground" />
                                <h3 className="text-base font-medium font-body">Custom Reports</h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-body">
                                Create and manage your custom reports. Build personalized dashboards
                                tailored to your specific needs and role requirements.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <ProtectedRoute>
            <PageTransition type="slide-up">
                <div id="tour-step-home-content" className="container mx-auto p-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold font-body mb-2">Reports Dashboard</h1>
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
