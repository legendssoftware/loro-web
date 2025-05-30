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
import { useResponsiveTextSize } from '@/hooks/use-mobile';
import { getMobileOptimizedMotionProps, getOptimizedDuration } from '@/lib/utils/animations';

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
    const { isMobile, isSmallMobile } = useResponsiveTextSize();
    const mobileProps = getMobileOptimizedMotionProps();

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

    // Dynamic grid layout based on screen size
    const getGridLayout = () => {
        if (isSmallMobile) return 'grid-cols-2'; // 2x2 grid on very small screens
        if (isMobile) return 'grid-cols-2'; // 2x2 grid on mobile
        return 'grid-cols-2'; // Keep 2x2 for consistency
    };

    // Dynamic padding and spacing
    const getCardPadding = () => {
        if (isSmallMobile) return 'p-1.5';
        if (isMobile) return 'p-2';
        return 'p-3';
    };

    const getCardGap = () => {
        if (isSmallMobile) return 'gap-2';
        if (isMobile) return 'gap-3';
        return 'gap-4';
    };

    // Dynamic text sizes
    const getIconSize = () => {
        if (isSmallMobile) return 'h-3 w-3';
        if (isMobile) return 'h-3.5 w-3.5';
        return 'h-4 w-4';
    };

    const getTitleTextSize = () => {
        if (isSmallMobile) return 'text-[8px]';
        if (isMobile) return 'text-[9px]';
        return 'text-[10px]';
    };

    const getValueTextSize = () => {
        if (isSmallMobile) return 'text-sm';
        if (isMobile) return 'text-base';
        return 'text-lg';
    };

    const getIconPadding = () => {
        if (isSmallMobile) return 'p-1';
        if (isMobile) return 'p-1.5';
        return 'p-1.5';
    };

    return (
        <div className={`grid ${getGridLayout()} ${getCardGap()} ${className}`}>
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: isMobile ? 10 : 20, scale: 0.9 }}
                    animate={{
                        opacity: isVisible ? 1 : 0,
                        y: isVisible ? 0 : (isMobile ? 10 : 20),
                        scale: isVisible ? 1 : 0.9,
                    }}
                    transition={{
                        duration: getOptimizedDuration(0.5),
                        delay: index * 0.1,
                        ease: 'easeOut',
                    }}
                    className={`${getCardPadding()} transition-shadow border rounded-lg shadow-sm bg-background hover:shadow-md`}
                >
                    <div className={`flex items-center ${isSmallMobile ? 'gap-1' : 'gap-2'} ${isSmallMobile ? 'mb-1' : 'mb-2'}`}>
                        <div className={`${getIconPadding()} rounded ${stat.bgColor}`}>
                            <stat.icon className={`${getIconSize()} ${stat.color}`} />
                        </div>
                        <div className={`${getTitleTextSize()} font-normal uppercase text-muted-foreground font-body leading-tight`}>
                            {isSmallMobile ? stat.title.split(' ')[0] : stat.title}
                        </div>
                    </div>

                    <div className={`${getValueTextSize()} font-bold uppercase font-body`}>
                        <CounterAnimation
                            value={stat.value}
                            formatter={stat.formatter}
                            duration={isMobile ? 1.5 : 2}
                        />
                    </div>
                </motion.div>
            ))}

            {/* Growth indicator - adjusted for mobile */}
            <motion.div
                initial={{ opacity: 0, y: isMobile ? 10 : 20, scale: 0.9 }}
                animate={{
                    opacity: isVisible ? 1 : 0,
                    y: isVisible ? 0 : (isMobile ? 10 : 20),
                    scale: isVisible ? 1 : 0.9,
                }}
                transition={{
                    duration: getOptimizedDuration(0.5),
                    delay: 0.4,
                    ease: 'easeOut',
                }}
                className={`col-span-2 ${getCardPadding()} border rounded-lg bg-gradient-to-r from-primary/5 to-primary/10`}
            >
                <div className="flex items-center justify-between">
                    <div className={`flex items-center ${isSmallMobile ? 'gap-1' : 'gap-2'}`}>
                        <TrendingUp className={`${getIconSize()} text-green-600`} />
                        <span className={`${getTitleTextSize()} font-medium uppercase text-muted-foreground font-body`}>
                            {isSmallMobile ? 'Growth' : 'Growth This Month'}
                        </span>
                    </div>
                    <div className="text-right">
                        <div className={`${getValueTextSize()} font-bold text-green-600 font-body`}>
                            <CounterAnimation
                                value={data.growthPercentage}
                                formatter={formatPercentage}
                                duration={isMobile ? 1.5 : 2}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
