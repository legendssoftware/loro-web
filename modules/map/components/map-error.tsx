'use client';

import { Map, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapErrorProps {
    message?: string;
    onRetry?: () => void;
}

export function MapError({
    message = 'Failed to load map data. Please try again.',
    onRetry,
}: MapErrorProps) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen rounded-lg bg-card/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-6 rounded bg-card/60">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full dark:bg-red-950/20">
                    <Map
                        className="w-12 h-12 text-red-500 dark:text-red-400"
                        strokeWidth={1.5}
                    />
                </div>
                <div className="text-center">
                    <h3 className="text-base font-thin uppercase font-body">
                        Map Data Error
                    </h3>
                    <p className="mt-1 text-xs font-thin uppercase text-muted-foreground font-body">
                        {message}
                    </p>
                </div>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="flex items-center gap-2 mt-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span className="font-thin uppercase font-body">
                            Retry
                        </span>
                    </Button>
                )}
            </div>
        </div>
    );
}
