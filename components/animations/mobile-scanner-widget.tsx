"use client";

import { motion } from 'framer-motion';
import { useResponsiveTextSize } from '@/hooks/use-mobile';
import { getOptimizedDuration } from '@/lib/utils/animations';

interface MobileScannerWidgetProps {
    className?: string;
    scanPercentage?: number;
    growthPercentage?: string;
}

export function MobileScannerWidget({
    className = '',
    scanPercentage = 75,
    growthPercentage = '+12%'
}: MobileScannerWidgetProps) {
    const { isMobile, isSmallMobile } = useResponsiveTextSize();

    // Dynamic sizing based on screen size
    const getContainerSize = () => {
        if (isSmallMobile) return 'max-h-20 lg:max-h-24';
        if (isMobile) return 'max-h-24 lg:max-h-32';
        return 'max-h-32 lg:max-h-48';
    };

    const getIconSize = () => {
        if (isSmallMobile) return 'w-8 h-8';
        if (isMobile) return 'w-10 h-10';
        return 'w-12 h-12';
    };

    const getSVGSize = () => {
        if (isSmallMobile) return '14';
        if (isMobile) return '16';
        return '20';
    };

    const getTextSize = () => {
        if (isSmallMobile) return 'text-[8px]';
        if (isMobile) return 'text-[9px]';
        return 'text-[10px]';
    };

    const getGrowthTextSize = () => {
        if (isSmallMobile) return 'text-[9px]';
        if (isMobile) return 'text-[10px]';
        return 'text-xs';
    };

    const getBarHeight = () => {
        if (isSmallMobile) return 'h-4';
        if (isMobile) return 'h-5';
        return 'h-6';
    };

    const getPadding = () => {
        if (isSmallMobile) return 'p-2';
        if (isMobile) return 'p-2.5';
        return 'p-3';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Scanner Visualization */}
            <div className={`relative aspect-square ${getContainerSize()}`}>
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                    <motion.div
                        className={`flex items-center justify-center ${getIconSize()} bg-white rounded-full shadow-lg`}
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, 0, -5, 0],
                        }}
                        transition={{
                            duration: getOptimizedDuration(5),
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: 'reverse',
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={getSVGSize()}
                            height={getSVGSize()}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                        >
                            <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                            />
                            <rect x="7" y="7" width="3" height="3" />
                            <rect x="14" y="7" width="3" height="3" />
                            <rect x="7" y="14" width="3" height="3" />
                            <rect x="14" y="14" width="3" height="3" />
                        </svg>
                    </motion.div>
                </div>
            </div>

            {/* Scanner Stats Card */}
            <div className={`${getPadding()} border rounded-lg shadow-sm bg-card`}>
                <div className={`flex items-center justify-between ${isSmallMobile ? 'mb-1' : 'mb-2'}`}>
                    <div className={`${getTextSize()} font-normal uppercase font-body`}>
                        {isSmallMobile ? 'Scans' : 'Scan Stats'}
                    </div>
                    <div className={`${getGrowthTextSize()} font-normal uppercase text-primary font-body`}>
                        {growthPercentage}
                    </div>
                </div>
                <div className={`${getBarHeight()} overflow-hidden rounded-md bg-muted`}>
                    <motion.div
                        className={`${getBarHeight()} rounded-md bg-gradient-to-r from-primary to-primary/70`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${scanPercentage}%` }}
                        transition={{
                            duration: getOptimizedDuration(1.5),
                            delay: 0.5,
                            ease: 'easeOut',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
