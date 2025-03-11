'use client';

import { cn } from '@/lib/utils';

interface HoneycombLoaderProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function HoneycombLoader({
  className,
  color,
  size = 'md'
}: HoneycombLoaderProps) {
  const sizeClasses = {
    sm: 'scale-70',
    md: 'scale-120',
    lg: 'scale-150',
  };

  const style = color ? {
    '--loader-color': color
  } as React.CSSProperties : undefined;

  return (
    <div className={cn("honeycomb", sizeClasses[size], className)} style={style}>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}

// Export a standard size AppHoneycombLoader that fits the design system
export function AppHoneycombLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center">
      <HoneycombLoader size={size} />
    </div>
  );
}
