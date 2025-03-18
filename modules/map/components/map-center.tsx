'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapCenterProps {
    center?: [number, number];
    zoom?: number;
}

export default function MapCenter({
    center = [-26.2041, 28.0473], // Default: Johannesburg, South Africa
    zoom = 13
}: MapCenterProps) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [map, center, zoom]);

    return null;
}