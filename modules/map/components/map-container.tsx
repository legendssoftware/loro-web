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
    filteredWorkers: any[]; // Extended to support all marker types
    clients?: ClientType[];
    competitors?: CompetitorType[];
    quotations?: QuotationType[];
    // New comprehensive data arrays
    leads?: any[];
    journals?: any[];
    tasks?: any[];
    checkIns?: any[];
    shiftStarts?: any[];
    shiftEnds?: any[];
    breakStarts?: any[];
    breakEnds?: any[];
    allMarkers?: any[];
    filteredEntities?: any[];
    activeFilter?: string;
    selectedMarker: any | null; // Extended to support all marker types
    highlightedMarkerId: string | null;
    handleMarkerClick: (marker: any) => void; // Extended to support all marker types
    mapRef: RefObject<L.Map>;
    mapConfig?: {
        defaultCenter: { lat: number; lng: number };
        orgRegions?: Array<{
            name: string;
            center: { lat: number; lng: number };
            zoom: number;
        }>;
    };
    
    // Enhanced GPS Analysis Data
    gpsAnalysis?: {
        totalWorkersAnalyzed: number;
        totalDistanceCovered: number;
        totalStopsDetected: number;
        averageStopsPerWorker: number;
        averageSpeedKmh: number;
        maxSpeedRecorded: number;
        workersData: Array<{
            workerId: number;
            workerName: string;
            tripSummary?: any;
            stopsCount: number;
            topStops: any[];
        }>;
    };
    
    routeOptimizations?: {
        totalWorkersOptimized: number;
        totalPotentialSaving: number;
        averagePotentialSaving: number;
        workersWithOptimizations: Array<{
            workerId: number;
            workerName: string;
            optimization: any;
        }>;
    };
    
    analytics?: {
        totalMarkers: number;
        markerBreakdown: any;
        gpsInsights: any;
        routeInsights: any;
    };
    
    showGpsAnalytics?: boolean; // Control visibility of GPS analytics
    showRouteOptimizations?: boolean; // Control visibility of route optimizations
}

export default function MapComponent({
    filteredWorkers,
    clients = [],
    competitors = [],
    quotations = [],
    leads = [],
    journals = [],
    tasks = [],
    checkIns = [],
    shiftStarts = [],
    shiftEnds = [],
    breakStarts = [],
    breakEnds = [],
    allMarkers = [],
    filteredEntities = [],
    activeFilter,
    selectedMarker,
    highlightedMarkerId,
    handleMarkerClick,
    mapRef,
    mapConfig,
    gpsAnalysis,
    routeOptimizations,
    analytics,
    showGpsAnalytics = false,
    showRouteOptimizations = false,
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
    const markersToRender = useMemo(() => {
        // If filteredEntities is provided (when using filtering), use that
        if (filteredEntities && filteredEntities.length > 0) {
            return filteredEntities.filter(
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
        }

        // If allMarkers prop is provided, use that (comes from the parent's filtering)
        if (allMarkers && allMarkers.length > 0) {
            return allMarkers.filter(
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
        }

        // Otherwise, combine all available entities
        const entities = [
            ...filteredWorkers, // Already filtered by the parent component
            ...(clients || []),
            ...(competitors || []),
            ...(quotations || []),
            ...(leads || []),
            ...(journals || []),
            ...(tasks || []),
            ...(checkIns || []),
            ...(shiftStarts || []),
            ...(shiftEnds || []),
            ...(breakStarts || []),
            ...(breakEnds || []),
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
    }, [filteredWorkers, clients, competitors, quotations, leads, journals, tasks, checkIns, shiftStarts, shiftEnds, breakStarts, breakEnds, filteredEntities, allMarkers]);

    // Now handle the markers differently for rendering
    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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
                {isMapReady && markersToRender.length > 0 && (
                    <MarkersLayer
                        filteredWorkers={markersToRender}
                        selectedMarker={selectedMarker}
                        highlightedMarkerId={highlightedMarkerId}
                        handleMarkerClick={handleMarkerClick}
                    />
                )}
            </MapContainer>

            {/* GPS Analytics Overlay */}
            {showGpsAnalytics && gpsAnalysis && (
                <div
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: 15,
                        borderRadius: 8,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        minWidth: 280,
                        maxWidth: 400,
                        fontSize: 14,
                    }}
                >
                    <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 'bold' }}>
                        📍 GPS Analytics
                    </h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div><strong>Workers Analyzed:</strong> {gpsAnalysis.totalWorkersAnalyzed}</div>
                        <div><strong>Total Distance:</strong> {gpsAnalysis.totalDistanceCovered.toFixed(1)}km</div>
                        <div><strong>Total Stops:</strong> {gpsAnalysis.totalStopsDetected}</div>
                        <div><strong>Avg Speed:</strong> {gpsAnalysis.averageSpeedKmh.toFixed(1)}km/h</div>
                        <div><strong>Max Speed:</strong> {gpsAnalysis.maxSpeedRecorded.toFixed(1)}km/h</div>
                        <div><strong>Avg Stops/Worker:</strong> {gpsAnalysis.averageStopsPerWorker.toFixed(1)}</div>
                    </div>
                </div>
            )}

            {/* Route Optimizations Overlay */}
            {showRouteOptimizations && routeOptimizations && routeOptimizations.totalWorkersOptimized > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        padding: 15,
                        borderRadius: 8,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        minWidth: 280,
                        maxWidth: 400,
                        fontSize: 14,
                    }}
                >
                    <h3 style={{ margin: '0 0 10px 0', fontSize: 16, fontWeight: 'bold' }}>
                        🛣️ Route Optimization
                    </h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div><strong>Routes Optimized:</strong> {routeOptimizations.totalWorkersOptimized}</div>
                        <div><strong>Total Potential Saving:</strong> {routeOptimizations.totalPotentialSaving.toFixed(1)}km</div>
                        <div><strong>Avg Saving/Route:</strong> {routeOptimizations.averagePotentialSaving.toFixed(1)}km</div>
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            💡 Optimization suggestions available for {routeOptimizations.workersWithOptimizations.length} workers
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
