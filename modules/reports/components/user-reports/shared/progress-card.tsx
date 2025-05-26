import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ProgressCardProps {
    title: string;
    icon?: LucideIcon;
    value: number;
    target: number;
    unit?: string;
    description?: string;
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
    className?: string;
    showPercentage?: boolean;
    formatValue?: (value: number) => string;
    formatTarget?: (target: number) => string;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
    title,
    icon: Icon,
    value,
    target,
    unit = '',
    description,
    variant = 'default',
    className,
    showPercentage = true,
    formatValue,
    formatTarget,
}) => {
    const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    const isComplete = value >= target;

    const displayValue = formatValue ? formatValue(value) : `${value.toLocaleString()}${unit}`;
    const displayTarget = formatTarget ? formatTarget(target) : `${target.toLocaleString()}${unit}`;

    const getProgressColor = () => {
        switch (variant) {
            case 'success':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'destructive':
                return 'bg-red-500';
            case 'secondary':
                return 'bg-gray-500';
            default:
                return 'bg-primary';
        }
    };

    const getBadgeVariant = () => {
        if (isComplete) return 'default';
        if (percentage >= 75) return 'secondary';
        if (percentage >= 50) return 'outline';
        return 'destructive';
    };

    return (
        <Card className={cn("transition-shadow hover:shadow-md", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center space-x-2">
                    {Icon && (
                        <div className="p-2 rounded-full bg-primary/10">
                            <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                        </div>
                    )}
                    <CardTitle className="text-sm font-normal uppercase font-body">
                        {title}
                    </CardTitle>
                </div>
                {showPercentage && (
                    <Badge variant={getBadgeVariant()} className="text-xs font-body">
                        {percentage.toFixed(0)}%
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-light">{displayValue}</span>
                    <span className="text-sm text-muted-foreground font-body">
                        of {displayTarget}
                    </span>
                </div>

                <Progress
                    value={percentage}
                    className="h-2"
                    // Apply custom color based on variant
                    style={{
                        '--progress-background': getProgressColor(),
                    } as React.CSSProperties}
                />

                {description && (
                    <p className="text-xs text-muted-foreground font-body">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
