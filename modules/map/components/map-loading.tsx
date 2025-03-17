'use client';

import { MapPin } from 'lucide-react';
import { AppLoader } from '@/components/loaders/page-loader';

interface MapLoadingProps {
    message?: string;
}

export function MapLoading({
    message = 'Loading map data...',
}: MapLoadingProps) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full rounded-lg bg-card/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-6 shadow-md bg-card/60 rounded-xl">
                <MapPin className="w-10 h-10 text-primary/70" />
                <AppLoader type="honeycomb" size="md" />
                <p className="text-sm font-thin text-muted-foreground">
                    {message}
                </p>
            </div>
        </div>
    );
}
