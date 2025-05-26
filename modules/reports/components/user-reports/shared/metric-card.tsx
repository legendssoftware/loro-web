import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    unit?: string;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
        period: string;
    };
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
    className?: string;
    badge?: {
        text: string;
        variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    };
    formatValue?: (value: string | number) => string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon: Icon,
    unit = '',
    description,
    trend,
    variant = 'default',
    className,
    badge,
    formatValue,
}) => {
    const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;

    const getIconColor = () => {
        switch (variant) {
            case 'success':
                return 'text-green-500';
            case 'warning':
                return 'text-yellow-500';
            case 'destructive':
                return 'text-red-500';
            case 'secondary':
                return 'text-gray-500';
            default:
                return 'text-primary';
        }
    };

    const getTrendColor = () => {
        if (!trend) return '';
        return trend.isPositive ? 'text-green-600' : 'text-red-600';
    };

    return (
        <Card className={cn("transition-shadow hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center space-x-2">
                    {Icon && (
                        <div className="p-2 rounded-full bg-primary/10">
                            <Icon className={cn("w-4 h-4", getIconColor())} strokeWidth={1.5} />
                        </div>
                    )}
                    <CardTitle className="text-sm font-normal uppercase font-body">
                        {title}
                    </CardTitle>
                </div>
                {badge && (
                    <Badge variant={badge.variant || 'default'} className="text-xs font-body">
                        {badge.text}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-light">{displayValue}</span>
                    {trend && (
                        <div className={cn("text-sm font-body", getTrendColor())}>
                            {trend.isPositive ? '+' : ''}{trend.value}% {trend.period}
                        </div>
                    )}
                </div>

                {description && (
                    <p className="text-xs text-muted-foreground font-body">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
