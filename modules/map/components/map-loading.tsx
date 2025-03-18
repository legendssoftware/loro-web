'use client';

import { AppLoader } from '@/components/loaders/page-loader';

interface MapLoadingProps {
    message?: string;
}

export function MapLoading({
    message = 'Loading map data...',
}: MapLoadingProps) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen rounded-lg bg-card/20 backdrop-blur-sm">
            <AppLoader type="honeycomb" size="md" />
        </div>
    );
}
