'use client';

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { WorkerType } from '@/lib/data';
import { createCustomIcon } from './marker-icon';
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
    BarChart4,
    TimerOff,
    TimerReset,
    Coffee,
    CheckCircle2,
    PlayCircle
} from 'lucide-react';

interface MarkerPopupProps {
    worker: WorkerType;
}

function MarkerPopup({ worker }: MarkerPopupProps) {
    if (!worker) return null;

    return (
        <div className="p-3 font-body">
            <div className="flex flex-col items-center mb-4">
                <div className="w-16 h-16 mb-2 overflow-hidden border-2 rounded-full border-primary/20">
                    <img
                        src={
                            worker?.image ||
                            '/placeholder.svg?height=64&width=64'
                        }
                        alt={worker?.name || 'Worker'}
                        className="object-cover w-full h-full"
                    />
                </div>
                <h3 className="text-xs font-normal uppercase">
                    {worker?.name || 'Unnamed Worker'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <span
                        className={`w-2 h-2 rounded-full ${
                            worker?.status?.includes('progress')
                                ? 'bg-green-500'
                                : worker?.status?.includes('break')
                                  ? 'bg-yellow-500'
                                  : worker?.status?.includes('Completed')
                                    ? 'bg-blue-500'
                                    : 'bg-gray-500'
                        }`}
                    ></span>
                    <p className="text-[10px] text-muted-foreground uppercase">
                        {worker?.status || 'Unknown Status'}
                    </p>
                </div>
            </div>

            {worker?.canAddTask && (
                <button className="w-full mb-4 flex items-center justify-center gap-2 text-primary text-[10px] uppercase font-thin border border-border rounded-md py-2 hover:bg-accent/10 transition-colors">
                    <PlusSquare size={14} />
                    Assign Task
                </button>
            )}

            <div className="space-y-2">
                <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <MapPin size={15} strokeWidth={1.5} />
                        Current Location
                    </p>
                    <p className="text-[10px]">
                        {worker?.location?.address || 'No location data'}
                    </p>
                </div>

                {worker?.task && (
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

                {worker?.jobStatus && (
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

                {worker?.breakData && (
                    <div className="p-2 text-[10px] bg-yellow-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <Coffee size={15} strokeWidth={1.5} />
                            On Break
                        </p>
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
                        <p className="text-[9px] flex items-center gap-1">
                            <MapPin size={15} strokeWidth={1.5} />
                            Location: {worker.breakData.location}
                        </p>
                    </div>
                )}

                {worker?.schedule && (
                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <Clock size={15} strokeWidth={1.5} />
                            Schedule
                        </p>
                        <p className="text-[9px] flex items-center gap-1">
                            <Calendar size={15} strokeWidth={1.5} />
                            Current: {worker.schedule.current}
                        </p>
                        <p className="text-[9px] flex items-center gap-1">
                            <CalendarCheck size={15} strokeWidth={1.5} />
                            Next: {worker.schedule.next}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MarkersLayerProps {
    filteredWorkers: WorkerType[];
    selectedMarker: WorkerType | null;
    highlightedMarkerId: string | null;
    handleMarkerClick: (worker: WorkerType) => void;
}

// Utility function to validate coordinates
const isValidPosition = (position: any): position is [number, number] => {
    return Array.isArray(position) &&
        position.length === 2 &&
        typeof position[0] === 'number' &&
        typeof position[1] === 'number' &&
        !isNaN(position[0]) &&
        !isNaN(position[1]) &&
        position[0] >= -90 &&
        position[0] <= 90 &&
        position[1] >= -180 &&
        position[1] <= 180;
};

export default function MarkersLayer({
    filteredWorkers,
    selectedMarker,
    highlightedMarkerId,
    handleMarkerClick,
}: MarkersLayerProps) {
    if (!Array.isArray(filteredWorkers)) return null;

    return (
        <>
            {filteredWorkers?.map((worker) => {
                // Skip markers with undefined, null, or invalid position data
                if (!worker || !worker.id || !isValidPosition(worker.position)) return null;

                return (
                    <Marker
                        key={worker.id}
                        position={worker.position}
                        icon={createCustomIcon(
                            worker.markerType || 'check-in',
                            worker.id === highlightedMarkerId,
                        )}
                        eventHandlers={{
                            click: () => handleMarkerClick(worker),
                        }}
                    >
                        {selectedMarker && selectedMarker.id === worker.id && (
                            <Popup
                                closeButton={false}
                                className="custom-popup"
                                minWidth={300}
                                maxWidth={300}
                            >
                                <MarkerPopup worker={worker} />
                            </Popup>
                        )}
                    </Marker>
                );
            })}
        </>
    );
}
