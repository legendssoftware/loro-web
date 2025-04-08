'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from 'recharts';

// Define proper interfaces for chart data
interface WorkforceHourlyItem {
    hour: string;
    activeCount: number;
    checkIns: number;
    checkOuts: number;
}

interface ProductivityItem {
    name: string;
    value: number;
    color: string;
}

// Dummy data that matches the structure from the JSON report
const dummyHourlyData: WorkforceHourlyItem[] = Array.from(
    { length: 24 },
    (_, i) => ({
        hour: i.toString().padStart(2, '0'),
        activeCount: Math.floor(Math.random() * 8) + 1, // Ensure positive values between 1-8
        checkIns: Math.floor(Math.random() * 4) + 1, // Ensure positive values between 1-4
        checkOuts: Math.floor(Math.random() * 3) + 1, // Ensure positive values between 1-3
    }),
);

const dummyProductivityData: ProductivityItem[] = [
    { name: 'Productive', value: 75, color: '#10B981' },
    { name: 'Idle', value: 15, color: '#F59E0B' },
    { name: 'Offline', value: 10, color: '#9CA3AF' },
];

export function WorkforceHourlyActivityChart({
    data = dummyHourlyData,
}: {
    data?: WorkforceHourlyItem[];
}) {
    // Process data to ensure it stays within reasonable bounds
    const processedData = data.map(item => ({
        ...item,
        activeCount: Math.min(10, Math.max(0, item.activeCount)), // Cap between 0-10
        checkIns: Math.min(5, Math.max(0, item.checkIns)), // Cap between 0-5
        checkOuts: Math.min(3, Math.max(0, item.checkOuts)), // Cap between 0-3
    }));

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Hourly Workforce Activity
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Employee check-ins and active status by hour
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
                                id="activeGradient"
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
                                id="checkInsGradient"
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
                            <linearGradient
                                id="checkOutsGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#F59E0B"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#F59E0B"
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
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, 'auto']} // Start at 0, auto-scale the upper limit with padding
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
                                            {payload.map(
                                                (entry: any, index: number) => (
                                                    <div
                                                        key={`item-${index}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    entry.color,
                                                            }}
                                                        />
                                                        <p className="text-[10px] font-normal uppercase font-body">
                                                            {entry.name}:{' '}
                                                            {entry.value}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
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
                            type="monotone"
                            dataKey="activeCount"
                            name="Active"
                            stroke="#4F46E5"
                            fillOpacity={1}
                            fill="url(#activeGradient)"
                            strokeWidth={2}
                            isAnimationActive={false} // Disable animation to avoid potential rendering issues
                        />
                        <Area
                            type="monotone"
                            dataKey="checkIns"
                            name="Check-ins"
                            stroke="#10B981"
                            fillOpacity={1}
                            fill="url(#checkInsGradient)"
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <Area
                            type="monotone"
                            dataKey="checkOuts"
                            name="Check-outs"
                            stroke="#F59E0B"
                            fillOpacity={1}
                            fill="url(#checkOutsGradient)"
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export function WorkforceProductivityChart({
    data = dummyProductivityData,
}: {
    data?: ProductivityItem[];
}) {
    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Workforce Productivity
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Overall productivity distribution
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={50}
                            dataKey="value"
                            paddingAngle={2}
                            cornerRadius={4}
                        >
                            {data.map(
                                (entry: ProductivityItem, index: number) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke="transparent"
                                    />
                                ),
                            )}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="p-3 border rounded shadow-md bg-card dark:bg-background dark:border-border/50">
                                            <p className="text-xs font-normal uppercase font-body">
                                                {data.name}
                                            </p>
                                            <p className="text-[10px] font-normal uppercase font-body">
                                                {data.value}%
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend
                            formatter={(value) => (
                                <span className="text-[8px] uppercase font-body">
                                    {value}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
