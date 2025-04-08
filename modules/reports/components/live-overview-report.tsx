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
    BarChart2,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

// New imports for task charts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';

// Define interface for lead generator data
interface LeadGenerator {
    userId: number;
    userName: string;
    leadCount: number;
    conversionRate: number;
}

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
        report?.metrics?.leads?.statusDistribution || {}
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
        report?.metrics?.leads?.leadsByCategory || {}
    ).map(([name, value]) => {
        // Map categories to colors with a richer color palette that matches status colors
        const colorMap: Record<string, string> = {
            'Uncategorized': '#9CA3AF',    // Gray
            'Walk-in': '#4F46E5',          // Indigo (same as REVIEW)
            'Referral': '#10B981',         // Green (same as APPROVED)
            'Website': '#8B5CF6',          // Purple (same as CONVERTED)
            'Phone': '#F59E0B',            // Amber (same as PENDING)
            'Email': '#EC4899',            // Pink
            'Social Media': '#3B82F6',     // Blue
            'Business': '#6366F1',         // Blue-indigo
            'Personal': '#14B8A6',         // Teal
        };

        return {
            name,
            value: Number(value),
            color: colorMap[name] || '#9CA3AF', // Default to gray for unknown categories
        };
    });

    // Create workforce productivity data
    const productivityData = [
        {
            name: 'Productive',
            value: report?.metrics?.workforce?.productivityRate || 0,
            color: '#10B981',
        },
        {
            name: 'Idle/Other',
            value: 100 - (report?.metrics?.workforce?.productivityRate || 0),
            color: '#F59E0B',
        },
    ];

    // Define interface for quotation data
    interface PendingQuotation {
        id: number;
        quotationNumber: string;
        clientName: string;
        amount: number;
        formattedAmount: string;
        itemCount: number;
        status: string;
        createdBy: string;
        createdAt: string;
    }

    // Create weekly revenue data from pending quotations
    const weeklyRevenueData = report?.metrics?.sales?.pendingQuotations?.map((quotation: PendingQuotation) => ({
        date: quotation.createdAt.split(' ')[0], // Use the date part
        revenue: quotation.amount
    })) || [];

    // Add today's revenue as the final data point if it exists
    if (report?.metrics?.sales?.revenueToday > 0) {
        weeklyRevenueData.push({
            date: 'Today',
            revenue: report.metrics.sales.revenueToday
        });
    }

    // Ensure we have at least one data point for the chart
    if (weeklyRevenueData.length === 0) {
        weeklyRevenueData.push({
            date: 'Today',
            revenue: 0
        });
    }

    // Prepare task data for charts
    const taskVolumeTrendsData = [
        { name: 'Weekly', value: report?.metrics?.tasks?.comprehensive?.volumeTrends?.weekly || 0 },
        { name: 'Monthly', value: report?.metrics?.tasks?.comprehensive?.volumeTrends?.monthly || 0 },
        { name: 'Quarterly', value: report?.metrics?.tasks?.comprehensive?.volumeTrends?.quarterly || 0 },
    ];

    const taskCompletionRatesData = [
        {
            name: 'Weekly',
            Completed: report?.metrics?.tasks?.comprehensive?.completionRates?.weeklyCount || 0,
            Rate: report?.metrics?.tasks?.comprehensive?.completionRates?.weekly || 0
        },
        {
            name: 'Monthly',
            Completed: report?.metrics?.tasks?.comprehensive?.completionRates?.monthlyCount || 0,
            Rate: report?.metrics?.tasks?.comprehensive?.completionRates?.monthly || 0
        },
        {
            name: 'Quarterly',
            Completed: report?.metrics?.tasks?.comprehensive?.completionRates?.quarterlyCount || 0,
            Rate: report?.metrics?.tasks?.comprehensive?.completionRates?.quarterly || 0
        },
    ];

    // Prepare task priority data for pie chart
    const taskPriorityData = Object.entries(
        report?.metrics?.tasks?.comprehensive?.priorityAnalysis || {}
    ).map(([name, data]: [string, any]) => {
        // Map priority to colors
        const colorMap: Record<string, string> = {
            LOW: '#10B981',
            MEDIUM: '#F59E0B',
            HIGH: '#EF4444',
            URGENT: '#7C3AED',
        };

        return {
            name,
            value: data.totalCount || 0,
            color: colorMap[name] || '#9CA3AF',
        };
    });

    // Prepare task type data for pie chart
    const taskTypeData = Object.entries(
        report?.metrics?.tasks?.comprehensive?.taskTypeDistribution || {}
    )
    .filter(([_, data]: [string, any]) => data.totalCount > 0)
    .map(([name, data]: [string, any]) => {
        return {
            name,
            value: data.totalCount || 0,
            color: getColorForIndex(name),
        };
    });

    // Prepare task aging data
    const taskAgingData = Object.entries(
        report?.metrics?.tasks?.comprehensive?.taskAging || {}
    )
    .filter(([status]) => status !== 'COMPLETED' && status !== 'CANCELLED')
    .map(([status, data]: [string, any]) => {
        // Map status to colors
        const statusColorMap: Record<string, string> = {
            PENDING: '#F59E0B',     // Amber
            IN_PROGRESS: '#3B82F6', // Blue
            OVERDUE: '#EF4444',     // Red
            POSTPONED: '#8B5CF6',   // Purple
            MISSED: '#EC4899',      // Pink
        };

        return {
            name: status,
            count: data.count || 0,
            color: statusColorMap[status] || '#9CA3AF', // Default gray if status not found
        };
    });

    // Function to generate colors for task types
    function getColorForIndex(name: string): string {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
            '#6366F1', '#F97316', '#14B8A6', '#8B5CF6'
        ];

        // Simple hash function to get consistent color
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    }

    // Format assignee performance data
    const assigneePerformanceData = report?.metrics?.tasks?.comprehensive?.assigneePerformance || [];

    // Define assignee interface for TypeScript
    interface AssigneePerformance {
        assigneeId: number;
        assigneeName: string;
        assigneePhotoURL: string | null;
        totalTasks: number;
        completedTasks: number;
        completionRate: number;
        avgCompletionTimeHours: number;
        highPriorityTasks: number;
        highPriorityCompleted: number;
        highPriorityCompletionRate: number;
    }

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
                    primaryMetric={report?.summary?.totalEmployees || 0}
                    primaryLabel="Total Employees"
                    secondaryMetric={report?.metrics?.workforce?.activeCount || 0}
                    secondaryLabel="Active Now"
                />
                <SummaryCard
                    title="Tasks"
                    icon={<ClipboardCheck className="w-4 h-4" />}
                    primaryMetric={
                        report?.metrics?.tasks?.comprehensive?.taskTypeDistribution
                            ? Object.values(report.metrics.tasks.comprehensive.taskTypeDistribution).reduce(
                                (sum, type: any) => sum + (type.completedCount || 0),
                                0
                              ) as number
                            : 0
                    }
                    primaryLabel="Completed Today"
                    secondaryMetric={
                        report?.metrics?.tasks?.comprehensive?.taskAging?.IN_PROGRESS?.count || 0
                    }
                    secondaryLabel="In Progress"
                />
                <SummaryCard
                    title="Leads"
                    icon={<Briefcase className="w-4 h-4" />}
                    primaryMetric={report?.metrics?.leads?.newLeadsToday || 0}
                    primaryLabel="Generated Today"
                    secondaryMetric={
                        report?.metrics?.leads?.statusDistribution?.PENDING || 0
                    }
                    secondaryLabel="Pending"
                />
                <SummaryCard
                    title="Sales"
                    icon={<DollarSign className="w-4 h-4" />}
                    primaryMetric={report?.metrics?.sales?.revenueFormatted || "R 0,00"}
                    primaryLabel="Revenue Today"
                    secondaryMetric={report?.metrics?.sales?.quotationsToday || 0}
                    secondaryLabel="Quotations"
                />
                <SummaryCard
                    title="Clients"
                    icon={<UserCheck className="w-4 h-4" />}
                    primaryMetric={report?.metrics?.clients?.interactionsToday || 0}
                    primaryLabel="Interactions Today"
                    secondaryMetric={report?.metrics?.clients?.newClientsToday || 0}
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
                        value="tasks"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        Tasks
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
                        <div className="flex flex-col">
                            <WorkforceHourlyActivityChart
                                data={report?.metrics?.workforce?.hourlyData || []}
                            />
                        </div>
                        <WorkforceProductivityChart data={productivityData} />
                        <LeadsStatusDistributionChart
                            data={statusDistributionData}
                        />
                        <div className="flex flex-col">
                            <SalesHourlyActivityChart
                                data={report?.metrics?.sales?.hourlySales || []}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Workforce Tab */}
                <TabsContent value="workforce" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-col">
                            <WorkforceHourlyActivityChart
                                data={report?.metrics?.workforce?.hourlyData || []}
                            />
                        </div>
                        <WorkforceProductivityChart data={productivityData} />
                    </div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Task Volume Trends */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Task Volume Trends
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Task volume across different time periods
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={taskVolumeTrendsData}
                                        margin={{
                                            top: 10,
                                            right: 30,
                                            left: 0,
                                            bottom: 20,
                                        }}
                                        barSize={25}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={{
                                                stroke: '#e5e7eb',
                                                strokeWidth: 0.5,
                                            }}
                                            tickLine={false}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            dy={16}
                                                            textAnchor="middle"
                                                            fill="#888"
                                                            className="text-[8px] font-body uppercase"
                                                        >
                                                            {payload.value}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis
                                            axisLine={{
                                                stroke: '#e5e7eb',
                                                strokeWidth: 0.5,
                                            }}
                                            tickLine={false}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            x={-5}
                                                            textAnchor="end"
                                                            fill="#888"
                                                            className="text-[8px] font-body uppercase"
                                                        >
                                                            {payload.value}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name} Task Volume
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: '#3b82f6',
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Tasks: {data.value}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                            formatter={(value) => (
                                                <span className="text-[8px] uppercase font-body">
                                                    Task Volume
                                                </span>
                                            )}
                                        />
                                        <Bar
                                            dataKey="value"
                                            name="Tasks"
                                            fill="#3b82f6"
                                            radius={[4, 4, 4, 4]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Task Priority Distribution */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Task Priority Distribution
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Distribution of tasks by priority level
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskPriorityData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            innerRadius={50}
                                            fill="#8884d8"
                                            dataKey="value"
                                            paddingAngle={2}
                                            cornerRadius={4}
                                        >
                                            {taskPriorityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name} Priority
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: data.color,
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Count: {data.value}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: '#93c5fd',
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Percentage: {((data.value / taskPriorityData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            formatter={(value, entry) => (
                                                <span className="text-[8px] uppercase font-body">
                                                    {value}
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Task Completion Rates */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Task Completion Rates
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Completion rates for different time periods
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={taskCompletionRatesData}
                                        margin={{
                                            top: 10,
                                            right: 30,
                                            left: 0,
                                            bottom: 20,
                                        }}
                                        barSize={25}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={{
                                                stroke: '#e5e7eb',
                                                strokeWidth: 0.5,
                                            }}
                                            tickLine={false}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            dy={16}
                                                            textAnchor="middle"
                                                            fill="#888"
                                                            className="text-[8px] font-body uppercase"
                                                        >
                                                            {payload.value}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis
                                            yAxisId="left"
                                            orientation="left"
                                            stroke="#3b82f6"
                                            axisLine={{
                                                stroke: '#e5e7eb',
                                                strokeWidth: 0.5,
                                            }}
                                            tickLine={false}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            x={-5}
                                                            textAnchor="end"
                                                            fill="#888"
                                                            className="text-[8px] font-body uppercase"
                                                        >
                                                            {payload.value}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            stroke="#10b981"
                                            axisLine={{
                                                stroke: '#e5e7eb',
                                                strokeWidth: 0.5,
                                            }}
                                            tickLine={false}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            x={5}
                                                            textAnchor="start"
                                                            fill="#888"
                                                            className="text-[8px] font-body uppercase"
                                                        >
                                                            {payload.value}%
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name} Completion Metrics
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: '#3b82f6',
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Completed: {data.Completed} tasks
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: '#10b981',
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Rate: {data.Rate}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                            formatter={(value) => (
                                                <span className="text-[8px] uppercase font-body">
                                                    {value}
                                                </span>
                                            )}
                                        />
                                        <Bar
                                            yAxisId="left"
                                            dataKey="Completed"
                                            name="Completed Tasks"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                        />
                                        <Bar
                                            yAxisId="right"
                                            dataKey="Rate"
                                            name="Completion Rate (%)"
                                            fill="#10b981"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Task Type Distribution */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Task Type Distribution
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Distribution of tasks by type
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskTypeData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            innerRadius={50}
                                            fill="#8884d8"
                                            dataKey="value"
                                            paddingAngle={2}
                                            cornerRadius={4}
                                        >
                                            {taskTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name.replace(/_/g, ' ')}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: data.color,
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Count: {data.value}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: '#93c5fd',
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Percentage: {((data.value / taskTypeData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            formatter={(value, entry) => (
                                                <span className="text-[8px] uppercase font-body">
                                                    {value.replace(/_/g, ' ')}
                                                </span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Task Aging Analysis */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Task Aging Analysis
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Analysis of task age by status
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={taskAgingData}
                                        margin={{
                                            top: 10,
                                            right: 30,
                                            left: 0,
                                            bottom: 20,
                                        }}
                                        barSize={25}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={{
                                                stroke: '#e5e7eb',
                                                strokeWidth: 0.5,
                                            }}
                                            tickLine={false}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            dy={16}
                                                            textAnchor="middle"
                                                            fill="#888"
                                                            className="text-[8px] font-body uppercase"
                                                        >
                                                            {payload.value}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis
                                            axisLine={{
                                                stroke: '#e5e7eb',
                                                strokeWidth: 0.5,
                                            }}
                                            tickLine={false}
                                            tick={(props) => {
                                                const { x, y, payload } = props;
                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            x={-5}
                                                            textAnchor="end"
                                                            fill="#888"
                                                            className="text-[8px] font-body uppercase"
                                                        >
                                                            {payload.value}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name} Tasks
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: data.color,
                                                                    }}
                                                                />
                                                                <p className="text-[10px] font-normal uppercase font-body">
                                                                    Count: {data.count}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="top"
                                            height={36}
                                            formatter={(value) => (
                                                <span className="text-[8px] uppercase font-body">
                                                    Tasks by Status
                                                </span>
                                            )}
                                        />
                                        <Bar
                                            dataKey="count"
                                            name="Number of Tasks"
                                            radius={[4, 4, 0, 0]}
                                            fill="#F59E0B"
                                        >
                                            {taskAgingData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Assignee Performance Table */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Assignee Performance
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Task performance metrics by assignee
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-auto border rounded h-96 border-border/30 bg-card/50">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="p-2 text-xs font-normal text-left uppercase font-body">Assignee</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Total</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Completed</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Rate</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Avg Time (hrs)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assigneePerformanceData.length > 0 ? (
                                            assigneePerformanceData.map((assignee: AssigneePerformance, index: number) => (
                                                <tr key={index} className="border-b border-border/20">
                                                    <td className="p-2 text-xs font-normal uppercase font-body">
                                                        <div className="flex flex-row items-center justify-start gap-2">
                                                            <Avatar className="w-8 h-8 ring-2 ring-primary">
                                                                {assignee.assigneePhotoURL && (
                                                                    <AvatarImage
                                                                        src={assignee.assigneePhotoURL}
                                                                        alt={assignee.assigneeName}
                                                                    />
                                                                )}
                                                                <AvatarFallback
                                                                    className="bg-black text-white text-[10px] font-body uppercase"
                                                                >
                                                                    {assignee.assigneeName?.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-[10px] font-normal uppercase font-body">
                                                                {assignee.assigneeName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">{assignee.totalTasks}</td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">{assignee.completedTasks}</td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">{assignee.completionRate}%</td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">{assignee.avgCompletionTimeHours}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-xs font-normal text-center uppercase text-muted-foreground font-body">
                                                    No assignee performance data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Leads Tab */}
                <TabsContent value="leads" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-col">
                            <LeadsHourlyActivityChart
                                data={report?.metrics?.leads?.hourlyData || []}
                            />
                        </div>
                        <LeadsStatusDistributionChart
                            data={statusDistributionData}
                        />
                        <LeadsByCategoryChart data={leadsByCategoryData} />

                        {/* Top Lead Generators Table */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Top Lead Generators
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Staff performance for lead generation
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-auto border rounded h-96 border-border/30 bg-card/50">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="p-2 text-xs font-normal text-left uppercase font-body">Staff Member</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Lead Count</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Conversion Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report?.metrics?.leads?.topLeadGenerators?.length > 0 ? (
                                            report.metrics.leads.topLeadGenerators.map((generator: LeadGenerator, index: number) => (
                                                <tr key={index} className="border-b border-border/20">
                                                    <td className="p-2 text-xs font-normal uppercase font-body">
                                                        <div className="flex flex-row items-center justify-start gap-2">
                                                            <Avatar className="w-8 h-8 ring-2 ring-primary">
                                                                <AvatarFallback
                                                                    className="bg-black text-white text-[10px] font-body uppercase"
                                                                >
                                                                    {generator.userName?.split(' ').map((n: string) => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-[10px] font-normal uppercase font-body">
                                                                {generator.userName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">{generator.leadCount}</td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">{generator.conversionRate}%</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-xs font-normal text-center uppercase text-muted-foreground font-body">
                                                    No lead generation data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-col">
                            <SalesHourlyActivityChart
                                data={report?.metrics?.sales?.hourlySales || []}
                            />
                        </div>
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
                    <p className="text-2xl font-semibold font-body">
                        {primaryMetric}
                    </p>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        {primaryLabel}
                    </p>
                </div>
                <div className="mt-4 space-y-1">
                    <p className="text-sm font-medium font-body">
                        {secondaryMetric}
                    </p>
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
