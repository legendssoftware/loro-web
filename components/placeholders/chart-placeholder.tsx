'use client';

import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface ChartProps {
    title: string;
}

export function BarChart({ title }: ChartProps) {
    return (
        <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <BarChart3 className="w-16 h-16 mb-4 text-primary/30" strokeWidth={1.5} />
            <h2 className="text-lg font-thin uppercase font-body">{title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">
                Bar chart visualization coming soon
            </p>
        </div>
    );
}

export function PieChart({ title }: ChartProps) {
    return (
        <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
            <PieChartIcon className="w-16 h-16 mb-4 text-primary/30" strokeWidth={1.5} />
            <h2 className="text-lg font-thin uppercase font-body">{title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">
                Pie chart visualization coming soon
            </p>
        </div>
    );
}
