'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    ClipboardCheck,
    Briefcase,
    DollarSign,
    UserCheck,
    MapPin,
    BarChart2,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
    WorkforceHourlyActivityChart,
    WorkforceProductivityChart,
} from './charts/workforce-charts';
import {
    LeadsHourlyActivityChart,
    LeadsStatusDistributionChart,
    LeadsByCategoryChart,
} from './charts/leads-charts';
import {
    SalesHourlyActivityChart,
    WeeklyRevenueChart,
} from './charts/sales-charts';

import { useLiveOverviewReport } from '@/hooks/use-live-overview-report';

interface LiveOverviewReportProps {
    organizationId?: number;
    branchId?: number;
}

export function LiveOverviewReport({
    organizationId,
    branchId,
}: LiveOverviewReportProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const { report, isLoading, error, refreshData } = useLiveOverviewReport({
        organizationId,
        branchId,
    });

    if (isLoading) {
        return <ReportSkeleton />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-6">
                <h3 className="mb-2 text-lg font-semibold">
                    Unable to load report
                </h3>
                <p className="text-sm text-muted-foreground">
                    {error?.message || 'Please try again later'}
                </p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={refreshData}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    // Convert status distribution and category distribution to array format for pie charts
    const statusDistributionData = Object.entries(
        report.metrics.leads.statusDistribution,
    ).map(([name, value]) => {
        // Map status to colors
        const colorMap: Record<string, string> = {
            PENDING: '#F59E0B',
            APPROVED: '#10B981',
            REVIEW: '#4F46E5',
            DECLINED: '#EF4444',
            CONVERTED: '#8B5CF6',
            CANCELLED: '#9CA3AF',
        };

        return {
            name,
            value: Number(value),
            color: colorMap[name] || '#9CA3AF',
        };
    });

    const leadsByCategoryData = Object.entries(
        report.metrics.leads.leadsByCategory,
    ).map(([name, value]) => {
        // Map categories to colors
        const colorMap: Record<string, string> = {
            Uncategorized: '#9CA3AF',
            'Walk-in': '#4F46E5',
            Referral: '#10B981',
            Website: '#8B5CF6',
            Phone: '#F59E0B',
            Email: '#EC4899',
            'Social Media': '#3B82F6',
        };

        return {
            name,
            value: Number(value),
            color: colorMap[name] || '#9CA3AF',
        };
    });

    // Create workforce productivity data
    const productivityData = [
        {
            name: 'Productive',
            value: report.metrics.workforce.productivityRate,
            color: '#10B981',
        },
        {
            name: 'Idle/Other',
            value: 100 - report.metrics.workforce.productivityRate,
            color: '#F59E0B',
        },
    ];

    // Create weekly revenue data
    const weeklyRevenueData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: Math.floor(Math.random() * 5000),
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-xl font-normal uppercase font-body">
                        Live Organization Overview
                    </h1>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        Real-time metrics and performance analytics
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    className="h-8 gap-1"
                >
                    <RefreshCw className="w-3 h-3" />
                    <span className="text-xs font-normal uppercase font-body">
                        Refresh
                    </span>
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <SummaryCard
                    title="Workforce"
                    icon={<Users className="w-4 h-4" />}
                    primaryMetric={report.summary.totalEmployees}
                    primaryLabel="Total Employees"
                    secondaryMetric={report.summary.activeEmployees}
                    secondaryLabel="Active Now"
                />
                <SummaryCard
                    title="Tasks"
                    icon={<ClipboardCheck className="w-4 h-4" />}
                    primaryMetric={report.summary.tasksCompletedToday}
                    primaryLabel="Completed Today"
                    secondaryMetric={report.summary.tasksInProgressCount}
                    secondaryLabel="In Progress"
                />
                <SummaryCard
                    title="Leads"
                    icon={<Briefcase className="w-4 h-4" />}
                    primaryMetric={report.summary.leadsGeneratedToday}
                    primaryLabel="Generated Today"
                    secondaryMetric={
                        report.metrics.leads.statusDistribution.PENDING || 0
                    }
                    secondaryLabel="Pending"
                />
                <SummaryCard
                    title="Sales"
                    icon={<DollarSign className="w-4 h-4" />}
                    primaryMetric={report.metrics.sales.revenueFormatted}
                    primaryLabel="Revenue Today"
                    secondaryMetric={report.summary.quotationsToday}
                    secondaryLabel="Quotations"
                />
                <SummaryCard
                    title="Clients"
                    icon={<UserCheck className="w-4 h-4" />}
                    primaryMetric={report.summary.clientInteractionsToday}
                    primaryLabel="Interactions Today"
                    secondaryMetric={report.metrics.clients.newClientsToday}
                    secondaryLabel="New Clients"
                />
            </div>

            {/* Tabs for different sections */}
            <Tabs
                defaultValue="overview"
                value={activeTab}
                onValueChange={setActiveTab}
            >
                <TabsList className="w-full h-auto p-0 bg-transparent rounded-none">
                    <TabsTrigger
                        value="overview"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        <BarChart2 className="w-4 h-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="workforce"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Workforce
                    </TabsTrigger>
                    <TabsTrigger
                        value="leads"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Leads
                    </TabsTrigger>
                    <TabsTrigger
                        value="sales"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Sales
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <WorkforceHourlyActivityChart
                            data={report.metrics.workforce.hourlyData}
                        />
                        <WorkforceProductivityChart data={productivityData} />
                        <LeadsStatusDistributionChart
                            data={statusDistributionData}
                        />
                        <SalesHourlyActivityChart
                            data={report.metrics.sales.hourlySales}
                        />
                    </div>
                </TabsContent>

                {/* Workforce Tab */}
                <TabsContent value="workforce" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <WorkforceHourlyActivityChart
                            data={report.metrics.workforce.hourlyData}
                        />
                        <WorkforceProductivityChart data={productivityData} />
                    </div>
                </TabsContent>

                {/* Leads Tab */}
                <TabsContent value="leads" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <LeadsHourlyActivityChart
                            data={report.metrics.leads.hourlyData}
                        />
                        <LeadsStatusDistributionChart
                            data={statusDistributionData}
                        />
                        <LeadsByCategoryChart data={leadsByCategoryData} />
                    </div>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <SalesHourlyActivityChart
                            data={report.metrics.sales.hourlySales}
                        />
                        <WeeklyRevenueChart data={weeklyRevenueData} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SummaryCard({
    title,
    icon,
    primaryMetric,
    primaryLabel,
    secondaryMetric,
    secondaryLabel,
}: {
    title: string;
    icon: React.ReactNode;
    primaryMetric: number | string;
    primaryLabel: string;
    secondaryMetric: number | string;
    secondaryLabel: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <h3 className="text-sm font-normal uppercase font-body">
                    {title}
                </h3>
                <div className="p-1 rounded-md bg-primary/10 text-primary">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <p className="text-2xl font-semibold font-body">{primaryMetric}</p>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        {primaryLabel}
                    </p>
                </div>
                <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium font-body">{secondaryMetric}</p>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        {secondaryLabel}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function ReportSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <Skeleton className="w-64 h-8" />
                    <Skeleton className="w-48 h-4 mt-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <Skeleton className="w-20 h-4" />
                            <Skeleton className="w-8 h-8 rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="w-12 h-8" />
                            <Skeleton className="w-24 h-4 mt-1" />
                            <Skeleton className="w-8 h-6 mt-4" />
                            <Skeleton className="w-20 h-4 mt-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="w-full h-auto p-0 bg-transparent rounded-none">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="w-32 h-10 mx-1" />
                    ))}
                </TabsList>

                <div className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Card key={index}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="w-40 h-4" />
                                    <Skeleton className="w-56 h-3 mt-2" />
                                </CardHeader>
                                <CardContent className="h-64 p-6 border rounded border-border/80 bg-card">
                                    <Skeleton className="w-full h-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
