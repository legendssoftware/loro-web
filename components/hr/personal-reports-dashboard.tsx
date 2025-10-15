import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Clock,
    Calendar as CalendarIcon,
    Coffee,
    Target,
    Timer,
    Award,
    BarChart3,
    Activity,
    AlertTriangle,
    Zap,
    Play,
    Square,
    CheckCircle,
    XCircle,
    Pause,
    MapPin,
    User,
    Building,
    FileText,
    ChevronRight,
    Eye,
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';
import toast from 'react-hot-toast';
import { useUserAttendance, AttendanceRecord } from '@/hooks/use-attendance-records';
import { AttendanceDetailsModal } from '@/components/attendance/attendance-details-modal';

interface PersonalReportsDashboardProps {
    className?: string;
}

interface UserAttendanceMetrics {
    message: string;
    metrics: {
        firstAttendance: {
            date: string | null;
            checkInTime: string | null;
            daysAgo: number | null;
        };
        lastAttendance: {
            date: string | null;
            checkInTime: string | null;
            checkOutTime: string | null;
            daysAgo: number | null;
        };
        totalHours: {
            allTime: number;
            thisMonth: number;
            thisWeek: number;
            today: number;
        };
        totalShifts: {
            allTime: number;
            thisMonth: number;
            thisWeek: number;
            today: number;
        };
        averageHoursPerDay: number;
        attendanceStreak: number;
        breakAnalytics: {
            totalBreakTime: {
                allTime: number;
                thisMonth: number;
                thisWeek: number;
                today: number;
            };
            averageBreakDuration: number;
            breakFrequency: number;
            longestBreak: number;
            shortestBreak: number;
        };
        timingPatterns: {
            averageCheckInTime: string;
            averageCheckOutTime: string;
            punctualityScore: number;
            overtimeFrequency: number;
        };
        productivityInsights: {
            workEfficiencyScore: number;
            shiftCompletionRate: number;
            lateArrivalsCount: number;
            earlyDeparturesCount: number;
        };
    };
}

interface DailyStats {
    message: string;
    dailyWorkTime: number; // in milliseconds
    dailyBreakTime: number; // in milliseconds
    detailedStatistics?: {
        totalActiveTime: number;
        effectiveWorkTime: number;
        overtimeMinutes: number;
        productiveHours: number;
        checkInTime: string;
        checkOutTime: string;
    };
}

interface UserAttendanceStatus {
    message: string;
    startTime: string;
    endTime: string;
    breakStartTime?: string;
    breakEndTime?: string;
    nextAction: string;
    isLatestCheckIn: boolean;
    checkedIn: boolean;
    user: {
        uid: number;
        name: string;
        surname: string;
        email: string;
        accessLevel: string;
    };
    attendance: {
        uid: number;
        status: string;
        checkIn: string;
        checkOut?: string;
        duration?: string;
        totalBreakTime?: string;
        breakCount?: number;
    };
}

// Utility function to format date
const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

// Utility function to convert milliseconds to hours
const msToHours = (ms: number): number => {
    return ms / (1000 * 60 * 60);
};

// Utility function to convert minutes to hours and minutes display
const minutesToHoursDisplay = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

// Custom hook for user attendance metrics
const useUserAttendanceMetrics = () => {
    const { accessToken, profileData } = useAuthStore();
    const userId = profileData?.uid;

    return useQuery<UserAttendanceMetrics>({
        queryKey: ['userAttendanceMetrics', userId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/metrics/${userId}`);
            return response.data;
        },
        enabled: !!accessToken && !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
        retry: 2,
    });
};

// Custom hook for daily stats
const useDailyStats = (selectedDate?: Date) => {
    const { accessToken, profileData } = useAuthStore();
    const userId = profileData?.uid;
    const dateString = selectedDate ? formatDate(selectedDate) : formatDate(new Date());

    return useQuery<DailyStats>({
        queryKey: ['dailyStats', userId, dateString],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/daily-stats/${userId}?date=${dateString}`);
            return response.data;
        },
        enabled: !!accessToken && !!userId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        retry: 2,
    });
};

// Custom hook for user attendance status
const useUserAttendanceStatus = () => {
    const { accessToken, profileData } = useAuthStore();
    const userId = profileData?.uid;

    return useQuery<UserAttendanceStatus>({
        queryKey: ['userAttendanceStatus', userId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/status/${userId}`);
            return response.data;
        },
        enabled: !!accessToken && !!userId,
        staleTime: 1 * 60 * 1000, // 1 minute for real-time status
        refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
        retry: 2,
    });
};

// Personal stats card component
const PersonalStatsCard: React.FunctionComponent<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: string;
    className?: string;
}> = ({ title, value, subtitle, icon, color = "text-primary", className }) => (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={`w-4 h-4 ${color}`}>
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
                <p className="text-xs text-muted-foreground">
                    {subtitle}
                </p>
            )}
        </CardContent>
    </Card>
);

// Shift Management Card Component
const ShiftManagementCard: React.FunctionComponent<{
    userStatus: any;
    userMetrics: any;
    onShiftAction: (action: 'start' | 'end' | 'startBreak' | 'endBreak') => void;
    checkInLoading: boolean;
    checkOutLoading: boolean;
    startBreakLoading: boolean;
    endBreakLoading: boolean;
}> = ({ userStatus, onShiftAction, checkInLoading, checkOutLoading, startBreakLoading, endBreakLoading }) => {
    // Use the same logic as mobile attendance-button.tsx for determining status
    const hasBreakStartTime = !!userStatus?.breakStartTime;
    const hasBreakEndTime = !!userStatus?.breakEndTime;
    const hasStartTime = !!userStatus?.startTime && userStatus.startTime !== 'null';
    const hasEndTime = !!userStatus?.endTime && userStatus.endTime !== 'null';

    // Directly use the nextAction field from server if available
    const serverNextAction = userStatus?.nextAction || '';

    // Determine actual state more accurately - matching mobile logic
    const isOnBreak =
        (hasBreakStartTime && !hasBreakEndTime) ||
        serverNextAction === 'End Break' ||
        serverNextAction === 'Resume Work';

    // User is checked in if server explicitly says so OR if they have a startTime without endTime
    // OR if nextAction indicates they should end shift or take break
    // OR if on break, definitely checked in
    const isCheckedIn =
        userStatus?.checkedIn === true ||
        (hasStartTime && !hasEndTime) ||
        serverNextAction === 'End Shift' ||
        serverNextAction === 'Take Break' ||
        isOnBreak; // If on break, definitely checked in

    // Critical check: If we have both breakStartTime and breakEndTime, and nextAction is End Shift,
    // then user has ENDED their break and is now working
    const hasEndedBreakAndIsWorking =
        hasBreakStartTime &&
        hasBreakEndTime &&
        (serverNextAction === 'End Shift' || userStatus?.checkedIn === true);

    // Final break status - handle ended breaks
    const finalIsOnBreak = isOnBreak && !hasEndedBreakAndIsWorking;

    // Determine available actions based on current state
    const canStartShift = !isCheckedIn;
    const canEndShift = isCheckedIn && !finalIsOnBreak;
    const canStartBreak = isCheckedIn && !finalIsOnBreak;
    const canEndBreak = finalIsOnBreak;

    const getStatusText = () => {
        if (finalIsOnBreak) return "On Break";
        if (isCheckedIn) return "Shift Active";
        return "Not Checked In";
    };

    const getStatusColor = () => {
        if (finalIsOnBreak) return "text-orange-600";
        if (isCheckedIn) return "text-green-600";
        return "text-gray-600";
    };

    const getNextAction = () => {
        if (finalIsOnBreak) return "End Break";
        if (isCheckedIn) return "End Shift";
        return "Start Shift";
    };

    const nextAction = getNextAction();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <Activity className="w-5 h-5" />
                    Shift Management
                </CardTitle>
                <CardDescription>
                    Manage your work shifts and breaks
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Status */}
                <div className="p-4 text-center bg-gray-50 rounded-lg dark:bg-gray-800/50">
                    <div className={`text-lg font-bold ${getStatusColor()}`}>
                        {getStatusText()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {userStatus?.checkedIn ? 'Currently working' : 'Ready to start'}
                    </div>
                </div>

                {/* Shift Controls - Matching mobile attendance button layout */}
                <div className="space-y-4">
                    {/* Single Start Shift Button - Only when not checked in */}
                    {!isCheckedIn && (
                    <div className="space-y-2">
                        <div className="text-sm font-medium">Shift Control</div>
                            <Button
                                onClick={() => onShiftAction('start')}
                                disabled={!canStartShift || checkInLoading}
                                variant="default"
                                size="sm"
                                className="gap-2 w-full bg-green-500 hover:bg-green-600"
                            >
                                <Play className="w-4 h-4" />
                                {checkInLoading ? 'Starting...' : 'Start Shift'}
                            </Button>
                        </div>
                    )}

                    {/* End Break Button - Only when on break */}
                    {finalIsOnBreak && (
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Break Control</div>
                            <Button
                                onClick={() => onShiftAction('endBreak')}
                                disabled={!canEndBreak || endBreakLoading}
                                variant="destructive"
                                size="sm"
                                className="gap-2 w-full"
                            >
                                <Square className="w-4 h-4" />
                                {endBreakLoading ? 'Ending...' : 'End My Break'}
                            </Button>
                        </div>
                    )}

                    {/* Take Break and End Shift Buttons - Only when checked in and not on break */}
                    {isCheckedIn && !finalIsOnBreak && (
                    <div className="space-y-2">
                            <div className="text-sm font-medium">Shift Control</div>
                            <div className="grid grid-cols-2 gap-2">
                            <Button
                                onClick={() => onShiftAction('startBreak')}
                                disabled={!canStartBreak || startBreakLoading}
                                    variant="outline"
                                size="sm"
                                    className="gap-2 text-orange-600 border-orange-500 hover:bg-orange-50"
                            >
                                <Coffee className="w-4 h-4" />
                                    {startBreakLoading ? 'Starting...' : 'Take A Break'}
                            </Button>
                            <Button
                                    onClick={() => onShiftAction('end')}
                                    disabled={!canEndShift || checkOutLoading}
                                    variant="destructive"
                                size="sm"
                                    className="gap-2"
                            >
                                    <Square className="w-4 h-4" />
                                    {checkOutLoading ? 'Ending...' : 'End My Shift'}
                            </Button>
                        </div>
                    </div>
                    )}
                </div>

                {/* Status Info */}
                {userStatus?.attendance && (
                    <div className="pt-4 space-y-2 border-t">
                        {userStatus.attendance.checkIn && (
                            <div className="flex justify-between text-sm">
                                <span>Started:</span>
                                <span>{format(new Date(userStatus.attendance.checkIn), 'HH:mm')}</span>
                            </div>
                        )}
                        {userStatus.attendance.duration && (
                            <div className="flex justify-between text-sm">
                                <span>Duration:</span>
                                <span>{userStatus.attendance.duration}</span>
                            </div>
                        )}
                        {userStatus.attendance.totalBreakTime && (
                            <div className="flex justify-between text-sm">
                                <span>Total Breaks:</span>
                                <span>{userStatus.attendance.totalBreakTime}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Utility functions for attendance records
const getAttendanceStatusColor = (status: string) => {
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

const getAttendanceStatusIcon = (status: string) => {
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

const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    
    // Format with ordinal dates like "3rd September 2025"
    const day = date.getDate();
    const ordinal = getOrdinalSuffix(day);
    return format(date, `'${day}${ordinal}' MMMM yyyy`);
};

const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

export const PersonalReportsDashboard: React.FunctionComponent<PersonalReportsDashboardProps> = ({
    className = '',
}) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<AttendanceRecord | null>(null);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // Fetch personal data
    const {
        data: userMetrics,
        isLoading: metricsLoading,
        error: metricsError,
        refetch: refetchMetrics
    } = useUserAttendanceMetrics();

    const {
        data: dailyStats,
        isLoading: dailyLoading,
        refetch: refetchDaily
    } = useDailyStats(selectedDate);

    const {
        data: userStatus,
        isLoading: statusLoading,
        refetch: refetchStatus
    } = useUserAttendanceStatus();

    // Fetch attendance records using the same approach as mobile
    const {
        data: attendanceResponse,
        isLoading: attendanceLoading,
        error: attendanceError,
        refetch: refetchAttendance
    } = useUserAttendance();

    // Manual refresh function
    const handleRefresh = () => {
        refetchMetrics();
        refetchDaily();
        refetchStatus();
        refetchAttendance();
    };

    // Handle attendance record click
    const handleAttendanceRecordClick = (record: AttendanceRecord) => {
        setSelectedAttendanceRecord(record);
        setIsAttendanceModalOpen(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setIsAttendanceModalOpen(false);
        setSelectedAttendanceRecord(null);
    };

    // Shift management mutations - Matching mobile version exactly
    const checkInMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();

            if (!profileData) throw new Error('User not found');

            const checkInData = {
                status: 'present', // Match mobile version exactly
                checkIn: `${new Date()}`, // Match mobile format
                checkInLatitude: null, // For web version, set to null (no GPS)
                checkInLongitude: null, // For web version, set to null (no GPS)
                checkInNotes: '', // Match mobile
                branch: { uid: Number(profileData.branch?.uid) },
                owner: { uid: Number(profileData.uid) }
            };

            const response = await axiosInstance.post('/att/in', checkInData);
            return response.data;
        },
        onSuccess: (data) => {
            showSuccessToast('Shift Started!', toast);
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchMetrics();
            refetchDaily();
            refetchStatus();
        },
        onError: (error) => {
            showErrorToast(`${error?.message}`, toast); // Match mobile error handling
        },
    });

    const checkOutMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();
            if (!profileData) throw new Error('profileData not found');

            const checkOutData = {
                checkOut: `${new Date()}`, // Match mobile format
                checkOutNotes: '', // Match mobile
                checkOutLatitude: null, // Match mobile
                checkOutLongitude: null, // Match mobile
                owner: { uid: Number(profileData.uid) }
            };

            const response = await axiosInstance.post('/att/out', checkOutData);
            return response.data;
        },
        onSuccess: (data) => {
            showSuccessToast('Shift Ended!', toast); // Match mobile message
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchMetrics();
            refetchDaily();
            refetchStatus();
        },
        onError: (error) => {
            showErrorToast(`${error?.message}`, toast); // Match mobile error handling
        },
    });

    // Break management mutations - Matching mobile version exactly
    const startBreakMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();

            if (!profileData) throw new Error('User not found');

            const breakData = {
                isStartingBreak: true, // Match mobile exactly
                breakNotes: 'Starting break',
                owner: { uid: profileData.uid },
            };

            const response = await axiosInstance.post('/att/break', breakData);
            return response.data;
        },
        onSuccess: (data) => {
            showSuccessToast('Break started successfully!', toast);
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchStatus();
        },
        onError: (error) => {
            showErrorToast(`${error?.message}`, toast); // Match mobile error handling
        },
    });

    const endBreakMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();

            if (!profileData) throw new Error('User not found');

            const breakData = {
                isStartingBreak: false, // Match mobile exactly
                breakNotes: 'Ending break',
                owner: { uid: profileData.uid },
            };

            const response = await axiosInstance.post('/att/break', breakData);
            return response.data;
        },
        onSuccess: (data) => {
            showSuccessToast('Break ended successfully!', toast);
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchStatus();
        },
        onError: (error) => {
            showErrorToast(`${error?.message}`, toast); // Match mobile error handling
        },
    });

    // Handle shift actions
    const handleShiftAction = async (action: 'start' | 'end' | 'startBreak' | 'endBreak') => {
        if (action === 'start') {
            await checkInMutation.mutateAsync();
        } else if (action === 'end') {
            await checkOutMutation.mutateAsync();
        } else if (action === 'startBreak') {
            await startBreakMutation.mutateAsync();
        } else if (action === 'endBreak') {
            await endBreakMutation.mutateAsync();
        }
    };

    // Loading state
    if (metricsLoading || dailyLoading || statusLoading) {
        return (
            <div className={cn("space-y-6", className)}>
                <div className="flex justify-between items-center">
                    <div>
                        <Skeleton className="mb-2 w-48 h-8" />
                        <Skeleton className="w-64 h-4" />
                    </div>
                    <Skeleton className="w-24 h-10" />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="w-32 h-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="mb-2 w-16 h-8" />
                                <Skeleton className="w-24 h-3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    // Error state
    if (metricsError) {
        return (
            <div className={cn("space-y-6", className)}>
                <Card>
                    <CardContent className="flex justify-center items-center h-32">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto mb-2 w-8 h-8 text-red-500" />
                            <p className="text-sm text-muted-foreground">
                                Failed to load personal reports. Please try again.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="mt-2"
                            >
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const metrics = userMetrics?.metrics;
    const dailyWorkHours = dailyStats ? msToHours(dailyStats.dailyWorkTime) : 0;
    const dailyBreakHours = dailyStats ? msToHours(dailyStats.dailyBreakTime) : 0;

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header with date selector */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Personal Dashboard</h2>
                    <p className="text-muted-foreground">
                        Attendance analytics and performance insights
                    </p>
                </div>
                <div className="hidden gap-2 items-center md:flex">
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {format(selectedDate, 'PPP')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-auto" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) {
                                        setSelectedDate(date);
                                        setIsCalendarOpen(false);
                                    }
                                }}
                                disabled={(date) => date > new Date()}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="gap-2"
                    >
                        <Activity className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Key Personal Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <PersonalStatsCard
                    title="Today's Hours"
                    value={`${dailyWorkHours.toFixed(1)}h`}
                    subtitle={`${dailyBreakHours.toFixed(1)}h break time`}
                    icon={<Clock className="w-4 h-4" />}
                    color="text-blue-600"
                />
                <PersonalStatsCard
                    title="This Week"
                    value={`${metrics?.totalHours.thisWeek.toFixed(1) || 0}h`}
                    subtitle={`${metrics?.totalShifts.thisWeek || 0} shifts`}
                    icon={<BarChart3 className="w-4 h-4" />}
                    color="text-green-600"
                />
                <PersonalStatsCard
                    title="Attendance Streak"
                    value={metrics?.attendanceStreak || 0}
                    subtitle="consecutive days"
                    icon={<Award className="w-4 h-4" />}
                    color="text-purple-600"
                />
                <PersonalStatsCard
                    title="Punctuality Score"
                    value={`${metrics?.timingPatterns.punctualityScore || 0}%`}
                    subtitle="on-time arrivals"
                    icon={<Target className="w-4 h-4" />}
                    color="text-orange-600"
                />
            </div>

            {/* Shift Management and Performance */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Performance Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center">
                            <Zap className="w-5 h-5" />
                            Performance Overview
                        </CardTitle>
                        <CardDescription>
                            Your productivity and efficiency metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Work efficiency */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Work Efficiency</span>
                                <span>{metrics?.productivityInsights.workEfficiencyScore || 0}%</span>
                            </div>
                            <Progress value={metrics?.productivityInsights.workEfficiencyScore || 0} />
                        </div>

                        {/* Shift completion rate */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Shift Completion Rate</span>
                                <span>{metrics?.productivityInsights.shiftCompletionRate || 0}%</span>
                            </div>
                            <Progress value={metrics?.productivityInsights.shiftCompletionRate || 0} />
                        </div>

                        {/* Performance insights */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div className="text-center">
                                <div className="text-lg font-bold text-green-600">
                                    {metrics?.totalShifts.allTime || 0}
                                </div>
                                <div className="text-xs text-muted-foreground">Total Shifts</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">
                                    {metrics?.averageHoursPerDay.toFixed(1) || 0}h
                                </div>
                                <div className="text-xs text-muted-foreground">Avg Hours/Day</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shift Management */}
                <ShiftManagementCard
                    userStatus={userStatus}
                    userMetrics={userMetrics}
                    onShiftAction={handleShiftAction}
                    checkInLoading={checkInMutation.isPending}
                    checkOutLoading={checkOutMutation.isPending}
                    startBreakLoading={startBreakMutation.isPending}
                    endBreakLoading={endBreakMutation.isPending}
                />
            </div>

            {/* Break Analytics and Timing Patterns */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Break Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center">
                            <Coffee className="w-5 h-5" />
                            Break Analytics
                        </CardTitle>
                        <CardDescription>
                            Your break patterns and optimization insights
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="p-3 text-center rounded-lg border">
                                <div className="text-lg font-bold text-orange-600">
                                    {minutesToHoursDisplay(metrics?.breakAnalytics.totalBreakTime.today || 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Today's Breaks</div>
                            </div>
                            <div className="p-3 text-center rounded-lg border">
                                <div className="text-lg font-bold text-blue-600">
                                    {metrics?.breakAnalytics.averageBreakDuration || 0}m
                                </div>
                                <div className="text-xs text-muted-foreground">Avg Break Duration</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">Break Frequency</div>
                            <div className="text-2xl font-bold">
                                {metrics?.breakAnalytics.breakFrequency.toFixed(1) || 0} breaks/shift
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Longest: {metrics?.breakAnalytics.longestBreak || 0}m •
                                Shortest: {metrics?.breakAnalytics.shortestBreak || 0}m
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Timing Patterns */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center">
                            <Timer className="w-5 h-5" />
                            Timing Patterns
                        </CardTitle>
                        <CardDescription>
                            Your check-in/check-out patterns and trends
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <div className="text-sm font-medium">Avg Check-in</div>
                                <div className="text-lg font-semibold text-green-600">
                                    {metrics?.timingPatterns.averageCheckInTime || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Avg Check-out</div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {metrics?.timingPatterns.averageCheckOutTime || 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3 border-t">
                            <div className="flex justify-between">
                                <span className="text-sm">Overtime Frequency</span>
                                <Badge variant="outline">
                                    {metrics?.timingPatterns?.overtimeFrequency || 0}%
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm">Late Arrivals</span>
                                <Badge variant={(metrics?.productivityInsights?.lateArrivalsCount ?? 0) > 0 ? "destructive" : "default"}>
                                    {metrics?.productivityInsights?.lateArrivalsCount || 0}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* All-Time Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <BarChart3 className="w-5 h-5" />
                        All-Time Summary
                    </CardTitle>
                    <CardDescription>
                        Your complete attendance history and achievements
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="p-4 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-primary">
                                {metrics?.totalHours.allTime.toFixed(1) || 0}h
                            </div>
                            <div className="text-sm text-muted-foreground">Total Hours</div>
                        </div>
                        <div className="p-4 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">
                                {metrics?.totalShifts.allTime || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Shifts</div>
                        </div>
                        <div className="p-4 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">
                                {metrics?.firstAttendance.daysAgo || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Days Since Start</div>
                        </div>
                        <div className="p-4 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-purple-600">
                                {minutesToHoursDisplay(metrics?.breakAnalytics.totalBreakTime.allTime || 0)}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Break Time</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Records Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <FileText className="w-5 h-5" />
                        Recent Attendance Records
                    </CardTitle>
                    <CardDescription>
                        Your recent attendance history and shift details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {attendanceLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="w-10 h-10 rounded-full" />
                                        <div className="space-y-2">
                                            <Skeleton className="w-32 h-4" />
                                            <Skeleton className="w-24 h-3" />
                                        </div>
                                    </div>
                                    <Skeleton className="w-16 h-6" />
                                </div>
                            ))}
                        </div>
                    ) : attendanceError ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="mx-auto mb-2 w-8 h-8 text-red-500" />
                            <p className="text-sm text-muted-foreground">
                                Failed to load attendance records. Please try again.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchAttendance()}
                                className="mt-2"
                            >
                                Retry
                            </Button>
                        </div>
                    ) : !attendanceResponse?.checkIns || attendanceResponse.checkIns.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto mb-2 w-8 h-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                No attendance records found.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {attendanceResponse.checkIns.map((record: AttendanceRecord) => (
                                <div
                                    key={record.uid}
                                    onClick={() => handleAttendanceRecordClick(record)}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Status Icon */}
                                        <div className="flex-shrink-0">
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                getAttendanceStatusColor(record.status)
                                            )}>
                                                {getAttendanceStatusIcon(record.status)}
                                            </div>
                                        </div>

                                        {/* Record Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-sm">
                                                    {getDateLabel(record.checkIn)}
                                                </h4>
                                                <Badge className={cn("text-xs", getAttendanceStatusColor(record.status))}>
                                                    {record.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                    <span>
                                                        {format(parseISO(record.checkIn), 'HH:mm')}
                                                        {record.checkOut && ` - ${format(parseISO(record.checkOut), 'HH:mm')}`}
                                                    </span>
                                                </div>
                                                {record.duration && (
                                                    <div className="flex items-center gap-1">
                                                        <Timer className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                        <span>{record.duration}</span>
                                                    </div>
                                                )}
                                                {record.breakCount && record.breakCount > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Coffee className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                        <span>{record.breakCount} break{record.breakCount > 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                                {record.branch && (
                                                    <div className="flex items-center gap-1">
                                                        <Building className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                        <span>{record.branch.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Indicators */}
                                    <div className="flex items-center gap-2">
                                        {record.checkInLatitude && record.checkInLongitude && (
                                            <MapPin className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                        )}
                                        {record.overtime && record.overtime !== '0h 0m' && (
                                            <Zap className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="opacity-100 transition-opacity"
                                        >
                                            <Eye className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                        </Button>
                                        <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                                    </div>
                                </div>
                            ))}

                            {/* View More Button */}
                            {attendanceResponse.checkIns && attendanceResponse.checkIns.length >= 10 && (
                                <div className="text-center pt-4">
                                    <Button variant="outline" className="text-xs">
                                        <FileText className="w-4 h-4 mr-2" />
                                        View All Records ({attendanceResponse.checkIns.length}+)
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attendance Details Modal */}
            <AttendanceDetailsModal
                open={isAttendanceModalOpen}
                onOpenChange={handleModalClose}
                record={selectedAttendanceRecord}
            />
        </div>
    );
};
