'use client';

import { Map, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function MapError({
  message = 'Failed to load map data. Please try again.',
  onRetry
}: MapErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-card/20 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col items-center gap-4 p-6 bg-card/60 rounded-xl shadow-md">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-full">
          <Map className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>

        <div className="text-center">
          <h3 className="text-base font-medium">Map Data Error</h3>
          <p className="text-sm text-muted-foreground mt-1">{message}</p>
        </div>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </Button>
        )}
      </div>
    </div>
  );
}
