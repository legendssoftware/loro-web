'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart3,
    Users,
    TrendingUp,
    DollarSign,
    Clock,
    Target,
    Award,
    UserCheck,
    Calendar,
    PieChart,
} from 'lucide-react';

interface LiveOverviewReportProps {
    organizationId?: number;
    branchId?: number;
}

export function LiveOverviewReport({
    organizationId,
    branchId,
}: LiveOverviewReportProps) {
    const [activeTab, setActiveTab] = useState<string>('sales');

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    const tabs = [
        { id: 'sales', label: 'Sales' },
        { id: 'hr', label: 'HR' },
        { id: 'personal', label: 'Personal' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sales':
                return (
                    <div className="space-y-6">
                        {/* Sales Reports Overview */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Sales Analytics & Performance
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <DollarSign className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Revenue Analytics</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Comprehensive revenue tracking, sales performance metrics, conversion rates, 
                                        and profit analysis across different time periods and sales channels.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <TrendingUp className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Sales Trends</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Real-time sales trend analysis, forecasting models, seasonal patterns, 
                                        and predictive analytics for informed decision making.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <BarChart3 className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Product Performance</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Detailed product sales analysis, inventory turnover rates, best/worst performing 
                                        products, and category-wise performance metrics.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <Target className="w-5 h-5 text-orange-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Sales Targets</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Sales target tracking, quota achievement analysis, team and individual 
                                        performance against set goals with actionable insights.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Features */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Coming Soon
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <PieChart className="w-4 h-4 text-indigo-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Customer segmentation and lifetime value analysis</span>
                                </div>
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <BarChart3 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Interactive sales dashboards with real-time updates</span>
                                </div>
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <TrendingUp className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Advanced sales forecasting and AI-powered insights</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'hr':
                return (
                    <div className="space-y-6">
                        {/* HR Reports Overview */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Human Resources Analytics
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <Users className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Workforce Analytics</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Employee demographics, headcount trends, departmental distribution, 
                                        and organizational structure insights for strategic planning.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <Clock className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Attendance & Time</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Comprehensive attendance tracking, working hours analysis, leave patterns, 
                                        overtime trends, and productivity time measurements.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <Award className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Performance Management</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Employee performance reviews, goal achievement tracking, skill assessments, 
                                        and career development progress monitoring.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <UserCheck className="w-5 h-5 text-orange-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Employee Engagement</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Engagement surveys, satisfaction scores, retention analysis, 
                                        and workplace culture metrics for enhanced employee experience.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Features */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Coming Soon
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <Calendar className="w-4 h-4 text-cyan-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Automated payroll reports and expense tracking</span>
                                </div>
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <TrendingUp className="w-4 h-4 text-violet-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Predictive turnover analysis and retention strategies</span>
                                </div>
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <Users className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Skills gap analysis and training recommendations</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'personal':
                return (
                    <div className="space-y-6">
                        {/* Personal Reports Overview */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Personal Performance Insights
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <Target className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Personal Targets</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Individual goal tracking, target achievement analytics, personal KPI monitoring, 
                                        and progress visualization for continuous improvement.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <Award className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Achievements & Rewards</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Personal achievement tracking, reward points, badges earned, milestone celebrations, 
                                        and gamification elements to boost motivation.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <Clock className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Time & Productivity</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Personal time tracking, productivity patterns, work-life balance insights, 
                                        and efficiency recommendations tailored to individual needs.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg border border-border/30">
                                    <div className="flex gap-3 items-center mb-3">
                                        <TrendingUp className="w-5 h-5 text-orange-600" strokeWidth={1.5} />
                                        <h4 className="text-sm font-medium font-body">Growth Analytics</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-body">
                                        Skills development tracking, learning progress, competency assessments, 
                                        and personalized career growth recommendations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Features */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-4 text-xs font-normal uppercase font-body">
                                Coming Soon
                            </h3>
                            <div className="space-y-3">
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <BarChart3 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">AI-powered personal performance insights and recommendations</span>
                                </div>
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <Calendar className="w-4 h-4 text-indigo-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Personal calendar integration and time optimization</span>
                                </div>
                                <div className="flex gap-2 items-center p-3 rounded border border-border/20">
                                    <Award className="w-4 h-4 text-rose-600" strokeWidth={1.5} />
                                    <span className="text-xs font-body">Peer comparison and team collaboration metrics</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="flex gap-2 items-center text-lg font-medium">
                        <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
                        <span className="font-light uppercase font-body">
                            Reports & Analytics
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 items-center text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
                        <span className="font-light font-body">
                            Comprehensive analytics and insights across sales, HR, and personal performance metrics
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Navigation */}
            <Card className="border-border/50">
                <CardContent className="p-0">
                    <div className="flex overflow-x-auto items-center mb-6 border-b border-border/10">
                        {tabs.map((tab) => (
                            <div
                                key={tab?.id}
                                className="flex relative gap-1 justify-center items-center mr-8 w-28 cursor-pointer"
                            >
                                <div
                                    className={`mb-3 font-body px-4 py-3 font-normal ${
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
                                    <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary dark:bg-primary" />
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Tab Content */}
                    <div className="p-6">
                        {renderTabContent()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
