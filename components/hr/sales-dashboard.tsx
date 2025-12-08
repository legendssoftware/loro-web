'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    MapPin,
    User,
    Building,
    Navigation,
    Route,
    Calendar as CalendarIcon,
    Clock,
    MapIcon,
    Search,
    FileText,
    FileSpreadsheet,
    X,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp,
    Download,
} from 'lucide-react';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { format, endOfDay } from 'date-fns';

interface SalesDashboardProps {
    className?: string;
}

interface Address {
    formattedAddress?: string;
    street?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

interface CheckInRecord {
    uid: number;
    checkInTime: string;
    checkOutTime?: string;
    checkInLocation: string;
    checkOutLocation?: string;
    checkInPhoto?: string;
    checkOutPhoto?: string;
    duration?: string;
    notes?: string;
    resolution?: string;
    fullAddress?: Address;
    createdAt?: string;
    updatedAt?: string;
    owner: {
        uid: number;
        name: string;
        surname: string;
        email?: string;
        photoURL?: string;
        avatar?: string;
    };
    branch?: {
        uid: number;
        name: string;
        ref?: string;
    };
    client?: {
        uid: number;
        name: string;
        email?: string;
        phone?: string;
    };
    organisation?: {
        uid: number;
        name: string;
        logo?: string;
        email?: string;
        phone?: string;
    };
    placesOfInterest?: {
        otherPlacesOfInterest?: Array<{
            address: any;
            notes: string;
        }>;
    };
}

interface SalesData {
    message: string;
    checkIns: CheckInRecord[];
}

// Interface for grouped sales rep data
interface SalesRepData {
    uid: number;
    name: string;
    surname: string;
    email?: string;
    photoURL?: string;
    avatar?: string;
    latestCheckInLocation?: string;
    latestCheckOutLocation?: string;
    latestCheckInTime?: string;
    latestCheckOutTime?: string;
    totalVisits: number;
    visits: CheckInRecord[];
    branch?: {
        uid: number;
        name: string;
        ref?: string;
    };
}

// Custom hook to fetch check-ins data
const useCheckInsData = (selectedDate?: Date) => {
    const { accessToken } = useAuthStore();

    return useQuery<SalesData>({
        queryKey: ['checkInsData', selectedDate?.toISOString()],
        queryFn: async () => {
            // Fetch all check-ins
            const checkInsResponse = await axiosInstance.get('/check-ins');
            let allCheckIns = checkInsResponse.data.checkIns || [];

            // Filter by date if provided (bring any check-ins up to and including that date)
            if (selectedDate) {
                const filterDate = endOfDay(selectedDate);
                allCheckIns = allCheckIns.filter((checkIn: CheckInRecord) => {
                    const checkInDate = new Date(checkIn.checkInTime);
                    return checkInDate <= filterDate;
                });
            }

            // Sort by check-in time descending (most recent first)
            allCheckIns.sort((a: CheckInRecord, b: CheckInRecord) => {
                return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
            });

            return {
                message: checkInsResponse.data.message || 'Success',
                checkIns: allCheckIns,
            };
        },
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        retry: 2,
    });
};

// Helper function to get location name from coordinates or fullAddress
const getLocationName = (record: CheckInRecord, isCheckOut: boolean = false): string => {
    // Try to get from fullAddress first (formatted address)
    if (record.fullAddress?.formattedAddress) {
        return record.fullAddress.formattedAddress;
    }

    // If fullAddress exists but no formattedAddress, build from components
    if (record.fullAddress) {
        const parts = [];
        if (record.fullAddress.street) parts.push(record.fullAddress.street);
        if (record.fullAddress.suburb) parts.push(record.fullAddress.suburb);
        if (record.fullAddress.city) parts.push(record.fullAddress.city);
        if (record.fullAddress.state) parts.push(record.fullAddress.state);
        if (parts.length > 0) return parts.join(', ');
    }

    // Fallback: use coordinates if no address available
    const location = isCheckOut ? record.checkOutLocation : record.checkInLocation;
    if (location && !location.includes(',')) {
        // If it's not coordinates format, return as-is
        return location;
    }

    return '-';
};

// Helper function to get visited places count
const getVisitedPlaces = (record: CheckInRecord): number => {
    let count = 0;

    // Count from placesOfInterest
    if (record.placesOfInterest?.otherPlacesOfInterest) {
        count += record.placesOfInterest.otherPlacesOfInterest.length;
    }

    return count;
};

// Export functions
const exportToExcel = (data: SalesRepData[]) => {
    const headers = [
        'Sales Rep',
        'Email',
        'Branch',
        'Latest Check In Location',
        'Latest Check Out Location',
        'Total Visits',
    ];

    const rows = data.map((rep) => [
        `${rep.name} ${rep.surname}`,
        rep.email || '-',
        rep.branch?.name || '-',
        rep.latestCheckInLocation || '-',
        rep.latestCheckOutLocation || '-',
        rep.totalVisits.toString(),
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-reps-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportToPDF = (data: SalesRepData[]) => {
    // Create a hidden iframe for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sales Reps Report</title>
            <style>
                @page {
                    size: landscape;
                    margin: 1cm;
                }
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    margin: 0;
                }
                h1 { margin: 0 0 10px 0; }
                p { margin: 0 0 20px 0; color: #666; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 10px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 6px;
                    text-align: left;
                    word-wrap: break-word;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .no-print { display: none; }
            </style>
        </head>
        <body>
            <h1>Sales Reps Report</h1>
            <p>Generated: ${format(new Date(), 'PPp')}</p>
            <table>
                <thead>
                    <tr>
                        <th>Sales Rep</th>
                        <th>Email</th>
                        <th>Branch</th>
                        <th>Latest Check In Location</th>
                        <th>Latest Check Out Location</th>
                        <th>Total Visits</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((rep) => `
                        <tr>
                            <td>${rep.name} ${rep.surname}</td>
                            <td>${rep.email || '-'}</td>
                            <td>${rep.branch?.name || '-'}</td>
                            <td>${rep.latestCheckInLocation || '-'}</td>
                            <td>${rep.latestCheckOutLocation || '-'}</td>
                            <td>${rep.totalVisits}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

// User Visits Modal Component - Shows all visits for a selected sales rep
const UserVisitsModal: React.FC<{
    salesRep: SalesRepData | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ salesRep, isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [expandedVisitId, setExpandedVisitId] = useState<number | null>(null);

    // Get unique branches from visits
    const branches = useMemo(() => {
        if (!salesRep?.visits) return [];
        const branchSet = new Set<string>();
        salesRep.visits.forEach((visit) => {
            if (visit.branch?.name) {
                branchSet.add(visit.branch.name);
            }
        });
        return Array.from(branchSet).sort();
    }, [salesRep?.visits]);

    // Filter visits
    const filteredVisits = useMemo(() => {
        if (!salesRep?.visits) return [];
        return salesRep.visits.filter((visit) => {
            // Search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const checkInLoc = getLocationName(visit, false).toLowerCase();
                const checkOutLoc = getLocationName(visit, true).toLowerCase();
                const clientName = visit.client?.name?.toLowerCase() || '';
                if (!checkInLoc.includes(searchLower) && !checkOutLoc.includes(searchLower) && !clientName.includes(searchLower)) {
                    return false;
                }
            }

            // Branch filter
            if (branchFilter !== 'all' && visit.branch?.name !== branchFilter) {
                return false;
            }

            // Date filter
            if (dateFilter) {
                const filterDate = endOfDay(dateFilter);
                const checkInDate = new Date(visit.checkInTime);
                if (checkInDate > filterDate) {
                    return false;
                }
            }

            return true;
        });
    }, [salesRep?.visits, searchQuery, branchFilter, dateFilter]);

    // Export functions for individual user visits
    const exportUserVisitsToExcel = (visits: CheckInRecord[], repName: string) => {
        const headers = [
            'Date',
            'Branch',
            'Check In Location',
            'Check Out Location',
            'Client',
            'Duration',
            'Check In Time',
            'Check Out Time',
            'Notes',
            'Resolution',
            'Created At',
            'Updated At',
        ];

        const rows = visits.map((visit) => [
            format(new Date(visit.checkInTime), 'PPp'),
            visit.branch?.name || '-',
            getLocationName(visit, false),
            getLocationName(visit, true),
            visit.client?.name || '-',
            visit.duration || '-',
            format(new Date(visit.checkInTime), 'PPp'),
            visit.checkOutTime ? format(new Date(visit.checkOutTime), 'PPp') : '-',
            visit.notes || '-',
            visit.resolution || '-',
            visit.createdAt ? format(new Date(visit.createdAt), 'PPp') : '-',
            visit.updatedAt ? format(new Date(visit.updatedAt), 'PPp') : '-',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${repName.replace(/\s+/g, '-')}-visits-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportUserVisitsToPDF = (visits: CheckInRecord[], repName: string) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${repName} - Visits Report</title>
                <style>
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        margin: 0;
                    }
                    h1 { margin: 0 0 10px 0; }
                    p { margin: 0 0 20px 0; color: #666; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                        font-size: 9px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 6px;
                        text-align: left;
                        word-wrap: break-word;
                    }
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                </style>
            </head>
            <body>
                <h1>${repName} - Visits Report</h1>
                <p>Generated: ${format(new Date(), 'PPp')}</p>
                <p>Total Visits: ${visits.length}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Branch</th>
                            <th>Check In Location</th>
                            <th>Check Out Location</th>
                            <th>Client</th>
                            <th>Duration</th>
                            <th>Notes</th>
                            <th>Resolution</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${visits.map((visit) => `
                            <tr>
                                <td>${format(new Date(visit.checkInTime), 'PPp')}</td>
                                <td>${visit.branch?.name || '-'}</td>
                                <td>${getLocationName(visit, false)}</td>
                                <td>${getLocationName(visit, true)}</td>
                                <td>${visit.client?.name || '-'}</td>
                                <td>${visit.duration || '-'}</td>
                                <td>${visit.notes || '-'}</td>
                                <td>${visit.resolution || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    const toggleVisitExpansion = (visitId: number) => {
        setExpandedVisitId(expandedVisitId === visitId ? null : visitId);
    };

    if (!salesRep) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setExpandedVisitId(null);
            }
            onClose();
        }}>
            <DialogContent className="w-[80vw] h-[80vh] max-w-none flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Visits - {salesRep.name} {salesRep.surname}
                            </DialogTitle>
                            <DialogDescription>
                                All visits for this sales rep ({salesRep.totalVisits} total)
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportUserVisitsToExcel(filteredVisits, `${salesRep.name} ${salesRep.surname}`)}
                                className="flex items-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                Export Excel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportUserVisitsToPDF(filteredVisits, `${salesRep.name} ${salesRep.surname}`)}
                                className="flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Filters */}
                <div className="flex flex-col gap-4 pb-4 border-b">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by location or client..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Date Filter */}
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full sm:w-[240px] justify-start text-left font-normal",
                                        !dateFilter && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={dateFilter}
                                    onSelect={(date) => {
                                        setDateFilter(date);
                                        setIsCalendarOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Branch Filter */}
                        <Select value={branchFilter} onValueChange={setBranchFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Branches</SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem key={branch} value={branch}>
                                        {branch}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear Filters */}
                    {(searchQuery || dateFilter || branchFilter !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setDateFilter(undefined);
                                setBranchFilter('all');
                            }}
                            className="self-start flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Visits Table */}
                <div className="flex-1 overflow-y-auto rounded-md border">
                    {filteredVisits.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            No visits found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold">Date</TableHead>
                                    <TableHead className="font-bold">Branch</TableHead>
                                    <TableHead className="font-bold">Check In Location</TableHead>
                                    <TableHead className="font-bold">Check Out Location</TableHead>
                                    <TableHead className="font-bold">Client</TableHead>
                                    <TableHead className="font-bold">Duration</TableHead>
                                    <TableHead className="font-bold">Notes</TableHead>
                                    <TableHead className="font-bold">Resolution</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredVisits.map((visit, index) => {
                                    const checkInLoc = getLocationName(visit, false);
                                    const checkOutLoc = getLocationName(visit, true);
                                    const isExpanded = expandedVisitId === visit.uid;
                                    const visitedPlaces = visit.placesOfInterest?.otherPlacesOfInterest || [];

                                    return (
                                        <React.Fragment key={visit.uid}>
                                            <TableRow
                                                className={cn(
                                                    "cursor-pointer hover:bg-muted/50",
                                                    index % 2 === 0 ? "bg-white" : "bg-gray-50 dark:bg-gray-900/50"
                                                )}
                                                onClick={() => toggleVisitExpansion(visit.uid)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                        {format(new Date(visit.checkInTime), 'PPp')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {visit.branch?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                        <span className="max-w-[200px] truncate">
                                                            {checkInLoc}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-3 h-3 text-red-600 flex-shrink-0" />
                                                        <span className="max-w-[200px] truncate">
                                                            {checkOutLoc}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {visit.client?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {visit.duration || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="max-w-[200px] truncate block">
                                                        {visit.notes || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="max-w-[200px] truncate block">
                                                        {visit.resolution || '-'}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="bg-muted/30 p-6">
                                                        <div className="space-y-6">
                                                            {/* Visit ID */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-4 rounded-lg border bg-background">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                                                        <span className="text-sm font-medium">Visit ID</span>
                                                                    </div>
                                                                    <p className="text-lg font-semibold">#{visit.uid}</p>
                                                                </div>

                                                                {/* Duration */}
                                                                {visit.duration && (
                                                                    <div className="p-4 rounded-lg border bg-background">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Clock className="w-4 h-4 text-purple-600" />
                                                                            <span className="text-sm font-medium">Duration</span>
                                                                        </div>
                                                                        <p className="text-lg font-semibold">{visit.duration}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Check In Details */}
                                                            <div className="p-4 rounded-lg border bg-background">
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <MapPin className="w-4 h-4 text-green-600" />
                                                                    <span className="text-sm font-medium">Check In Details</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Time</p>
                                                                        <p className="text-sm font-semibold">{format(new Date(visit.checkInTime), 'PPp')}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground mb-1">Location</p>
                                                                        <p className="text-sm">{checkInLoc}</p>
                                                                    </div>
                                                                </div>
                                                                {visit.checkInPhoto && (
                                                                    <div className="mt-4">
                                                                        <img
                                                                            src={visit.checkInPhoto}
                                                                            alt="Check-in photo"
                                                                            className="w-full rounded-md border max-h-64 object-cover"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                {visit.fullAddress && (
                                                                    <div className="mt-4 p-3 rounded-md bg-muted">
                                                                        <p className="text-xs text-muted-foreground mb-1">Full Address</p>
                                                                        <p className="text-sm">
                                                                            {visit.fullAddress.formattedAddress ||
                                                                             [visit.fullAddress.street, visit.fullAddress.suburb, visit.fullAddress.city, visit.fullAddress.state, visit.fullAddress.country]
                                                                                .filter(Boolean).join(', ')}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Check Out Details */}
                                                            {visit.checkOutTime && (
                                                                <div className="p-4 rounded-lg border bg-background">
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <MapPin className="w-4 h-4 text-red-600" />
                                                                        <span className="text-sm font-medium">Check Out Details</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground mb-1">Time</p>
                                                                            <p className="text-sm font-semibold">{format(new Date(visit.checkOutTime), 'PPp')}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground mb-1">Location</p>
                                                                            <p className="text-sm">{checkOutLoc}</p>
                                                                        </div>
                                                                    </div>
                                                                    {visit.checkOutPhoto && (
                                                                        <div className="mt-4">
                                                                            <img
                                                                                src={visit.checkOutPhoto}
                                                                                alt="Check-out photo"
                                                                                className="w-full rounded-md border max-h-64 object-cover"
                                                                                onError={(e) => {
                                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Sales Rep, Branch, Client, Organisation */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-4 rounded-lg border bg-background">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                                        <span className="text-sm font-medium">Sales Rep</span>
                                                                    </div>
                                                                    <p className="text-sm font-semibold">
                                                                        {visit.owner.name} {visit.owner.surname}
                                                                    </p>
                                                                    {visit.owner.email && (
                                                                        <p className="text-xs text-muted-foreground">{visit.owner.email}</p>
                                                                    )}
                                                                </div>

                                                                <div className="p-4 rounded-lg border bg-background">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Building className="w-4 h-4 text-muted-foreground" />
                                                                        <span className="text-sm font-medium">Branch</span>
                                                                    </div>
                                                                    <p className="text-sm font-semibold">
                                                                        {visit.branch?.name || '-'}
                                                                    </p>
                                                                    {visit.branch?.ref && (
                                                                        <p className="text-xs text-muted-foreground">{visit.branch.ref}</p>
                                                                    )}
                                                                </div>

                                                                {visit.client && (
                                                                    <div className="p-4 rounded-lg border bg-background">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <User className="w-4 h-4 text-blue-600" />
                                                                            <span className="text-sm font-medium">Client</span>
                                                                        </div>
                                                                        <p className="text-sm font-semibold">{visit.client.name}</p>
                                                                        {visit.client.email && (
                                                                            <p className="text-xs text-muted-foreground">{visit.client.email}</p>
                                                                        )}
                                                                        {visit.client.phone && (
                                                                            <p className="text-xs text-muted-foreground">{visit.client.phone}</p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {visit.organisation && (
                                                                    <div className="p-4 rounded-lg border bg-background">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Building className="w-4 h-4 text-blue-600" />
                                                                            <span className="text-sm font-medium">Organisation</span>
                                                                        </div>
                                                                        <p className="text-sm font-semibold">{visit.organisation.name}</p>
                                                                        {visit.organisation.email && (
                                                                            <p className="text-xs text-muted-foreground">{visit.organisation.email}</p>
                                                                        )}
                                                                        {visit.organisation.phone && (
                                                                            <p className="text-xs text-muted-foreground">{visit.organisation.phone}</p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Notes and Resolution */}
                                                            {(visit.notes || visit.resolution) && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {visit.notes && (
                                                                        <div className="p-4 rounded-lg border bg-background">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                                                <span className="text-sm font-medium">Notes</span>
                                                                            </div>
                                                                            <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
                                                                        </div>
                                                                    )}
                                                                    {visit.resolution && (
                                                                        <div className="p-4 rounded-lg border bg-background">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                                                <span className="text-sm font-medium">Resolution</span>
                                                                            </div>
                                                                            <p className="text-sm whitespace-pre-wrap">{visit.resolution}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Visited Places */}
                                                            {visitedPlaces.length > 0 && (
                                                                <div className="p-4 rounded-lg border bg-background">
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <MapIcon className="w-4 h-4 text-orange-600" />
                                                                        <span className="text-sm font-medium">Visited Places</span>
                                                                        <Badge variant="secondary">{visitedPlaces.length}</Badge>
                                                                    </div>
                                                                    <div className="space-y-3">
                                                                        {visitedPlaces.map((place, placeIndex) => (
                                                                            <div key={placeIndex} className="p-3 rounded-md bg-muted">
                                                                                <p className="text-sm font-medium">
                                                                                    {typeof place.address === 'string'
                                                                                        ? place.address
                                                                                        : place.address?.formattedAddress || place.address?.street || '-'}
                                                                                </p>
                                                                                {place.notes && (
                                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                                        {place.notes}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Timestamps */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {visit.createdAt && (
                                                                    <div className="p-4 rounded-lg border bg-background">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                                            <span className="text-sm font-medium">Created At</span>
                                                                        </div>
                                                                        <p className="text-sm">{format(new Date(visit.createdAt), 'PPp')}</p>
                                                                    </div>
                                                                )}
                                                                {visit.updatedAt && (
                                                                    <div className="p-4 rounded-lg border bg-background">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                                            <span className="text-sm font-medium">Updated At</span>
                                                                        </div>
                                                                        <p className="text-sm">{format(new Date(visit.updatedAt), 'PPp')}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const SalesDashboard: React.FC<SalesDashboardProps> = ({ className = '' }) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { data, isLoading, error } = useCheckInsData(selectedDate);
    const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRepData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [branchFilter, setBranchFilter] = useState<string>('all');

    const handleRowClick = (salesRep: SalesRepData) => {
        setSelectedSalesRep(salesRep);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSalesRep(null);
    };

    // Group check-ins by sales rep and get latest locations
    const salesRepsData = useMemo(() => {
        if (!data?.checkIns) return [];

        const repMap = new Map<number, SalesRepData>();

        data.checkIns.forEach((checkIn) => {
            const repId = checkIn.owner.uid;

            if (!repMap.has(repId)) {
                repMap.set(repId, {
                    uid: checkIn.owner.uid,
                    name: checkIn.owner.name,
                    surname: checkIn.owner.surname,
                    email: checkIn.owner.email,
                    photoURL: checkIn.owner.photoURL,
                    avatar: checkIn.owner.avatar,
                    totalVisits: 0,
                    visits: [],
                    branch: checkIn.branch,
                });
            }

            const repData = repMap.get(repId)!;
            repData.visits.push(checkIn);
            repData.totalVisits++;

            // Update latest check-in/check-out if this is more recent
            const checkInTime = new Date(checkIn.checkInTime).getTime();
            const currentLatestTime = repData.latestCheckInTime
                ? new Date(repData.latestCheckInTime).getTime()
                : 0;

            if (checkInTime > currentLatestTime) {
                repData.latestCheckInTime = checkIn.checkInTime;
                repData.latestCheckInLocation = getLocationName(checkIn, false);

                if (checkIn.checkOutTime) {
                    repData.latestCheckOutTime = checkIn.checkOutTime;
                    repData.latestCheckOutLocation = getLocationName(checkIn, true);
                }
            }
        });

        // Sort visits for each rep (most recent first)
        repMap.forEach((repData) => {
            repData.visits.sort((a, b) => {
                return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
            });
        });

        return Array.from(repMap.values()).sort((a, b) => {
            // Sort by latest check-in time (most recent first)
            const timeA = a.latestCheckInTime ? new Date(a.latestCheckInTime).getTime() : 0;
            const timeB = b.latestCheckInTime ? new Date(b.latestCheckInTime).getTime() : 0;
            return timeB - timeA;
        });
    }, [data]);

    // Get unique branches from sales reps
    const branches = useMemo(() => {
        const branchSet = new Set<string>();
        salesRepsData.forEach((rep) => {
            if (rep.branch?.name) {
                branchSet.add(rep.branch.name);
            }
        });
        return Array.from(branchSet).sort();
    }, [salesRepsData]);

    // Filter sales reps
    const filteredSalesReps = useMemo(() => {
        return salesRepsData.filter((rep) => {
            // Search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const fullName = `${rep.name} ${rep.surname}`.toLowerCase();
                const email = rep.email?.toLowerCase() || '';
                if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
                    return false;
                }
            }

            // Branch filter
            if (branchFilter !== 'all' && rep.branch?.name !== branchFilter) {
                return false;
            }

            return true;
        });
    }, [salesRepsData, searchQuery, branchFilter]);

    if (isLoading) {
        return (
            <div className={cn('space-y-6', className)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Reps Trip Summary</CardTitle>
                        <CardDescription>Track sales rep trips, locations, and visit details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Skeleton className="w-full h-12" />
                            <Skeleton className="w-full h-12" />
                            <Skeleton className="w-full h-12" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !data?.checkIns) {
        return (
            <div className={cn('space-y-6', className)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Reps Trip Summary</CardTitle>
                        <CardDescription>Track sales rep trips, locations, and visit details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="py-8 text-center text-muted-foreground">
                            Failed to load sales data. Please try again.
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className={cn('space-y-6', className)}>
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Navigation className="w-5 h-5" />
                                Sales Reps Trip Summary
                            </CardTitle>
                            <CardDescription>
                                Track sales rep trips, locations, and visit details
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportToExcel(filteredSalesReps)}
                                className="flex items-center gap-2"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span className="hidden sm:inline">Export Excel</span>
                                <span className="sm:hidden">Excel</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportToPDF(filteredSalesReps)}
                                className="flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">Export PDF</span>
                                <span className="sm:hidden">PDF</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters and Search */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Date Filter */}
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full sm:w-[240px] justify-start text-left font-normal",
                                            !selectedDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => {
                                            setSelectedDate(date);
                                            setIsCalendarOpen(false);
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {/* Branch Filter */}
                            <Select value={branchFilter} onValueChange={setBranchFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch} value={branch}>
                                            {branch}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        {(searchQuery || selectedDate || branchFilter !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedDate(undefined);
                                    setBranchFilter('all');
                                }}
                                className="self-start flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {filteredSalesReps.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground">
                            No sales reps found
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Sales Rep</TableHead>
                                        <TableHead className="font-bold">Branch</TableHead>
                                        <TableHead className="font-bold">Latest Check In Location</TableHead>
                                        <TableHead className="font-bold">Latest Check Out Location</TableHead>
                                        <TableHead className="font-bold">Total Visits</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSalesReps.map((rep, index) => (
                                        <TableRow
                                            key={rep.uid}
                                            className={cn(
                                                "cursor-pointer hover:bg-muted/50",
                                                index % 2 === 0 ? "bg-white" : "bg-gray-50 dark:bg-gray-900/50"
                                            )}
                                            onClick={() => handleRowClick(rep)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage
                                                            src={rep.photoURL || rep.avatar}
                                                            alt={`${rep.name} ${rep.surname}`}
                                                        />
                                                        <AvatarFallback>
                                                            {rep.name?.charAt(0)}{rep.surname?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {rep.name} {rep.surname}
                                                        </div>
                                                        {rep.email && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {rep.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {rep.branch?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-green-600 flex-shrink-0" />
                                                    <span className="max-w-[200px] truncate">
                                                        {rep.latestCheckInLocation || '-'}
                                                    </span>
                                                </div>
                                                {rep.latestCheckInTime && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(rep.latestCheckInTime), 'PPp')}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-red-600 flex-shrink-0" />
                                                    <span className="max-w-[200px] truncate">
                                                        {rep.latestCheckOutLocation || '-'}
                                                    </span>
                                                </div>
                                                {rep.latestCheckOutTime && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(rep.latestCheckOutTime), 'PPp')}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {rep.totalVisits}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Visits Modal */}
            <UserVisitsModal
                salesRep={selectedSalesRep}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};
