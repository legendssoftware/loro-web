import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Clock,
    CalendarDays,
    MapPin,
    Coffee,
    Timer,
    CheckCircle,
    XCircle,
    Pause,
    Play,
    User,
    Building,
    FileText,
    Zap,
    Activity,
    BarChart3,
    Target,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AttendanceRecord } from '@/hooks/use-attendance-records';

interface AttendanceDetailsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: AttendanceRecord | null;
}

const formatTime = (timeString?: string): string => {
    if (!timeString) return 'N/A';
    try {
        return format(parseISO(timeString), 'HH:mm');
    } catch {
        return timeString;
    }
};

const formatDateTime = (timeString?: string): string => {
    if (!timeString) return 'N/A';
    try {
        return format(parseISO(timeString), 'PPP p');
    } catch {
        return timeString;
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'present':
        case 'completed':
            return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        case 'on_break':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
        case 'absent':
            return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        case 'late':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
};

const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'present':
            return <Play className="w-4 h-4" />;
        case 'completed':
            return <CheckCircle className="w-4 h-4" />;
        case 'on_break':
            return <Pause className="w-4 h-4" />;
        case 'absent':
            return <XCircle className="w-4 h-4" />;
        default:
            return <Activity className="w-4 h-4" />;
    }
};

export const AttendanceDetailsModal: React.FC<AttendanceDetailsModalProps> = ({
    open,
    onOpenChange,
    record,
}) => {
    if (!record) return null;

    const workDuration = record.duration || 'N/A';
    const breakDuration = record.totalBreakTime || 'N/A';
    const overtimeDuration = record.overtime || 'N/A';

    // Calculate some metrics
    const hasLocation = record.checkInLatitude && record.checkInLongitude;
    const hasBreaks = (record.breakCount && record.breakCount > 0) || 
                     (record.totalBreakTime && record.totalBreakTime !== 'N/A' && record.totalBreakTime !== '0m' && record.totalBreakTime !== '0h 0m');
    const isCompleted = record.checkOut && record.status.toLowerCase() === 'completed';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Shift Details - {format(parseISO(record.checkIn), 'PPP')}
                    </DialogTitle>
                    <DialogDescription>
                        Comprehensive view of attendance record #{record.uid}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    {getStatusIcon(record.status)}
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className={getStatusColor(record.status)}>
                                    {record.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Timer className="w-4 h-4" />
                                    Duration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-semibold">{workDuration}</div>
                                <p className="text-xs text-muted-foreground">Total work time</p>
                            </CardContent>
                        </Card>

                        {hasBreaks && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Coffee className="w-4 h-4" />
                                        Breaks
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg font-semibold">{record.breakCount || 0}</div>
                                    <p className="text-xs text-muted-foreground">{breakDuration} total</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Time Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Time Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Check In Details */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-green-600 flex items-center gap-2">
                                        <Play className="w-4 h-4" />
                                        Check In
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Time:</span>
                                            <span className="font-medium">{formatTime(record.checkIn)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Date:</span>
                                            <span className="font-medium">{format(parseISO(record.checkIn), 'PP')}</span>
                                        </div>
                                        {record.checkInNotes && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Notes:</span>
                                                <p className="text-sm mt-1 p-2 bg-muted rounded">{record.checkInNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Check Out Details */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-blue-600 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        Check Out
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Time:</span>
                                            <span className="font-medium">{formatTime(record.checkOut)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Status:</span>
                                            <span className="font-medium">{isCompleted ? 'Completed' : 'In Progress'}</span>
                                        </div>
                                        {record.checkOutNotes && (
                                            <div>
                                                <span className="text-sm text-muted-foreground">Notes:</span>
                                                <p className="text-sm mt-1 p-2 bg-muted rounded">{record.checkOutNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Location Information */}
                    {hasLocation && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Location Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Check In Location</h4>
                                        <div className="text-sm space-y-1">
                                            <div>Latitude: {record.checkInLatitude}</div>
                                            <div>Longitude: {record.checkInLongitude}</div>
                                        </div>
                                    </div>
                                    {record.checkOutLatitude && record.checkOutLongitude && (
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Check Out Location</h4>
                                            <div className="text-sm space-y-1">
                                                <div>Latitude: {record.checkOutLatitude}</div>
                                                <div>Longitude: {record.checkOutLongitude}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Break Details */}
                    {hasBreaks && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coffee className="w-5 h-5" />
                                    Break Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">{record.breakCount}</div>
                                        <div className="text-sm text-muted-foreground">Total Breaks</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{breakDuration}</div>
                                        <div className="text-sm text-muted-foreground">Total Break Time</div>
                                    </div>
                                    <div className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {record.breakDetails ? 
                                                Math.round((record.breakDetails.reduce((sum, detail) => sum + (detail.duration || 0), 0)) / (record.breakDetails.length || 1)) 
                                                : 'N/A'
                                            }m
                                        </div>
                                        <div className="text-sm text-muted-foreground">Avg Break Duration</div>
                                    </div>
                                </div>

                                {record.breakDetails && record.breakDetails.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-3">Break Timeline</h4>
                                        <div className="space-y-2">
                                            {record.breakDetails.map((breakDetail, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Coffee className="w-4 h-4 text-orange-500" />
                                                        <span className="font-medium">Break {index + 1}</span>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatTime(breakDetail.breakStart)} - {formatTime(breakDetail.breakEnd)} 
                                                        {breakDetail.duration && ` (${breakDetail.duration}m)`}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" />
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <Zap className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                    <div className="text-lg font-bold">{workDuration}</div>
                                    <div className="text-xs text-muted-foreground">Work Duration</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                    <div className="text-lg font-bold">{overtimeDuration !== 'N/A' ? overtimeDuration : '0h'}</div>
                                    <div className="text-xs text-muted-foreground">Overtime</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <Clock className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                                    <div className="text-lg font-bold">{isCompleted ? 'Complete' : 'Active'}</div>
                                    <div className="text-xs text-muted-foreground">Shift Status</div>
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <Activity className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                                    <div className="text-lg font-bold">{hasBreaks ? 'Yes' : 'No'}</div>
                                    <div className="text-xs text-muted-foreground">Breaks Taken</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User and Organization Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Employee Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Name:</span>
                                    <span className="font-medium">{record.owner.name} {record.owner.surname}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Email:</span>
                                    <span className="font-medium">{record.owner.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Role:</span>
                                    <span className="font-medium">{record.owner.role}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Access Level:</span>
                                    <Badge variant="outline">{record.owner.accessLevel}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {record.branch && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Branch Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Branch:</span>
                                        <span className="font-medium">{record.branch.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Reference:</span>
                                        <span className="font-medium">{record.branch.ref}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Address:</span>
                                        <span className="font-medium text-right">
                                            {typeof record.branch.address === 'object' && record.branch.address !== null
                                                ? (() => {
                                                    const addr = record.branch.address as any;
                                                    return `${addr.street || ''} ${addr.suburb || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}`.trim().replace(/,\s*,/g, ',').replace(/^,|,$/g, '');
                                                  })()
                                                : record.branch.address || 'N/A'
                                            }
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Record Metadata */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Record Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Record ID:</span>
                                    <div className="font-medium">#{record.uid}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Created:</span>
                                    <div className="font-medium">{formatDateTime(record.createdAt)}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                                    <div className="font-medium">{formatDateTime(record.updatedAt)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};
