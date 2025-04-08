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
    PieChart,
    Pie,
    Cell,
    Area,
    AreaChart,
} from 'recharts';

// Define proper interfaces for our chart data
interface LeadHourlyData {
    hour: string;
    newLeads: number;
    converted: number;
}

interface LeadStatusData {
    name: string;
    value: number;
    color: string;
}

interface LeadCategoryData {
    name: string;
    value: number;
    color: string;
}

// Dummy hourly leads data
const dummyHourlyLeadsData: LeadHourlyData[] = Array.from(
    { length: 24 },
    (_, i) => ({
        hour: i.toString().padStart(2, '0'),
        newLeads: Math.floor(Math.random() * 2) + 1, // Ensure positive values between 1-2
        converted: Math.floor(Math.random() * 1.5), // Values between 0-1
    }),
);

// Dummy status distribution data
const dummyStatusDistribution: LeadStatusData[] = [
    { name: 'PENDING', value: 7, color: '#F59E0B' },
    { name: 'APPROVED', value: 2, color: '#10B981' },
    { name: 'REVIEW', value: 1, color: '#4F46E5' },
    { name: 'DECLINED', value: 0, color: '#EF4444' },
    { name: 'CONVERTED', value: 1, color: '#8B5CF6' },
    { name: 'CANCELLED', value: 0, color: '#9CA3AF' },
];

// Dummy leads by category data
const dummyLeadsByCategory: LeadCategoryData[] = [
    { name: 'Uncategorized', value: 11, color: '#9CA3AF' },
    { name: 'Walk-in', value: 0, color: '#4F46E5' },
    { name: 'Referral', value: 0, color: '#10B981' },
    { name: 'Website', value: 0, color: '#8B5CF6' },
    { name: 'Phone', value: 0, color: '#F59E0B' },
    { name: 'Email', value: 0, color: '#EC4899' },
    { name: 'Social Media', value: 0, color: '#3B82F6' },
];

export function LeadsHourlyActivityChart({
    data = dummyHourlyLeadsData,
}: {
    data?: LeadHourlyData[];
}) {
    // Process data to ensure it stays within reasonable bounds
    const processedData = data.map((item) => ({
        ...item,
        newLeads: Math.min(3, Math.max(0, item.newLeads)), // Cap between 0-3
        converted: Math.min(2, Math.max(0, item.converted)), // Cap between 0-2
    }));

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Hourly Lead Activity
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    New and converted leads by hour
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
                                id="newLeadsGradient"
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
                                id="convertedGradient"
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
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 0.5 }}
                            tickLine={false}
                            domain={[0, 'dataMax + 0.5']} // Start at 0, add padding to the max value
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
                                            {payload.map((entry, index) => (
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
                                            ))}
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
                            dataKey="newLeads"
                            name="New Leads"
                            stroke="#4F46E5"
                            fillOpacity={1}
                            fill="url(#newLeadsGradient)"
                            strokeWidth={2}
                            isAnimationActive={false} // Disable animation to avoid potential rendering issues
                        />
                        <Area
                            type="monotone"
                            dataKey="converted"
                            name="Converted"
                            stroke="#10B981"
                            fillOpacity={1}
                            fill="url(#convertedGradient)"
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

export function LeadsStatusDistributionChart({
    data = dummyStatusDistribution,
}: {
    data?: LeadStatusData[];
}) {
    // Filter out zero values
    const filteredData = data.filter((item) => item.value > 0);

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Lead Status Distribution
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Breakdown of leads by current status
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={50}
                            dataKey="value"
                            paddingAngle={2}
                            cornerRadius={4}
                        >
                            {filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="transparent"
                                />
                            ))}
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
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            data.color,
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Count: {data.value}
                                                </p>
                                            </div>
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

export function LeadsByCategoryChart({
    data = dummyLeadsByCategory,
}: {
    data?: LeadCategoryData[];
}) {
    // Filter out zero values
    const filteredData = data.filter((item) => item.value > 0);

    return (
        <Card className="border shadow-sm border-border/60 bg-card">
            <CardHeader className="pb-2">
                <h3 className="text-sm font-normal uppercase font-body">
                    Leads By Category
                </h3>
                <p className="mb-4 text-xs font-thin uppercase text-muted-foreground font-body">
                    Distribution of leads by source category
                </p>
            </CardHeader>
            <CardContent className="p-6 border rounded h-96 border-border/30 bg-card/50">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={50}
                            dataKey="value"
                            paddingAngle={2}
                            cornerRadius={4}
                        >
                            {filteredData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="transparent"
                                />
                            ))}
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
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            data.color,
                                                    }}
                                                />
                                                <p className="text-[10px] font-normal uppercase font-body">
                                                    Count: {data.value}
                                                </p>
                                            </div>
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
