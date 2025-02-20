'use client';

import { useMemo } from 'react';

interface SparklineProps {
    data: readonly number[];
    width?: number;
    height?: number;
    color?: string;
}

export function Sparkline({ data, width = 80, height = 24, color = 'currentColor' }: SparklineProps) {
    const points = useMemo(() => {
        const maxValue = Math.max(...data);
        const minValue = Math.min(...data);
        const range = maxValue - minValue;
        const step = width / (data.length - 1);

        return data.map((value, i) => ({
            x: i * step,
            y: height - ((value - minValue) / range) * height,
        }));
    }, [data, width, height]);

    const path = useMemo(() => {
        return points.reduce((acc, point, i) => {
            if (i === 0) return `M ${point.x},${point.y}`;
            const prev = points[i - 1];
            const cx = (prev.x + point.x) / 2;
            return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
        }, '');
    }, [points]);

    return (
        <svg width={width} height={height} className='overflow-visible'>
            <path d={path} fill='none' stroke={color} strokeWidth='1.5' strokeLinecap='round' />
            {points.map((point, i) => (
                <circle key={i} cx={point.x} cy={point.y} r='1.5' fill={color} />
            ))}
        </svg>
    );
}
