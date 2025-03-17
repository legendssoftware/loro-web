'use client';

import { useEffect, useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import dynamic from 'next/dynamic';
import { type WorkerType, type EventType } from '@/lib/data';
import {
    Filter,
    List,
    ChevronDown,
    MapPin,
    Clock,
    FileText,
    CalendarClock,
    UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMapQuery } from '@/hooks/use-map-query';

const MapComponent = dynamic(
    () => import('@/modules/map/components/map-container'),
    { ssr: false },
);

const MapLoading = dynamic(
    () =>
        import('@/modules/map/components/map-loading').then(
            (mod) => mod.MapLoading,
        ),
    { ssr: false },
);

const MapError = dynamic(
    () =>
        import('@/modules/map/components/map-error').then(
            (mod) => mod.MapError,
        ),
    { ssr: false },
);

// Filter type definition
type FilterType =
    | 'all'
    | 'check-in'
    | 'shift-start'
    | 'lead'
    | 'journal'
    | 'task';

export default function MapPage() {
    const [selectedMarker, setSelectedMarker] = useState<WorkerType | null>(
        null,
    );
    const [highlightedMarkerId, setHighlightedMarkerId] = useState<
        string | null
    >(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showEventsDropdown, setShowEventsDropdown] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const mapRef = useRef<any>(null);

    // Use the map query hook
    const { workers, events, mapConfig, isLoading, isError, error, refetch } =
        useMapQuery({
            enabled: isClient, // Only enable the query when client-side
        });

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
            // Set the highlight first
            setHighlightedMarkerId(worker.id);

            // Center the map on the worker's position with animation
            if (mapRef.current && worker.position) {
                // Use a higher zoom level for better visibility
                mapRef.current.flyTo(worker.position, 16, {
                    duration: 1.5, // Animation duration in seconds
                });

                // Slight delay before setting selectedMarker to ensure map has time to begin panning
                setTimeout(() => {
                    setSelectedMarker(worker);
                }, 100);
            } else {
                // If map reference isn't available, just set the marker directly
                setSelectedMarker(worker);
            }

            // Close dropdown to avoid covering the popup
            setShowEventsDropdown(false);
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

    if (isLoading) {
        return <MapLoading message="Initializing map..." />;
    }

    if (isError) {
        return <MapError onRetry={refetch} message={error?.message} />;
    }

    if (!isClient) {
        return <MapLoading message="Initializing map..." />;
    }

    console.log(
        showEventsDropdown,
        'showEventsDropdown',
        events,
        'events to show',
    );

    return (
        <ProtectedRoute>
            <PageTransition type="fade">
                <div className="relative w-[98%] mx-auto h-[90vh] p-1 rounded border border-card">
                    <MapComponent
                        filteredWorkers={filteredWorkers}
                        selectedMarker={selectedMarker}
                        highlightedMarkerId={highlightedMarkerId}
                        handleMarkerClick={handleMarkerClick}
                        mapRef={mapRef}
                        mapConfig={mapConfig}
                    />
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
                                            onClick={() =>
                                                setFilter('check-in')
                                            }
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
                                            onClick={() =>
                                                setFilter('shift-start')
                                            }
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
                                disabled={isLoading || isError}
                            >
                                <List size={14} />
                                <span className="hidden sm:inline">Recent Events</span>
                                <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] bg-primary/10 text-primary rounded-full">
                                    {events?.length || 0}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={`transition-transform ${showEventsDropdown ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showEventsDropdown && (
                                <div className="absolute right-0 z-[2501] w-72 mt-1 overflow-hidden rounded-lg shadow-lg top-full bg-card font-body">
                                    <div className="p-1">
                                        <h3 className="px-3 py-2 text-xs font-medium uppercase text-muted-foreground">Recent Events</h3>

                                        {events?.length === 0 ? (
                                            <p className="px-3 py-2 text-[10px] text-muted-foreground">No recent events found.</p>
                                        ) : (
                                            <div className="max-h-[350px] overflow-y-auto">
                                                {events.map((event) => (
                                                    <button
                                                        key={event.id}
                                                        onClick={() => handleEventClick(event)}
                                                        className="w-full text-left px-3 py-2 text-[10px] rounded-md hover:bg-accent/20 flex items-start gap-2"
                                                    >
                                                        <div
                                                            className={cn(
                                                                'w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 mt-0.5',
                                                                event.type === 'check-in'
                                                                    ? 'bg-blue-500'
                                                                    : event.type === 'task'
                                                                        ? 'bg-purple-500'
                                                                        : event.type === 'journal'
                                                                            ? 'bg-red-500'
                                                                            : event.type === 'shift-start'
                                                                                ? 'bg-green-500'
                                                                                : 'bg-orange-500',
                                                            )}
                                                        >
                                                            {event.type === 'check-in' && <MapPin size={12} />}
                                                            {event.type === 'task' && <CalendarClock size={12} />}
                                                            {event.type === 'journal' && <FileText size={12} />}
                                                            {event.type === 'shift-start' && <Clock size={12} />}
                                                            {event.type === 'lead' && <UserPlus size={12} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="font-medium uppercase text-[9px] text-primary">
                                                                {event.type.replace('-', ' ')}
                                                            </div>
                                                            <div className="font-thin uppercase">
                                                                {event.title}
                                                            </div>
                                                            <div className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                                                                <Clock size={8} />
                                                                {event.time}
                                                            </div>
                                                            <div className="text-[9px] text-muted-foreground flex items-center gap-1">
                                                                <MapPin size={8} />
                                                                <span className="truncate">{event.location}</span>
                                                            </div>
                                                            {event.user && (
                                                                <div className="flex items-center gap-1 pt-1 mt-1 border-t border-border/10">
                                                                    <div className="w-4 h-4 overflow-hidden rounded-full bg-accent">
                                                                        <img
                                                                            src="/placeholder.svg?height=16&width=16"
                                                                            alt={event.user}
                                                                            className="object-cover w-full h-full"
                                                                        />
                                                                    </div>
                                                                    <div className="truncate">{event.user}</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
