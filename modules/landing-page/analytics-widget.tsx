'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    Globe,
    Smartphone,
    Clock,
    Target,
    DollarSign,
    BarChart3,
    Users,
    MousePointer,
    Share2,
    ChevronRight,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    CounterAnimation,
    formatZAR,
    formatPercentage,
} from '@/components/animations/counter-animation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
    totalViews: number;
    totalContacts: number;
    totalShares: number;
    conversionRate: number;
    revenueToday: number;
    topCountries: { country: string; views: number; flag: string }[];
    deviceBreakdown: { device: string; percentage: number; icon: any }[];
    peakHours: { hour: string; activity: number }[];
    trends: {
        views: { value: number; change: number };
        contacts: { value: number; change: number };
        revenue: { value: number; change: number };
    };
}

interface AnalyticsWidgetProps {
    className?: string;
}

export function AnalyticsWidget({ className = '' }: AnalyticsWidgetProps) {
    const [data, setData] = useState<AnalyticsData>({
        totalViews: 12547,
        totalContacts: 2893,
        totalShares: 1456,
        conversionRate: 23.1,
        revenueToday: 15420,
        topCountries: [
            { country: 'South Africa', views: 8234, flag: '🇿🇦' },
            { country: 'Nigeria', views: 2156, flag: '🇳🇬' },
            { country: 'Kenya', views: 1234, flag: '🇰🇪' },
            { country: 'Ghana', views: 923, flag: '🇬🇭' },
        ],
        deviceBreakdown: [
            { device: 'Mobile', percentage: 68, icon: Smartphone },
            { device: 'Desktop', percentage: 25, icon: BarChart3 },
            { device: 'Tablet', percentage: 7, icon: Smartphone },
        ],
        peakHours: [
            { hour: '9AM', activity: 85 },
            { hour: '1PM', activity: 72 },
            { hour: '5PM', activity: 91 },
            { hour: '8PM', activity: 64 },
        ],
        trends: {
            views: { value: 12547, change: 15.2 },
            contacts: { value: 2893, change: 8.7 },
            revenue: { value: 15420, change: 22.1 },
        },
    });

    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData((prev) => ({
                ...prev,
                totalViews: prev.totalViews + Math.floor(Math.random() * 10),
                totalContacts:
                    prev.totalContacts + Math.floor(Math.random() * 3),
                totalShares: prev.totalShares + Math.floor(Math.random() * 2),
                revenueToday:
                    prev.revenueToday + Math.floor(Math.random() * 100),
            }));
        }, 15000); // Update every 15 seconds

        return () => clearInterval(interval);
    }, []);

    const quickStats = [
        {
            title: 'Total Views',
            value: data.totalViews,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            change: data.trends.views.change,
        },
        {
            title: 'Contacts Made',
            value: data.totalContacts,
            icon: MousePointer,
            color: 'text-green-600',
            bg: 'bg-green-50',
            change: data.trends.contacts.change,
        },
        {
            title: 'Revenue Today',
            value: data.revenueToday,
            icon: DollarSign,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            change: data.trends.revenue.change,
            formatter: formatZAR,
        },
    ];

    return (
        <div className={className}>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Live Analytics Dashboard
                            </CardTitle>
                            <CardDescription className="text-xs font-body text-muted-foreground">
                                Real-time insights
                            </CardDescription>
                        </div>
                        <Link href="/analytics">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1 text-[10px] cursor-pointer text-primary hover:text-primary/80 font-body uppercase"
                            >
                                View Full
                                <ChevronRight className="w-4 h-4" />
                            </motion.div>
                        </Link>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {quickStats.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div
                                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} mb-2`}
                                >
                                    <stat.icon
                                        className={`h-5 w-5 ${stat.color}`}
                                    />
                                </div>
                                <div className="mb-1 text-[10px] font-medium uppercase text-muted-foreground font-body">
                                    {stat.title}
                                </div>
                                <div className="text-xl font-bold font-body">
                                    <CounterAnimation
                                        value={stat.value}
                                        formatter={stat.formatter}
                                        duration={1.5}
                                    />
                                </div>
                                <div className="flex items-center justify-center gap-1 text-xs">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-[10px] font-medium text-green-600 uppercase font-body">
                                        +{formatPercentage(stat.change)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Geographic Analytics */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-normal uppercase font-body">
                                Top Countries
                            </span>
                        </div>
                        <div className="space-y-2">
                            {data.topCountries
                                .slice(0, 3)
                                .map((country, index) => (
                                    <motion.div
                                        key={country.country}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: 0.3 + index * 0.1,
                                        }}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {country.flag}
                                            </span>
                                            <span className="text-xs font-body">
                                                {country.country}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium font-body">
                                            <CounterAnimation
                                                value={country.views}
                                                duration={1}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                    </div>

                    {/* Device Analytics */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Smartphone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-normal uppercase font-body">
                                Device Usage
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {data.deviceBreakdown.map((device, index) => (
                                <motion.div
                                    key={device.device}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex-1"
                                >
                                    <Badge
                                        variant="secondary"
                                        className="justify-center w-full text-[10px] font-normal uppercase font-body"
                                    >
                                        {device.device} {device.percentage}%
                                    </Badge>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Conversion Rate */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                <span className="text-xs font-normal uppercase font-body">
                                    Conversion Rate
                                </span>
                            </div>
                            <div className="text-lg font-bold text-primary font-body">
                                <CounterAnimation
                                    value={data.conversionRate}
                                    formatter={formatPercentage}
                                    duration={2}
                                />
                            </div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground font-body">
                            Views to contacts ratio
                        </div>
                    </motion.div>
                </CardContent>
            </Card>
        </div>
    );
}
