'use client';

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { WorkerType, ClientType, CompetitorType, QuotationType } from '@/lib/data';
import { createCustomIcon } from './marker-icon';
import Image from 'next/image';
import {
    MapPin,
    Kanban,
    Building,
    FolderIcon,
    Clock,
    Calendar,
    CalendarCheck,
    PlusSquare,
    LucideTimer,
    TimerOff,
    TimerReset,
    Coffee,
    CheckCircle2,
    PlayCircle,
    Globe,
    PhoneCall,
    Mail,
    AlertTriangle,
    UserPlus
} from 'lucide-react';

interface MarkerPopupProps {
    worker: WorkerType | ClientType | CompetitorType | QuotationType;
}

function MarkerPopup({ worker }: MarkerPopupProps) {
    if (!worker) return null;

    // Determine marker type for conditional rendering
    const markerType = worker.markerType;
    const isWorkerType = markerType !== 'client' && markerType !== 'competitor' && markerType !== 'quotation';
    const isClientType = markerType === 'client';
    const isCompetitorType = markerType === 'competitor';
    const isQuotationType = markerType === 'quotation';
    const isEventType = 'type' in worker && worker.type === 'event';

    // Handle client navigation
    const handleViewClient = () => {
        if (isClientType && 'id' in worker) {
            window.location.href = `/clients/${worker.id}`;
        }
    };

    // Get a placeholder image for worker locations only
    const locationImage = isWorkerType && 'location' in worker && worker.location?.imageUrl
        ? worker.location.imageUrl
        : isWorkerType && 'location' in worker && worker.location?.address
            ? `https://maps.googleapis.com/maps/api/streetview?size=400x200&location=${encodeURIComponent(worker.location.address)}&key=YOUR_API_KEY&fallback=true`
            : '/placeholder.svg?height=200&width=400';

    // Profile image for worker
    const profileImage = 'https://images.pexels.com/photos/1181346/pexels-photo-1181346.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

    // Get the entity name for display
    const entityName =
        isQuotationType && 'quotationNumber' in worker
            ? worker.quotationNumber
            : isEventType && 'name' in worker
            ? worker.name
            : 'name' in worker ? worker.name : 'Unnamed Entity';

    // Get appropriate status color based on marker type and status
    const statusColor = isClientType
        ? 'bg-indigo-500'
        : isCompetitorType
            ? 'bg-red-500'
            : isQuotationType
                ? 'bg-green-600'
                : isEventType
                    ? 'bg-orange-500'
                : worker?.status?.includes('progress')
                    ? 'bg-green-500'
                    : worker?.status?.includes('break')
                        ? 'bg-yellow-500'
                        : worker?.status?.includes('Completed')
                            ? 'bg-blue-500'
                            : 'bg-gray-500';

    return (
        <div className="p-3 font-body">
            {/* Header with entity info */}
            <div className="flex flex-col items-center mb-4">
                {/* Only show image for worker types */}
                {isWorkerType && !isEventType && (
                    <div className="w-16 h-16 mb-2 overflow-hidden border-2 rounded-full border-primary/20">
                        <Image
                            src={
                                isWorkerType && 'image' in worker && worker.image
                                    ? profileImage
                                    : '/placeholder.svg?height=64&width=64'
                            }
                            alt={entityName}
                            className="object-cover w-full h-full"
                            width={64}
                            height={64}
                        />
                    </div>
                )}
                {/* Show event icon for event type */}
                {isEventType && (
                    <div className="flex items-center justify-center w-12 h-12 mb-2 text-orange-500 bg-orange-100 rounded-full">
                        {(markerType as string) === 'check-in' ? <MapPin size={24} /> :
                         (markerType as string) === 'shift-start' ? <PlayCircle size={24} /> :
                         (markerType as string) === 'shift-end' ? <TimerOff size={24} /> :
                         (markerType as string) === 'task' || (markerType as string) === 'task-completed' ? <CheckCircle2 size={24} /> :
                         (markerType as string) === 'journal' ? <FolderIcon size={24} /> :
                         (markerType as string) === 'new-lead' ? <UserPlus size={24} /> :
                         (markerType as string) === 'client-visit' ? <Building size={24} /> :
                         (markerType as string) === 'break-start' || (markerType as string) === 'break-end' ? <Coffee size={24} /> :
                         <Calendar size={24} />}
                    </div>
                )}
                <h3 className="text-xs font-normal uppercase">
                    {isQuotationType && 'clientName' in worker ? worker.clientName : entityName}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                    <p className="text-[10px] text-muted-foreground uppercase">
                        {isEventType ? markerType.replace(/-/g, ' ') : (worker?.status || 'Unknown Status')}
                    </p>
                </div>
            </div>

            {/* Render location image only for worker types and event types with imageUrl */}
            {(isWorkerType || (isEventType && 'location' in worker && typeof (worker as any).location === 'object' && (worker as any).location?.imageUrl)) && (
                <div className="w-full mb-4 overflow-hidden rounded-md h-44">
                    <Image
                        src={isEventType && typeof (worker as any).location === 'object' && (worker as any).location?.imageUrl
                            ? (worker as any).location.imageUrl
                            : locationImage}
                        alt={'location' in worker
                            ? (typeof (worker as any).location === 'object'
                                ? (worker as any).location?.address || 'Location'
                                : String((worker as any).location || 'Location'))
                            : 'Location'}
                        className="object-cover w-full h-full"
                        width={400}
                        height={400}
                        priority={false}
                    />
                </div>
            )}

            {/* Event specific information */}
            {isEventType && (
                <div className="p-2 text-[10px] bg-orange-500/10 rounded-md mb-2">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <Calendar size={15} strokeWidth={1.5} />
                        Event Details
                    </p>
                    {/* Show event location details */}
                    {'location' in worker && typeof (worker as any).location === 'object' && (worker as any).location?.address && (
                        <div className="flex items-start gap-1 mb-2">
                            <MapPin size={12} className="mt-0.5 text-muted-foreground" strokeWidth={1.5} />
                            <p className="text-[10px]">{(worker as any).location.address}</p>
                        </div>
                    )}
                </div>
            )}

            {isWorkerType && 'canAddTask' in worker && worker.canAddTask && !isEventType && (
                <button className="w-full mb-4 flex items-center justify-center gap-2 text-primary text-[10px] uppercase font-thin border border-border rounded-md py-2 hover:bg-accent/10 transition-colors">
                    <PlusSquare size={14} />
                    Assign Task
                </button>
            )}

            {/* Make the content area scrollable with fixed height */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">

            {/* Quotation-specific information */}
            {isQuotationType && 'quotationNumber' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-green-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <FolderIcon size={15} strokeWidth={1.5} />
                            Quotation Details
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            Reference: {worker.quotationNumber}
                        </p>
                        <p className="text-[10px] flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                                worker.status === 'approved' ? 'bg-green-500' :
                                worker.status === 'rejected' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`}></span>
                            Status: {worker.status?.toUpperCase() || 'PENDING'}
                        </p>
                        {worker.totalAmount && (
                            <p className="text-[10px] font-semibold mt-2">
                                Total: ${typeof worker.totalAmount === 'number' ? worker.totalAmount.toFixed(2) : worker.totalAmount}
                            </p>
                        )}
                    </div>

                    <div className="p-2 text-[10px] bg-accent/10 rounded-md mt-2">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <Calendar size={15} strokeWidth={1.5} />
                            Dates
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                            <p className="text-[9px] text-muted-foreground">
                                Quotation Date: {worker.quotationDate ? new Date(worker.quotationDate).toLocaleDateString() : 'N/A'}
                            </p>
                            {worker.validUntil && (
                                <p className="text-[9px] text-muted-foreground">
                                    Valid Until: {new Date(worker.validUntil).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        {worker.placedBy && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Placed By: {worker.placedBy}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-center mt-2">
                        <button className="px-3 py-1 text-[10px] uppercase font-thin border border-green-500/20 rounded-md text-green-600 hover:bg-green-500/5 transition-colors">
                            View Quotation
                        </button>
                    </div>
                </>
            )}

            {/* Client-specific information */}
            {isClientType && 'clientRef' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <MapPin size={15} strokeWidth={1.5} />
                            Location
                        </p>
                        <p className="text-[10px]">
                            {'address' in worker && worker.address ? (
                                <>
                                    {worker.address.street && <span>{worker.address.street}, </span>}
                                    {worker.address.suburb && <span>{worker.address.suburb}, </span>}
                                    {worker.address.city && <span>{worker.address.city}, </span>}
                                    {worker.address.state && <span>{worker.address.state}, </span>}
                                    {worker.address.country && <span>{worker.address.country} </span>}
                                    {worker.address.postalCode && <span>{worker.address.postalCode}</span>}
                                </>
                            ) : 'No address available'}
                        </p>
                    </div>

                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <Building size={15} strokeWidth={1.5} />
                            Client Information
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            Reference: {worker.clientRef}
                        </p>
                        <p className="text-[10px] flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                                worker.status === 'active' ? 'bg-green-500' :
                                worker.status === 'inactive' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`}></span>
                            Status: {worker.status?.toUpperCase() || 'Unknown'}
                        </p>
                    </div>

                    {'contactName' in worker && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <Building size={15} strokeWidth={1.5} />
                                Contact Information
                            </p>
                            {worker.contactName && (
                                <p className="text-[10px] mb-1 flex items-center gap-1">
                                    <UserPlus size={12} strokeWidth={1.5} className="text-indigo-500" />
                                    {worker.contactName}
                                </p>
                            )}
                            {'phone' in worker && worker.phone && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                                    <PhoneCall size={12} strokeWidth={1.5} className="text-indigo-500" />
                                    {worker.phone}
                                </p>
                            )}
                            {'email' in worker && worker.email && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                    <Mail size={12} strokeWidth={1.5} className="text-indigo-500" />
                                    {worker.email}
                                </p>
                            )}
                            {'website' in worker && worker.website && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                    <Globe size={12} strokeWidth={1.5} className="text-indigo-500" />
                                    {worker.website}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex justify-center mt-2">
                        <button
                            onClick={handleViewClient}
                            className="px-3 py-1 text-[10px] uppercase font-thin border border-indigo-500/20 rounded-md text-indigo-600 hover:bg-indigo-500/5 transition-colors"
                        >
                            View Client Details
                        </button>
                    </div>
                </>
            )}

            {/* Competitor-specific information */}
            {isCompetitorType && 'competitorRef' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <MapPin size={15} strokeWidth={1.5} />
                            Location
                        </p>
                        <p className="text-[10px]">
                            {'address' in worker && worker.address ? (
                                typeof worker.address === 'object' ? (
                                    <>
                                        {worker.address.street && <span>{worker.address.street}, </span>}
                                        {worker.address.suburb && <span>{worker.address.suburb}, </span>}
                                        {worker.address.city && <span>{worker.address.city}, </span>}
                                        {worker.address.state && <span>{worker.address.state}, </span>}
                                        {worker.address.country && <span>{worker.address.country} </span>}
                                        {worker.address.postalCode && <span>{worker.address.postalCode}</span>}
                                    </>
                                ) : worker.address.toString()
                            ) : 'No address available'}
                        </p>
                    </div>

                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <Building size={15} strokeWidth={1.5} />
                            Competitor Information
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            Reference: {worker.competitorRef}
                        </p>
                        <p className="text-[10px] flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                                worker.status === 'active' ? 'bg-green-500' :
                                worker.status === 'inactive' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`}></span>
                            Status: {worker.status?.toUpperCase() || 'Unknown'}
                        </p>
                    </div>

                    {'isDirect' in worker && (
                        <div className="p-2 text-[10px] bg-red-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <AlertTriangle size={15} strokeWidth={1.5} />
                                Competitor Analysis
                            </p>
                            {'industry' in worker && worker.industry && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                                    <Building size={12} strokeWidth={1.5} className="text-red-500" />
                                    Industry: {worker.industry}
                                </p>
                            )}
                            {'threatLevel' in worker && worker.threatLevel !== undefined && (
                                <div className="mt-1 mb-2">
                                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                        <AlertTriangle size={12} strokeWidth={1.5} className="text-red-500" />
                                        Threat Level: {worker.threatLevel}/10
                                    </p>
                                    <div className="mt-1 w-full bg-accent/20 rounded-full h-1.5">
                                        <div
                                            className="bg-red-500 h-1.5 rounded-full"
                                            style={{ width: `${(worker.threatLevel / 10) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                                <Building size={12} strokeWidth={1.5} className="text-red-500" />
                                Direct Competitor: {worker.isDirect ? 'Yes' : 'No'}
                            </p>
                            {'website' in worker && worker.website && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                                    <Globe size={12} strokeWidth={1.5} className="text-red-500" />
                                    {worker.website}
                                </p>
                            )}
                            {'geofencing' in worker && worker.geofencing && worker.geofencing.enabled && (
                                <div className="p-1 mt-2 rounded bg-red-500/5">
                                    <p className="text-[9px] font-medium">Geofencing Active</p>
                                    <p className="text-[8px] text-muted-foreground">
                                        Type: {worker.geofencing.type}, Radius: {worker.geofencing.radius}m
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-center mt-2">
                        <button className="px-3 py-1 text-[10px] uppercase font-thin border border-red-500/20 rounded-md text-red-500 hover:bg-red-500/5 transition-colors">
                            View Competitor Profile
                        </button>
                    </div>
                </>
            )}

            {/* Worker-specific information */}
            {isWorkerType && 'location' in worker && (
                <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <MapPin size={15} strokeWidth={1.5} />
                        Current Location
                    </p>
                    <p className="text-[10px]">
                        {worker.location?.address || 'No location data'}
                    </p>
                </div>
            )}

            {isWorkerType && 'task' in worker && worker.task && (
                <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <Kanban size={15} strokeWidth={1.5} />
                        Current Task
                    </p>
                    <p className="text-[10px] font-medium">
                        {worker.task.title}
                    </p>
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                        <Building size={15} strokeWidth={1.5} />
                        Client: {worker.task.client}
                    </p>
                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                        <FolderIcon size={15} strokeWidth={1.5} />
                        ID: {worker.task.id}
                    </p>
                </div>
            )}

            {isWorkerType && 'jobStatus' in worker && worker.jobStatus &&
             !(worker.jobStatus.startTime === "--:--" && worker.jobStatus.endTime === "--:--") && (
                <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <LucideTimer size={15} strokeWidth={1.5} />
                        Job Status
                    </p>
                    <div className="flex items-center gap-1 mb-1">
                        <span
                            className={`w-2 h-2 rounded-full ${
                                worker.jobStatus.status === 'In Progress'
                                    ? 'bg-green-500'
                                    : worker.jobStatus.status === 'On Break'
                                        ? 'bg-yellow-500'
                                        : worker.jobStatus.status === 'Completed'
                                            ? 'bg-blue-500'
                                            : 'bg-gray-500'
                            }`}
                        ></span>
                        <p className="text-[10px] font-medium">
                            {worker.jobStatus.status}
                        </p>
                    </div>
                    <div className="mt-2 mb-2 w-full bg-accent/20 rounded-full h-1.5">
                        <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${worker.jobStatus.completionPercentage}%` }}
                        ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-2">
                        <p className="text-[9px] flex items-center gap-1">
                            <PlayCircle size={15} strokeWidth={1.5} />
                            Start: {worker.jobStatus.startTime}
                        </p>
                        <p className="text-[9px] flex items-center gap-1">
                            <CheckCircle2 size={15} strokeWidth={1.5} />
                            End: {worker.jobStatus.endTime}
                        </p>
                        <p className="text-[9px] flex items-center gap-1 col-span-2">
                            <TimerReset size={15} strokeWidth={1.5} />
                            Duration: {worker.jobStatus.duration}
                        </p>
                    </div>
                </div>
            )}

            {isWorkerType && 'breakData' in worker && worker.breakData && (
                <div className="p-2 text-[10px] bg-yellow-500/10 rounded-md">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <Coffee size={15} strokeWidth={1.5} />
                        On Break
                    </p>
                    <div className="grid grid-cols-2 gap-x-2">
                        <p className="text-[9px] flex items-center gap-1">
                            <PlayCircle size={15} strokeWidth={1.5} />
                            From: {worker.breakData.startTime}
                        </p>
                        <p className="text-[9px] flex items-center gap-1">
                            <TimerOff size={15} strokeWidth={1.5} />
                            To: {worker.breakData.endTime}
                        </p>
                        <p className="text-[9px] flex items-center gap-1">
                            <TimerReset size={15} strokeWidth={1.5} />
                            Total: {worker.breakData.duration}
                        </p>
                        <p className="text-[9px] flex items-center gap-1">
                            <Clock size={15} strokeWidth={1.5} />
                            Remaining: {worker.breakData.remainingTime}
                        </p>
                    </div>
                    <p className="text-[9px] flex items-center gap-1 mt-1">
                        <MapPin size={15} strokeWidth={1.5} />
                        Location: {worker.breakData.location}
                    </p>
                </div>
            )}

            {isWorkerType && 'schedule' in worker && worker.schedule && (
                <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <Clock size={15} strokeWidth={1.5} />
                        Schedule
                    </p>
                    <div className="grid grid-cols-1 gap-y-2">
                        <p className="text-[9px] flex items-center gap-1">
                            <Calendar size={15} strokeWidth={1.5} />
                            Current: {worker.schedule.current}
                        </p>
                        {worker.schedule.next && (
                            <div className="text-[9px]">
                                <p className="flex items-center gap-1 mb-1">
                                    <CalendarCheck size={15} strokeWidth={1.5} />
                                    Next Task:
                                </p>
                                {worker.schedule.next.includes(':') ? (
                                    <>
                                        <p className="ml-5 font-medium">
                                            {/* Extract task title, format: "04:56 PM: Test S01 E04 - Mar 18, 2025" */}
                                            {worker.schedule.next.substring(worker.schedule.next.indexOf(': ') + 2)}
                                        </p>
                                        <p className="ml-5 text-muted-foreground">
                                            {/* Extract deadline time */}
                                            Deadline: {worker.schedule.next.substring(0, worker.schedule.next.indexOf(':') + 6)}
                                        </p>
                                    </>
                                ) : (
                                    <p className="ml-5">{worker.schedule.next}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}

// Define map marker icon colors to ensure they match in popup
const markerTypeColors = {
    'client': 'indigo-500',
    'competitor': 'red-500',
    'quotation': 'green-600',
    'check-in': 'blue-500',
    'shift-start': 'green-500',
    'lead': 'orange-500',
    'journal': 'purple-500',
    'task': 'pink-500',
    'break-start': 'yellow-500',
    'break-end': 'yellow-500'
};

interface MarkersLayerProps {
    filteredWorkers: WorkerType[] | ClientType[] | CompetitorType[] | QuotationType[] | (WorkerType | ClientType | CompetitorType | QuotationType)[];
    selectedMarker: WorkerType | ClientType | CompetitorType | QuotationType | null;
    highlightedMarkerId: string | null;
    handleMarkerClick: (marker: WorkerType | ClientType | CompetitorType | QuotationType) => void;
}

// Helper function to get position from marker
const getMarkerPosition = (marker: any): [number, number] | null => {
    // Direct position array
    if (Array.isArray(marker.position) &&
        marker.position.length === 2 &&
        typeof marker.position[0] === 'number' &&
        typeof marker.position[1] === 'number') {
        return marker.position;
    }

    // Location object with lat/lng fields (for events)
    if (marker.location &&
        typeof marker.location === 'object' &&
        typeof marker.location.lat === 'number' &&
        typeof marker.location.lng === 'number') {
        return [marker.location.lat, marker.location.lng];
    }

    return null;
};

export default function MarkersLayer({
    filteredWorkers,
    selectedMarker,
    highlightedMarkerId,
    handleMarkerClick,
}: MarkersLayerProps) {
    if (!Array.isArray(filteredWorkers)) {
        console.error("filteredWorkers is not an array:", filteredWorkers);
        return null;
    }

    // Log the number of markers to be rendered
    console.log(`Rendering ${filteredWorkers.length} markers on t he m ap`);

    // Log any markers with invalid positions
    const invalidMarkers = filteredWorkers.filter(worker => !getMarkerPosition(worker));
    if (invalidMarkers.length > 0) {
        console.warn(`Found ${invalidMarkers.length} markers with invalid positions`, invalidMarkers);
    }

    return (
        <>
            {filteredWorkers?.map((worker) => {
                const position = getMarkerPosition(worker);
                if (!position) return null;

                const isHighlighted =
                    selectedMarker?.id?.toString() === worker.id?.toString() ||
                    highlightedMarkerId === worker.id?.toString();

                // Generate a unique key using id and type
                const uniqueKey = `${worker.id}-${worker.markerType}-${Math.random().toString(36).substr(2, 9)}`;

                return (
                    <Marker
                        key={uniqueKey}
                        position={position}
                        icon={createCustomIcon(worker.markerType || 'check-in')}
                        eventHandlers={{
                            click: () => handleMarkerClick(worker),
                        }}
                        // Add data attribute to identify markers for programmatic access
                        // @ts-ignore - Adding custom property to Marker component
                        data-marker-id={worker.id?.toString()}
                    >
                        {selectedMarker?.id === worker.id && (
                            <Popup>
                                <MarkerPopup worker={worker} />
                            </Popup>
                        )}
                    </Marker>
                );
            })}
        </>
    );
}
