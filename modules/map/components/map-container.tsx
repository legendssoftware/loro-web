'use client';

import { RefObject, useEffect, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import {
    WorkerType,
    ClientType,
    CompetitorType,
    QuotationType,
} from '@/lib/data';
import MarkersLayer from './markers-layer';
import MapCenter from './map-center';
import { useLeafletInit } from '../hooks/use-leaflet-init';

// Define a union type for all map markers
type MapMarker = WorkerType | ClientType | CompetitorType | QuotationType;

// Type guard to check if a marker is a WorkerType
const isWorker = (marker: MapMarker): marker is WorkerType => {
    return (
        'markerType' in marker &&
        (marker.markerType === 'check-in' ||
            marker.markerType === 'shift-start' ||
            marker.markerType === 'lead' ||
            marker.markerType === 'journal' ||
            marker.markerType === 'task' ||
            marker.markerType === 'break-start' ||
            marker.markerType === 'break-end')
    );
};

// Type guard for client markers
const isClient = (marker: MapMarker): marker is ClientType => {
    return 'markerType' in marker && marker.markerType === 'client';
};

// Type guard for competitor markers
const isCompetitor = (marker: MapMarker): marker is CompetitorType => {
    return 'markerType' in marker && marker.markerType === 'competitor';
};

// Type guard for quotation markers
const isQuotation = (marker: MapMarker): marker is QuotationType => {
    return 'markerType' in marker && marker.markerType === 'quotation';
};

// Utility function to validate coordinates
const isValidPosition = (position: any): position is [number, number] => {
    return (
        Array.isArray(position) &&
        position.length === 2 &&
        typeof position[0] === 'number' &&
        typeof position[1] === 'number' &&
        !isNaN(position[0]) &&
        !isNaN(position[1]) &&
        position[0] >= -90 &&
        position[0] <= 90 &&
        position[1] >= -180 &&
        position[1] <= 180
    );
};

interface MapComponentProps {
    filteredWorkers: (
        | WorkerType
        | ClientType
        | CompetitorType
        | QuotationType
    )[];
    clients?: ClientType[];
    competitors?: CompetitorType[];
    quotations?: QuotationType[];
    selectedMarker:
        | WorkerType
        | ClientType
        | CompetitorType
        | QuotationType
        | null;
    highlightedMarkerId: string | null;
    handleMarkerClick: (
        marker: WorkerType | ClientType | CompetitorType | QuotationType,
    ) => void;
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
    clients = [],
    competitors = [],
    quotations = [],
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
                  : 28.0473,
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

    // Process all markers to display
    const allMarkers = useMemo(() => {
        // Create a set of all entities we want to show on the map - excluding quotations
        const entities = new Set([
            ...filteredWorkers, // Already filtered by the parent component
            ...(filteredWorkers.some((w) => w.markerType === 'client')
                ? []
                : clients),
            ...(filteredWorkers.some((w) => w.markerType === 'competitor')
                ? []
                : competitors),
            // Quotations are intentionally excluded from the map display
        ]);

        // Filter out any invalid entities and ensure they have valid positions
        return Array.from(entities).filter(
            (entity) =>
                entity &&
                entity.id &&
                entity.position &&
                isValidPosition(entity.position) &&
                entity.markerType !== 'quotation', // Additional filter to ensure no quotations are shown
        );
    }, [filteredWorkers, clients, competitors]); // Removed quotations from dependencies

    // Now handle the markers differently for rendering
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

            {/* Render all markers in a single layer */}
            {isMapReady && allMarkers.length > 0 && (
                <MarkersLayer
                    filteredWorkers={allMarkers}
                    selectedMarker={selectedMarker}
                    highlightedMarkerId={highlightedMarkerId}
                    handleMarkerClick={handleMarkerClick}
                />
            )}
        </MapContainer>
    );
}
