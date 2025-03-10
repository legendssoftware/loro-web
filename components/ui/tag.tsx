import { cn } from '@/lib/utils';

interface TagProps {
    text: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function Tag({ text, className, size = 'sm' }: TagProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium',
                sizeClasses[size],
                className
            )}
        >
            {text}
        </span>
    );
}
