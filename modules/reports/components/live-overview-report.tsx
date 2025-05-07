'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Users,
    ClipboardCheck,
    Briefcase,
    DollarSign,
    UserCheck,
    RefreshCw,
    ShoppingBag,
    Flag,
    Receipt,
    BookOpen,
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
    TopPerformersPieChart,
    AverageOrderValueChart,
    QuotationItemsChart,
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

interface FlaggedTask {
    taskId: number;
    taskTitle: string;
    flagCount: number;
    openFlagCount: number;
}

interface FlagCreator {
    userId: number;
    userName: string;
    userPhotoURL?: string;
    flagCount: number;
    resolvedCount: number;
    resolutionRate: number;
}

interface RecentFlag {
    uid: string;
    title: string;
    status: string;
    createdAt: string;
    description: string;
    creatorName: string;
}

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

interface ClaimCreator {
    userId: number;
    userName: string;
    claimCount: number;
    totalValue: number;
    formattedValue: string;
}

interface Claim {
    uid: number;
    amount: string;
    comments: string;
    status: string;
    category: string;
    createdAt: string;
    ownerName: string;
}

interface JournalCreator {
    userId: number;
    userName: string;
    userPhotoURL?: string;
    journalCount: number;
}

interface Journal {
    uid: number;
    clientRef: string;
    comments: string;
    status: string;
    createdAt: string;
    ownerName: string;
}

interface LiveOverviewReportProps {
    organizationId?: number;
    branchId?: number;
}

export function LiveOverviewReport({
    organizationId,
    branchId,
}: LiveOverviewReportProps) {
    const [activeTab, setActiveTab] = useState('sales');
    const { report, isLoading, error, refreshData } = useLiveOverviewReport({
        organizationId,
        branchId,
    });

    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refreshData();
        setIsRefreshing(false);
    }, [refreshData]);

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
                    onClick={handleRefresh}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
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

    // Prepare task flag status data for pie chart
    const taskFlagStatusData = Object.entries(
        report?.metrics?.tasks?.flags?.statusDistribution || {}
    ).map(([name, value]: [string, any]) => {
        // Map status to colors
        const colorMap: Record<string, string> = {
            OPEN: '#EF4444',
            IN_PROGRESS: '#F59E0B',
            RESOLVED: '#10B981',
            CLOSED: '#9CA3AF',
        };

        return {
            name,
            value: Number(value) || 0,
            color: colorMap[name] || '#9CA3AF',
        };
    }).filter(item => item.value > 0);

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
        // Define a specific color map for known categories
        const categoryColorMap: Record<string, string> = {
            'MEAT_POULTRY': '#EF4444',  // Red
            'SEAFOOD': '#3B82F6',       // Blue
            'DAIRY': '#F59E0B',         // Amber
            'BAKERY': '#F97316',        // Orange
            'PRODUCE': '#10B981',       // Green
            'BEVERAGES': '#06B6D4',     // Cyan
            'SNACKS': '#EC4899',        // Pink
            'CANNED_GOODS': '#9CA3AF',  // Gray
            'FROZEN_FOODS': '#60A5FA',  // Light Blue
            'CLEANING': '#6366F1',      // Indigo
            'PERSONAL_CARE': '#8B5CF6', // Purple
            'OTHER': '#78716C',         // Stone
            'UNCATEGORIZED': '#64748B', // Slate
        };

        // Check if the category exists in our map
        if (categoryColorMap[name]) {
            return categoryColorMap[name];
        }

        // For unknown categories, use the hash-based approach with a better color palette
        const fallbackColors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
            '#6366F1', '#F97316', '#14B8A6', '#A855F7',
            '#D946EF', '#F43F5E', '#0EA5E9', '#22D3EE'
        ];

        // Simple hash function to get consistent color
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return fallbackColors[Math.abs(hash) % fallbackColors.length];
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
            <div className="flex items-center justify-between mb-4" id="live-overview-header">
                <div>
                    <h1 className="text-xl font-normal uppercase font-body">
                        Live Organization Overview
                    </h1>
                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                        Real-time metrics and performance analytics
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        disabled={isLoading || isRefreshing}
                        onClick={handleRefresh}
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        id="live-overview-refresh-button"
                    >
                        {isRefreshing ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" id="live-overview-summary-cards-grid">
                <SummaryCard
                    title="Workforce"
                    icon={<Users className="w-4 h-4" />}
                    primaryMetric={report?.summary?.totalEmployees || 0}
                    primaryLabel="Total Employees"
                    secondaryMetric={report?.metrics?.workforce?.activeCount || 0}
                    secondaryLabel="Active Now"
                    id="live-overview-summary-card-workforce"
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
                    id="live-overview-summary-card-tasks"
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
                    id="live-overview-summary-card-leads"
                />
                <SummaryCard
                    title="Sales"
                    icon={<DollarSign className="w-4 h-4" />}
                    primaryMetric={report?.metrics?.sales?.revenueFormatted || "R 0,00"}
                    primaryLabel="Revenue Today"
                    secondaryMetric={report?.metrics?.sales?.quotationsToday || 0}
                    secondaryLabel="Quotations"
                    id="live-overview-summary-card-sales"
                />
                <SummaryCard
                    title="Clients"
                    icon={<UserCheck className="w-4 h-4" />}
                    primaryMetric={report?.metrics?.clients?.interactionsToday || 0}
                    primaryLabel="Interactions Today"
                    secondaryMetric={report?.metrics?.clients?.newClientsToday || 0}
                    secondaryLabel="New Clients"
                    id="live-overview-summary-card-clients"
                />
            </div>

            {/* Tabs for different sections */}
            <Tabs
                defaultValue="sales"
                value={activeTab}
                onValueChange={setActiveTab}
            >
                <TabsList className="w-full h-auto p-0 bg-transparent rounded-none" id="live-overview-tabs-list">
                    <TabsTrigger
                        value="sales"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-sales"
                    >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Sales
                    </TabsTrigger>
                    <TabsTrigger
                        value="workforce"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-workforce"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Workforce
                    </TabsTrigger>
                    <TabsTrigger
                        value="tasks"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-tasks"
                    >
                        <ClipboardCheck className="w-4 h-4 mr-2" />
                        Tasks
                    </TabsTrigger>
                    <TabsTrigger
                        value="taskflags"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-taskflags"
                    >
                        <Flag className="w-4 h-4 mr-2" />
                        Task Flags
                    </TabsTrigger>
                    <TabsTrigger
                        value="leads"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-leads"
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Leads
                    </TabsTrigger>
                    <TabsTrigger
                        value="products"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-products"
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Products
                    </TabsTrigger>
                    <TabsTrigger
                        value="claims"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-claims"
                    >
                        <Receipt className="w-4 h-4 mr-2" />
                        Claims
                    </TabsTrigger>
                    <TabsTrigger
                        value="journals"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-journals"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Journals
                    </TabsTrigger>
                    <TabsTrigger
                        value="clients"
                        className="px-6 py-2 text-xs font-normal uppercase rounded-none font-body data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                        id="live-overview-tab-trigger-clients"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Clients
                    </TabsTrigger>
                </TabsList>

                {/* Sales Tab */}
                <TabsContent value="sales" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="flex flex-col">
                            <SalesHourlyActivityChart
                                data={report?.metrics?.sales?.hourlySales || []}
                            />
                        </div>
                        <WeeklyRevenueChart data={weeklyRevenueData} />
                        <TopPerformersPieChart
                            data={report?.metrics?.sales?.topPerformers || []}
                        />
                        <AverageOrderValueChart
                            quotationsData={[
                                ...(report?.metrics?.sales?.recentQuotations || []),
                                ...(report?.metrics?.sales?.pendingQuotations || [])
                            ]}
                        />
                        <QuotationItemsChart
                            quotationsData={report?.metrics?.sales?.recentQuotations || []}
                        />
                    </div>
                </TabsContent>

                {/* Workforce Tab */}
                <TabsContent value="workforce-tab" className="pt-6">
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
                                                    const data = payload[0].payload as { name: string; value: number; color: string };
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
                                                    const data = payload[0].payload as { name: string; value: number; color: string };
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
                                            formatter={(value, entry) => {
                                                return (
                                                    <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                        {value}
                                                    </span>
                                                );
                                            }}
                                            iconSize={10}
                                            layout="horizontal"
                                            margin={{ top: 10 }}
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
                                                    const data = payload[0].payload as {
                                                        name: string;
                                                        Completed: number;
                                                        Rate: number;
                                                    };
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
                                            stroke="transparent"
                                        >
                                            {taskTypeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload as { name: string; value: number; color: string };
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name.replace(/_/g, ' ')}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: '#3b82f6',
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
                                            formatter={(value, entry) => {
                                                return (
                                                    <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                        {value}
                                                    </span>
                                                );
                                            }}
                                            iconSize={10}
                                            layout="horizontal"
                                            margin={{ top: 10 }}
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
                                                    const data = payload[0].payload as { name: string; count: number; color: string };
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name} Tasks
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: '#3b82f6',
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

                {/* Task Flags Tab */}
                <TabsContent value="taskflags" className="pt-6">
                    <div className="space-y-6">
                        <h2 className="text-lg font-normal uppercase font-body">Task Flags</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Total Flags</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.tasks?.flags?.totalFlags || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold text-primary">
                                                    {report?.metrics?.tasks?.flags?.flagsToday || 0}
                                                </span>{' '}
                                                today
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Open Flags</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.tasks?.flags?.openFlags || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold text-amber-500">
                                                    {report?.metrics?.tasks?.flags?.inProgressFlags || 0}
                                                </span>{' '}
                                                in progress
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Resolved Flags</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.tasks?.flags?.resolvedFlags || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold text-green-500">
                                                    {report?.metrics?.tasks?.flags?.closedFlags || 0}
                                                </span>{' '}
                                                closed
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Avg. Resolution Time</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">
                                                {report?.metrics?.tasks?.flags?.averageResolutionHours || 0}
                                                <span className="text-xs font-normal uppercase text-muted-foreground font-body"> hrs</span>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                            {/* Flag Status Distribution */}
                            <Card className="col-span-1 shadow-sm bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Flag Status Distribution
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Distribution of flags by status
                                    </p>
                                </CardHeader>
                                <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={taskFlagStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                                cornerRadius={4}
                                                labelLine={false}
                                            >
                                                {taskFlagStatusData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        stroke="transparent"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload as { name: string; value: number; color: string };
                                                        return (
                                                            <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                                <p className="text-xs font-normal uppercase font-body">
                                                                    {data.name}
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
                                                                        Percentage: {((data.value / taskFlagStatusData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend
                                                formatter={(value, entry) => {
                                                    return (
                                                        <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                            {value}
                                                        </span>
                                                    );
                                                }}
                                                iconSize={10}
                                                layout="horizontal"
                                                margin={{ top: 10 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Most Flagged Tasks */}
                            <Card className="col-span-1 shadow-sm bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Most Flagged Tasks
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4 overflow-hidden">
                                        {report?.metrics?.tasks?.flags?.mostFlaggedTasks?.length ? (
                                            report.metrics.tasks.flags.mostFlaggedTasks.map((task: FlaggedTask) => (
                                                <div
                                                    key={task.taskId}
                                                    className="flex items-center justify-between p-3 transition-colors border rounded hover:bg-accent/10 border-border/30"
                                                >
                                                    <div className="flex-1 pr-4 overflow-hidden">
                                                        <p className="overflow-hidden text-xs font-medium whitespace-nowrap text-ellipsis font-body">
                                                            {task.taskTitle}
                                                        </p>
                                                        <p className="text-xs uppercase text-muted-foreground font-body">
                                                            Task #{task.taskId}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <p className="text-xs font-medium font-body">{task.flagCount}</p>
                                                            <p className="text-xs uppercase text-muted-foreground font-body">Flags</p>
                                                        </div>
                                                        {task.openFlagCount > 0 && (
                                                            <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-red-500 rounded-full font-body">
                                                                {task.openFlagCount}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-center uppercase text-muted-foreground font-body">No flagged tasks found</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Flag Creators */}
                            <Card className="col-span-1 shadow-sm bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Top Flag Creators
                                    </h3>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4 overflow-hidden">
                                        {report?.metrics?.tasks?.flags?.topFlagCreators?.length ? (
                                            report.metrics.tasks.flags.topFlagCreators.map((user: FlagCreator) => (
                                                <div
                                                    key={user.userId}
                                                    className="flex items-center justify-between p-3 transition-colors border rounded hover:bg-accent/10 border-border/30"
                                                >
                                                    <div className="flex items-center flex-1 pr-4 overflow-hidden">
                                                        <Avatar className="w-6 h-6 mr-3">
                                                            <AvatarImage src={user.userPhotoURL} alt={user.userName} />
                                                            <AvatarFallback className="bg-black text-white text-[10px] font-body uppercase">
                                                                {user.userName.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="overflow-hidden">
                                                            <p className="overflow-hidden text-xs font-medium whitespace-nowrap text-ellipsis font-body">
                                                                {user.userName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-right">
                                                            <p className="text-xs font-medium font-body">{user.flagCount}</p>
                                                            <p className="text-xs uppercase text-muted-foreground font-body">Flags</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-medium font-body">{user.resolutionRate}%</p>
                                                            <p className="text-xs uppercase text-muted-foreground font-body">Resolved</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-center uppercase text-muted-foreground font-body">No flag creators found</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Flags */}
                        <Card className="mt-6 shadow-sm bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-xs font-normal uppercase font-body">
                                    Recent Flags
                                </h3>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">ID</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Title</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Description</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Status</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Created</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Creator</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {report?.metrics?.tasks?.flags?.recentFlags?.length ? (
                                                report.metrics.tasks.flags.recentFlags.map((flag: RecentFlag) => (
                                                    <tr key={flag.uid} className="hover:bg-accent/5">
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">{flag.uid}</td>
                                                        <td className="px-4 py-3 text-xs font-medium whitespace-nowrap font-body">{flag.title}</td>
                                                        <td className="max-w-xs px-4 py-3 text-xs truncate font-body">{flag.description}</td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">
                                                            <span
                                                                className={`text-xs font-normal uppercase font-body ${
                                                                    flag.status === 'OPEN'
                                                                        ? 'text-red-700 dark:text-red-400'
                                                                        : flag.status === 'IN_PROGRESS'
                                                                        ? 'text-amber-700 dark:text-amber-400'
                                                                        : flag.status === 'RESOLVED'
                                                                        ? 'text-green-700 dark:text-green-400'
                                                                        : 'text-gray-700 dark:text-gray-400'
                                                                }`}
                                                            >
                                                                {flag.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">
                                                            {new Date(flag.createdAt).toLocaleString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">{flag.creatorName}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-6 text-xs text-center font-body text-muted-foreground">
                                                        No recent flags found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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

                {/* Products Tab */}
                <TabsContent value="products" className="pt-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Product Category Distribution */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Product Category Distribution
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Distribution of products by category
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(report?.metrics?.products?.categoryDistribution || {}).map(([name, value]) => ({
                                                name,
                                                value: Number(value),
                                                fill: getColorForIndex(name) // Use fill property directly
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            innerRadius={50}
                                            dataKey="value"
                                            nameKey="name"
                                            paddingAngle={2}
                                            cornerRadius={4}
                                            stroke="transparent"
                                        >
                                            {/* No Cell components needed, using fill in the data */}
                                        </Pie>
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload as { name: string; value: number; fill: string };
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: data.fill,
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
                                                                    Percentage: {((data.value / Object.values(report?.metrics?.products?.categoryDistribution || {}).reduce((sum: number, val: unknown) => sum + Number(val as number), 0)) * 100).toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            formatter={(value, entry) => {
                                                return (
                                                    <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                        {value}
                                                    </span>
                                                );
                                            }}
                                            iconSize={10}
                                            layout="horizontal"
                                            margin={{ top: 10 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Product Status Distribution */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Product Status Distribution
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Distribution of products by status
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(report?.metrics?.products?.statusDistribution || {}).map(([name, value]) => ({
                                                name,
                                                value: Number(value)
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            innerRadius={50}
                                            dataKey="value"
                                            nameKey="name"
                                            paddingAngle={2}
                                            cornerRadius={4}
                                        >
                                            {Object.entries(report?.metrics?.products?.statusDistribution || {}).map(([name, value], index) => {
                                                // Define the color map for status
                                                const colorMap: Record<string, string> = {
                                                    'active': '#10B981',       // Green
                                                    'new': '#3B82F6',          // Blue
                                                    'outofstock': '#EF4444',   // Red
                                                    'bestseller': '#8B5CF6',  // Purple
                                                    'inactive': '#9CA3AF',     // Gray
                                                    'discontinued': '#F59E0B', // Amber
                                                    'hotdeals': '#F97316',     // Orange
                                                    'special': '#EC4899',      // Pink
                                                    'hidden': '#64748B',       // Slate
                                                    'deleted': '#7F1D1D'       // Dark Red
                                                };

                                                return (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={colorMap[name] || '#9CA3AF'}
                                                        stroke="transparent"
                                                    />
                                                );
                                            })}
                                        </Pie>
                                        <Tooltip
                                            cursor={false}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload as { name: string; value: number };
                                                    // Define the color map for tooltip consistency
                                                    const colorMap: Record<string, string> = {
                                                        'active': '#10B981',       // Green
                                                        'new': '#3B82F6',          // Blue
                                                        'outofstock': '#EF4444',   // Red
                                                        'bestseller': '#8B5CF6',  // Purple
                                                        'inactive': '#9CA3AF',     // Gray
                                                        'discontinued': '#F59E0B', // Amber
                                                        'hotdeals': '#F97316',     // Orange
                                                        'special': '#EC4899',      // Pink
                                                        'hidden': '#64748B',       // Slate
                                                        'deleted': '#7F1D1D'       // Dark Red
                                                    };
                                                    return (
                                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                            <p className="text-xs font-normal uppercase font-body">
                                                                {data.name}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor: colorMap[data.name] || '#9CA3AF',
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
                                                                    Percentage: {((data.value / Object.values(report?.metrics?.products?.statusDistribution || {}).reduce((sum: number, val: unknown) => sum + Number(val as number), 0)) * 100).toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend
                                            formatter={(value, entry) => {
                                                return (
                                                    <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                        {value}
                                                    </span>
                                                );
                                            }}
                                            iconSize={10}
                                            layout="horizontal"
                                            margin={{ top: 10 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Top Performing Products */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Top Performing Products
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Products with highest revenue and sales
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-auto border rounded h-96 border-border/30 bg-card/50">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr>
                                            <th className="p-2 text-xs font-normal text-left uppercase font-body">Product</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Revenue</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Units Sold</th>
                                            <th className="p-2 text-xs font-normal text-right uppercase font-body">Profit Margin</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report?.metrics?.products?.topPerformingProducts?.length > 0 ? (
                                            report.metrics.products.topPerformingProducts.map((product: any, index: number) => (
                                                <tr key={index} className="border-b border-border/20">
                                                    <td className="p-2 text-xs font-normal uppercase font-body">
                                                        <div className="flex flex-row items-center justify-start gap-2">
                                                            <span className="text-[10px] font-normal uppercase font-body">
                                                                {product.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">
                                                        R {product.totalRevenue.toLocaleString()}
                                                    </td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">
                                                        {product.totalUnitsSold}
                                                    </td>
                                                    <td className="p-2 text-xs font-normal text-right uppercase font-body">
                                                        {product.profitMargin}%
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-xs font-normal text-center uppercase text-muted-foreground font-body">
                                                    No product performance data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Inventory Value & Stats */}
                        <Card className="border shadow-sm border-border/60 bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-sm font-normal uppercase font-body">
                                    Inventory Overview
                                </h3>
                                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                                    Current inventory status and metrics
                                </p>
                            </CardHeader>
                            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="p-4 border rounded-md">
                                        <h4 className="mb-2 text-xs font-normal uppercase font-body">Total Products</h4>
                                        <p className="text-xl font-semibold">{report?.metrics?.products?.totalProductsCount || 0}</p>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">Active</span>
                                                <span className="text-xs font-semibold font-body">{report?.metrics?.products?.activeProductsCount || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">Out of Stock</span>
                                                <span className="text-xs font-semibold font-body">{report?.metrics?.products?.outOfStockCount || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">New Products</span>
                                                <span className="text-xs font-semibold font-body">{report?.metrics?.products?.newProductsCount || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">Best Sellers</span>
                                                <span className="text-xs font-semibold font-body">{report?.metrics?.products?.bestSellersCount || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border rounded-md">
                                        <h4 className="mb-2 text-xs font-normal uppercase font-body">Inventory Value</h4>
                                        <p className="text-xl font-semibold font-body">R {(report?.metrics?.products?.inventoryValue || 0).toLocaleString()}</p>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">Total Units</span>
                                                <span className="text-xs font-semibold font-body">{report?.metrics?.products?.analytics?.totalUnitsSold || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">Avg. Profit Margin</span>
                                                <span className="text-xs font-semibold font-body">{(report?.metrics?.products?.analytics?.averageProfitMargin || 0).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">Stock Turnover</span>
                                                <span className="text-xs font-semibold font-body">{(report?.metrics?.products?.analytics?.averageStockTurnover || 0).toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs uppercase font-body">Return Rate</span>
                                                <span className="text-xs font-semibold font-body">{(report?.metrics?.products?.analytics?.returnRate || 0).toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Low Stock Alerts */}
                                <div className="mt-6">
                                    <h4 className="mb-2 text-xs font-normal uppercase font-body">Low Stock Alerts</h4>
                                    <div className="overflow-auto max-h-36">
                                        <table className="w-full text-xs">
                                            <thead className="border-b">
                                                <tr>
                                                    <th className="p-1 text-xs font-normal text-left uppercase font-body">Product</th>
                                                    <th className="p-1 text-xs font-normal text-right uppercase font-body">Current</th>
                                                    <th className="p-1 text-xs font-normal text-right uppercase font-body">Reorder At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report?.metrics?.products?.lowStockAlerts?.length > 0 ? (
                                                    report.metrics.products.lowStockAlerts.map((product: any, index: number) => (
                                                        <tr key={index} className="border-b border-border/20">
                                                            <td className="p-1 text-[10px] font-normal uppercase font-body">
                                                                {product.name}
                                                            </td>
                                                            <td className="p-1 text-[10px] font-normal text-right uppercase font-body">
                                                                <span className={product.currentStock === 0 ? "text-red-500" : "text-amber-500"}>
                                                                    {product.currentStock}
                                                                </span>
                                                            </td>
                                                            <td className="p-1 text-[10px] font-normal text-right uppercase font-body">
                                                                {product.reorderPoint}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="p-1 text-[10px] font-normal text-center uppercase text-muted-foreground font-body">
                                                            No low stock alerts
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Claims Tab */}
                <TabsContent value="claims" className="pt-6">
                    <div className="space-y-6">
                        <h2 className="text-lg font-normal uppercase font-body">Claims Overview</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Total Claims</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold font-body">{report?.metrics?.claims?.totalClaims || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold text-primary">
                                                    {report?.metrics?.claims?.claimsToday || 0}
                                                </span>{' '}
                                                today
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Pending Claims</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold font-body">{report?.metrics?.claims?.statusDistribution?.pending || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">awaiting review</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Approved Claims</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold font-body">{report?.metrics?.claims?.statusDistribution?.approved || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">ready for payment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Total Value</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold font-body">{report?.metrics?.claims?.totalClaimAmountFormatted || 'R 0.00'}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">all claims</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Claims Status Distribution */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Claims Status Distribution
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Distribution of claims by status
                                    </p>
                                </CardHeader>
                                <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(report?.metrics?.claims?.statusDistribution || {}).map(([name, value]) => {
                                                    // Map status to colors
                                                    const colorMap: Record<string, string> = {
                                                        'pending': '#F59E0B',    // Amber
                                                        'approved': '#10B981',   // Green
                                                        'rejected': '#EF4444',   // Red
                                                        'paid': '#3B82F6',       // Blue
                                                        'cancelled': '#9CA3AF',  // Gray
                                                        'declined': '#F43F5E',   // Rose
                                                        'deleted': '#6B7280',    // Gray
                                                    };

                                                    return {
                                                        name: name.charAt(0).toUpperCase() + name.slice(1),
                                                        value: Number(value),
                                                        color: colorMap[name] || '#9CA3AF',
                                                    };
                                                })}
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
                                                {Object.entries(report?.metrics?.claims?.statusDistribution || {}).map(([name, value], index) => {
                                                    const colorMap: Record<string, string> = {
                                                        'pending': '#F59E0B',    // Amber
                                                        'approved': '#10B981',   // Green
                                                        'rejected': '#EF4444',   // Red
                                                        'paid': '#3B82F6',       // Blue
                                                        'cancelled': '#9CA3AF',  // Gray
                                                        'declined': '#F43F5E',   // Rose
                                                        'deleted': '#6B7280',    // Gray
                                                    };
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={colorMap[name] || '#9CA3AF'}
                                                            stroke="transparent"
                                                        />
                                                    );
                                                })}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload as { name: string; value: number; color: string };
                                                        return (
                                                            <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                                <p className="text-xs font-normal uppercase font-body">
                                                                    {data.name}
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
                                                                        Percentage: {((data.value / Object.values(report?.metrics?.claims?.statusDistribution || {}).reduce((sum: number, val: unknown) => sum + Number(val as number), 0)) * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend
                                                formatter={(value, entry) => {
                                                    return (
                                                        <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                            {value}
                                                        </span>
                                                    );
                                                }}
                                                iconSize={10}
                                                layout="horizontal"
                                                margin={{ top: 10 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Claims Category Distribution */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Claims Category Distribution
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Distribution of claims by category
                                    </p>
                                </CardHeader>
                                <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(report?.metrics?.claims?.categoryDistribution || {})
                                                    .filter(([_, value]) => Number(value) > 0)
                                                    .map(([name, value], index) => {
                                                        return {
                                                            name: name.charAt(0).toUpperCase() + name.slice(1),
                                                            value: Number(value),
                                                            color: getColorForIndex(name),
                                                        };
                                                    })}
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
                                                {Object.entries(report?.metrics?.claims?.categoryDistribution || {})
                                                    .filter(([_, value]) => Number(value) > 0)
                                                    .map(([name, value], index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={getColorForIndex(name)}
                                                            stroke="transparent"
                                                        />
                                                    ))}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload as { name: string; value: number; color: string };
                                                        return (
                                                            <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                                <p className="text-xs font-normal uppercase font-body">
                                                                    {data.name}
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
                                                                        Percentage: {((data.value / Object.values(report?.metrics?.claims?.categoryDistribution || {}).reduce((sum: number, val: unknown) => sum + Number(val as number), 0)) * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend
                                                formatter={(value, entry) => {
                                                    return (
                                                        <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                            {value}
                                                        </span>
                                                    );
                                                }}
                                                iconSize={10}
                                                layout="horizontal"
                                                margin={{ top: 10 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Claim Creators & Recent Claims */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Top Claim Creators */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Top Claim Creators
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Top claim creators by count and value
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4 overflow-auto border rounded h-96 border-border/30 bg-card/50">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr>
                                                <th className="p-2 text-xs font-normal text-left uppercase font-body">Staff Member</th>
                                                <th className="p-2 text-xs font-normal text-right uppercase font-body">Claims</th>
                                                <th className="p-2 text-xs font-normal text-right uppercase font-body">Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report?.metrics?.claims?.topClaimCreators?.length > 0 ? (
                                                report.metrics.claims.topClaimCreators.map((creator: ClaimCreator, index: number) => (
                                                    <tr key={index} className="border-b border-border/20">
                                                        <td className="p-2 text-xs font-normal uppercase font-body">
                                                            <div className="flex flex-row items-center justify-start gap-2">
                                                                <Avatar className="w-8 h-8 ring-2 ring-primary">
                                                                    <AvatarFallback
                                                                        className="bg-black text-white text-[10px] font-body uppercase"
                                                                    >
                                                                        {creator.userName?.split(' ').map((n: string) => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-[10px] font-normal uppercase font-body">
                                                                    {creator.userName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-xs font-normal text-right uppercase font-body">{creator.claimCount}</td>
                                                        <td className="p-2 text-xs font-normal text-right uppercase font-body">{creator.formattedValue}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="p-4 text-xs font-normal text-center uppercase text-muted-foreground font-body">
                                                        No claim creator data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>

                            {/* Recent Claims */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Recent Claims
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Most recently submitted claims
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4 overflow-auto border rounded h-96 border-border/30 bg-card/50">
                                    <div className="space-y-4">
                                        {report?.metrics?.claims?.recentClaims?.length > 0 ? (
                                            report.metrics.claims.recentClaims.map((claim: Claim) => (
                                                <div
                                                    key={claim.uid}
                                                    className="p-4 border rounded-md shadow-sm"
                                                >
                                                    <div className="flex justify-between mb-2">
                                                        <div>
                                                            <span className="text-xs uppercase text-muted-foreground font-body">Claim #{claim.uid}</span>
                                                            <h4 className="text-xs font-medium uppercase font-body">{claim.category.charAt(0).toUpperCase() + claim.category.slice(1)} Claim</h4>
                                                        </div>
                                                        <span
                                                            className={`text-xs font-normal uppercase font-body ${
                                                                claim.status === 'pending'
                                                                    ? 'text-amber-700 dark:text-amber-400'
                                                                    : claim.status === 'approved'
                                                                    ? 'text-green-700 dark:text-green-400'
                                                                    : claim.status === 'paid'
                                                                    ? 'text-blue-700 dark:text-blue-400'
                                                                    : claim.status === 'rejected' || claim.status === 'declined'
                                                                    ? 'text-red-700 dark:text-red-400'
                                                                    : 'text-gray-700 dark:text-gray-400'
                                                            }`}
                                                        >
                                                            {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                                        <div>
                                                            <p className="text-xs uppercase text-muted-foreground font-body">Amount</p>
                                                            <p className="text-xs font-semibold font-body">R {Number(claim.amount).toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs uppercase text-muted-foreground font-body">Created By</p>
                                                            <p className="text-xs font-body">{claim.ownerName}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-xs uppercase text-muted-foreground font-body">Created</p>
                                                        <p className="text-xs font-body">
                                                            {new Date(claim.createdAt).toLocaleString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    {claim.comments && (
                                                        <div className="pt-3 mt-3 border-t">
                                                            <p className="text-xs uppercase text-muted-foreground font-body">Comments</p>
                                                            <p className="text-xs font-body">{claim.comments}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-sm uppercase text-muted-foreground font-body">No recent claims found</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Journals Tab */}
                <TabsContent value="journals" className="pt-6">
                    <div className="space-y-6">
                        <h2 className="text-lg font-normal uppercase font-body">Journals</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Total Journals</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.journals?.totalJournals || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold text-primary">
                                                    {report?.metrics?.journals?.journalsToday || 0}
                                                </span>{' '}
                                                today
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Published Journals</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.journals?.statusDistribution?.PUBLISHED || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Rejected Journals</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.journals?.statusDistribution?.REJECTED || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Journal Status Distribution */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Journal Status Distribution
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Distribution of journals by status
                                    </p>
                                </CardHeader>
                                <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(report?.metrics?.journals?.statusDistribution || {}).map(([name, value]) => {
                                                    // Map status to colors
                                                    const colorMap: Record<string, string> = {
                                                        'PUBLISHED': '#10B981',  // Green
                                                        'REJECTED': '#EF4444',   // Red
                                                        'PENDING': '#F59E0B',    // Amber
                                                        'DRAFT': '#3B82F6',      // Blue
                                                    };

                                                    return {
                                                        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
                                                        value: Number(value),
                                                        color: colorMap[name] || '#9CA3AF',
                                                    };
                                                })}
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
                                                {Object.entries(report?.metrics?.journals?.statusDistribution || {}).map(([name, value], index) => {
                                                    const colorMap: Record<string, string> = {
                                                        'PUBLISHED': '#10B981',  // Green
                                                        'REJECTED': '#EF4444',   // Red
                                                        'PENDING': '#F59E0B',    // Amber
                                                        'DRAFT': '#3B82F6',      // Blue
                                                    };
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={colorMap[name] || '#9CA3AF'}
                                                            stroke="transparent"
                                                        />
                                                    );
                                                })}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload as { name: string; value: number; color: string };
                                                        return (
                                                            <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                                <p className="text-xs font-normal uppercase font-body">
                                                                    {data.name}
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
                                                                        Percentage: {((data.value / Object.values(report?.metrics?.journals?.statusDistribution || {}).reduce((sum: number, val: unknown) => sum + Number(val as number), 0)) * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend
                                                formatter={(value, entry) => {
                                                    return (
                                                        <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                            {value}
                                                        </span>
                                                    );
                                                }}
                                                iconSize={10}
                                                layout="horizontal"
                                                margin={{ top: 10 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Top Journal Creators */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Top Journal Creators
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Employees with the most journal entries
                                    </p>
                                </CardHeader>
                                <CardContent className="p-4 overflow-auto border rounded h-96 border-border/30 bg-card/50">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr>
                                                <th className="p-2 text-xs font-normal text-left uppercase font-body">Creator</th>
                                                <th className="p-2 text-xs font-normal text-right uppercase font-body">Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report?.metrics?.journals?.topCreators?.length > 0 ? (
                                                report.metrics.journals.topCreators.map((creator: JournalCreator, index: number) => (
                                                    <tr key={index} className="border-b border-border/20">
                                                        <td className="p-2 text-xs font-normal font-body">
                                                            <div className="flex flex-row items-center justify-start gap-2">
                                                                <Avatar className="w-6 h-6 ring-2 ring-primary">
                                                                    {creator.userPhotoURL && (
                                                                        <AvatarImage
                                                                            src={creator.userPhotoURL}
                                                                            alt={creator.userName}
                                                                        />
                                                                    )}
                                                                    <AvatarFallback
                                                                        className="bg-black text-white text-[10px] font-body uppercase"
                                                                    >
                                                                        {creator.userName?.split(' ').map((n: string) => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-[10px] font-normal font-body">
                                                                    {creator.userName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="p-2 text-xs font-normal text-right font-body">{creator.journalCount}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2} className="p-4 text-xs font-normal text-center text-muted-foreground font-body">
                                                        No journal creator data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Journals */}
                        <Card className="mt-6 shadow-sm bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-xs font-normal uppercase font-body">
                                    Recent Journals
                                </h3>
                                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                    Most recent journal entries
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-auto border rounded h-96 border-border/30 bg-card/50">
                                <div className="space-y-4">
                                    {report?.metrics?.journals?.recentJournals?.length > 0 ? (
                                        report.metrics.journals.recentJournals.map((journal: Journal) => (
                                            <div
                                                key={journal.uid}
                                                className="p-4 border rounded-md shadow-sm"
                                            >
                                                <div className="flex justify-between mb-2">
                                                    <div>
                                                        <span className="text-xs uppercase text-muted-foreground font-body">Journal #{journal.uid}</span>
                                                        <h4 className="text-xs font-medium uppercase font-body">{journal.clientRef}</h4>
                                                    </div>
                                                    <span
                                                        className={`text-xs font-normal uppercase font-body ${
                                                            journal.status === 'PUBLISHED'
                                                                ? 'text-green-700 dark:text-green-400'
                                                                : journal.status === 'REJECTED'
                                                                ? 'text-red-700 dark:text-red-400'
                                                                : journal.status === 'PENDING'
                                                                ? 'text-amber-700 dark:text-amber-400'
                                                                : 'text-gray-700 dark:text-gray-400'
                                                            }`}
                                                    >
                                                        {journal.status.charAt(0).toUpperCase() + journal.status.slice(1).toLowerCase()}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-2">
                                                    <div>
                                                        <p className="text-xs uppercase text-muted-foreground font-body">Created</p>
                                                        <p className="text-xs font-body">
                                                            {new Date(journal.createdAt).toLocaleString(undefined, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs uppercase text-muted-foreground font-body">Created By</p>
                                                        <p className="text-xs font-body">{journal.ownerName}</p>
                                                    </div>
                                                </div>
                                                {journal.comments && (
                                                    <div className="pt-3 mt-3 border-t">
                                                        <p className="text-xs uppercase text-muted-foreground font-body">Comments</p>
                                                        <p className="text-xs font-body">{journal.comments}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-sm uppercase text-muted-foreground font-body">No recent journals found</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Clients Tab */}
                <TabsContent value="clients" className="pt-6">
                    <div className="space-y-6">
                        <h2 className="text-lg font-normal uppercase font-body">Clients Overview</h2>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Total Clients</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.clients?.totalClientCount || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold text-primary">
                                                    {report?.metrics?.clients?.newClientsToday || 0}
                                                </span>{' '}
                                                new today
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Active Clients</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.clients?.activeClientsCount || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                {(report?.metrics?.clients?.totalClientCount > 0)
                                                    ? `${(report?.metrics?.clients?.activeClientsCount / report?.metrics?.clients?.totalClientCount * 100).toFixed(0)}%`
                                                    : '0%'}
                                                of total
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Today's Interactions</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.clients?.interactionsToday || 0}</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold">
                                                    {report?.metrics?.clients?.uniqueClientsCount || 0}
                                                </span>{' '}
                                                unique clients
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm bg-card">
                                <CardContent className="p-6">
                                    <div className="flex flex-col space-y-2">
                                        <h3 className="text-xs font-normal uppercase font-body">Engagement Rate</h3>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-semibold uppercase font-body">{report?.metrics?.clients?.clientEngagementRate || 0}%</p>
                                            <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                                                <span className="font-semibold">
                                                    {report?.metrics?.clients?.newClientsLast30Days || 0}
                                                </span>{' '}
                                                new in 30d
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Client Category Distribution */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Client Category Distribution
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Distribution of clients by category
                                    </p>
                                </CardHeader>
                                <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(report?.metrics?.clients?.clientsByCategory || {}).map(([name, value]) => {
                                                    // Generate color based on category name for consistency
                                                    const colorMap: Record<string, string> = {
                                                        'software': '#3B82F6',   // Blue
                                                        'contract': '#10B981',   // Green
                                                        'retail': '#F59E0B',     // Amber
                                                        'service': '#8B5CF6',    // Purple
                                                        'manufacturing': '#EC4899', // Pink
                                                        'consulting': '#06B6D4',  // Cyan
                                                        'other': '#9CA3AF',      // Gray
                                                    };

                                                    return {
                                                        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
                                                        value: Number(value),
                                                        color: colorMap[name.toLowerCase()] || getColorForIndex(name)
                                                    };
                                                })}
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
                                                {Object.entries(report?.metrics?.clients?.clientsByCategory || {}).map(([name, value], index) => {
                                                    const colorMap: Record<string, string> = {
                                                        'software': '#3B82F6',   // Blue
                                                        'contract': '#10B981',   // Green
                                                        'retail': '#F59E0B',     // Amber
                                                        'service': '#8B5CF6',    // Purple
                                                        'manufacturing': '#EC4899', // Pink
                                                        'consulting': '#06B6D4',  // Cyan
                                                        'other': '#9CA3AF',      // Gray
                                                    };
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={colorMap[name.toLowerCase()] || getColorForIndex(name)}
                                                            stroke="transparent"
                                                        />
                                                    );
                                                })}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload as { name: string; value: number; color: string };
                                                        return (
                                                            <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                                <p className="text-xs font-normal uppercase font-body">
                                                                    {data.name}
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
                                                                        Percentage: {((data.value / Object.values(report?.metrics?.clients?.clientsByCategory || {}).reduce((sum: number, val: unknown) => sum + Number(val as number), 0)) * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend
                                                formatter={(value, entry) => {
                                                    return (
                                                        <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                            {value}
                                                        </span>
                                                    );
                                                }}
                                                iconSize={10}
                                                layout="horizontal"
                                                margin={{ top: 10 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Client Risk Distribution */}
                            <Card className="border shadow-sm border-border/60 bg-card">
                                <CardHeader className="pb-2">
                                    <h3 className="text-xs font-normal uppercase font-body">
                                        Client Risk Distribution
                                    </h3>
                                    <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                        Distribution of clients by risk level
                                    </p>
                                </CardHeader>
                                <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={Object.entries(report?.metrics?.clients?.clientsByRiskLevel || {}).map(([name, value]) => {
                                                    // Map risk levels to colors
                                                    const colorMap: Record<string, string> = {
                                                        'low': '#10B981',        // Green
                                                        'medium': '#F59E0B',     // Amber
                                                        'high': '#EF4444',       // Red
                                                        'critical': '#7F1D1D',   // Dark Red
                                                    };

                                                    return {
                                                        name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
                                                        value: Number(value),
                                                        color: colorMap[name.toLowerCase()] || '#9CA3AF'
                                                    };
                                                })}
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
                                                {Object.entries(report?.metrics?.clients?.clientsByRiskLevel || {}).map(([name, value], index) => {
                                                    const colorMap: Record<string, string> = {
                                                        'low': '#10B981',        // Green
                                                        'medium': '#F59E0B',     // Amber
                                                        'high': '#EF4444',       // Red
                                                        'critical': '#7F1D1D',   // Dark Red
                                                    };
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={colorMap[name.toLowerCase()] || '#9CA3AF'}
                                                            stroke="transparent"
                                                        />
                                                    );
                                                })}
                                            </Pie>
                                            <Tooltip
                                                cursor={false}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload as { name: string; value: number; color: string };
                                                        return (
                                                            <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                                                <p className="text-xs font-normal uppercase font-body">
                                                                    {data.name} Risk
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
                                                                        Percentage: {((data.value / Object.values(report?.metrics?.clients?.clientsByRiskLevel || {}).reduce((sum: number, val: unknown) => sum + Number(val as number), 0)) * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Legend
                                                formatter={(value, entry) => {
                                                    return (
                                                        <span className="text-[10px] uppercase font-body" style={{ color: entry.color }}>
                                                            {value}
                                                        </span>
                                                    );
                                                }}
                                                iconSize={10}
                                                layout="horizontal"
                                                margin={{ top: 10 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Clients */}
                        <Card className="shadow-sm bg-card">
                            <CardHeader className="pb-2">
                                <h3 className="text-xs font-normal uppercase font-body">
                                    Recent Clients
                                </h3>
                                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                                    Most recently added clients
                                </p>
                            </CardHeader>
                            <CardContent className="p-4 overflow-auto">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Name</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Contact</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Email</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Phone</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Status</th>
                                                <th className="px-4 py-3 text-xs font-normal text-left uppercase text-muted-foreground font-body">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {report?.metrics?.clients?.recentClients?.length ? (
                                                report.metrics.clients.recentClients.map((client: any) => (
                                                    <tr key={client.id} className="hover:bg-accent/5">
                                                        <td className="px-4 py-3 text-xs font-medium whitespace-nowrap font-body">{client.name}</td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">{client.contactPerson}</td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">{client.email}</td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">{client.phone}</td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">
                                                            <span
                                                                className={`text-xs font-normal uppercase font-body ${
                                                                    client.status === 'active'
                                                                        ? 'text-green-700 dark:text-green-400'
                                                                        : client.status === 'inactive'
                                                                        ? 'text-amber-700 dark:text-amber-400'
                                                                        : 'text-gray-700 dark:text-gray-400'
                                                                }`}
                                                            >
                                                                {client.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs whitespace-nowrap font-body">
                                                            {client.createdAt}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-6 text-xs text-center font-body text-muted-foreground">
                                                        No recent clients found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
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
    id,
}: {
    title: string;
    icon: React.ReactNode;
    primaryMetric: number | string;
    primaryLabel: string;
    secondaryMetric: number | string;
    secondaryLabel: string;
    id?: string;
}) {
    return (
        <Card id={id}>
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
