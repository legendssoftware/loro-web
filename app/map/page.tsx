'use client';

import { useEffect, useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import dynamic from 'next/dynamic';
import {
    type WorkerType,
    type MarkerType,
    type EventType,
} from '@/lib/data';
import { Filter, List, ChevronDown, MapPin, Clock, Users, FileText, CalendarClock, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mapApi } from '@/lib/services/map-api';

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
    const [loading, setLoading] = useState(true);
    const [workers, setWorkers] = useState<WorkerType[]>([]);
    const [events, setEvents] = useState<EventType[]>([]);
    const [mapConfig, setMapConfig] = useState<any>(null);
    const mapRef = useRef<any>(null);

    // Fetch map data when component mounts
    useEffect(() => {
        const fetchMapData = async () => {
            setLoading(true);
            try {
                const { workers: workerData, events: eventData, mapConfig: configData } = await mapApi.getMapData();
                setWorkers(workerData);
                setEvents(eventData);
                setMapConfig(configData);
            } catch (error) {
                console.error('Failed to fetch map data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isClient) {
            fetchMapData();
        }
    }, [isClient]);

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
                <div className="relative w-[98%] mx-auto h-[90vh] p-1 rounded border border-card">
                    {isClient ? (
                        loading ? (
                            <div className="flex items-center justify-center h-screen">
                                <MapPin className="w-16 h-16 animate-pulse text-primary/50" />
                            </div>
                        ) : (
                            <MapComponent
                                filteredWorkers={filteredWorkers}
                                selectedMarker={selectedMarker}
                                highlightedMarkerId={highlightedMarkerId}
                                handleMarkerClick={handleMarkerClick}
                                mapRef={mapRef}
                                mapConfig={mapConfig}
                            />
                        )
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

                            {showEventsDropdown && (
                                <div className="absolute right-0 top-16 z-[2501] w-full sm:max-w-xs h-[calc(100%-5rem)] bg-card/95 backdrop-blur-sm border border-border rounded-l-lg shadow-lg overflow-y-auto">
                                    <div className="p-4">
                                        <h3 className="mb-4 text-sm font-medium uppercase">Recent Events</h3>
                                        <div className="space-y-3">
                                            {events.map((event) => (
                                                <button
                                                    key={event.id}
                                                    onClick={() => handleEventClick(event)}
                                                    className="flex w-full gap-3 p-2 text-left transition-colors rounded-md hover:bg-accent/10"
                                                >
                                                    <div
                                                        className={cn(
                                                            'w-8 h-8 rounded-md flex items-center justify-center text-white',
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
                                                        {event.type === 'check-in' && <MapPin size={14} />}
                                                        {event.type === 'task' && <CalendarClock size={14} />}
                                                        {event.type === 'journal' && <FileText size={14} />}
                                                        {event.type === 'shift-start' && <Clock size={14} />}
                                                        {event.type === 'lead' && <UserPlus size={14} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-[10px] text-muted-foreground uppercase">
                                                            {event.type.replace('-', ' ')}
                                                        </div>
                                                        <div className="text-xs font-thin uppercase">
                                                            {event.title}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground mt-1">
                                                            {event.time}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <MapPin size={10} className="text-muted-foreground" />
                                                            <span className="text-[10px] uppercase">{event.location}</span>
                                                        </div>
                                                        {event.user && (
                                                            <div className="flex items-center gap-2 pt-1 mt-1 border-t border-border/10">
                                                                <div className="w-5 h-5 overflow-hidden rounded-full bg-accent">
                                                                    <img
                                                                        src="/placeholder.svg?height=20&width=20"
                                                                        alt={event.user}
                                                                        className="object-cover w-full h-full"
                                                                    />
                                                                </div>
                                                                <div className="text-[10px] uppercase">
                                                                    {event.user}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
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
