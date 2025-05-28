'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CounterAnimationProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    formatter?: (value: number) => string;
    className?: string;
}

export function CounterAnimation({
    value,
    duration = 2,
    prefix = '',
    suffix = '',
    formatter,
    className = 'text-xs uppercase font-body',
}: CounterAnimationProps) {
    const spring = useSpring(0, {
        stiffness: 60,
        damping: 15,
        restDelta: 0.01,
    });

    const display = useTransform(spring, (latest) => {
        const rounded = Math.round(latest);
        return formatter ? formatter(rounded) : rounded.toLocaleString();
    });

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return (
        <motion.span
            className={className}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {prefix}
            <motion.span>{display}</motion.span>
            {suffix}
        </motion.span>
    );
}

// Currency formatter for ZAR
export function formatZAR(value: number): string {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

// Percentage formatter
export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
}
