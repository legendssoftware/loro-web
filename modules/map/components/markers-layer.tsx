'use client';

/**
 * MarkersLayer Component
 *
 * This component renders markers and their associated influence radius circles on the map.
 *
 * Features:
 * - Renders markers for workers, clients, competitors, and quotations
 * - **Client Spheres of Influence**: ALL client markers now display influence radius circles
 *   - Uses geofencing radius if explicitly set
 *   - Falls back to geofenceRadius property if available
 *   - Uses intelligent defaults: 1000m for active clients, 500m for others
 * - **Dynamic Client Colors**: Client markers and circles use colors based on:
 *   - Status: active (cyan), inactive (slate), potential (light cyan)
 *   - Price tier: premium (blue), standard (cyan), basic (dark cyan)
 * - Competitor circles only shown when geofencing is explicitly enabled
 * - Circle styling varies by type:
 *   - Clients: More visible (weight: 2, opacity: 0.4, fill: 0.15, dash: 3,7)
 *   - Competitors: Subtle (weight: 1, opacity: 0.3, fill: 0.1, dash: 5,5)
 * - Circle colors match their corresponding marker colors for consistency
 * - Radius is determined by geofencing configuration or intelligent defaults
 */

import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
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
import { formatCurrency } from '@/lib/utils/formatters';

// Helper function to safely render address data
const renderAddressSafely = (address: any): string => {
    if (!address) return 'No address available';

    // If address is a string, return it directly
    if (typeof address === 'string') return address;

    // If address is an object, safely extract and concatenate components
    if (typeof address === 'object') {
        const parts: string[] = [];

        // Helper to safely get string value
        const safeString = (value: any): string => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'string') return value;
            if (typeof value === 'object') return JSON.stringify(value);
            return String(value);
        };

        // Try common address field names
        const streetValue = safeString(address.street || address.streetAddress || address.address1);
        const suburbValue = safeString(address.suburb || address.district || address.address2);
        const cityValue = safeString(address.city || address.locality);
        const stateValue = safeString(address.state || address.province || address.region);
        const countryValue = safeString(address.country || address.countryName);
        const postalValue = safeString(address.postalCode || address.zipCode || address.zip);

        if (streetValue) parts.push(streetValue);
        if (suburbValue) parts.push(suburbValue);
        if (cityValue) parts.push(cityValue);
        if (stateValue) parts.push(stateValue);
        if (countryValue) parts.push(countryValue);
        if (postalValue) parts.push(postalValue);

        return parts.filter(part => part.trim().length > 0).join(', ') || 'Address details available';
    }

    return 'Invalid address format';
};

interface MarkerPopupProps {
    worker: WorkerType | ClientType | CompetitorType | QuotationType | any; // Extended to support all marker types
}

function MarkerPopup({ worker }: MarkerPopupProps) {
    if (!worker) return null;

    // Determine marker type for conditional rendering
    const markerType = worker.markerType;
    const isWorkerType = markerType !== 'client' && markerType !== 'competitor' && markerType !== 'quotation' &&
                         markerType !== 'task' && markerType !== 'lead' && markerType !== 'journal' &&
                         markerType !== 'check-in-visit' && !markerType?.includes('shift') && !markerType?.includes('break');
    const isShiftOrBreakType = isShiftStartType || isShiftEndType || isBreakStartType || isBreakEndType;
    const shouldShowUserImage = isWorkerType || isShiftOrBreakType;
    const isClientType = markerType === 'client';
    const isCompetitorType = markerType === 'competitor';
    const isQuotationType = markerType === 'quotation';
    const isTaskType = markerType === 'task';
    const isLeadType = markerType === 'lead';
    const isJournalType = markerType === 'journal';
    const isCheckInVisitType = markerType === 'check-in-visit';
    const isShiftStartType = markerType === 'shift-start';
    const isShiftEndType = markerType === 'shift-end';
    const isBreakStartType = markerType === 'break-start';
    const isBreakEndType = markerType === 'break-end';
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

    // Get user profile image - prioritize image field, then owner photoURL/avatar, then placeholder
    const getUserImage = () => {
        if (worker.image) return worker.image;
        if (worker.owner?.photoURL) return worker.owner.photoURL;
        if (worker.owner?.avatar) return worker.owner.avatar;
        return '/placeholder.svg?height=64&width=64';
    };

    // Get user phone number - prioritize phone field, then owner phone
    const getUserPhone = () => {
        return worker.phone || worker.owner?.phone || null;
    };

    // Get the entity name for display
    const entityName =
        isQuotationType && 'quotationNumber' in worker
            ? worker.quotationNumber
            : isTaskType && 'taskData' in worker
            ? worker.taskData?.title || worker.name
            : isLeadType && 'leadData' in worker
            ? worker.leadData?.companyName || worker.leadData?.contactName || worker.name
            : isJournalType && 'journalData' in worker
            ? `Journal Entry #${worker.journalData?.uid || worker.id}`
            : isCheckInVisitType && 'checkInData' in worker
            ? `Check-in Visit - ${worker.client?.name || 'Client'}`
            : isShiftStartType || isShiftEndType
            ? `${isShiftStartType ? 'Shift Start' : 'Shift End'} - ${worker.name}`
            : isBreakStartType || isBreakEndType
            ? `${isBreakStartType ? 'Break Start' : 'Break End'} - ${worker.name}`
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
            : isTaskType
                ? 'bg-pink-500'
            : isLeadType
                ? 'bg-orange-500'
            : isJournalType
                ? 'bg-purple-500'
            : isCheckInVisitType
                ? 'bg-blue-500'
            : isShiftStartType || isShiftEndType
                ? 'bg-green-500'
            : isBreakStartType || isBreakEndType
                ? 'bg-yellow-500'
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
                {/* Show user image for worker types, shift start/end, and break start/end */}
                {shouldShowUserImage && !isEventType && (
                    <div className="w-16 h-16 mb-2 overflow-hidden border-2 rounded-full border-primary/20">
                        <Image
                            src={getUserImage()}
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
                                Total: {formatCurrency(worker.totalAmount)}
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
                            {renderAddressSafely('address' in worker ? worker.address : null)}
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
                        {'industry' in worker && worker.industry && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Industry: {worker.industry}
                            </p>
                        )}
                        {'description' in worker && worker.description && (
                            <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">
                                {worker.description}
                            </p>
                        )}
                    </div>

                    {'contactName' in worker && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <UserPlus size={15} strokeWidth={1.5} />
                                Contact Information
                            </p>
                            {worker.contactName && (
                                <p className="text-[10px] mb-1 flex items-center gap-1">
                                    <UserPlus size={12} strokeWidth={1.5} className="text-indigo-500" />
                                    {worker.contactName}
                                </p>
                            )}
                            {getUserPhone() && (
                                <a 
                                    href={`tel:${getUserPhone()}`}
                                    className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1 hover:text-primary transition-colors"
                                >
                                    <PhoneCall size={12} strokeWidth={1.5} className="text-indigo-500" />
                                    {getUserPhone()}
                                </a>
                            )}
                            {'alternativePhone' in worker && worker.alternativePhone && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                    <PhoneCall size={12} strokeWidth={1.5} className="text-green-500" />
                                    Alt: {worker.alternativePhone}
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

                    {'creditLimit' in worker && (worker.creditLimit || worker.outstandingBalance || worker.lifetimeValue) && (
                        <div className="p-2 text-[10px] bg-green-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <FolderIcon size={15} strokeWidth={1.5} />
                                Financial Information
                            </p>
                            {worker.creditLimit && (
                                <p className="text-[9px] text-muted-foreground mb-1">
                                    Credit Limit: {formatCurrency(worker.creditLimit)}
                                </p>
                            )}
                            {worker.outstandingBalance && (
                                <p className="text-[9px] text-muted-foreground mb-1">
                                    Outstanding: {formatCurrency(worker.outstandingBalance)}
                                </p>
                            )}
                            {worker.lifetimeValue && (
                                <p className="text-[9px] text-muted-foreground mb-1">
                                    Lifetime Value: {formatCurrency(worker.lifetimeValue)}
                                </p>
                            )}
                            {'priceTier' in worker && worker.priceTier && (
                                <p className="text-[9px] text-muted-foreground mb-1">
                                    Price Tier: {worker.priceTier.toUpperCase()}
                                </p>
                            )}
                            {'riskLevel' in worker && worker.riskLevel && (
                                <p className="text-[9px] text-muted-foreground">
                                    Risk Level: {worker.riskLevel.toUpperCase()}
                                </p>
                            )}
                        </div>
                    )}

                    {'companySize' in worker && (worker.companySize || worker.annualRevenue) && (
                        <div className="p-2 text-[10px] bg-blue-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <Building size={15} strokeWidth={1.5} />
                                Company Details
                            </p>
                            {worker.companySize && (
                                <p className="text-[9px] text-muted-foreground mb-1">
                                    Employees: {worker.companySize}
                                </p>
                            )}
                            {worker.annualRevenue && (
                                <p className="text-[9px] text-muted-foreground mb-1">
                                    Annual Revenue: {formatCurrency(worker.annualRevenue)}
                                </p>
                            )}
                            {'satisfactionScore' in worker && worker.satisfactionScore && (
                                <p className="text-[9px] text-muted-foreground mb-1">
                                    Satisfaction: {worker.satisfactionScore}/10
                                </p>
                            )}
                            {'npsScore' in worker && worker.npsScore && (
                                <p className="text-[9px] text-muted-foreground">
                                    NPS Score: {worker.npsScore}
                                </p>
                            )}
                        </div>
                    )}

                    {'tags' in worker && worker.tags && worker.tags.length > 0 && (
                        <div className="p-2 text-[10px] bg-purple-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground">
                                Tags
                            </p>
                            <div className="flex flex-wrap gap-1">
                                {worker.tags?.slice(0, 4)?.map((tag: string, index: number) => (
                                    <span key={index} className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[8px]">
                                        {tag}
                                    </span>
                                ))}
                                {worker.tags && worker.tags.length > 4 && (
                                    <span className="text-[8px] text-muted-foreground">+{worker.tags.length - 4} more</span>
                                )}
                            </div>
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

            {/* Task-specific information */}
            {isTaskType && 'taskData' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-pink-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 size={15} strokeWidth={1.5} />
                            Task Details
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            {worker.taskData?.title || 'Task'}
                        </p>
                        <p className="text-[10px] flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                                worker.taskData?.status === 'COMPLETED' ? 'bg-green-500' :
                                worker.taskData?.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                worker.taskData?.status === 'OVERDUE' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`}></span>
                            Status: {worker.taskData?.status || 'PENDING'}
                        </p>
                        {worker.taskData?.description && (
                            <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">
                                {worker.taskData.description}
                            </p>
                        )}
                        {worker.taskData?.priority && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Priority: {worker.taskData.priority}
                            </p>
                        )}
                        {worker.taskData?.deadline && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Deadline: {new Date(worker.taskData.deadline).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {worker.client && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <Building size={15} strokeWidth={1.5} />
                                Client Location
                            </p>
                            <p className="text-[10px] font-medium">
                                {worker.client.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                                {renderAddressSafely(worker.location?.address)}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-center mt-2">
                        <button className="px-3 py-1 text-[10px] uppercase font-thin border border-pink-500/20 rounded-md text-pink-600 hover:bg-pink-500/5 transition-colors">
                            View Task Details
                        </button>
                    </div>
                </>
            )}

            {/* Lead-specific information */}
            {isLeadType && 'leadData' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-orange-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <UserPlus size={15} strokeWidth={1.5} />
                            Lead Details
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            {worker.leadData?.companyName || worker.leadData?.contactName || 'Lead'}
                        </p>
                        <p className="text-[10px] flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                                worker.leadData?.status === 'QUALIFIED' ? 'bg-green-500' :
                                worker.leadData?.status === 'CONTACTED' ? 'bg-blue-500' :
                                worker.leadData?.status === 'COLD' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`}></span>
                            Status: {worker.leadData?.status || 'NEW'}
                        </p>
                        {worker.leadData?.email && (
                            <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                                <Mail size={12} strokeWidth={1.5} className="text-orange-500" />
                                {worker.leadData.email}
                            </p>
                        )}
                        {worker.leadData?.phone && (
                            <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                <PhoneCall size={12} strokeWidth={1.5} className="text-orange-500" />
                                {worker.leadData.phone}
                            </p>
                        )}
                        {worker.leadData?.industry && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Industry: {worker.leadData.industry}
                            </p>
                        )}
                        {worker.leadData?.leadScore && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Lead Score: {worker.leadData.leadScore}/100
                            </p>
                        )}
                    </div>

                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <MapPin size={15} strokeWidth={1.5} />
                            Lead Location
                        </p>
                        <p className="text-[10px]">
                            {renderAddressSafely(worker.location?.address)}
                        </p>
                    </div>

                    <div className="flex justify-center mt-2">
                        <button className="px-3 py-1 text-[10px] uppercase font-thin border border-orange-500/20 rounded-md text-orange-600 hover:bg-orange-500/5 transition-colors">
                            View Lead Details
                        </button>
                    </div>
                </>
            )}

            {/* Journal-specific information */}
            {isJournalType && 'journalData' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-purple-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <FolderIcon size={15} strokeWidth={1.5} />
                            Journal Entry
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            Entry #{worker.journalData?.uid || worker.id}
                        </p>
                        <p className="text-[10px] flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${
                                worker.journalData?.status === 'APPROVED' ? 'bg-green-500' :
                                worker.journalData?.status === 'REJECTED' ? 'bg-red-500' :
                                'bg-yellow-500'
                            }`}></span>
                            Status: {worker.journalData?.status || 'PENDING_REVIEW'}
                        </p>
                        {worker.journalData?.comments && (
                            <p className="text-[9px] text-muted-foreground mt-1 line-clamp-3">
                                {worker.journalData.comments}
                            </p>
                        )}
                        {worker.journalData?.timestamp && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Created: {new Date(worker.journalData.timestamp).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {worker.clientName && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <Building size={15} strokeWidth={1.5} />
                                Client Reference
                            </p>
                            <p className="text-[10px] font-medium">
                                {worker.clientName}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                                {renderAddressSafely(worker.location?.address)}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-center mt-2">
                        <button className="px-3 py-1 text-[10px] uppercase font-thin border border-purple-500/20 rounded-md text-purple-600 hover:bg-purple-500/5 transition-colors">
                            View Journal Entry
                        </button>
                    </div>
                </>
            )}

            {/* Check-in Visit specific information */}
            {isCheckInVisitType && 'checkInData' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-blue-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <MapPin size={15} strokeWidth={1.5} />
                            Check-in Visit
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            Visit #{worker.checkInData?.uid || worker.id}
                        </p>
                        <p className="text-[10px] flex items-center gap-1 mb-1">
                            <span className={`w-2 h-2 rounded-full ${worker.checkInData?.checkOutTime ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                            Status: {worker.checkInData?.checkOutTime ? 'Completed' : 'In Progress'}
                        </p>
                        {worker.checkInData?.checkInTime && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Check-in: {new Date(worker.checkInData.checkInTime).toLocaleString()}
                            </p>
                        )}
                        {worker.checkInData?.checkOutTime && (
                            <p className="text-[9px] text-muted-foreground">
                                Check-out: {new Date(worker.checkInData.checkOutTime).toLocaleString()}
                            </p>
                        )}
                        {worker.checkInData?.duration && (
                            <p className="text-[9px] text-muted-foreground">
                                Duration: {worker.checkInData.duration}
                            </p>
                        )}
                    </div>

                    {worker.client && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <Building size={15} strokeWidth={1.5} />
                                Visit Location
                            </p>
                            <p className="text-[10px] font-medium">
                                {worker.client.name}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                                {renderAddressSafely(worker.location?.address)}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-center mt-2">
                        <button className="px-3 py-1 text-[10px] uppercase font-thin border border-blue-500/20 rounded-md text-blue-600 hover:bg-blue-500/5 transition-colors">
                            View Visit Details
                        </button>
                    </div>
                </>
            )}

            {/* Shift Start/End specific information */}
            {(isShiftStartType || isShiftEndType) && 'attendanceData' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-green-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            {isShiftStartType ? <PlayCircle size={15} strokeWidth={1.5} /> : <TimerOff size={15} strokeWidth={1.5} />}
                            {isShiftStartType ? 'Shift Started' : 'Shift Ended'}
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            {worker.name}
                        </p>
                        {worker.attendanceData?.checkInTime && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                {isShiftStartType ? 'Started' : 'Check-in'}: {new Date(worker.attendanceData.checkInTime).toLocaleString()}
                            </p>
                        )}
                        {isShiftEndType && worker.attendanceData?.checkOutTime && (
                            <p className="text-[9px] text-muted-foreground">
                                Ended: {new Date(worker.attendanceData.checkOutTime).toLocaleString()}
                            </p>
                        )}
                        {isShiftEndType && worker.attendanceData?.duration && (
                            <p className="text-[9px] text-muted-foreground">
                                Total Duration: {worker.attendanceData.duration}
                            </p>
                        )}
                    </div>

                    {/* User contact information */}
                    {getUserPhone() && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <PhoneCall size={15} strokeWidth={1.5} />
                                Contact
                            </p>
                            <a 
                                href={`tel:${getUserPhone()}`}
                                className="flex items-center gap-2 text-[10px] text-primary hover:text-primary/80 transition-colors"
                            >
                                <PhoneCall size={12} strokeWidth={1.5} />
                                {getUserPhone()}
                            </a>
                        </div>
                    )}

                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <MapPin size={15} strokeWidth={1.5} />
                            Location
                        </p>
                        <p className="text-[10px]">
                            {renderAddressSafely(worker.location?.address)}
                        </p>
                    </div>
                </>
            )}

            {/* Break Start/End specific information */}
            {(isBreakStartType || isBreakEndType) && 'attendanceData' in worker && (
                <>
                    <div className="p-2 text-[10px] bg-yellow-500/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <Coffee size={15} strokeWidth={1.5} />
                            {isBreakStartType ? 'Break Started' : 'Break Ended'}
                        </p>
                        <p className="text-[10px] font-medium mb-2">
                            {worker.name}
                        </p>
                        {worker.attendanceData?.breakStartTime && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Started: {new Date(worker.attendanceData.breakStartTime).toLocaleString()}
                            </p>
                        )}
                        {isBreakEndType && worker.attendanceData?.breakEndTime && (
                            <p className="text-[9px] text-muted-foreground">
                                Ended: {new Date(worker.attendanceData.breakEndTime).toLocaleString()}
                            </p>
                        )}
                        {worker.attendanceData?.breakCount && (
                            <p className="text-[9px] text-muted-foreground">
                                Break Count: {worker.attendanceData.breakCount}
                            </p>
                        )}
                        {worker.attendanceData?.totalBreakTime && (
                            <p className="text-[9px] text-muted-foreground">
                                Total Break Time: {worker.attendanceData.totalBreakTime}
                            </p>
                        )}
                    </div>

                    {/* User contact information */}
                    {getUserPhone() && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <PhoneCall size={15} strokeWidth={1.5} />
                                Contact
                            </p>
                            <a 
                                href={`tel:${getUserPhone()}`}
                                className="flex items-center gap-2 text-[10px] text-primary hover:text-primary/80 transition-colors"
                            >
                                <PhoneCall size={12} strokeWidth={1.5} />
                                {getUserPhone()}
                            </a>
                        </div>
                    )}

                    <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                        <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                            <MapPin size={15} strokeWidth={1.5} />
                            Break Location
                        </p>
                        <p className="text-[10px]">
                            {renderAddressSafely(worker.location?.address)}
                        </p>
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
                            {renderAddressSafely('address' in worker ? worker.address : null)}
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
                        {'industry' in worker && worker.industry && (
                            <p className="text-[9px] text-muted-foreground mt-1">
                                Industry: {worker.industry}
                            </p>
                        )}
                        {'description' in worker && worker.description && (
                            <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">
                                {worker.description}
                            </p>
                        )}
                    </div>

                    {'contactEmail' in worker && (worker.contactEmail || worker.contactPhone || worker.website) && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <UserPlus size={15} strokeWidth={1.5} />
                                Contact Information
                            </p>
                            {worker.contactEmail && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                                    <Mail size={12} strokeWidth={1.5} className="text-red-500" />
                                    {worker.contactEmail}
                                </p>
                            )}
                            {worker.contactPhone && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                    <PhoneCall size={12} strokeWidth={1.5} className="text-red-500" />
                                    {worker.contactPhone}
                                </p>
                            )}
                            {worker.website && (
                                <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                    <Globe size={12} strokeWidth={1.5} className="text-red-500" />
                                    {worker.website}
                                </p>
                            )}
                        </div>
                    )}

                    {'isDirect' in worker && (
                        <div className="p-2 text-[10px] bg-red-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <AlertTriangle size={15} strokeWidth={1.5} />
                                Competitive Analysis
                            </p>
                            <p className="text-[9px] text-muted-foreground flex items-center gap-1 mt-1">
                                <Building size={12} strokeWidth={1.5} className="text-red-500" />
                                Direct Competitor: {worker.isDirect ? 'Yes' : 'No'}
                            </p>
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
                            {'competitiveAdvantage' in worker && worker.competitiveAdvantage !== undefined && (
                                <div className="mt-1 mb-2">
                                    <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                                        <CheckCircle2 size={12} strokeWidth={1.5} className="text-green-500" />
                                        Competitive Advantage: {worker.competitiveAdvantage}/10
                                    </p>
                                    <div className="mt-1 w-full bg-accent/20 rounded-full h-1.5">
                                        <div
                                            className="bg-green-500 h-1.5 rounded-full"
                                            style={{ width: `${(worker.competitiveAdvantage / 10) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            {'estimatedEmployeeCount' in worker && worker.estimatedEmployeeCount && (
                                <p className="text-[9px] text-muted-foreground mt-1">
                                    Est. Employees: {worker.estimatedEmployeeCount}
                                </p>
                            )}
                            {'estimatedAnnualRevenue' in worker && worker.estimatedAnnualRevenue && (
                                <p className="text-[9px] text-muted-foreground">
                                    Est. Revenue: {formatCurrency(worker.estimatedAnnualRevenue)}
                                </p>
                            )}
                            {'marketSharePercentage' in worker && worker.marketSharePercentage && (
                                <p className="text-[9px] text-muted-foreground">
                                    Market Share: {worker.marketSharePercentage}%
                                </p>
                            )}
                        </div>
                    )}

                    {'keyProducts' in worker && worker.keyProducts && worker.keyProducts.length > 0 && (
                        <div className="p-2 text-[10px] bg-blue-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground">
                                Key Products
                            </p>
                            <div className="space-y-0.5">
                                {worker.keyProducts?.slice(0, 3)?.map((product: string, index: number) => (
                                    <p key={index} className="text-[9px] text-muted-foreground">• {product}</p>
                                ))}
                                {worker.keyProducts && worker.keyProducts.length > 3 && (
                                    <p className="text-[8px] text-muted-foreground">+{worker.keyProducts.length - 3} more</p>
                                )}
                            </div>
                        </div>
                    )}

                    {'keyStrengths' in worker && worker.keyStrengths && worker.keyStrengths.length > 0 && (
                        <div className="p-2 text-[10px] bg-green-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground">
                                Key Strengths
                            </p>
                            <div className="space-y-0.5">
                                {worker.keyStrengths?.slice(0, 2)?.map((strength: string, index: number) => (
                                    <p key={index} className="text-[9px] text-muted-foreground">• {strength}</p>
                                ))}
                                {worker.keyStrengths && worker.keyStrengths.length > 2 && (
                                    <p className="text-[8px] text-muted-foreground">+{worker.keyStrengths.length - 2} more</p>
                                )}
                            </div>
                        </div>
                    )}

                    {'keyWeaknesses' in worker && worker.keyWeaknesses && worker.keyWeaknesses.length > 0 && (
                        <div className="p-2 text-[10px] bg-orange-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground">
                                Key Weaknesses
                            </p>
                            <div className="space-y-0.5">
                                {worker.keyWeaknesses?.slice(0, 2)?.map((weakness: string, index: number) => (
                                    <p key={index} className="text-[9px] text-muted-foreground">• {weakness}</p>
                                ))}
                                {worker.keyWeaknesses && worker.keyWeaknesses.length > 2 && (
                                    <p className="text-[8px] text-muted-foreground">+{worker.keyWeaknesses.length - 2} more</p>
                                )}
                            </div>
                        </div>
                    )}

                    {'pricingData' in worker && worker.pricingData && (
                        <div className="p-2 text-[10px] bg-yellow-500/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground">
                                Pricing Intelligence
                            </p>
                            {worker.pricingData.lowEndPricing && (
                                <p className="text-[9px] text-muted-foreground">
                                    Low: {formatCurrency(worker.pricingData.lowEndPricing)}
                                </p>
                            )}
                            {worker.pricingData.midRangePricing && (
                                <p className="text-[9px] text-muted-foreground">
                                    Mid: {formatCurrency(worker.pricingData.midRangePricing)}
                                </p>
                            )}
                            {worker.pricingData.highEndPricing && (
                                <p className="text-[9px] text-muted-foreground">
                                    High: {formatCurrency(worker.pricingData.highEndPricing)}
                                </p>
                            )}
                            {worker.pricingData.pricingModel && (
                                <p className="text-[9px] text-muted-foreground mt-1">
                                    Model: {worker.pricingData.pricingModel}
                                </p>
                            )}
                        </div>
                    )}

                    {'geofencing' in worker && worker.geofencing && worker.geofencing.enabled && (
                        <div className="p-1 mt-2 rounded bg-red-500/5">
                            <p className="text-[9px] font-medium">Geofencing Active</p>
                            <p className="text-[8px] text-muted-foreground">
                                Type: {worker.geofencing.type}, Radius: {worker.geofencing.radius}m
                            </p>
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
                <>
                    {/* User contact information for workers */}
                    {getUserPhone() && (
                        <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                            <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                                <PhoneCall size={15} strokeWidth={1.5} />
                                Contact
                            </p>
                            <a 
                                href={`tel:${getUserPhone()}`}
                                className="flex items-center gap-2 text-[10px] text-primary hover:text-primary/80 transition-colors"
                            >
                                <PhoneCall size={12} strokeWidth={1.5} />
                                {getUserPhone()}
                            </a>
                        </div>
                    )}

                <div className="p-2 text-[10px] bg-accent/10 rounded-md">
                    <p className="font-medium uppercase text-[8px] mb-1 text-muted-foreground flex items-center gap-1">
                        <MapPin size={15} strokeWidth={1.5} />
                        Current Location
                    </p>
                    <p className="text-[10px]">
                        {worker.location?.address || 'No location data'}
                    </p>
                </div>
                </>
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
    filteredWorkers: any[]; // Extended to support all marker types (WorkerType, ClientType, CompetitorType, QuotationType, TaskType, LeadType, etc.)
    selectedMarker: any | null; // Extended to support all marker types
    highlightedMarkerId: string | null;
    handleMarkerClick: (marker: any) => void; // Extended to support all marker types
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

// Helper function to get geofencing data from marker
const getGeofencingData = (marker: any): { enabled: boolean; radius: number } | null => {
    if ('geofencing' in marker &&
        marker.geofencing &&
        marker.geofencing.enabled &&
        typeof marker.geofencing.radius === 'number' &&
        marker.geofencing.radius > 0) {
        return {
            enabled: true,
            radius: marker.geofencing.radius
        };
    }
    return null;
};

// Helper function to get client influence radius - ALL clients should have a sphere of influence
const getClientInfluenceData = (marker: any): { enabled: boolean; radius: number } | null => {
    // Only apply to client markers
    if (marker.markerType !== 'client') return null;

    // Check if geofencing is explicitly enabled and has radius
    if ('geofencing' in marker &&
        marker.geofencing &&
        marker.geofencing.enabled &&
        typeof marker.geofencing.radius === 'number' &&
        marker.geofencing.radius > 0) {
        return {
            enabled: true,
            radius: marker.geofencing.radius
        };
    }

    // Check for direct geofenceRadius property
    if ('geofenceRadius' in marker &&
        typeof marker.geofenceRadius === 'number' &&
        marker.geofenceRadius > 0) {
        return {
            enabled: true,
            radius: marker.geofenceRadius
        };
    }

    // Default radius for all clients if no specific radius is set
    // Use a reasonable default based on client type or status
    const defaultRadius = marker.status === 'active' ? 1000 : 500; // Active clients get larger radius

    return {
        enabled: true,
        radius: defaultRadius
    };
};

// Helper function to get circle color based on marker type and client properties
const getCircleColor = (markerType: string, marker?: any): string => {
    switch (markerType) {
        case 'client':
            // For clients, vary color based on status, tier, or other properties
            if (marker) {
                // Color based on client status
                if (marker.status === 'active') return '#06b6d4'; // cyan for active
                if (marker.status === 'inactive') return '#94a3b8'; // slate for inactive
                if (marker.status === 'potential') return '#22d3ee'; // cyan lighter for potential

                // Alternative: Color based on price tier
                if (marker.priceTier === 'premium') return '#3b82f6'; // blue for premium
                if (marker.priceTier === 'standard') return '#06b6d4'; // cyan for standard
                if (marker.priceTier === 'basic') return '#0891b2'; // darker cyan for basic
            }
            return '#06b6d4'; // default cyan - matching marker color
        case 'competitor':
            return '#ef4444'; // red - matching marker color
        default:
            return '#6b7280'; // gray fallback
    }
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
    console.log(`Rendering ${filteredWorkers.length} markers on the map`);

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

                // For clients, always show influence radius
                let influenceData = null;
                if (worker.markerType === 'client') {
                    influenceData = getClientInfluenceData(worker);
                } else if (worker.markerType === 'competitor') {
                    // For competitors, only show if geofencing is explicitly enabled
                    influenceData = getGeofencingData(worker);
                }

                return (
                    <React.Fragment key={uniqueKey}>
                        {/* Render influence radius circle for clients (always) and competitors (when enabled) */}
                        {influenceData && (
                            <Circle
                                center={position}
                                radius={influenceData.radius}
                                pathOptions={{
                                    color: getCircleColor(worker.markerType || '', worker),
                                    weight: worker.markerType === 'client' ? 2 : 1, // Slightly thicker for clients
                                    opacity: worker.markerType === 'client' ? 0.4 : 0.3, // More visible for clients
                                    fillColor: getCircleColor(worker.markerType || '', worker),
                                    fillOpacity: worker.markerType === 'client' ? 0.15 : 0.1, // More visible fill for clients
                                    dashArray: worker.markerType === 'client' ? '3, 7' : '5, 5', // Different dash pattern for clients
                                }}
                            />
                        )}

                        {/* Render the marker */}
                        <Marker
                            position={position}
                            icon={createCustomIcon(worker.markerType || 'check-in', isHighlighted, worker)}
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
                    </React.Fragment>
                );
            })}
        </>
    );
}
