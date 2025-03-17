'use client';

import { RefObject, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import { WorkerType } from '@/lib/data';
import MarkersLayer from './markers-layer';
import MapCenter from './map-center';
import { useLeafletInit } from '../hooks/use-leaflet-init';

interface MapComponentProps {
    filteredWorkers: WorkerType[];
    selectedMarker: WorkerType | null;
    highlightedMarkerId: string | null;
    handleMarkerClick: (worker: WorkerType) => void;
    mapRef: RefObject<L.Map>;
}

export default function MapComponent({
    filteredWorkers,
    selectedMarker,
    highlightedMarkerId,
    handleMarkerClick,
    mapRef,
}: MapComponentProps) {
    const [isMapReady, setIsMapReady] = useState(false);
    
    // Initialize Leaflet icon fixes
    useLeafletInit();

    // Handle map ready event
    const handleMapReady = () => {
        setIsMapReady(true);
        // Map is accessible through mapRef.current after rendering
    };
    
    // Set default center coordinates
    const defaultCenter: [number, number] = [-26.2041, 28.0473]; // Johannesburg coordinates
    const defaultZoom = 13;

    // Center map on selected marker when it changes
    useEffect(() => {
        if (mapRef.current && selectedMarker?.position) {
            mapRef.current.setView(selectedMarker.position, 15);
        }
    }, [selectedMarker, mapRef]);

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
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenter />
            
            {isMapReady && Array.isArray(filteredWorkers) && filteredWorkers.length > 0 && (
                <MarkersLayer 
                    filteredWorkers={filteredWorkers}
                    selectedMarker={selectedMarker}
                    highlightedMarkerId={highlightedMarkerId}
                    handleMarkerClick={handleMarkerClick}
                />
            )}
        </MapContainer>
    );
} 