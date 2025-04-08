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

// Utility function to validate coordinates
const isValidPosition = (position: any): position is [number, number] => {
    return (
        Array.isArray(position) &&
        position.length === 2 &&
        typeof position[0] === 'number' &&
        typeof position[1] === 'number' &&
        !isNaN(position[0]) &&
        !isNaN(position[1])
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
        if (mapRef.current && selectedMarker) {
            let position: [number, number] | null = null;

            // Get position from marker position property
            if (
                selectedMarker.position &&
                isValidPosition(selectedMarker.position)
            ) {
                position = selectedMarker.position;
            }
            // Or from location property for events
            else if (
                'location' in selectedMarker &&
                typeof selectedMarker.location === 'object' &&
                selectedMarker.location &&
                'lat' in selectedMarker.location &&
                'lng' in selectedMarker.location
            ) {
                position = [
                    Number(selectedMarker.location.lat),
                    Number(selectedMarker.location.lng),
                ];
            }

            if (position) {
                mapRef.current.setView(position, 15);

                // Search for the marker by ID to open its popup
                setTimeout(() => {
                    const markers = document.querySelectorAll(
                        '.leaflet-marker-icon',
                    );
                    markers.forEach((marker) => {
                        if (
                            marker.getAttribute('data-marker-id') ===
                            selectedMarker.id?.toString()
                        ) {
                            (marker as HTMLElement).click();
                        }
                    });
                }, 100);
            }
        }
    }, [selectedMarker, mapRef]);

    // Process all markers to display
    const allMarkers = useMemo(() => {
        // Create an array of all entities we want to show on the map
        const entities = [
            ...filteredWorkers, // Already filtered by the parent component
            ...(clients || []),
            ...(competitors || []),
            ...(quotations || []),
        ].filter(Boolean); // Remove any undefined or null entries

        // Filter out any invalid entities and ensure they have valid positions
        return entities.filter(
            (entity) =>
                entity &&
                entity.id &&
                (isValidPosition(entity.position) ||
                    // Check if it's an entity with location.lat and location.lng (like an event)
                    ('location' in entity &&
                        typeof entity.location === 'object' &&
                        entity.location !== null &&
                        'lat' in entity.location &&
                        'lng' in entity.location &&
                        typeof entity.location.lat === 'number' &&
                        typeof entity.location.lng === 'number')),
        );
    }, [filteredWorkers, clients, competitors, quotations]);

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
