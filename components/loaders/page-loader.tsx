import { cn } from '@/lib/utils';
import { HoneycombLoader } from './honeycomb-loader';

interface AppLoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    type?: 'spinner' | 'honeycomb';
}

// Legacy spinner loader
function SpinnerLoader({ size = 'md', className }: Omit<AppLoaderProps, 'type'>) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
    };

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-t-transparent border-primary',
                sizeClasses[size],
                className
            )}
        />
    );
}

// Main AppLoader that now defaults to the honeycomb loader
export function AppLoader({ size = 'md', className, type = 'honeycomb' }: AppLoaderProps) {
    if (type === 'spinner') {
        return <SpinnerLoader size={size} className={className} />;
    }

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <HoneycombLoader size={size} />
        </div>
    );
}
