'use client';

import { useEffect, useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import dynamic from 'next/dynamic';
import {
    workers,
    type WorkerType,
    type MarkerType,
    type EventType,
} from '@/lib/data';
import { Filter, List, ChevronDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamically import Leaflet components to avoid SSR issues with no SSR option
const MapComponent = dynamic(
    () => import('@/modules/map/components/map-container'),
    { ssr: false }
);

// Dynamically import EventsSidebar with SSR disabled
const DynamicEventsSidebar = dynamic(
    () => import('@/modules/map/components/events-sidebar'),
    { ssr: false }
);

type FilterType =
    | 'all'
    | 'check-in'
    | 'shift-start'
    | 'lead'
    | 'journal'
    | 'task';

export default function MapPage() {
    const [selectedMarker, setSelectedMarker] = useState<WorkerType | null>(null);
    const [highlightedMarkerId, setHighlightedMarkerId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showEventsDropdown, setShowEventsDropdown] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const mapRef = useRef<any>(null);

    // Set isClient to true when component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleMarkerClick = (worker: WorkerType) => {
        if (!worker) return;
        setSelectedMarker(worker);
        setHighlightedMarkerId(worker.id);
    };

    const handleEventClick = (event: EventType) => {
        if (!event || !event.user) return;
        
        // Find the worker associated with this event
        const worker = workers.find((w) => w?.name === event.user);
        if (worker) {
            setHighlightedMarkerId(worker.id);
            setSelectedMarker(worker);

            // Center map on the marker (handled by useEffect in MapComponent)
        }
    };

    // Filter workers based on active filter
    const filteredWorkers = Array.isArray(workers) 
        ? workers.filter((worker) => {
            if (!worker) return false;
            if (activeFilter === 'all') return true;
            return worker.markerType === activeFilter;
        })
        : [];

    const toggleFilterDropdown = () => {
        setShowFilterDropdown(!showFilterDropdown);
        if (showEventsDropdown) setShowEventsDropdown(false);
    };

    const toggleEventsDropdown = () => {
        setShowEventsDropdown(!showEventsDropdown);
        if (showFilterDropdown) setShowFilterDropdown(false);
    };

    const setFilter = (filter: FilterType) => {
        setActiveFilter(filter);
        setShowFilterDropdown(false);
    };

    return (
        <ProtectedRoute>
            <PageTransition type="fade">
                <div className="relative w-[98%] mx-auto h-[90vh] p-1 border-border/20 rounded">
                    {isClient ? (
                        <MapComponent
                            filteredWorkers={filteredWorkers}
                            selectedMarker={selectedMarker}
                            highlightedMarkerId={highlightedMarkerId}
                            handleMarkerClick={handleMarkerClick}
                            mapRef={mapRef}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-screen">
                            <MapPin className="w-16 h-16 animate-pulse text-primary/50" />
                        </div>
                    )}

                    {/* Top Navigation Bar */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[2500] flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={toggleFilterDropdown}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-thin uppercase transition-colors rounded shadow-md bg-card hover:bg-accent/20 font-body"
                            >
                                <Filter size={14} />
                                <span className="hidden sm:inline">Filter</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showFilterDropdown && (
                                <div className="absolute right-0 z-[2501] w-48 mt-1 overflow-hidden rounded-lg shadow-lg top-full bg-card font-body">
                                    <div className="p-1">
                                        <button
                                            onClick={() => setFilter('all')}
                                            className={cn(
                                                'w-full text-left px-3 py-2 text-[10px] rounded-md uppercase font-thin',
                                                activeFilter === 'all'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-accent/20',
                                            )}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => setFilter('check-in')}
                                            className={cn(
                                                'w-full text-left px-3 py-2 text-[10px] rounded-md uppercase font-thin',
                                                activeFilter === 'check-in'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-accent/20',
                                            )}
                                        >
                                            Check-ins
                                        </button>
                                        <button
                                            onClick={() => setFilter('task')}
                                            className={cn(
                                                'w-full text-left px-3 py-2 text-[10px] rounded-md uppercase font-thin',
                                                activeFilter === 'task'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-accent/20',
                                            )}
                                        >
                                            Tasks
                                        </button>
                                        <button
                                            onClick={() => setFilter('journal')}
                                            className={cn(
                                                'w-full text-left px-3 py-2 text-[10px] rounded-md uppercase font-thin',
                                                activeFilter === 'journal'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-accent/20',
                                            )}
                                        >
                                            Journals
                                        </button>
                                        <button
                                            onClick={() => setFilter('shift-start')}
                                            className={cn(
                                                'w-full text-left px-3 py-2 text-[10px] rounded-md uppercase font-thin',
                                                activeFilter === 'shift-start'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-accent/20',
                                            )}
                                        >
                                            Shift Starts
                                        </button>
                                        <button
                                            onClick={() => setFilter('lead')}
                                            className={cn(
                                                'w-full text-left px-3 py-2 text-[10px] rounded-md uppercase font-thin',
                                                activeFilter === 'lead'
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-accent/20',
                                            )}
                                        >
                                            Leads
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={toggleEventsDropdown}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-thin uppercase transition-colors rounded shadow-md bg-card hover:bg-accent/20 font-body"
                            >
                                <List size={14} />
                                <span className="hidden sm:inline">Recent Events</span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${showEventsDropdown ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showEventsDropdown && isClient && (
                                <div className="absolute right-0 z-[2501] w-80 mt-1 overflow-hidden rounded-lg shadow-lg top-full bg-card font-body max-h-[calc(100vh-6rem)] overflow-y-auto">
                                    <DynamicEventsSidebar
                                        onEventClick={(event) => {
                                            handleEventClick(event);
                                            setShowEventsDropdown(false);
                                        }}
                                        highlightedMarkerId={highlightedMarkerId}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
