'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Users,
    CreditCard,
    Activity,
    DollarSign,
} from 'lucide-react';
import {
    CounterAnimation,
    formatZAR,
    formatPercentage,
} from './counter-animation';
import { useEffect, useState } from 'react';

interface StatsData {
    totalUsers: number;
    cardsCreatedToday: number;
    activeSessions: number;
    revenueToday: number;
    growthPercentage: number;
    newUsersThisWeek: number;
}

interface StatsDisplayProps {
    data: StatsData;
    className?: string;
}

export function StatsDisplay({ data, className = '' }: StatsDisplayProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const stats = [
        {
            title: 'Total Users',
            value: data.totalUsers,
            icon: Users,
            formatter: (val: number) => val.toLocaleString(),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Cards Today',
            value: data.cardsCreatedToday,
            icon: CreditCard,
            formatter: (val: number) => val.toLocaleString(),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Active Sessions',
            value: data.activeSessions,
            icon: Activity,
            formatter: (val: number) => val.toLocaleString(),
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Revenue Today',
            value: data.revenueToday,
            icon: DollarSign,
            formatter: formatZAR,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
    ];

    return (
        <div className={`grid grid-cols-2 gap-4 ${className}`}>
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{
                        opacity: isVisible ? 1 : 0,
                        y: isVisible ? 0 : 20,
                        scale: isVisible ? 1 : 0.9,
                    }}
                    transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        ease: 'easeOut',
                    }}
                    className="p-3 transition-shadow border rounded-lg shadow-sm bg-background hover:shadow-md"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <div className="text-[10px] font-normal uppercase text-muted-foreground font-body">
                            {stat.title}
                        </div>
                    </div>

                    <div className="text-lg font-bold uppercase font-body">
                        <CounterAnimation
                            value={stat.value}
                            formatter={stat.formatter}
                            duration={2}
                        />
                    </div>
                </motion.div>
            ))}

            {/* Growth indicator */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : 20,
                    scale: isVisible ? 1 : 0.9,
                }}
                transition={{
                    duration: 0.5,
                    delay: 0.4,
                    ease: 'easeOut',
                }}
                className="col-span-2 p-3 border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium uppercase text-muted-foreground font-body">
                            Growth This Month
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-green-600 font-body">
                            <CounterAnimation
                                value={data.growthPercentage}
                                formatter={formatPercentage}
                                duration={2}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
