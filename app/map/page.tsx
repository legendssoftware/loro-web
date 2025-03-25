'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageTransition } from '@/components/animations/page-transition';
import { type WorkerType, type EventType, type ClientType, type CompetitorType, type QuotationType } from '@/lib/data';
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
    | 'task'
    | 'client'
    | 'competitor'
    | 'quotation';

export default function MapPage() {
    const [selectedMarker, setSelectedMarker] = useState<WorkerType | ClientType | CompetitorType | QuotationType | null>(
        null,
    );
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
        refetch
    } = useMapQuery({
        enabled: isClient, // Only enable the query when client-side
    });

    // Set isClient to true when component mounts
    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleMarkerClick = (marker: WorkerType | ClientType | CompetitorType | QuotationType) => {
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
        switch (activeFilter) {
            case 'all':
                return [
                    ...(workers || []),
                    ...(clients || []),
                    ...(competitors || []),
                    ...(quotations || [])
                ];
            case 'client':
                return clients || [];
            case 'competitor':
                return competitors || [];
            case 'quotation':
                return quotations || [];
            default:
                // For worker-specific filters (check-in, shift-start, lead, journal, task)
                return workers?.filter(worker => worker.markerType === activeFilter) || [];
        }
    };

    const filteredEntities = getFilteredEntities();

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
                        clients={clients}
                        competitors={competitors}
                        quotations={quotations}
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
                                        ? 'ALL'
                                        : activeFilter
                                              .split('-')
                                              .map(
                                                  (word) =>
                                                      word.charAt(0).toUpperCase() +
                                                      word.slice(1),
                                              )
                                              .join(' ')}
                                </span>
                                <ChevronDown
                                    size={14}
                                    className={cn(
                                        'text-muted-foreground transition-transform',
                                        activeDropdown === 'filter' && 'rotate-180',
                                    )}
                                />
                            </button>

                            {/* Filter Dropdown */}
                            {activeDropdown === 'filter' && (
                                <div className="absolute top-full mt-1 left-0 bg-card border border-border rounded-md shadow-md w-40 z-[3000] py-1 text-xs">
                                    {[
                                        { id: 'all', label: 'All', icon: List },
                                        { id: 'check-in', label: 'Check In', icon: MapPin },
                                        { id: 'shift-start', label: 'Shift Start', icon: Clock },
                                        { id: 'lead', label: 'Lead', icon: UserPlus },
                                        { id: 'journal', label: 'Journal', icon: FileText },
                                        { id: 'task', label: 'Task', icon: CalendarClock },
                                        { id: 'client', label: 'Client', icon: Building },
                                        { id: 'competitor', label: 'Competitor', icon: Building },
                                        { id: 'quotation', label: 'Quotation', icon: FileText }
                                    ].map((filter) => (
                                        <button
                                            key={filter.id}
                                            onClick={() => {
                                                setActiveFilter(filter.id as FilterType);
                                                setActiveDropdown(null);
                                            }}
                                            className={cn(
                                                'w-full px-3 py-1.5 text-left hover:bg-accent/5 flex items-center gap-2',
                                                activeFilter === filter.id &&
                                                    'bg-accent/10 text-accent-foreground',
                                            )}
                                        >
                                            <filter.icon size={14} strokeWidth={1.5} />
                                            <span className="text-[10px] uppercase font-thin">
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
                                <List size={14} className="text-muted-foreground" strokeWidth={1.5} />
                                <span className="text-[10px] font-thin uppercase font-body">RECENT EVENTS</span>
                                <ChevronDown
                                    size={14}
                                    className={cn(
                                        'text-muted-foreground transition-transform',
                                        activeDropdown === 'events' && 'rotate-180',
                                    )}
                                />
                            </button>

                            {/* Events Dropdown */}
                            {activeDropdown === 'events' && (
                                <div className="absolute top-full mt-1 right-0 bg-card border border-border rounded-md shadow-md w-72 z-[3000] py-1 text-xs max-h-[60vh] overflow-y-auto">
                                    <div className="px-3 py-2 border-b border-border">
                                        <h3 className="text-xs font-thin uppercase font-body">RECENT EVENTS</h3>
                                    </div>
                                    {events?.length > 0 ? (
                                        <div>
                                            {events.map((event) => (
                                                <button
                                                    key={event.id}
                                                    className="w-full px-3 py-2 text-left border-b hover:bg-accent/10 border-border/50 last:border-0"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className={cn(
                                                                'w-2 h-2 rounded-full',
                                                                event.type === 'check-in'
                                                                    ? 'bg-blue-500'
                                                                    : event.type ===
                                                                      'shift-start'
                                                                    ? 'bg-green-500'
                                                                    : event.type === 'task'
                                                                    ? 'bg-pink-500'
                                                                    : event.type ===
                                                                      'journal'
                                                                    ? 'bg-purple-500'
                                                                    : 'bg-orange-500',
                                                            )}
                                                        ></div>
                                                        <div>
                                                            <p className="font-medium line-clamp-1 font-body">
                                                                {event.title}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-0.5 font-body">
                                                                <span>
                                                                    {event.user}
                                                                </span>
                                                                <span>
                                                                    {event.time}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
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
