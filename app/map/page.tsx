'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import {
    type WorkerType,
    type EventType,
    type ClientType,
    type CompetitorType,
    type QuotationType,
} from '@/lib/data';
import {
    Filter,
    List,
    ChevronDown,
    MapPin,
    Clock,
    FileText,
    CalendarClock,
    UserPlus,
    Building,
    Coffee,
    PlayCircle,
    TimerOff,
    CheckCircle2,
    User as UserIcon,
    Calendar,
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
    | 'shift-end'
    | 'lead'
    | 'journal'
    | 'task'
    | 'break-start'
    | 'break-end'
    | 'client'
    | 'competitor'
    | 'quotation';

export default function MapPage() {
    const [selectedMarker, setSelectedMarker] = useState<
        WorkerType | ClientType | CompetitorType | QuotationType | null
    >(null);
    const [highlightedMarkerId, setHighlightedMarkerId] = useState<
        string | null
    >(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const mapRef = useRef<any>(null);

    // Use the map query hook
    const {
        workers,
        events,
        mapConfig,
        clients,
        competitors,
        quotations,
        isLoading,
        isError,
        error,
        refetch,
    } = useMapQuery({
        enabled: isClient, // Only enable the query when client-side
    });

    console.log(workers, clients, competitors, quotations, 'here');

    // Set isClient to true when component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleMarkerClick = (
        marker: WorkerType | ClientType | CompetitorType | QuotationType,
    ) => {
        if (!marker) return;
        setSelectedMarker(marker);
        setHighlightedMarkerId(marker.id.toString());
    };

    // Toggle dropdown function
    const toggleDropdown = (dropdown: string) => {
        if (activeDropdown === dropdown) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(dropdown);
        }
    };

    // Filter workers based on active filter
    const filteredWorkers = workers?.filter((worker) => {
        if (activeFilter === 'all') return true;
        return worker.markerType === activeFilter;
    });

    // Get all entities for the map based on active filter
    const getFilteredEntities = () => {
        const entities = [];

        // Always verify that each entity has valid position data
        const hasValidPosition = (entity: any) => {
            return (
                entity &&
                entity.position &&
                Array.isArray(entity.position) &&
                entity.position.length === 2 &&
                typeof entity.position[0] === 'number' &&
                typeof entity.position[1] === 'number'
            );
        };

        // Add filtered entities based on the active filter
        if (activeFilter === 'all') {
            // Add all workers with valid positions
            const validWorkers = workers?.filter(hasValidPosition) || [];
            entities.push(...validWorkers);

            // Add all clients with valid positions
            const validClients = clients?.filter(hasValidPosition) || [];
            entities.push(...validClients);

            // Add all competitors with valid positions
            const validCompetitors =
                competitors?.filter(hasValidPosition) || [];
            entities.push(...validCompetitors);

            // Add all quotations with valid positions
            const validQuotations = quotations?.filter(hasValidPosition) || [];
            entities.push(...validQuotations);
        } else {
            // Filter by specific types
            switch (activeFilter) {
                case 'check-in':
                case 'shift-start':
                case 'shift-end':
                case 'lead':
                case 'journal':
                case 'task':
                case 'break-start':
                case 'break-end':
                    // Filter workers by marker type
                    const filteredWorkers =
                        workers?.filter(
                            (worker) =>
                                worker.markerType === activeFilter &&
                                hasValidPosition(worker),
                        ) || [];
                    entities.push(...filteredWorkers);
                    break;

                case 'client':
                    const filteredClients =
                        clients?.filter(hasValidPosition) || [];
                    entities.push(...filteredClients);
                    break;

                case 'competitor':
                    const filteredCompetitors =
                        competitors?.filter(hasValidPosition) || [];
                    entities.push(...filteredCompetitors);
                    break;

                case 'quotation':
                    const filteredQuotations =
                        quotations?.filter(hasValidPosition) || [];
                    entities.push(...filteredQuotations);
                    break;
            }
        }

        return entities;
    };

    const filteredEntities = getFilteredEntities();

    // Add a new function to handle event click
    const handleEventClick = (event: EventType) => {
        // Early return if no map reference or event doesn't have location
        if (!mapRef.current) return;

        let position: [number, number] | null = null;

        // Handle different formats of event location
        if (
            typeof event.location === 'object' &&
            event.location &&
            'lat' in event.location &&
            'lng' in event.location
        ) {
            // Object with lat/lng properties
            position = [event.location.lat, event.location.lng];
        }

        // If no valid position found, return
        if (!position) return;

        // Fly to the event location
        mapRef.current.flyTo(position, 15, {
            animate: true,
            duration: 1.5,
        });

        // Create a temporary marker or set as selected
        setHighlightedMarkerId(`event-${event.id}`);

        // Create a "marker-like" object from the event to display details
        const eventMarker = {
            id: `event-${event.id}`,
            name: event.title || event.details || event.type.replace(/-/g, ' '),
            position,
            markerType: event.type as any,
            status: 'Event',
            location: {
                address:
                    typeof event.location === 'string'
                        ? event.location
                        : event.location?.address || '',
                imageUrl:
                    typeof event.location === 'object' &&
                    event.location &&
                    'imageUrl' in event.location
                        ? event.location.imageUrl || ''
                        : '',
            },
            type: 'event',
        };

        setSelectedMarker(eventMarker as any);
    };

    // Add a new function to handle selecting an event on the map
    const handleSelectEvent = (event: EventType) => {
        // Display the event information in map center
        if (mapRef.current && events) {
            // Create a position from the event
            let eventPosition: [number, number] | null = null;

            // Extract position from event location
            if (typeof event.location === 'object' && event.location && 'lat' in event.location && 'lng' in event.location) {
                eventPosition = [event.location.lat, event.location.lng];
            }

            if (!eventPosition) return;

            // Create a marker-like object for the event
            const eventMarker = {
                id: String(event.id),
                name: event.title || event.details || `${event.type.replace(/-/g, ' ')} Event`,
                position: eventPosition,
                markerType: event.type as any,
                status: "Event",
                location: {
                    address: typeof event.location === 'string'
                        ? event.location
                        : (event.location?.address || ''),
                    imageUrl: typeof event.location === 'object' && event.location?.imageUrl || ''
                },
                userName: event.userName || event.user || '',
                timestamp: event.timestamp || event.time || '',
                type: 'event'
            };

            // Set the selected marker first
            setSelectedMarker(eventMarker as any);
            setHighlightedMarkerId(`event-${event.id}`);

            // Close the dropdown
            setActiveDropdown(null);

            // Then fly to location with a slight delay to ensure the marker is created
            setTimeout(() => {
                if (mapRef.current) {
                    mapRef.current.flyTo(eventPosition as [number, number], 16, {
                        animate: true,
                        duration: 1.0
                    });

                    // Force marker popup to open
                    const markers = document.querySelectorAll('.leaflet-marker-icon');
                    markers.forEach(marker => {
                        // Using dataset attribute to identify our marker
                        if (marker.getAttribute('data-marker-id') === `event-${event.id}`) {
                            (marker as HTMLElement).click();
                        }
                    });
                }
            }, 100);
        }
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <PageTransition type="fade">
                    <div className="relative w-[98%] mx-auto h-[90vh] p-1 rounded border border-card">
                        <MapLoading />
                    </div>
                </PageTransition>
            </ProtectedRoute>
        );
    }

    if (isError) {
        return (
            <ProtectedRoute>
                <PageTransition type="fade">
                    <div className="relative w-[98%] mx-auto h-[90vh] p-1 rounded border border-card">
                        <MapError onRetry={refetch} message={error?.message} />
                    </div>
                </PageTransition>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <PageTransition type="fade">
                <div className="relative w-[98%] mx-auto h-[90vh] p-1 rounded border border-card">
                    <MapComponent
                        filteredWorkers={filteredEntities}
                        clients={
                            activeFilter === 'all' || activeFilter === 'client'
                                ? clients
                                : []
                        }
                        competitors={
                            activeFilter === 'all' ||
                            activeFilter === 'competitor'
                                ? competitors
                                : []
                        }
                        quotations={
                            activeFilter === 'all' ||
                            activeFilter === 'quotation'
                                ? quotations
                                : []
                        }
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
                                onClick={() => toggleDropdown('filter')}
                                className="flex items-center gap-2 bg-card backdrop-blur-sm px-4 py-1.5 rounded-md text-xs font-body uppercase border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-accent/5 transition"
                            >
                                <Filter size={14} strokeWidth={1.5} />
                                <span className="text-[10px] font-thin uppercase font-body">
                                    {activeFilter === 'all'
                                        ? 'Select A Filter'
                                        : activeFilter
                                              .split('-')
                                              .map(
                                                  (word) =>
                                                      word
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      word.slice(1),
                                              )
                                              .join(' ')}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={cn(
                                        'text-muted-foreground transition-transform',
                                        activeDropdown === 'filter' &&
                                            'rotate-180',
                                    )}
                                />
                            </button>

                            {/* Filter Dropdown */}
                            {activeDropdown === 'filter' && (
                                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-md shadow-md w-40 z-[3000] py-1 text-xs">
                                    {[
                                        { id: 'all', label: 'All', icon: List },
                                        {
                                            id: 'check-in',
                                            label: 'Check In',
                                            icon: MapPin,
                                        },
                                        {
                                            id: 'shift-start',
                                            label: 'Shift Start',
                                            icon: Clock,
                                        },
                                        {
                                            id: 'shift-end',
                                            label: 'Shift End',
                                            icon: Clock,
                                        },
                                        {
                                            id: 'lead',
                                            label: 'Lead',
                                            icon: UserPlus,
                                        },
                                        {
                                            id: 'journal',
                                            label: 'Journal',
                                            icon: FileText,
                                        },
                                        {
                                            id: 'task',
                                            label: 'Task',
                                            icon: CalendarClock,
                                        },
                                        {
                                            id: 'break-start',
                                            label: 'Break Start',
                                            icon: Coffee,
                                        },
                                        {
                                            id: 'break-end',
                                            label: 'Break End',
                                            icon: Coffee,
                                        },
                                        {
                                            id: 'client',
                                            label: 'Client',
                                            icon: Building,
                                        },
                                        {
                                            id: 'competitor',
                                            label: 'Competitor',
                                            icon: Building,
                                        },
                                        {
                                            id: 'quotation',
                                            label: 'Quotation',
                                            icon: FileText,
                                        },
                                    ].map((filter) => (
                                        <button
                                            key={filter.id}
                                            onClick={() => {
                                                setActiveFilter(
                                                    filter.id as FilterType,
                                                );
                                                setActiveDropdown(null);
                                            }}
                                            className={cn(
                                                'w-full px-3 py-1.5 text-left hover:bg-accent/5 flex items-center gap-2',
                                                activeFilter === filter.id &&
                                                    'bg-accent/10 text-accent-foreground',
                                            )}
                                        >
                                            <filter.icon
                                                size={14}
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] uppercase font-thin font-body">
                                                {filter.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown('events')}
                                className="flex items-center gap-2 bg-card backdrop-blur-sm px-4 py-1.5 rounded-md text-xs font-body uppercase border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-accent/5 transition"
                            >
                                <List
                                    size={14}
                                    className="text-muted-foreground"
                                    strokeWidth={1.5}
                                />
                                <span className="text-[10px] font-thin uppercase font-body">
                                    RECENT EVENTS
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={cn(
                                        'text-muted-foreground transition-transform',
                                        activeDropdown === 'events' &&
                                            'rotate-180',
                                    )}
                                />
                            </button>

                            {/* Events Dropdown */}
                            {activeDropdown === 'events' && (
                                <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-md shadow-md w-72 z-[3000] py-1 text-xs max-h-[60vh] overflow-y-auto">
                                    <div className="px-3 py-2 border-b border-border">
                                        <h3 className="text-xs font-thin uppercase font-body">
                                            RECENT EVENTS
                                        </h3>
                                    </div>
                                    {events?.length > 0 ? (
                                        <div>
                                            {events.map((event) => {
                                                // Get appropriate icon based on event type
                                                let IconComponent = Calendar; // Default icon

                                                if (event.type === 'check-in') IconComponent = MapPin;
                                                else if (event.type === 'shift-start') IconComponent = PlayCircle;
                                                else if (event.type === 'shift-end') IconComponent = TimerOff;
                                                else if (event.type === 'task' || event.type === 'task-completed') IconComponent = CheckCircle2;
                                                else if (event.type === 'journal') IconComponent = FileText;
                                                else if (event.type === 'new-lead') IconComponent = UserPlus;
                                                else if (event.type === 'client-visit') IconComponent = Building;
                                                else if (event.type === 'break-start' || event.type === 'break-end') IconComponent = Coffee;

                                                // Get color class for each event type
                                                const colorClass =
                                                    event.type === 'check-in' ? 'text-blue-500' :
                                                    event.type === 'shift-start' ? 'text-green-500' :
                                                    event.type === 'shift-end' ? 'text-green-500' :
                                                    event.type === 'task' || event.type === 'task-completed' ? 'text-pink-500' :
                                                    event.type === 'journal' ? 'text-purple-500' :
                                                    event.type === 'new-lead' ? 'text-orange-500' :
                                                    event.type === 'client-visit' ? 'text-yellow-500' :
                                                    event.type === 'break-start' || event.type === 'break-end' ? 'text-cyan-500' :
                                                    'text-gray-500';

                                                // Check if this event is currently selected/highlighted
                                                const isSelected = highlightedMarkerId === `event-${event.id}`;

                                                return (
                                                    <button
                                                        key={event.id}
                                                        className={cn(
                                                            "w-full px-3 py-1.5 text-left flex items-center gap-2 border-b border-border/10 last:border-0",
                                                            isSelected ? "bg-accent/20" : "hover:bg-accent/5"
                                                        )}
                                                        onClick={() => handleSelectEvent(event)}
                                                    >
                                                        <IconComponent size={25} className={colorClass} strokeWidth={1.5} />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] uppercase font-thin font-body">
                                                                    {event.type.replace(/-/g, ' ')}
                                                                </span>
                                                                <span className="text-[9px] text-muted-foreground font-thin uppercase font-body">
                                                                    {event.time || (event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : '')}
                                                                </span>
                                                            </div>
                                                            <p className="font-normal uppercase text-[10px] line-clamp-1 font-body mt-0.5">
                                                                {event.title || event.details || ''}
                                                            </p>
                                                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 font-body">
                                                                <UserIcon size={15} strokeWidth={1.5} />
                                                                <span className="text-[9px] font-body uppercase font-thin">{event.user || event.userName || ''}</span>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="px-3 py-2 text-muted-foreground font-body font-thin uppercase text-[10px]">
                                            No recent events.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageTransition>
        </ProtectedRoute>
    );
}
