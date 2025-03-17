'use client';

import { RefObject, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { WorkerType } from '@/lib/data';
import MarkersLayer from './markers-layer';
import MapCenter from './map-center';
import { useLeafletInit } from '../hooks/use-leaflet-init';

// Utility function to validate coordinates
const isValidPosition = (position: any): position is [number, number] => {
    return Array.isArray(position) &&
        position.length === 2 &&
        typeof position[0] === 'number' &&
        typeof position[1] === 'number' &&
        !isNaN(position[0]) &&
        !isNaN(position[1]) &&
        position[0] >= -90 &&
        position[0] <= 90 &&
        position[1] >= -180 &&
        position[1] <= 180;
};

interface MapComponentProps {
    filteredWorkers: WorkerType[];
    selectedMarker: WorkerType | null;
    highlightedMarkerId: string | null;
    handleMarkerClick: (worker: WorkerType) => void;
    mapRef: RefObject<L.Map>;
    mapConfig?: {
        defaultCenter: { lat: number; lng: number };
        orgRegions?: Array<{
            name: string;
            center: { lat: number; lng: number };
            zoom: number;
        }>;
    };
}

export default function MapComponent({
    filteredWorkers,
    selectedMarker,
    highlightedMarkerId,
    handleMarkerClick,
    mapRef,
    mapConfig,
}: MapComponentProps) {
    const [isMapReady, setIsMapReady] = useState(false);

    // Initialize Leaflet icon fixes
    useLeafletInit();

    // Handle map ready event
    const handleMapReady = () => {
        setIsMapReady(true);
        // Map is accessible through mapRef.current after rendering
    };

    // Set default center coordinates from environment variables or fallback to Johannesburg coordinates
    const defaultCenter: [number, number] = mapConfig?.defaultCenter
        ? [mapConfig.defaultCenter.lat, mapConfig.defaultCenter.lng]
        : [
            process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT
                ? parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT)
                : -26.2041,
            process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG
                ? parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG)
                : 28.0473
        ];

    const defaultZoom = process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM
        ? parseInt(process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM)
        : 13;

    // Center map on selected marker when it changes
    useEffect(() => {
        if (mapRef.current && selectedMarker?.position) {
            // Validate position data is valid before setting view
            if (isValidPosition(selectedMarker.position)) {
                mapRef.current.setView(selectedMarker.position, 15);
            }
        }
    }, [selectedMarker, mapRef]);

    // Safely validate and filter workers with valid coordinates
    const safeWorkers = Array.isArray(filteredWorkers)
        ? filteredWorkers.filter(worker => worker && isValidPosition(worker.position))
        : [];

    return (
        <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                borderRadius: 8,
                zIndex: 1, // Lower z-index than sidebar and nav
            }}
            ref={mapRef}
            whenReady={handleMapReady}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenter />

            {isMapReady && safeWorkers.length > 0 && (
                <MarkersLayer
                    filteredWorkers={safeWorkers}
                    selectedMarker={selectedMarker}
                    highlightedMarkerId={highlightedMarkerId}
                    handleMarkerClick={handleMarkerClick}
                />
            )}
        </MapContainer>
    );
}