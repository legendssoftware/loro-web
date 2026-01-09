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
    Calendar as CalendarIcon,
    Clock,
    MapIcon,
    Search,
    FileText,
    FileSpreadsheet,
    X,
    ChevronDown,
    ChevronUp,
    Route,
    DollarSign,
    Users,
    Target,
    Zap,
    TrendingUp,
    Activity,
    Image as ImageIcon,
    AlertCircle,
    CheckCircle2,
    Timer,
    Gauge,
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

// Helper function to validate image URL
const isValidImageUrl = (url?: string): boolean => {
    if (!url || url.trim() === '') return false;
    // Check if it's a valid URL or data URL
    try {
        // Allow data URLs (base64 images)
        if (url.startsWith('data:')) return true;
        // Allow http/https URLs
        if (url.startsWith('http://') || url.startsWith('https://')) return true;
        // Allow relative URLs that start with /
        if (url.startsWith('/')) return true;
        return false;
    } catch {
        return false;
    }
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

    // Check if location is empty, null, undefined, or contains "web based" text
    if (!location || location.trim() === '' || location.toLowerCase().includes('web based')) {
        return isCheckOut ? 'No location recorded' : 'No location recorded';
    }

    if (!location.includes(',')) {
        // If it's not coordinates format, return as-is
        return location;
    }

    return isCheckOut ? 'No location recorded' : 'No location recorded';
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

// Helper function to format minutes to hours and minutes display
const formatMinutesToHours = (minutes: number): string => {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
};

// Export functions
const exportToExcel = (data: SalesRepData[]) => {
    const headers = [
        'Sales Rep',
        'Email',
        'Branch',
        'Locations',
        'Total Visits',
    ];

    const rows = data.map((rep) => {
        const checkInLoc = rep.latestCheckInLocation;
        const checkOutLoc = rep.latestCheckOutLocation;

        const normalizedCheckIn = !checkInLoc || checkInLoc === '-' || checkInLoc.toLowerCase().includes('web based')
            ? 'No location recorded'
            : checkInLoc;

        const normalizedCheckOut = !checkOutLoc || checkOutLoc === '-' || checkOutLoc.toLowerCase().includes('web based')
            ? 'No location recorded'
            : checkOutLoc;

        return [
            `${rep.name} ${rep.surname}`,
            rep.email || '-',
            rep.branch?.name || '-',
            `Check In: ${normalizedCheckIn} | Check Out: ${normalizedCheckOut}`,
            rep.totalVisits.toString(),
        ];
    });

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
                        <th>Locations</th>
                        <th>Total Visits</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((rep) => {
                        const checkInLoc = rep.latestCheckInLocation;
                        const checkOutLoc = rep.latestCheckOutLocation;

                        const normalizedCheckIn = !checkInLoc || checkInLoc === '-' || checkInLoc.toLowerCase().includes('web based')
                            ? 'No location recorded'
                            : checkInLoc;

                        const normalizedCheckOut = !checkOutLoc || checkOutLoc === '-' || checkOutLoc.toLowerCase().includes('web based')
                            ? 'No location recorded'
                            : checkOutLoc;

                        return `
                        <tr>
                            <td>${rep.name} ${rep.surname}</td>
                            <td>${rep.email || '-'}</td>
                            <td>${rep.branch?.name || '-'}</td>
                            <td>Check In: ${normalizedCheckIn} | Check Out: ${normalizedCheckOut}</td>
                            <td>${rep.totalVisits}</td>
                        </tr>
                    `;
                    }).join('')}
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
    const [activeTab, setActiveTab] = useState<string>('visits');
    const [selectedImage, setSelectedImage] = useState<{ url: string; type: 'check-in' | 'check-out' } | null>(null);


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
            'Locations',
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
            `Check In: ${getLocationName(visit, false)} | Check Out: ${getLocationName(visit, true)}`,
            visit.client?.name || 'Potential client',
            visit.duration || '-',
            format(new Date(visit.checkInTime), 'PPp'),
            visit.checkOutTime ? format(new Date(visit.checkOutTime), 'PPp') : '-',
            visit.notes || 'No notes saved',
            visit.resolution || 'no resolution reached',
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
                                <td>${visit.client?.name || 'Potential client'}</td>
                                <td>${visit.duration || '-'}</td>
                                <td>${visit.notes || 'No notes saved'}</td>
                                <td>${visit.resolution || 'no resolution reached'}</td>
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

    // Fetch trip summary data for the selected user
    const { data: tripSummaryData, isLoading: isLoadingTripSummary } = useQuery({
        queryKey: ['tripSummary', salesRep?.uid],
        queryFn: async () => {
            if (!salesRep?.uid) return null;
            const response = await axiosInstance.get(`/reports/user/${salesRep.uid}/daily-reports?reportType=USER_DAILY&limit=1000`);

            // Log the raw response data before mapping
            console.log('[Trip Summary] Raw API response:', response.data);
            console.log('[Trip Summary] Reports count:', response.data?.reports?.length || 0);

            if (response.data?.reports) {
                response.data.reports.forEach((report: any, index: number) => {
                    console.log(`[Trip Summary] Report ${index + 1}:`, {
                        uid: report.uid,
                        reportType: report.reportType,
                        generatedAt: report.generatedAt,
                        hasGpsData: !!report.gpsData,
                        gpsDataKeys: report.gpsData ? Object.keys(report.gpsData) : [],
                        hasReportData: !!report.reportData,
                        reportDataKeys: report.reportData ? Object.keys(report.reportData) : [],
                        gpsDataStructure: report.gpsData ? {
                            hasTripSummary: !!report.gpsData.tripSummary,
                            tripSummaryKeys: report.gpsData.tripSummary ? Object.keys(report.gpsData.tripSummary) : [],
                            tripSummary: report.gpsData.tripSummary,
                        } : null,
                    });
                });
            }

            return response.data;
        },
        enabled: activeTab === 'trip' && !!salesRep?.uid,
        staleTime: 2 * 60 * 1000,
    });

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    // Define tabs
    const tabs = [
        { id: 'visits', label: 'Visits Summary' },
        { id: 'trip', label: 'Trip Summary' },
    ];

    // Early return if no salesRep - prevents hook from running with invalid userId
    if (!salesRep || !salesRep.uid) return null;

    return (
        <React.Fragment>
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                setExpandedVisitId(null);
                setActiveTab('visits'); // Reset to visits tab on close
            }
            onClose();
        }}>
            <DialogContent className="w-[80vw] h-[80vh] max-w-none flex flex-col">
                <DialogHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="flex gap-2 items-center">
                                <User className="w-5 h-5" />
                                Visits - {salesRep.name} {salesRep.surname}
                            </DialogTitle>
                            <DialogDescription>
                                {activeTab === 'visits'
                                    ? `All visits for this sales rep (${salesRep.totalVisits} total)`
                                    : 'Trip summaries for this user'
                                }
                            </DialogDescription>
                        </div>
                        <div className="flex gap-2">
                            {activeTab === 'visits' && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => exportUserVisitsToExcel(filteredVisits, `${salesRep.name} ${salesRep.surname}`)}
                                        className="flex gap-2 items-center"
                                    >
                                        <FileSpreadsheet className="w-4 h-4" />
                                        Export Excel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => exportUserVisitsToPDF(filteredVisits, `${salesRep.name} ${salesRep.surname}`)}
                                        className="flex gap-2 items-center"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Export PDF
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <div className="flex overflow-hidden flex-col flex-1 mt-4 min-h-0">
                    <div className="flex overflow-x-auto flex-shrink-0 gap-6 items-center mb-6 border-b border-border/20">
                        {tabs.map((tab) => (
                            <button
                                key={tab?.id}
                                onClick={() => handleTabChange(tab?.id)}
                                className={`relative pb-3 px-1 text-xs font-thin uppercase font-body transition-colors ${
                                    activeTab === tab.id
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab?.label}
                                {activeTab === tab?.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-600 dark:bg-purple-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'visits' && (
                        <div className="flex overflow-hidden flex-col flex-1 min-h-0">
                        {/* Filters */}
                        <div className="flex flex-col flex-shrink-0 gap-4 pb-4 mb-4 border-b">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
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
                                    <CalendarIcon className="mr-2 w-4 h-4" />
                                    {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-auto" align="end">
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
                            className="flex gap-2 items-center self-start"
                        >
                            <X className="w-4 h-4" />
                            Clear Filters
                        </Button>
                    )}
                        </div>

                        {/* Visits Table */}
                        <div className="overflow-y-auto flex-1 h-full min-h-0 rounded-md border">
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
                                    <TableHead className="font-bold">Locations</TableHead>
                                    <TableHead className="font-bold">Client</TableHead>
                                    <TableHead className="font-bold">Duration</TableHead>
                                    <TableHead className="font-bold">Images</TableHead>
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
                                                    <div className="flex gap-2 items-center">
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                        {format(new Date(visit.checkInTime), 'PPp')}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        visit.branch?.name ? "" : "text-[0.8em] text-muted-foreground"
                                                    )}>
                                                        {visit.branch?.name || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {checkInLoc === 'No location recorded' && checkOutLoc === 'No location recorded' ? (
                                                        <div className="flex gap-2 items-center">
                                                            <MapPin className="flex-shrink-0 w-3 h-3 text-muted-foreground" />
                                                            <span className="text-[0.8em] text-muted-foreground">
                                                                No locations recorded
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex gap-2 items-center">
                                                                <MapPin className="flex-shrink-0 w-3 h-3 text-green-600" />
                                                                <span className={cn(
                                                                    "max-w-[200px] truncate text-xs",
                                                                    checkInLoc === 'No location recorded' && "text-[0.8em] text-muted-foreground"
                                                                )}>
                                                                    {checkInLoc}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2 items-center">
                                                                <MapPin className="flex-shrink-0 w-3 h-3 text-red-600" />
                                                                <span className={cn(
                                                                    "max-w-[200px] truncate text-xs",
                                                                    checkOutLoc === 'No location recorded' && "text-[0.8em] text-muted-foreground"
                                                                )}>
                                                                    {checkOutLoc}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        visit.client?.name ? "" : "text-[0.8em] text-muted-foreground"
                                                    )}>
                                                        {visit.client?.name || 'Potential client'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        visit.duration ? "" : "text-[0.8em] text-muted-foreground"
                                                    )}>
                                                        {visit.duration || '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {(() => {
                                                        const hasCheckInPhoto = isValidImageUrl(visit.checkInPhoto);
                                                        const hasCheckOutPhoto = isValidImageUrl(visit.checkOutPhoto);
                                                        const imageCount = (hasCheckInPhoto ? 1 : 0) + (hasCheckOutPhoto ? 1 : 0);
                                                        if (imageCount === 0) {
                                                            return (
                                                                <span className="text-[0.8em] text-muted-foreground">0 images</span>
                                                            );
                                                        }
                                                        return (
                                                            <div className="flex gap-1 items-center">
                                                                {hasCheckInPhoto && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedImage({ url: visit.checkInPhoto!, type: 'check-in' });
                                                                        }}
                                                                        className="relative transition-opacity cursor-pointer group hover:opacity-80"
                                                                        title="Click to view check-in photo"
                                                                    >
                                                                        <ImageIcon className="w-4 h-4 text-green-600" />
                                                                        <span className="sr-only">Check-in photo</span>
                                                                    </button>
                                                                )}
                                                                {hasCheckOutPhoto && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedImage({ url: visit.checkOutPhoto!, type: 'check-out' });
                                                                        }}
                                                                        className="relative transition-opacity cursor-pointer group hover:opacity-80"
                                                                        title="Click to view check-out photo"
                                                                    >
                                                                        <ImageIcon className="w-4 h-4 text-red-600" />
                                                                        <span className="sr-only">Check-out photo</span>
                                                                    </button>
                                                                )}
                                                                <span className="ml-1 text-xs text-muted-foreground">
                                                                    {imageCount === 1 ? '1 image' : '2 images'}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        "max-w-[200px] truncate block",
                                                        !visit.notes && "text-[0.8em] text-muted-foreground"
                                                    )}>
                                                        {visit.notes || 'No notes saved'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        "max-w-[200px] truncate block",
                                                        !visit.resolution && "text-[0.8em] text-muted-foreground"
                                                    )}>
                                                        {visit.resolution || 'no resolution reached'}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="p-6 bg-muted/30">
                                                        <div className="space-y-6">
                                                            {/* Visit ID */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-4 rounded-lg border bg-background">
                                                                    <div className="flex gap-2 items-center mb-2">
                                                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                                                        <span className="text-sm font-medium">Visit ID</span>
                                                                    </div>
                                                                    <p className="text-lg font-semibold">#{visit.uid}</p>
                                                                </div>

                                                                {/* Duration */}
                                                                {visit.duration && (
                                                                    <div className="p-4 rounded-lg border bg-background">
                                                                        <div className="flex gap-2 items-center mb-2">
                                                                            <Clock className="w-4 h-4 text-purple-600" />
                                                                            <span className="text-sm font-medium">Duration</span>
                                                                        </div>
                                                                        <p className="text-lg font-semibold">{visit.duration}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Check In Details */}
                                                            <div className="p-4 rounded-lg border bg-background">
                                                                <div className="flex gap-2 items-center mb-4">
                                                                    <MapPin className="w-4 h-4 text-green-600" />
                                                                    <span className="text-sm font-medium">Check In Details</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="mb-1 text-xs text-muted-foreground">Time</p>
                                                                        <p className="text-sm font-semibold">{format(new Date(visit.checkInTime), 'PPp')}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="mb-1 text-xs text-muted-foreground">Location</p>
                                                                        <p className={cn(
                                                                            "text-sm",
                                                                            checkInLoc === 'No location recorded' && "text-[0.8em] text-muted-foreground"
                                                                        )}>{checkInLoc}</p>
                                                                    </div>
                                                                </div>
                                                                {isValidImageUrl(visit.checkInPhoto) && (
                                                                    <div className="mt-4">
                                                                        <p className="mb-2 text-xs text-muted-foreground">Check-In Photo</p>
                                                                        <div className="overflow-hidden relative rounded-md border">
                                                                            <img
                                                                                src={visit.checkInPhoto}
                                                                                alt="Check-in photo"
                                                                                className="object-contain w-full max-h-64"
                                                                                onError={(e) => {
                                                                                    const img = e.target as HTMLImageElement;
                                                                                    img.style.display = 'none';
                                                                                    const errorDiv = document.createElement('div');
                                                                                    errorDiv.className = 'flex justify-center items-center p-8 text-sm text-muted-foreground';
                                                                                    errorDiv.textContent = 'Failed to load check-in image';
                                                                                    img.parentElement?.appendChild(errorDiv);
                                                                                }}
                                                                                onLoad={(e) => {
                                                                                    // Ensure image is visible on successful load
                                                                                    (e.target as HTMLImageElement).style.display = 'block';
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {visit.fullAddress && (
                                                                    <div className="p-3 mt-4 rounded-md bg-muted">
                                                                        <p className="mb-1 text-xs text-muted-foreground">Full Address</p>
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
                                                                    <div className="flex gap-2 items-center mb-4">
                                                                        <MapPin className="w-4 h-4 text-red-600" />
                                                                        <span className="text-sm font-medium">Check Out Details</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <p className="mb-1 text-xs text-muted-foreground">Time</p>
                                                                            <p className="text-sm font-semibold">{format(new Date(visit.checkOutTime), 'PPp')}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="mb-1 text-xs text-muted-foreground">Location</p>
                                                                            <p className={cn(
                                                                                "text-sm",
                                                                                checkOutLoc === 'No location recorded' && "text-[0.8em] text-muted-foreground"
                                                                            )}>{checkOutLoc}</p>
                                                                        </div>
                                                                    </div>
                                                                    {isValidImageUrl(visit.checkOutPhoto) && (
                                                                        <div className="mt-4">
                                                                            <p className="mb-2 text-xs text-muted-foreground">Check-Out Photo</p>
                                                                            <div className="overflow-hidden relative rounded-md border">
                                                                                <img
                                                                                    src={visit.checkOutPhoto}
                                                                                    alt="Check-out photo"
                                                                                    className="object-contain w-full max-h-64"
                                                                                    onError={(e) => {
                                                                                        const img = e.target as HTMLImageElement;
                                                                                        img.style.display = 'none';
                                                                                        const errorDiv = document.createElement('div');
                                                                                        errorDiv.className = 'flex justify-center items-center p-8 text-sm text-muted-foreground';
                                                                                        errorDiv.textContent = 'Failed to load check-out image';
                                                                                        img.parentElement?.appendChild(errorDiv);
                                                                                    }}
                                                                                    onLoad={(e) => {
                                                                                        // Ensure image is visible on successful load
                                                                                        (e.target as HTMLImageElement).style.display = 'block';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Sales Rep, Branch, Client, Organisation */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-4 rounded-lg border bg-background">
                                                                    <div className="flex gap-2 items-center mb-2">
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
                                                                    <div className="flex gap-2 items-center mb-2">
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
                                                                        <div className="flex gap-2 items-center mb-2">
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
                                                                        <div className="flex gap-2 items-center mb-2">
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
                                                                            <div className="flex gap-2 items-center mb-2">
                                                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                                                <span className="text-sm font-medium">Notes</span>
                                                                            </div>
                                                                            <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
                                                                        </div>
                                                                    )}
                                                                    {visit.resolution && (
                                                                        <div className="p-4 rounded-lg border bg-background">
                                                                            <div className="flex gap-2 items-center mb-2">
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
                                                                    <div className="flex gap-2 items-center mb-4">
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
                                                                                    <p className="mt-1 text-xs text-muted-foreground">
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
                                                                        <div className="flex gap-2 items-center mb-2">
                                                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                                            <span className="text-sm font-medium">Created At</span>
                                                                        </div>
                                                                        <p className="text-sm">{format(new Date(visit.createdAt), 'PPp')}</p>
                                                                    </div>
                                                                )}
                                                                {visit.updatedAt && (
                                                                    <div className="p-4 rounded-lg border bg-background">
                                                                        <div className="flex gap-2 items-center mb-2">
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
                    </div>
                    )}

                    {activeTab === 'trip' && (
                        <div className="flex overflow-hidden flex-col flex-1 mt-0">
                            {isLoadingTripSummary ? (
                                <div className="flex flex-1 justify-center items-center">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 w-8 h-8 rounded-full border-b-2 border-purple-600 animate-spin"></div>
                                        <p className="text-sm text-muted-foreground">Loading trip summaries...</p>
                                    </div>
                                </div>
                            ) : tripSummaryData?.reports && tripSummaryData.reports.length > 0 ? (
                                <div className="overflow-y-auto flex-1 space-y-4">
                                    {tripSummaryData.reports.map((report: any, idx: number) => {
                                        // Extract data from reportData.details structure
                                        const reportData = report.reportData;
                                        const details = reportData?.details;
                                        const locationData = details?.location;
                                        const trackingData = locationData?.trackingData;
                                        const tripSummary = trackingData?.tripSummary;
                                        const stops = trackingData?.stops || locationData?.stops || [];
                                        const travelInsights = trackingData?.travelInsights || locationData?.travelInsights;
                                        const distanceInsights = trackingData?.distanceInsights;
                                        const locationProductivity = trackingData?.locationProductivity || locationData?.locationProductivity;

                                        // Get summary data for quick metrics
                                        const summary = reportData?.summary;
                                        const quotations = details?.quotations;
                                        const leads = details?.leads;
                                        const tasks = details?.tasks;
                                        const attendance = details?.attendance;
                                        const rewards = details?.rewards;

                                        // Distance values
                                        const totalDistanceKm = tripSummary?.totalDistanceKm || locationData?.totalDistanceKm || 0;
                                        const totalDistance = trackingData?.totalDistance || locationData?.totalDistance || locationData?.distanceTraveled || '0 km';

                                        // Check if we have any trip data
                                        const hasTripData = totalDistanceKm > 0 || stops.length > 0 || (locationData?.locations && locationData.locations.length > 0);

                                        return (
                                            <Card key={report.uid || idx} className="overflow-hidden">
                                                {/* Collapsed Header - Quick Metrics at a Glance */}
                                                <div
                                                    className="p-4 transition-colors cursor-pointer hover:bg-muted/30"
                                                    onClick={() => setExpandedVisitId(expandedVisitId === report.uid ? null : report.uid)}
                                                >
                                                    {/* Date and Status Row */}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex gap-2 items-center">
                                                            <Route className="w-5 h-5 text-purple-600" />
                                                            <span className="text-sm font-semibold">
                                                                {format(new Date(report.generatedAt), 'PPp')}
                                                            </span>
                                                            {distanceInsights && (
                                                                <span className="text-lg">{distanceInsights.icon}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            {hasTripData ? (
                                                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                                                                    <CheckCircle2 className="mr-1 w-3 h-3" />
                                                                    GPS Data
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                                                                    <AlertCircle className="mr-1 w-3 h-3" />
                                                                    Limited Data
                                                                </Badge>
                                                            )}
                                                            {expandedVisitId === report.uid ? (
                                                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Quick Metrics Row - Always Visible */}
                                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                                                        {/* Distance */}
                                                        <div className="flex gap-2 items-center p-2 rounded-lg">
                                                            <Navigation className="w-4 h-4 text-blue-600" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Distance</p>
                                                                <p className="text-sm font-semibold">
                                                                    {totalDistanceKm > 0
                                                                        ? totalDistanceKm < 1
                                                                            ? `${Math.round(totalDistanceKm * 1000)}m`
                                                                            : `${totalDistanceKm.toFixed(1)} km`
                                                                        : totalDistance || '0 km'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Stops */}
                                                        <div className="flex gap-2 items-center p-2 rounded-lg">
                                                            <MapPin className="w-4 h-4 text-purple-600" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Stops</p>
                                                                <p className="text-sm font-semibold">{tripSummary?.numberOfStops ?? stops.length ?? 0}</p>
                                                            </div>
                                                        </div>

                                                        {/* Revenue */}
                                                        <div className="flex gap-2 items-center p-2 rounded-lg">
                                                            <DollarSign className="w-4 h-4 text-green-600" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Revenue</p>
                                                                <p className="text-sm font-semibold">{quotations?.totalRevenueFormatted || summary?.totalRevenue || 'R 0'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Leads */}
                                                        <div className="flex gap-2 items-center p-2 rounded-lg">
                                                            <Target className="w-4 h-4 text-amber-600" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Leads</p>
                                                                <p className="text-sm font-semibold">{leads?.newLeadsCount ?? summary?.newLeads ?? 0}</p>
                                                            </div>
                                                        </div>

                                                        {/* Hours Worked */}
                                                        <div className="flex gap-2 items-center p-2 rounded-lg">
                                                            <Clock className="w-4 h-4 text-indigo-600" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">Hours</p>
                                                                <p className="text-sm font-semibold">{summary?.hoursWorked ?? 0}h</p>
                                                            </div>
                                                        </div>

                                                        {/* XP Earned */}
                                                        <div className="flex gap-2 items-center p-2 rounded-lg">
                                                            <Zap className="w-4 h-4 text-orange-600" />
                                                            <div>
                                                                <p className="text-xs text-muted-foreground">XP</p>
                                                                <p className="text-sm font-semibold">+{rewards?.dailyXPEarned ?? summary?.xpEarned ?? 0}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {expandedVisitId === report.uid && (
                                                    <div className="p-4 space-y-6 border-t bg-muted/10">
                                                        {/* Trip Details Section */}
                                                        {hasTripData && (
                                                            <div>
                                                                <h4 className="flex gap-2 items-center mb-3 text-sm font-semibold">
                                                                    <Route className="w-4 h-4 text-purple-600" />
                                                                    Trip Details
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                                    <div className="p-3 rounded-lg border bg-card">
                                                                        <div className="flex gap-2 items-center mb-1">
                                                                            <Timer className="w-4 h-4 text-green-600" />
                                                                            <span className="text-xs text-muted-foreground">Moving Time</span>
                                                                        </div>
                                                                        <p className="text-base font-semibold">{tripSummary?.movingTimeFormatted || formatMinutesToHours(tripSummary?.movingTimeMinutes || 0)}</p>
                                                                    </div>
                                                                    <div className="p-3 rounded-lg border bg-card">
                                                                        <div className="flex gap-2 items-center mb-1">
                                                                            <Clock className="w-4 h-4 text-amber-600" />
                                                                            <span className="text-xs text-muted-foreground">Stopped Time</span>
                                                                        </div>
                                                                        <p className="text-base font-semibold">{tripSummary?.stoppedTimeFormatted || formatMinutesToHours(tripSummary?.stoppedTimeMinutes || 0)}</p>
                                                                    </div>
                                                                    <div className="p-3 rounded-lg border bg-card">
                                                                        <div className="flex gap-2 items-center mb-1">
                                                                            <Gauge className="w-4 h-4 text-blue-600" />
                                                                            <span className="text-xs text-muted-foreground">Avg Speed</span>
                                                                        </div>
                                                                        <p className="text-base font-semibold">{tripSummary?.averageSpeed || `${(tripSummary?.averageSpeedKmh || 0).toFixed(1)} km/h`}</p>
                                                                    </div>
                                                                    <div className="p-3 rounded-lg border bg-card">
                                                                        <div className="flex gap-2 items-center mb-1">
                                                                            <TrendingUp className="w-4 h-4 text-red-600" />
                                                                            <span className="text-xs text-muted-foreground">Max Speed</span>
                                                                        </div>
                                                                        <p className="text-base font-semibold">{tripSummary?.maxSpeed || `${(tripSummary?.maxSpeedKmh || 0).toFixed(1)} km/h`}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Distance Insights */}
                                                        {distanceInsights && (
                                                            <div className="p-3 rounded-lg border" style={{ backgroundColor: `${distanceInsights.color}10` }}>
                                                                <p className="text-sm">{distanceInsights.message}</p>
                                                                {distanceInsights.recommendation && (
                                                                    <p className="mt-1 text-xs text-muted-foreground">{distanceInsights.recommendation}</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Stops List */}
                                                        {stops.length > 0 && (
                                                            <div>
                                                                <h4 className="flex gap-2 items-center mb-3 text-sm font-semibold">
                                                                    <MapPin className="w-4 h-4 text-purple-600" />
                                                                    Stops ({stops.length})
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {stops.slice(0, 5).map((stop: any, stopIdx: number) => (
                                                                        <div key={stopIdx} className="flex gap-3 items-start p-3 rounded-lg border bg-card">
                                                                            <div className="flex flex-shrink-0 justify-center items-center w-6 h-6 bg-purple-100 rounded-full dark:bg-purple-900">
                                                                                <span className="text-xs font-semibold text-purple-600">{stopIdx + 1}</span>
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium truncate">{stop.address || 'Unknown location'}</p>
                                                                                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                                                                                    <span>{stop.startTime} - {stop.endTime}</span>
                                                                                    <span className="font-medium">{stop.duration || stop.durationFormatted}</span>
                                                                                </div>
                                                                            </div>
                                                                            {locationProductivity?.keyLocations?.find((loc: any) => loc.address === stop.address)?.productivity && (
                                                                                <Badge variant="outline" className="text-xs">
                                                                                    {locationProductivity.keyLocations.find((loc: any) => loc.address === stop.address).productivity}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {stops.length > 5 && (
                                                                        <p className="text-xs text-center text-muted-foreground">
                                                                            + {stops.length - 5} more stops
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Activity Summary */}
                                                        <div>
                                                            <h4 className="flex gap-2 items-center mb-3 text-sm font-semibold">
                                                                <Activity className="w-4 h-4 text-blue-600" />
                                                                Activity Summary
                                                            </h4>
                                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                                <div className="p-3 rounded-lg border bg-card">
                                                                    <p className="text-xs text-muted-foreground">Tasks Completed</p>
                                                                    <p className="text-lg font-semibold">{tasks?.completedCount ?? summary?.tasksCompleted ?? 0}</p>
                                                                </div>
                                                                <div className="p-3 rounded-lg border bg-card">
                                                                    <p className="text-xs text-muted-foreground">Quotations</p>
                                                                    <p className="text-lg font-semibold">{quotations?.totalQuotations ?? summary?.totalQuotations ?? 0}</p>
                                                                </div>
                                                                <div className="p-3 rounded-lg border bg-card">
                                                                    <p className="text-xs text-muted-foreground">Client Interactions</p>
                                                                    <p className="text-lg font-semibold">{details?.clients?.totalInteractions ?? summary?.clientInteractions ?? 0}</p>
                                                                </div>
                                                                <div className="p-3 rounded-lg border bg-card">
                                                                    <p className="text-xs text-muted-foreground">Claims</p>
                                                                    <p className="text-lg font-semibold">{details?.claims?.count ?? summary?.totalClaims ?? 0}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Travel Insights */}
                                                        {travelInsights && (
                                                            <div>
                                                                <h4 className="flex gap-2 items-center mb-3 text-sm font-semibold">
                                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                                    Travel Insights
                                                                </h4>
                                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                                    {travelInsights.movementPatterns && (
                                                                        <div className="p-3 rounded-lg border bg-card">
                                                                            <p className="mb-1 text-xs text-muted-foreground">Movement Pattern</p>
                                                                            <p className="text-sm font-medium">{travelInsights.movementPatterns.pattern}</p>
                                                                            {travelInsights.movementPatterns.analysis && (
                                                                                <p className="mt-1 text-xs text-muted-foreground">{travelInsights.movementPatterns.analysis}</p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {travelInsights.travelEfficiency && (
                                                                        <div className="p-3 rounded-lg border bg-card">
                                                                            <p className="mb-1 text-xs text-muted-foreground">Travel Efficiency</p>
                                                                            <p className="text-sm font-medium">{travelInsights.travelEfficiency.score}</p>
                                                                        </div>
                                                                    )}
                                                                    {travelInsights.routeOptimization && (
                                                                        <div className="p-3 rounded-lg border bg-card">
                                                                            <p className="mb-1 text-xs text-muted-foreground">Route Optimization</p>
                                                                            <p className="text-sm">{travelInsights.routeOptimization.recommendation}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* No trip data message */}
                                                        {!hasTripData && (
                                                            <div className="p-4 text-center rounded-lg border bg-muted/30">
                                                                <MapPin className="mx-auto mb-2 w-8 h-8 text-muted-foreground" />
                                                                <p className="text-sm text-muted-foreground">No GPS tracking data available for this day</p>
                                                                <p className="mt-1 text-xs text-muted-foreground">Location tracking may have been disabled or no movement was recorded</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-1 justify-center items-center">
                                    <div className="text-center">
                                        <Route className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
                                        <p className="text-sm font-medium text-muted-foreground">No trip summaries available</p>
                                        <p className="mt-2 text-xs text-muted-foreground">This user has no trip reports yet</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                </DialogContent>
        </Dialog>

        {/* Image Viewer Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={(open) => {
            if (!open) {
                setSelectedImage(null);
            }
        }}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex gap-2 items-center">
                        <ImageIcon className="w-5 h-5" />
                        {selectedImage?.type === 'check-in' ? 'Check-In Photo' : 'Check-Out Photo'}
                    </DialogTitle>
                </DialogHeader>
                {selectedImage && isValidImageUrl(selectedImage.url) ? (
                    <div className="flex justify-center items-center w-full">
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.type === 'check-in' ? 'Check-in photo' : 'Check-out photo'}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                // Check if error message already exists
                                const existingError = img.parentElement?.querySelector('.image-error-message');
                                if (!existingError) {
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'p-8 text-center image-error-message text-muted-foreground';
                                    errorDiv.innerHTML = `
                                        <svg class="mx-auto mb-2 w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p class="text-sm font-medium">Failed to load image</p>
                                        <p class="mt-1 text-xs">The image URL may be invalid or the image may have been deleted.</p>
                                    `;
                                    img.parentElement?.appendChild(errorDiv);
                                }
                            }}
                            onLoad={(e) => {
                                // Remove any existing error messages on successful load
                                const img = e.target as HTMLImageElement;
                                const errorMsg = img.parentElement?.querySelector('.image-error-message');
                                if (errorMsg) {
                                    errorMsg.remove();
                                }
                                img.style.display = 'block';
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col justify-center items-center p-8 text-center">
                        <ImageIcon className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">Invalid Image URL</p>
                        <p className="mt-1 text-xs text-muted-foreground">The image URL is invalid or empty.</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        </React.Fragment>
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
    const [selectedImage, setSelectedImage] = useState<{ url: string; type: 'check-in' | 'check-out' } | null>(null);

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
                        <CardTitle>Sales Reps</CardTitle>
                        <CardDescription>Track sales rep locations and visit details</CardDescription>
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
                        <CardTitle>Sales Reps</CardTitle>
                        <CardDescription>Track sales rep locations and visit details</CardDescription>
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
                            <CardTitle className="flex gap-2 items-center">
                                <Navigation className="w-5 h-5" />
                                Sales Reps
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
                                className="flex gap-2 items-center"
                            >
                                <FileSpreadsheet className="w-4 h-4" />
                                <span className="hidden sm:inline">Export Excel</span>
                                <span className="sm:hidden">Excel</span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportToPDF(filteredSalesReps)}
                                className="flex gap-2 items-center"
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
                                    <Search className="absolute left-3 top-1/2 w-4 h-4 transform -translate-y-1/2 text-muted-foreground" />
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
                                        <CalendarIcon className="mr-2 w-4 h-4" />
                                        {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto" align="end">
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
                                className="flex gap-2 items-center self-start"
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
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-bold">Sales Rep</TableHead>
                                        <TableHead className="font-bold">Branch</TableHead>
                                        <TableHead className="font-bold">Locations</TableHead>
                                        <TableHead className="font-bold">Total Visits</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSalesReps.map((rep, index) => {
                                        // Get location names using the same helper function as modal
                                        const checkInLoc = rep.latestCheckInLocation
                                            ? (!rep.latestCheckInLocation || rep.latestCheckInLocation === '-' || rep.latestCheckInLocation.toLowerCase().includes('web based')
                                                ? 'No location recorded'
                                                : rep.latestCheckInLocation)
                                            : 'No location recorded';

                                        const checkOutLoc = rep.latestCheckOutLocation
                                            ? (!rep.latestCheckOutLocation || rep.latestCheckOutLocation === '-' || rep.latestCheckOutLocation.toLowerCase().includes('web based')
                                                ? 'No location recorded'
                                                : rep.latestCheckOutLocation)
                                            : 'No location recorded';

                                        return (
                                        <TableRow
                                            key={rep.uid}
                                            className={cn(
                                                "cursor-pointer hover:bg-muted/50",
                                                index % 2 === 0 ? "bg-white" : "bg-gray-50 dark:bg-gray-900/50"
                                            )}
                                            onClick={() => handleRowClick(rep)}
                                        >
                                            <TableCell>
                                                <div className="flex gap-3 items-center">
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
                                                <span className={cn(
                                                    rep.branch?.name ? "" : "text-[0.8em] text-muted-foreground"
                                                )}>
                                                    {rep.branch?.name || '-'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {checkInLoc === 'No location recorded' && checkOutLoc === 'No location recorded' ? (
                                                    <div className="flex gap-2 items-center">
                                                        <MapPin className="flex-shrink-0 w-3 h-3 text-muted-foreground" />
                                                        <span className="text-[0.8em] text-muted-foreground">
                                                            No locations recorded
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex gap-2 items-center">
                                                            <MapPin className="flex-shrink-0 w-3 h-3 text-green-600" />
                                                            <div>
                                                                <span className={cn(
                                                                    "max-w-[200px] truncate block text-xs",
                                                                    checkInLoc === 'No location recorded' && "text-[0.8em] text-muted-foreground"
                                                                )}>
                                                                    {checkInLoc}
                                                                </span>
                                                                {rep.latestCheckInTime && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {format(new Date(rep.latestCheckInTime), 'PPp')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 items-center">
                                                            <MapPin className="flex-shrink-0 w-3 h-3 text-red-600" />
                                                            <div>
                                                                <span className={cn(
                                                                    "max-w-[200px] truncate block text-xs",
                                                                    checkOutLoc === 'No location recorded' && "text-[0.8em] text-muted-foreground"
                                                                )}>
                                                                    {checkOutLoc}
                                                                </span>
                                                                {rep.latestCheckOutTime && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {format(new Date(rep.latestCheckOutTime), 'PPp')}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {rep.totalVisits}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                        );
                                    })}
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

            {/* Image Viewer Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex gap-2 items-center">
                            <ImageIcon className="w-5 h-5" />
                            {selectedImage?.type === 'check-in' ? 'Check-In Photo' : 'Check-Out Photo'}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedImage && (
                        <div className="flex justify-center items-center w-full">
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.type === 'check-in' ? 'Check-in photo' : 'Check-out photo'}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'p-4 text-center text-muted-foreground';
                                    errorDiv.textContent = 'Failed to load image';
                                    (e.target as HTMLImageElement).parentElement?.appendChild(errorDiv);
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
