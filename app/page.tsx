'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
    Calendar as CalendarIcon,
    TrendingUp,
    TrendingDown,
    CalendarClock,
    ClipboardCheck,
    FileText,
    Loader2,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import React from 'react';
import { useReports } from '@/hooks/use-reports';
import { ReportType, ReportPeriod, ReportResponse, BreakdownMetric } from '@/lib/types/reports';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
        },
    },
};

const sectionVariants = {
    hidden: {
        opacity: 0,
        y: 40,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
            delay: 0.4,
        },
    },
};

const REPORT_OPTIONS = {
    quotation: { label: 'Quotations Report', icon: <FileText className='w-4 h-4' /> },
    task: { label: 'Tasks Report', icon: <ClipboardCheck className='w-4 h-4' /> },
    lead: { label: 'Leads Report', icon: <TrendingUp className='w-4 h-4' /> },
    claim: { label: 'Claims Report', icon: <FileText className='w-4 h-4' /> },
} as const;

const TIME_OPTIONS = [
    { value: 'daily', label: 'Daily', icon: <CalendarClock className='w-4 h-4' /> },
    { value: 'weekly', label: 'Weekly', icon: <CalendarClock className='w-4 h-4' /> },
    { value: 'monthly', label: 'Monthly', icon: <CalendarClock className='w-4 h-4' /> },
    { value: 'quarterly', label: 'Quarterly', icon: <CalendarClock className='w-4 h-4' /> },
    { value: 'yearly', label: 'Yearly', icon: <CalendarClock className='w-4 h-4' /> },
];

const taskChartConfig = {
    completed: {
        label: 'Completed',
        color: 'hsl(var(--chart-1))',
    },
    pending: {
        label: 'Pending',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

const taskPriorityConfig = {
    total: {
        label: 'Total Tasks',
        color: 'hsl(var(--chart-1))',
    },
    completed: {
        label: 'Completed',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig;

const revenueConfig = {
    value: {
        label: 'Revenue',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

const quotationChartConfig = {
    quotations: {
        label: 'Quotations',
    },
    total: {
        label: 'Total',
        color: 'hsl(var(--chart-1))',
    },
    accepted: {
        label: 'Accepted',
        color: 'hsl(var(--chart-2))',
    },
    pending: {
        label: 'Pending',
        color: 'hsl(var(--chart-3))',
    },
} satisfies ChartConfig;

// Improved data transformation functions
const transformQuotationData = (data: ReportResponse | null) => {
    if (!data) return [];

    if (data?.orders) {
        return [
            {
                date: new Date().toISOString(),
                total: Math.max(0, data.orders.metrics.totalQuotations || 0),
                accepted: Math.max(0, data.orders.approved || 0),
                pending: Math.max(0, data.orders.pending || 0),
            },
        ];
    }

    if (!data?.trends?.patterns?.daily || !data?.financial?.quotations) return [];

    const conversion = Math.max(0, data.financial.quotations.conversion || 0);

    return Object.entries(data.trends.patterns.daily).map(([date, value]) => {
        const total = Math.max(0, Number(value || 0));
        return {
            date: new Date(date).toISOString(),
            total,
            accepted: Math.round(total * (conversion / 100)),
            pending: Math.round(total * ((100 - conversion) / 100)),
        };
    });
};

const transformTaskData = (data: ReportResponse | null) => {
    // Handle daily report format
    if (data?.tasks) {
        return [
            {
                month: 'Today',
                completed: data.tasks.completed || 0,
                pending: data.tasks.pending || 0,
            },
        ];
    }

    // Handle generated report format
    if (!data?.performance?.tasks?.byType || !data?.performance?.tasks?.completionRate) return [];

    const { completionRate = 0 } = data.performance.tasks;

    return Object.entries(data.performance.tasks.byType).map(([type, value]) => ({
        month: type,
        completed: Math.round(Number(value || 0) * (completionRate / 100)),
        pending: Math.round(Number(value || 0) * ((100 - completionRate) / 100)),
    }));
};

const transformPriorityData = (data: ReportResponse | null) => {
    // Handle daily report format
    if (data?.tasks) {
        return [
            {
                name: 'Tasks',
                total: data.tasks.total || 0,
                completed: data.tasks.completed || 0,
            },
        ];
    }

    // Handle generated report format
    if (!data?.performance?.tasks?.byPriority || !data?.performance?.tasks?.completionRate) return [];

    const { completionRate = 0 } = data.performance.tasks;

    return Object.entries(data.performance.tasks.byPriority).map(([priority, value]) => ({
        name: priority,
        total: Number(value || 0),
        completed: Math.round(Number(value || 0) * (completionRate / 100)),
    }));
};

const transformRevenueData = (data: ReportResponse | null) => {
    // Handle daily report format
    if (data?.orders) {
        return [
            {
                name: 'Today',
                value: Number(data.orders.metrics.grossQuotationValue?.replace(/[^0-9.-]+/g, '') || 0),
                percentage: 100,
            },
        ];
    }

    // Handle generated report format
    if (!data?.financial?.revenue?.breakdown) return [];

    return data.financial.revenue.breakdown.map((metric: BreakdownMetric) => ({
        name: metric.category,
        value: Number(metric.value || 0),
        percentage: Number(metric.percentage || 0),
    }));
};

// Get metrics for the cards
const getQuotationMetrics = (data: ReportResponse | null) => {
    if (data?.orders) {
        const total = Math.max(0, data.orders.metrics.totalQuotations || 0);
        const approved = Math.max(0, data.orders.approved || 0);
        return {
            total,
            growth: data.orders.metrics.quotationTrends?.growth || '0',
            trend: data.orders.metrics.quotationTrends?.growth?.startsWith('+') ? 'up' : 'down',
            averageValue: Number(data.orders.metrics.averageQuotationValue?.replace(/[^0-9.-]+/g, '') || 0),
            conversion: total > 0 ? (approved / total) * 100 : 0,
        };
    }

    return {
        total: Math.max(0, data?.financial?.quotations?.total || 0),
        growth: data?.financial?.revenue?.growth || '0',
        trend: data?.financial?.revenue?.trend || 'stable',
        averageValue: Math.max(0, data?.financial?.quotations?.averageValue || 0),
        conversion: Math.max(0, data?.financial?.quotations?.conversion || 0),
    };
};

const getTaskMetrics = (data: ReportResponse | null) => {
    if (data?.tasks) {
        const completed = Math.max(0, data.tasks.completed || 0);
        const total = Math.max(0, data.tasks.total || 1);
        return {
            completionRate: total > 0 ? (completed / total) * 100 : 0,
            growth: data.tasks.metrics?.taskTrends?.growth || '0',
            completed,
            total,
            averageTime: 'N/A',
        };
    }

    const completed = Math.max(0, data?.performance?.tasks?.completed || 0);
    const total = Math.max(0, data?.performance?.tasks?.total || 1);
    return {
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        growth: '0',
        completed,
        total,
        averageTime: data?.performance?.tasks?.averageCompletionTime || 'N/A',
    };
};

export default function Dashboard() {
    const {
        dateRange,
        setDateRange,
        period,
        setPeriod,
        reportType,
        setReportType,
        data,
        isGenerating,
        error,
        handleGenerateReport,
    } = useReports();

    // Transform data for charts using memoized functions
    const quotationData = React.useMemo(() => transformQuotationData(data), [data]);
    const taskComparisonData = React.useMemo(() => transformTaskData(data), [data]);
    const taskPriorityData = React.useMemo(() => transformPriorityData(data), [data]);
    const revenueData = React.useMemo(() => transformRevenueData(data), [data]);

    // Get metrics for the cards
    const quotationMetrics = React.useMemo(() => getQuotationMetrics(data), [data]);
    const taskMetrics = React.useMemo(() => getTaskMetrics(data), [data]);

    // Format currency with the correct locale and symbol
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
        })
            .format(value)
            .replace('ZAR', 'R');
    };

    // Format percentage with sign
    const formatPercentage = (value: number, includeSign = true) => {
        const formatted = Math.abs(value).toFixed(1);
        return includeSign ? `${value >= 0 ? '+' : '-'}${formatted}%` : `${formatted}%`;
    };

    React.useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        if (range?.from) {
            setDateRange({
                from: range.from,
                to: range.to || range.from,
            });
        }
    };

    return (
        <motion.div
            initial='hidden'
            animate='show'
            variants={containerVariants}
            className='flex flex-col h-screen gap-6 p-6 overflow-y-scroll'
        >
            {/* Key Metrics Cards */}
            <motion.div variants={containerVariants} className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex flex-col gap-4'>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Total Quotations
                                </p>
                                <div className='flex items-center justify-between'>
                                    <h2 className='text-2xl font-bold font-body text-card-foreground'>
                                        {quotationMetrics.total.toLocaleString()}
                                    </h2>
                                    <span
                                        className={cn(
                                            'flex items-center text-xs font-normal font-body',
                                            quotationMetrics.trend === 'up' ? 'text-emerald-500' : 'text-rose-500',
                                        )}
                                    >
                                        {quotationMetrics.trend === 'up' ? (
                                            <TrendingUp className='w-4 h-4 mr-1' />
                                        ) : (
                                            <TrendingDown className='w-4 h-4 mr-1' />
                                        )}
                                        {formatPercentage(Number(quotationMetrics.growth))}
                                    </span>
                                </div>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    vs last month
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex flex-col gap-4'>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Task Completion Rate
                                </p>
                                <div className='flex items-center justify-between'>
                                    <h2 className='text-2xl font-bold font-body text-card-foreground'>
                                        {formatPercentage(taskMetrics.completionRate, false)}
                                    </h2>
                                    <span className='flex items-center text-xs font-normal text-emerald-500 font-body'>
                                        <TrendingUp className='w-4 h-4 mr-1' />
                                        {formatPercentage((taskMetrics.completed / taskMetrics.total) * 100)}
                                    </span>
                                </div>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    vs last week
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex flex-col gap-4'>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Average Quote Value
                                </p>
                                <div className='flex items-center justify-between'>
                                    <h2 className='text-2xl font-bold font-body text-card-foreground'>
                                        {formatCurrency(quotationMetrics.averageValue)}
                                    </h2>
                                    <span
                                        className={cn(
                                            'flex items-center text-xs font-normal font-body',
                                            quotationMetrics.trend === 'up' ? 'text-emerald-500' : 'text-rose-500',
                                        )}
                                    >
                                        {quotationMetrics.trend === 'up' ? (
                                            <TrendingUp className='w-4 h-4 mr-1' />
                                        ) : (
                                            <TrendingDown className='w-4 h-4 mr-1' />
                                        )}
                                        {formatPercentage(Number(quotationMetrics.growth))}
                                    </span>
                                </div>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    vs last month
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex flex-col gap-4'>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Conversion Rate
                                </p>
                                <div className='flex items-center justify-between'>
                                    <h2 className='text-2xl font-bold font-body text-card-foreground'>
                                        {formatPercentage(quotationMetrics.conversion, false)}
                                    </h2>
                                    <span className='flex items-center text-xs font-normal text-emerald-500 font-body'>
                                        <TrendingUp className='w-4 h-4 mr-1' />
                                        {formatPercentage(quotationMetrics.conversion)}
                                    </span>
                                </div>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    vs last month
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Charts Section */}
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <Card className='lg:col-span-2'>
                    <CardHeader className='flex items-center gap-2 py-5 space-y-0 border-b sm:flex-row'>
                        <div className='grid flex-1 gap-1 text-center sm:text-left'>
                            <CardTitle className='font-normal uppercase font-body text-card-foreground'>
                                Quotation Trends
                            </CardTitle>
                            {/* <CardDescription className="font-normal uppercase font-body text-muted-foreground">
								{data ? `Data from ${format(new Date(data.metadata.generatedAt), 'PPP')}` : 'No data available'}
							</CardDescription> */}
                        </div>
                        <Select defaultValue='7d'>
                            <SelectTrigger className='w-[160px] rounded-lg sm:ml-auto' aria-label='Select time range'>
                                <SelectValue placeholder='Last 7 days' />
                            </SelectTrigger>
                            <SelectContent className='rounded-xl'>
                                <SelectItem value='90d' className='rounded-lg'>
                                    Last 3 months
                                </SelectItem>
                                <SelectItem value='30d' className='rounded-lg'>
                                    Last 30 days
                                </SelectItem>
                                <SelectItem value='7d' className='rounded-lg'>
                                    Last 7 days
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
                        {data ? (
                            <ChartContainer config={quotationChartConfig} className='aspect-auto h-[250px] w-full'>
                                <AreaChart data={quotationData}>
                                    <defs>
                                        <linearGradient id='fillTotal' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='var(--color-total)' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='var(--color-total)' stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id='fillAccepted' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='var(--color-accepted)' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='var(--color-accepted)' stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id='fillPending' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='var(--color-pending)' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='var(--color-pending)' stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey='date'
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={32}
                                        tickFormatter={value => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            });
                                        }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={value => {
                                                    return new Date(value).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    });
                                                }}
                                                indicator='dot'
                                            />
                                        }
                                    />
                                    <Area
                                        dataKey='pending'
                                        type='natural'
                                        fill='url(#fillPending)'
                                        stroke='var(--color-pending)'
                                        stackId='a'
                                    />
                                    <Area
                                        dataKey='accepted'
                                        type='natural'
                                        fill='url(#fillAccepted)'
                                        stroke='var(--color-accepted)'
                                        stackId='a'
                                    />
                                    <Area
                                        dataKey='total'
                                        type='natural'
                                        fill='url(#fillTotal)'
                                        stroke='var(--color-total)'
                                        stackId='a'
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                </AreaChart>
                            </ChartContainer>
                        ) : (
                            <div className='flex items-center justify-center h-[250px]'>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    {isGenerating ? 'Generating report...' : 'No data available'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='text-sm font-medium uppercase font-body text-card-foreground'>
                            Task Completion Trends
                        </CardTitle>
                        <CardDescription className='text-xs font-normal uppercase font-body text-muted-foreground'>
                            <p>task completion trends this week</p>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data ? (
                            <ChartContainer config={taskChartConfig}>
                                <BarChart data={taskComparisonData} height={300}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey='month'
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={value => value.slice(0, 3)}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                                    <Bar dataKey='completed' fill='var(--color-completed)' radius={3} barSize={20} />
                                    <Bar dataKey='pending' fill='var(--color-pending)' radius={3} barSize={20} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className='flex items-center justify-center h-[300px]'>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    {isGenerating ? 'Generating report...' : 'No data available'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className='flex-col items-center justify-center gap-2 text-sm'>
                        {/* {data && (
							<>
								<div className="flex gap-2 text-xs font-normal leading-none uppercase text-card-foreground font-body">
									Task completion up by {data.performance.tasks.completionRate}% this month <TrendingUp className="w-4 h-4" />
								</div>
								<div className="flex gap-2 font-normal leading-none uppercase text-card-foreground font-body text-[10px]">
									Average completion time: {data.performance.tasks.averageCompletionTime}
								</div>
							</>
						)} */}
                    </CardFooter>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className='grid gap-6 md:grid-cols-2'>
                <Card>
                    <CardHeader>
                        <CardTitle className='text-sm font-medium uppercase font-body text-card-foreground'>
                            Task Completion by Priority
                        </CardTitle>
                        <CardDescription className='text-xs font-normal uppercase font-body text-muted-foreground'>
                            This Week
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={taskPriorityConfig}>
                            <BarChart data={taskPriorityData} height={300}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey='name' tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                                <Bar dataKey='total' fill='var(--color-total)' radius={3} barSize={20} />
                                <Bar dataKey='completed' fill='var(--color-completed)' radius={3} barSize={20} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className='flex-col items-center justify-center gap-2 text-sm'>
                        <div className='flex gap-2 text-xs font-normal leading-none uppercase text-card-foreground font-body'>
                            High priority completion rate increased by 8.4% <TrendingUp className='w-4 h-4' />
                        </div>
                        <div className='flex gap-2 font-normal leading-none uppercase text-card-foreground font-body text-[10px]'>
                            Showing task completion rates across different priority levels
                        </div>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className='text-sm font-medium uppercase font-body text-card-foreground'>
                            Weekly Revenue
                        </CardTitle>
                        <CardDescription className='text-xs font-normal uppercase font-body text-muted-foreground'>
                            Last 4 Weeks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={revenueConfig}>
                            <BarChart data={revenueData} height={300}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey='name' tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator='dashed' />} />
                                <Bar dataKey='value' fill='var(--color-value)' radius={5} barSize={50} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                    <CardFooter className='flex-col items-center justify-center gap-2 text-sm'>
                        <div className='flex gap-2 text-xs font-normal leading-none uppercase text-card-foreground font-body'>
                            Revenue up by 12.5% from last week <TrendingUp className='w-4 h-4' />
                        </div>
                        <div className='flex gap-2 font-normal leading-none uppercase text-card-foreground font-body text-[10px]'>
                            Showing weekly revenue trends for the past month
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Report Generator Section */}
            <motion.div variants={sectionVariants}>
                <Card className='transition-all duration-500 border shadow-sm cursor-pointer bg-card border-border/80 hover:border-primary/40'>
                    <CardHeader className='space-y-0'>
                        <CardTitle className='font-normal uppercase text-md font-body text-card-foreground'>
                            Generate Detailed Report
                        </CardTitle>
                        <p className='text-muted-foreground font-body uppercase font-normal text-[10px]'>
                            Select date range and report type to generate a comprehensive analysis
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-col gap-6 md:flex-row'>
                            <div className='flex-1'>
                                <label className='block mb-2 text-xs font-normal uppercase font-body'>Date Range</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !dateRange && 'text-muted-foreground',
                                            )}
                                        >
                                            <CalendarIcon className='w-4 h-4 mr-2' />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                                                        {format(dateRange.to, 'LLL dd, y')}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, 'LLL dd, y')
                                                )
                                            ) : (
                                                <span className='text-[10px] font-body uppercase font-normal'>
                                                    Pick a date range
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            initialFocus
                                            mode='range'
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={handleDateRangeChange}
                                            numberOfMonths={2}
                                            className='border rounded-md'
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className='flex-1'>
                                <label className='block mb-2 text-xs font-normal uppercase font-body'>
                                    Time Period
                                </label>
                                <Select value={period} onValueChange={value => setPeriod(value as ReportPeriod)}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select time period...' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_OPTIONS.map(option => (
                                            <SelectItem key={option?.value} value={option?.value}>
                                                <div className='flex items-center gap-2'>
                                                    {option?.icon}
                                                    <p className='text-[10px] font-body uppercase font-normal'>
                                                        {option?.label}
                                                    </p>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='flex-1'>
                                <label className='block mb-2 text-xs font-normal uppercase font-body'>
                                    Report Type
                                </label>
                                <Select value={reportType} onValueChange={value => setReportType(value as ReportType)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select report type...' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(REPORT_OPTIONS).map(([key, option]) => (
                                            <SelectItem key={key} value={key}>
                                                <div className='flex items-center gap-2'>
                                                    {option.icon}
                                                    <p className='text-[10px] font-body uppercase font-normal'>
                                                        {option.label}
                                                    </p>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='flex justify-center mt-6'>
                            <Button
                                onClick={handleGenerateReport}
                                disabled={isGenerating || !dateRange?.from || !dateRange?.to}
                                className='w-full max-w-md font-normal text-white uppercase bg-indigo-600 hover:bg-indigo-700 font-body'
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                        Generating Report...
                                    </>
                                ) : (
                                    'Generate Report'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
