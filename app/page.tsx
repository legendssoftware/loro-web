'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    BarChart,
    Bar,
} from 'recharts';
import { Package, Truck, CheckCircle, Clock, AlertTriangle, UserCheck, Scale, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

// Updated dummy data with more variation
const salesData = [
    { name: 'Jan 1', value: 2000 },
    { name: 'Jan 2', value: 2500 },
    { name: 'Jan 3', value: 2500 },
    { name: 'Jan 4', value: 12900 },
    { name: 'Jan 5', value: 11850 },
    { name: 'Jan 6', value: 2500 },
    { name: 'Jan 7', value: 25800 },
    { name: 'Jan 8', value: 25000 },
    { name: 'Jan 9', value: 25000 },
    { name: 'Jan 10', value: 2200 },
    { name: 'Jan 11', value: 233000 },
    { name: 'Jan 12', value: 3000 },
    { name: 'Jan 13', value: 2300 },
    { name: 'Jan 14', value: 2500 },
    { name: 'Jan 15', value: 2200 },
    { name: 'Jan 16', value: 5000 },
    { name: 'Jan 17', value: 260 },
    { name: 'Jan 18', value: 65000 },
    { name: 'Jan 19', value: 2500 },
    { name: 'Jan 20', value: 29800 },
    { name: 'Jan 21', value: 310 },
];

// More varied conversion data
const monthlyConversionData = Array.from({ length: 31 }, (_, i) => ({
    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    quotations: Math.floor(1500 + Math.random() * 2000),
    orders: Math.floor(800 + Math.random() * 1500),
}));

const conversionData = {
    orders: { value: 62.2, count: 6440 },
    visits: { value: 25.5, count: 12749 },
    growth: '+18.2%',
};

const taskPerformanceData = [
    { status: 'In Progress', value: 10, icon: Package, percentage: '25.8%', color: '#818CF8' },
    { status: 'Pending', value: 5, icon: Truck, percentage: '4.3%', color: '#60A5FA' },
    { status: 'Completed', value: 15, icon: CheckCircle, percentage: '-12.5%', color: '#34D399' },
    { status: 'Overdue', value: 3, icon: Clock, percentage: '35.6%', color: '#F87171' },
    { status: 'Cancelled', value: 2, icon: AlertTriangle, percentage: '-2.15%', color: '#FB923C' },
];

// Add this new type and data
type ClaimsReportData = {
    month: string;
    claims: number;
    payouts: number;
};

const claimsReportData: ClaimsReportData[] = [
    { month: 'Jan', claims: 230, payouts: -110 },
    { month: 'Feb', claims: 180, payouts: -150 },
    { month: 'Mar', claims: 130, payouts: -180 },
    { month: 'Apr', claims: 150, payouts: -160 },
    { month: 'May', claims: 210, payouts: -80 },
    { month: 'Jun', claims: 280, payouts: -40 },
    { month: 'Jul', claims: 220, payouts: -70 },
    { month: 'Aug', claims: 230, payouts: -120 },
    { month: 'Sep', claims: 90, payouts: -170 },
    { month: 'Oct', claims: 180, payouts: -140 },
    { month: 'Nov', claims: 250, payouts: -90 },
    { month: 'Dec', claims: 200, payouts: -130 },
];

const ClaimsReportCard = () => {
    return (
        <Card className='p-6 h-[520px]'>
            <div className='flex flex-col items-start justify-between w-full pb-6 border-b'>
                <h3 className='text-sm font-normal uppercase font-body'>Claims vs Payouts</h3>
                <span className='text-xs font-normal uppercase text-muted-foreground font-body'>
                    overview of claims payouts
                </span>
            </div>
            <div className='h-[300px] mt-6'>
                <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                        data={claimsReportData}
                        margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                        barGap={8}
                        barSize={6}
                    >
                        <CartesianGrid vertical={false} stroke='hsl(var(--border))' strokeDasharray='4 4' />
                        <XAxis
                            dataKey='month'
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fontFamily: 'var(--font-body)',
                                fill: 'hsl(var(--muted-foreground))',
                            }}
                            dy={10}
                            className='text-[9px] uppercase font-body'
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 10,
                                fontFamily: 'var(--font-body)',
                                fill: 'hsl(var(--muted-foreground))',
                            }}
                            ticks={[-300, -200, -100, 0, 100, 200, 300]}
                            dx={-10}
                            className='text-[9px] uppercase font-body'
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted))' }}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontFamily: 'var(--font-body)',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 'normal',
                            }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className='flex flex-col gap-2 p-2 rounded bg-card'>
                                            <div className='flex flex-row items-center gap-1'>
                                                <Calendar size={16} strokeWidth={1.5} />
                                                <p className='text-xs font-normal uppercase font-body'>
                                                    {payload[0].payload.month}
                                                </p>
                                            </div>
                                            {payload.map((entry, index) => (
                                                <p key={index} className='flex items-center justify-between gap-4'>
                                                    <span className='text-[10px] font-normal uppercase font-body'>
                                                        {entry.dataKey === 'claims' ? 'Claims:' : 'Payouts:'}
                                                    </span>
                                                    <span className='text-sm font-normal font-body'>
                                                        R{Math.abs(entry.value as number)}
                                                    </span>
                                                </p>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey='claims' fill='#818CF8' radius={[5, 5, 5, 5]} maxBarSize={10} barSize={10} />
                        <Bar dataKey='payouts' fill='#FB923C' radius={[5, 5, 5, 5]} maxBarSize={10} barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className='flex items-center justify-between pt-6 mt-6 border-t'>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-[#818CF8]' />
                        <span className='text-[10px] font-normal uppercase font-body'>Claims</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-[#FB923C]' />
                        <span className='text-[10px] font-normal uppercase font-body'>Payouts</span>
                    </div>
                </div>
                <Button
                    variant='secondary'
                    size='sm'
                    className='text-[10px] font-normal uppercase font-body bg-primary text-white cursor-pointer'
                >
                    Manage Budget
                </Button>
            </div>
        </Card>
    );
};

export default function Dashboard() {
    return (
        <motion.div initial='hidden' animate='show' variants={containerVariants} className='flex flex-col gap-2 p-6'>
            {/* Overview Cards */}
            <div className='grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4'>
                {/* Average Daily Sales */}
                <motion.div variants={itemVariants} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card className='p-3 h-[280px] cursor-pointer transition-shadow'>
                        <div className='flex flex-col h-full'>
                            <div className='flex flex-col items-start justify-between w-full pb-6 border-b'>
                                <h3 className='text-sm font-normal uppercase font-body'>Average Daily Sales</h3>
                                <span className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    monthly
                                </span>
                                <p className='text-2xl font-normal font-body'>R28,450</p>
                            </div>
                            <div className='flex-1 mt-4'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id='salesGradient' x1='0' y1='0' x2='0' y2='1'>
                                                <stop offset='0%' stopColor='#34D399' stopOpacity={0.2} />
                                                <stop offset='100%' stopColor='#34D399' stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type='monotone'
                                            dataKey='value'
                                            stroke='#34D399'
                                            fill='url(#salesGradient)'
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Sales Overview */}
                <motion.div variants={itemVariants} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card className='p-3 h-[280px] cursor-pointer transition-shadow'>
                        <div className='flex flex-col h-full'>
                            <div className='flex flex-row items-start justify-between w-full pb-6 border-b'>
                                <div className='flex flex-col gap-0'>
                                    <h3 className='text-sm font-normal uppercase font-body'>Sales Overview</h3>
                                    <span className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                        monthly
                                    </span>
                                    <p className='text-2xl font-normal font-body'>R42.5k</p>
                                </div>
                                <span className='text-xs font-normal text-emerald-500 font-body'>
                                    {conversionData.growth}
                                </span>
                            </div>
                            <div className='flex items-center justify-between gap-4 mt-auto'>
                                <div className='flex flex-col gap-1'>
                                    <div className='flex items-center gap-2'>
                                        <Package className='w-4 h-4 text-cyan-500' />
                                        <span className='text-[10px] font-normal uppercase font-body'>Quotations</span>
                                    </div>
                                    <p className='text-lg font-normal font-body'>{conversionData.orders.value}%</p>
                                    <p className='text-xs font-normal text-muted-foreground font-body'>
                                        {conversionData.orders.count}
                                    </p>
                                </div>
                                <div className='text-sm font-normal text-muted-foreground font-body'>
                                    <Scale size={40} strokeWidth={1.5} />
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <div className='flex items-center gap-2'>
                                        <UserCheck className='w-4 h-4 text-indigo-500' />
                                        <span className='text-[10px] font-normal font-body uppercase'>Orders</span>
                                    </div>
                                    <p className='text-lg font-normal font-body'>{conversionData.visits.value}%</p>
                                    <p className='text-xs font-normal text-muted-foreground font-body'>
                                        {conversionData.visits.count}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Generated Leads */}
                <motion.div variants={itemVariants} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card className='p-3 h-[280px] cursor-pointer transition-shadow'>
                        <div className='flex flex-col h-full'>
                            <div className='flex flex-col items-start justify-between w-full pb-6 border-b'>
                                <h3 className='text-sm font-normal uppercase font-body'>Generated Leads</h3>
                                <span className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    Monthly
                                </span>
                            </div>
                            <div className='flex items-center justify-between mt-auto'>
                                <div className='flex flex-col gap-2'>
                                    <p className='text-2xl font-normal font-body'>4,350</p>
                                    <span className='text-sm font-normal text-emerald-500 font-body'>+15.8%</span>
                                </div>
                                <div className='w-[100px] h-[100px]'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        <PieChart>
                                            <Pie
                                                data={[{ value: 184 }, { value: 100 - 184 }]}
                                                innerRadius={35}
                                                outerRadius={45}
                                                startAngle={90}
                                                endAngle={-270}
                                                dataKey='value'
                                            >
                                                <Cell fill='#34D399' />
                                                <Cell fill='#E5E7EB' />
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Task Performance */}
                <motion.div variants={itemVariants} transition={{ type: 'spring', stiffness: 300 }}>
                    <Card className='p-6 h-[280px] cursor-pointer transition-shadow'>
                        <div className='flex flex-col h-full'>
                            <div className='flex items-center justify-between'>
                                <h3 className='text-sm font-normal uppercase font-body'>Task Performance</h3>
                                <p className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                    12% increase
                                </p>
                            </div>
                            <div className='flex flex-col gap-4 mt-auto'>
                                {taskPerformanceData.slice(0, 3).map((item, index) => (
                                    <div key={index} className='flex items-center justify-between'>
                                        <div className='flex items-center gap-4'>
                                            <div
                                                className='p-2 rounded-lg'
                                                style={{ backgroundColor: `${item.color}20` }}
                                            >
                                                <item.icon className='w-4 h-4' style={{ color: item.color }} />
                                            </div>
                                            <div className='flex flex-col'>
                                                <span className='text-xs font-normal uppercase font-body'>
                                                    {item.status}
                                                </span>
                                                <span className='text-[10px] text-muted-foreground font-body uppercase'>
                                                    {item.percentage}
                                                </span>
                                            </div>
                                        </div>
                                        <span className='text-xs font-normal uppercase font-body'>{item.value}k</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className='grid grid-cols-1 gap-2 lg:grid-cols-2'>
                {/* Monthly Conversions Chart */}
                <motion.div variants={itemVariants}>
                    <Card className='p-3 h-[520px]'>
                        <div className='flex flex-col items-start justify-between w-full pb-6 border-b'>
                            <h3 className='text-sm font-normal uppercase font-body'>Monthly Conversions</h3>
                            <span className='text-xs font-normal uppercase text-muted-foreground font-body'>
                                Quotations to Orders Conversion Rate
                            </span>
                        </div>
                        <div className='h-[300px] mt-6'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <AreaChart data={monthlyConversionData}>
                                    <defs>
                                        <linearGradient id='colorQuotations' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='#818CF8' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='#818CF8' stopOpacity={0.1} />
                                        </linearGradient>
                                        <linearGradient id='colorOrders' x1='0' y1='0' x2='0' y2='1'>
                                            <stop offset='5%' stopColor='#34D399' stopOpacity={0.8} />
                                            <stop offset='95%' stopColor='#34D399' stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke='#333' strokeOpacity={0.1} />
                                    <XAxis
                                        dataKey='date'
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={value => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString('en-US', { day: 'numeric' });
                                        }}
                                        fontSize={10}
                                        fontFamily='var(--font-body)'
                                        className='text-[8px] uppercase font-body'
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        fontSize={11}
                                        fontFamily='var(--font-body)'
                                        className='text-[9px] uppercase font-body'
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                            fontFamily: 'var(--font-body)',
                                            fontSize: '10px',
                                            textTransform: 'uppercase',
                                            fontWeight: 'normal',
                                        }}
                                        labelFormatter={value => {
                                            const date = new Date(value);
                                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                        }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className='flex flex-col gap-2 p-2 rounded bg-card'>
                                                        <div className='flex flex-row items-center gap-1'>
                                                            <Calendar size={16} strokeWidth={1.5} />
                                                            <p className='text-xs font-normal uppercase font-body'>
                                                                {new Date(payload[0].payload.date).toLocaleDateString(
                                                                    'en-ZA',
                                                                    {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                    },
                                                                )}
                                                            </p>
                                                        </div>
                                                        {payload.map((entry, index) => (
                                                            <p
                                                                key={index}
                                                                className='flex items-center justify-between gap-4'
                                                            >
                                                                <span className='text-[10px] font-normal uppercase font-body'>
                                                                    {entry.dataKey === 'quotations'
                                                                        ? 'Orders:'
                                                                        : 'Quotations:'}
                                                                </span>
                                                                <span className='text-sm font-normal font-body'>
                                                                    R{Math.abs(entry.value as number)}
                                                                </span>
                                                            </p>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type='monotone'
                                        dataKey='quotations'
                                        stroke='#818CF8'
                                        fill='url(#colorQuotations)'
                                        strokeWidth={2}
                                        name='Quotations'
                                    />
                                    <Area
                                        type='monotone'
                                        dataKey='orders'
                                        stroke='#34D399'
                                        fill='url(#colorOrders)'
                                        strokeWidth={2}
                                        name='Orders'
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className='flex items-center justify-center gap-6 pt-6 mt-6 border-t'>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-[#818CF8]' />
                                <span className='text-[10px] font-normal uppercase font-body'>Quotations</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <div className='w-3 h-3 rounded-full bg-[#34D399]' />
                                <span className='text-[10px] font-normal uppercase font-body'>Orders</span>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Claims Report */}
                <motion.div variants={itemVariants} className='h-[520px]'>
                    <ClaimsReportCard />
                </motion.div>
            </div>
        </motion.div>
    );
}
