'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

// Define proper interfaces for our chart data
interface HourlySalesData {
    hour: string;
    quotations: number;
    revenue: number;
}

interface WeeklyRevenueData {
    date: string;
    revenue: number;
}

// Add new interfaces for the new charts
interface TopPerformerData {
    userId: number;
    userName: string;
    userPhotoURL?: string;
    quotations: number;
    revenue: number;
}

interface QuotationItemData {
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

// Dummy hourly sales data
const dummyHourlySalesData: HourlySalesData[] = Array.from(
    { length: 24 },
    (_, i) => ({
        hour: i.toString().padStart(2, '0'),
        quotations: Math.floor(Math.random() * 1.5), // Values between 0-1
        revenue: Math.floor(Math.random() * 800) + 100, // Values between 100-900
    }),
);

// Dummy daily revenue data for the past week
const dummyWeeklyRevenueData: WeeklyRevenueData[] = Array.from(
    { length: 7 },
    (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 6 + i);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: Math.floor(Math.random() * 4000) + 500, // Values between 500-4500
        };
    },
);

export function SalesHourlyActivityChart({
    data = dummyHourlySalesData,
}: {
    data?: HourlySalesData[];
}) {
    // Process data to ensure it stays within reasonable bounds
    const processedData = data.map((item) => ({
        ...item,
        quotations: Math.min(2, Math.max(0, item.quotations)), // Cap between 0-2
        revenue: Math.min(1000, Math.max(0, item.revenue)), // Cap between 0-1000
    }));

    // Calculate the max revenue for proper Y axis scaling
    const maxRevenue = Math.max(...processedData.map((item) => item.revenue));
    const revenueAxisMax = Math.ceil(maxRevenue / 250) * 250; // Round up to nearest 250

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Hourly Sales Activity
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Quotations and revenue by hour
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={processedData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 10, // Slightly increased left margin for Y-axis
                            bottom: 20,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="quotationsGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#4F46E5"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#4F46E5"
                                    stopOpacity={0.2}
                                />
                            </linearGradient>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#10B981"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#10B981"
                                    stopOpacity={0.2}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            opacity={0.1}
                        />
                        <XAxis
                            dataKey="hour"
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
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
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, 2]} // Fixed domain for quotations (0-2)
                            allowDataOverflow={false} // Prevent data from overflowing
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
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, revenueAxisMax]} // Dynamic domain based on data
                            allowDataOverflow={false} // Prevent data from overflowing
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
                                            R {payload.value}
                                        </text>
                                    </g>
                                );
                            }}
                        />
                        <Tooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                            <p className="text-xs font-normal uppercase font-body">
                                                Hour:{' '}
                                                {payload[0]?.payload?.hour}:00
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            '#4F46E5',
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Quotations:{' '}
                                                    {payload[0]?.value || 0}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            '#10B981',
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Revenue: R{' '}
                                                    {payload[1]?.value || 0}
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
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="quotations"
                            name="Quotations"
                            stroke="#4F46E5"
                            fillOpacity={1}
                            fill="url(#quotationsGradient)"
                            strokeWidth={2}
                            isAnimationActive={false} // Disable animation to avoid potential rendering issues
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue (R)"
                            stroke="#10B981"
                            fillOpacity={1}
                            fill="url(#revenueGradient)"
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center uppercase text-muted-foreground font-body">
                    hours of the day (0 - 23)
                </p>
            </CardContent>
        </Card>
    );
}

export function WeeklyRevenueChart({
    data = dummyWeeklyRevenueData,
}: {
    data?: WeeklyRevenueData[];
}) {
    const formatCurrency = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `R ${numValue.toLocaleString('en-ZA')}`;
    };

    // Process data to ensure it stays within reasonable bounds
    const processedData = data.map((item) => ({
        ...item,
        revenue: Math.min(5000, Math.max(0, item.revenue)), // Cap between 0-5000
    }));

    // Calculate the max revenue for proper Y axis scaling
    const maxRevenue = Math.max(...processedData.map((item) => item.revenue));
    const revenueAxisMax = Math.ceil(maxRevenue / 1000) * 1000; // Round up to nearest 1000

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Weekly Revenue Trend
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Revenue performance over the past week
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={processedData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 10, // Slightly increased left margin for Y-axis
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            opacity={0.1}
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
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
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, revenueAxisMax]} // Dynamic domain based on data
                            allowDataOverflow={false} // Prevent data from overflowing
                            tickFormatter={formatCurrency}
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
                                            R {payload.value}
                                        </text>
                                    </g>
                                );
                            }}
                        />
                        <Tooltip
                            cursor={{
                                stroke: '#9CA3AF',
                                strokeWidth: 2,
                                strokeDasharray: '3 3',
                            }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const value = payload[0]?.value;
                                    return (
                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                            <p className="text-xs font-normal uppercase font-body">
                                                {payload[0]?.payload?.date}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            '#10B981',
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Revenue:{' '}
                                                    {typeof value === 'number'
                                                        ? formatCurrency(value)
                                                        : 'R 0'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{
                                fill: '#10B981',
                                r: 4,
                                strokeWidth: 2,
                                stroke: '#fff',
                            }}
                            activeDot={{
                                fill: '#10B981',
                                r: 6,
                                strokeWidth: 2,
                                stroke: '#fff',
                            }}
                            isAnimationActive={false} // Disable animation to avoid potential rendering issues
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function TopPerformersPieChart({
    data = [],
}: {
    data?: TopPerformerData[];
}) {
    // Format data for the pie chart
    const formattedData = data.map((performer) => ({
        name: performer.userName,
        value: performer.revenue,
        quotations: performer.quotations,
    }));

    // Generate colors for the pie chart - using a fixed set of colors
    const COLORS = ['#10B981', '#4F46E5', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

    // Format currency
    const formatCurrency = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `R ${numValue.toLocaleString('en-ZA')}`;
    };

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Top Sales Performers
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Revenue distribution by sales staff
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={formattedData}
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
                            {formattedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="transparent"
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload as {
                                        name: string;
                                        value: number;
                                        quotations: number;
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
                                                        backgroundColor: COLORS[formattedData.findIndex(item => item.name === data.name) % COLORS.length],
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Revenue: {formatCurrency(data.value)}
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
                                                    Quotations: {data.quotations}
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
                                                    Percentage: {((data.value / formattedData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            formatter={(value, entry, index) => (
                                <span className="text-[10px] uppercase font-body">
                                    {value}
                                </span>
                            )}
                            iconSize={10}
                            layout="horizontal"
                            margin={{ top: 10 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function AverageOrderValueChart({
    quotationsData = [],
}: {
    quotationsData?: QuotationItemData[];
}) {
    // Format currency
    const formatCurrency = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `R ${numValue.toLocaleString('en-ZA')}`;
    };

    // Calculate average order value by date
    const avgOrderByDate = quotationsData.reduce((acc, quotation) => {
        const date = quotation.createdAt.split('T')[0]; // Get just the date part
        if (!acc[date]) {
            acc[date] = {
                totalAmount: 0,
                count: 0,
                date: date
            };
        }
        acc[date].totalAmount += quotation.amount;
        acc[date].count += 1;
        return acc;
    }, {} as Record<string, { totalAmount: number; count: number; date: string; }>);

    // Convert to array and calculate averages
    const chartData = Object.values(avgOrderByDate).map(({ date, totalAmount, count }) => ({
        date,
        avgValue: count > 0 ? totalAmount / count : 0
    }));

    // Sort by date
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate the max value for proper Y axis scaling
    const maxValue = Math.max(...chartData.map(item => item.avgValue));
    const valueAxisMax = Math.ceil(maxValue / 500) * 500; // Round up to nearest 500

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Average Order Value
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Average quotation value over time
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 10,
                            bottom: 20,
                        }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis
                            dataKey="date"
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            tick={(props) => {
                                const { x, y, payload } = props;
                                // Display the date as-is without trying to parse it
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
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, valueAxisMax]}
                            allowDataOverflow={false}
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
                                            R {payload.value}
                                        </text>
                                    </g>
                                );
                            }}
                        />
                        <Tooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const value = payload[0]?.value;
                                    // Display original date string without parsing
                                    const dateString = payload[0]?.payload?.date;

                                    return (
                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                            <p className="text-xs font-normal uppercase font-body">
                                                {dateString}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: '#3B82F6',
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Avg Order Value:{' '}
                                                    {typeof value === 'number'
                                                        ? formatCurrency(value)
                                                        : 'R 0'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="avgValue"
                            name="Average Order Value"
                            fill="#3B82F6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function QuotationItemsChart({
    quotationsData = [],
}: {
    quotationsData?: QuotationItemData[];
}) {
    // Prepare data for the chart
    const chartData = quotationsData.map(quotation => ({
        id: quotation.id,
        quotationNumber: quotation.quotationNumber,
        amount: quotation.amount,
        itemCount: quotation.itemCount,
        client: quotation.clientName,
        createdAt: quotation.createdAt
    })).sort((a, b) => a.id - b.id);

    // Format currency
    const formatCurrency = (value: number | string) => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return `R ${numValue.toLocaleString('en-ZA')}`;
    };

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Quotation Items Analysis
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Number of items per quotation vs amount
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 10,
                            bottom: 20,
                        }}
                        barSize={20}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis
                            dataKey="quotationNumber"
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            tick={(props) => {
                                const { x, y, payload } = props;
                                // Just show the last 5 characters to save space
                                const shortQuotation = payload.value.slice(-5);
                                return (
                                    <g transform={`translate(${x},${y})`}>
                                        <text
                                            dy={16}
                                            textAnchor="middle"
                                            fill="#888"
                                            className="text-[8px] font-body uppercase"
                                        >
                                            {shortQuotation}
                                        </text>
                                    </g>
                                );
                            }}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#4F46E5"
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, 'dataMax']}
                            allowDataOverflow={false}
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
                            stroke="#10B981"
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, 'dataMax']}
                            allowDataOverflow={false}
                            tickFormatter={(value) => `R ${value}`}
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
                                            R {payload.value}
                                        </text>
                                    </g>
                                );
                            }}
                        />
                        <Tooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const {
                                        quotationNumber,
                                        amount,
                                        itemCount,
                                        client,
                                        createdAt
                                    } = payload[0]?.payload || {};

                                    // Display the original date string without parsing
                                    return (
                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                            <p className="text-xs font-normal uppercase font-body">
                                                {quotationNumber}
                                            </p>
                                            <p className="text-[10px] font-normal uppercase font-body">
                                                {client} - {createdAt}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: '#4F46E5',
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Items: {itemCount}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: '#10B981',
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Amount: {formatCurrency(amount)}
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
                            dataKey="itemCount"
                            name="Items"
                            fill="#4F46E5"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            yAxisId="right"
                            dataKey="amount"
                            name="Amount (R)"
                            fill="#10B981"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
