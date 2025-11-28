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
import { DailyReportsSection } from '@/components/reports/daily-reports-section';
import { useUserTargets, UserTarget } from '@/hooks/use-user-targets';
import { TrendingUp, Goal, ShoppingCart } from 'lucide-react';

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
        overtimeAnalytics: {
            totalOvertimeHours: {
                allTime: number; // in hours
                thisMonth: number;
                thisWeek: number;
                today: number;
            };
            averageOvertimePerShift: number; // in hours
            overtimeFrequency: number; // percentage of shifts with overtime
            longestOvertimeShift: number; // in hours
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

// Utility function to extract time from ISO timestamp (HH:mm:ss)
const extractTime = (isoString: string | null | undefined): string => {
    if (!isoString) return 'N/A';
    // If it's already formatted (doesn't contain 'T'), return as-is
    if (!isoString.includes('T')) return isoString;
    // Extract time portion from ISO string (e.g., "2025-11-11T08:34:33.000Z" -> "08:34:33")
    const timePart = isoString.split('T')[1];
    if (!timePart) return isoString;
    // Remove milliseconds and timezone (everything after '.')
    return timePart.split('.')[0].split('Z')[0].split('+')[0];
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

// Helper function for consistent date formatting: "Monday 1st August 2025"
const formatDateLong = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // Monday
        const day = date.getDate();
        const monthName = date.toLocaleDateString('en-US', { month: 'long' }); // August
        const year = date.getFullYear();

        // Add ordinal suffix to day
        const getOrdinalSuffix = (day: number) => {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${dayName} ${day}${getOrdinalSuffix(day)} ${monthName} ${year}`;
    } catch (error) {
        console.warn('Failed to format date:', dateStr, error);
        return 'Invalid date';
    }
};

// Helper functions for targets
const getProgressPercentage = (current: number | undefined, target: number | undefined) => {
    if (!current || !target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
};

const formatCurrency = (amount: number | undefined, currency: string = 'ZAR') => {
    if (!amount) return `${currency} 0`;
    return `${currency} ${amount.toLocaleString()}`;
};

// Pie Chart Component for Target Performance
interface PieChartProps {
    achieved: number;
    remaining: number;
    currency: string;
    title: string;
}

const PieChart: React.FunctionComponent<PieChartProps> = ({ achieved, remaining, currency, title }) => {
    const total = achieved + remaining;
    const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0;
    const radius = 90;
    const strokeWidth = 20;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Card className="relative bg-white dark:bg-gray-900">
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <CardTitle className="text-sm font-normal uppercase font-body">
                        {title}
                    </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-body w-fit">
                    {percentage}% Complete
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Pie Chart */}
                <div className="flex justify-center">
                    <div className="relative">
                        <svg
                            height={radius * 2}
                            width={radius * 2}
                            className="transform -rotate-90"
                        >
                            {/* Background circle */}
                            <circle
                                stroke="#e5e7eb"
                                fill="transparent"
                                strokeWidth={strokeWidth}
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                            />
                            {/* Progress circle */}
                            <circle
                                stroke="#ef4444"
                                fill="transparent"
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                style={{ strokeDashoffset }}
                                strokeLinecap="round"
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                                className="transition-all duration-300 ease-in-out"
                            />
                        </svg>
                        {/* Center text */}
                        <div className="flex absolute inset-0 flex-col justify-center items-center">
                            <div className="text-2xl font-bold text-primary font-body">
                                {percentage}%
                            </div>
                            <div className="text-xs uppercase text-muted-foreground font-body">
                                Complete
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                        <span className="text-sm font-medium text-foreground font-body">
                            Achieved
                        </span>
                        <span className="ml-auto text-sm font-bold text-foreground font-body">
                            {currency} {achieved.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                        <span className="text-sm font-medium text-muted-foreground font-body">
                            Remaining
                        </span>
                        <span className="ml-auto text-sm font-bold text-muted-foreground font-body">
                            {currency} {remaining.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Summary */}
                <div className="text-center">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-body">
                        {currency} {remaining.toLocaleString()} remaining to achieve target
                    </p>
                </div>
            </CardContent>
        </Card>
    );
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
                                <span>{extractTime(userStatus.attendance.checkIn)}</span>
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

    // Get profile data for targets
    const { profileData } = useAuthStore();

    // Fetch user targets
    const {
        data: targetsData,
        isLoading: targetsLoading,
        error: targetsError,
        refetch: refetchTargets
    } = useUserTargets();

    // Type assertion to ensure TypeScript recognizes personalTargets
    const targetsWithPersonalTargets = targetsData as UserTarget | null;

    // Fetch profile sales data from ERP (matching targets-tab.tsx)
    const {
        data: profileSalesData,
        refetch: refetchProfileSales
    } = useQuery({
        queryKey: ['profile-sales', profileData?.uid],
        queryFn: async () => {
            const response = await axiosInstance.get('/erp/profile/sales');
            return response.data;
        },
        enabled: !!profileData?.uid,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Manual refresh function
    const handleRefresh = () => {
        refetchMetrics();
        refetchDaily();
        refetchStatus();
        refetchAttendance();
        refetchTargets();
        refetchProfileSales();
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
    if (metricsLoading || dailyLoading || statusLoading || targetsLoading) {
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

    // Extract personalTargets for easier access
    const personalTargets = targetsWithPersonalTargets?.personalTargets;

    // Calculate sales data - Use ERP sales data for current period when available (matching targets-tab.tsx)
    // ✅ ALWAYS use ERP sales data for current period when available (even if 0)
    // Only fallback to userTarget if ERP data is not available (null/undefined = API error or no ERP code)
    const currentSalesAmount = profileSalesData !== null && profileSalesData !== undefined
        ? (profileSalesData.data?.totalRevenue ?? 0)  // Use ERP data (even if 0)
        : (personalTargets?.sales?.current ?? 0); // Fallback only if ERP unavailable

    const targetSalesAmount = personalTargets?.sales?.target ?? 0;
    const salesCurrency = personalTargets?.sales?.currency || 'ZAR';
    const shouldShowSalesTarget = targetSalesAmount > 0 || currentSalesAmount > 0;

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

              {/* Targets Section */}
              {personalTargets && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Performance Targets</h2>
                            <p className="text-muted-foreground">
                                Track your progress towards monthly goals
                            </p>
                        </div>
                        {personalTargets.targetPeriod && (
                            <Badge variant="outline" className="text-sm">
                                {personalTargets.targetPeriod}
                            </Badge>
                        )}
                    </div>

                    {/* Target Period Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                    <Goal className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-sm font-normal uppercase font-body">
                                        Target Period
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-body uppercase">Period Start</p>
                                    <p className="text-sm font-medium font-body">
                                        {personalTargets.periodStartDate
                                            ? formatDateLong(personalTargets.periodStartDate)
                                            : 'Not set'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-body uppercase">Period End</p>
                                    <p className="text-sm font-medium font-body">
                                        {personalTargets.periodEndDate
                                            ? formatDateLong(personalTargets.periodEndDate)
                                            : 'Not set'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sales Targets - Pie Chart */}
                    {/* Use ERP sales data for current sales amount, matching targets-tab.tsx */}
                    {shouldShowSalesTarget && (
                        <>
                            <PieChart
                                achieved={currentSalesAmount}
                                remaining={Math.max(0, targetSalesAmount - currentSalesAmount)}
                                currency={salesCurrency}
                                title="Sales Performance"
                            />

                            {/* Sales Metrics */}
                            {profileSalesData?.data && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            {profileSalesData.data.transactionCount > 0 && (
                                                <div className="flex gap-3 items-center">
                                                    <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-body uppercase">Transactions</p>
                                                        <p className="text-sm font-medium font-body">{profileSalesData.data.transactionCount}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {profileSalesData.data.uniqueCustomers > 0 && (
                                                <div className="flex gap-3 items-center">
                                                    <User className="w-5 h-5 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground font-body uppercase">Customers</p>
                                                        <p className="text-sm font-medium font-body">{profileSalesData.data.uniqueCustomers}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {profileSalesData.data.uniqueCustomers > 0 && (
                                            <div className="pt-4 mt-4 border-t">
                                                <p className="text-sm text-center text-muted-foreground font-body">
                                                    You have assisted <span className="font-semibold text-foreground">{profileSalesData.data.uniqueCustomers}</span> customer{profileSalesData.data.uniqueCustomers !== 1 ? 's' : ''} this period
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    {/* Quotations Targets - Pie Chart */}
                    {personalTargets.quotations && (personalTargets.quotations.target || personalTargets.quotations.current) && (
                        <PieChart
                            achieved={personalTargets.quotations.current || 0}
                            remaining={personalTargets.quotations.remaining || 0}
                            currency={personalTargets.quotations.currency || 'ZAR'}
                            title="Quotations Performance"
                        />
                    )}

                    {/* Orders Performance - Shows current orders without target */}
                    {/* Note: Orders are tracked separately, check if we have access to this data */}
                    {'currentOrdersAmount' in personalTargets && personalTargets.currentOrdersAmount && (
                        <Card className="relative">
                            <CardHeader>
                                <div className="flex gap-2 items-center">
                                    <Zap className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                                    <CardTitle className="text-sm font-normal uppercase font-body">
                                        Orders Performance
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-medium text-muted-foreground font-body uppercase">Current Orders</p>
                                        <Badge variant="outline" className="text-[10px] font-body">
                                            {formatCurrency((personalTargets as any).currentOrdersAmount, personalTargets.targetCurrency)}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl text-orange-600 dark:text-orange-400 font-body">
                                        {formatCurrency((personalTargets as any).currentOrdersAmount, personalTargets.targetCurrency)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">
                                        Total Orders (Converted from Quotations)
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Work Hours Target */}
                    {personalTargets.hours && (personalTargets.hours.target || personalTargets.hours.current) && (
                        <Card className="relative">
                            <CardHeader>
                                <div className="flex gap-2 items-center">
                                    <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                    <CardTitle className="text-sm font-normal uppercase font-body">
                                        Work Hours
                                    </CardTitle>
                                </div>
                                {/* Green badge for target reached */}
                                {(personalTargets.hours.progress || 0) >= 100 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge variant="default" className="bg-emerald-500 text-white text-[10px] font-body">
                                            <CheckCircle className="mr-1 w-3 h-3" />
                                            Target Reached
                                        </Badge>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-medium text-muted-foreground font-body uppercase">Hours Target</p>
                                        <Badge variant="outline" className="text-[10px] font-body">
                                            {(personalTargets.hours.progress || 0).toFixed(1)}%
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body">
                                        <span>{personalTargets.hours.current || 0}h</span>
                                        <span>{personalTargets.hours.target || 0}h</span>
                                    </div>
                                    <Progress
                                        value={personalTargets.hours.progress || 0}
                                        className="h-3"
                                    />
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body uppercase">
                                        <span>Complete</span>
                                        <span>
                                            {personalTargets.hours.remaining
                                                ? `${personalTargets.hours.remaining}h remaining`
                                                : 'Target needed'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* General Metrics */}
                    <Card>
                        <CardHeader>
                            <div className="flex gap-2 items-center">
                                <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                <CardTitle className="text-sm font-normal uppercase font-body">
                                    General Metrics
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                                {/* Work Hours */}
                                {personalTargets.hours && (personalTargets.hours.target || personalTargets.hours.current) && (
                                    <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                        <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                            {personalTargets.hours.current || 0}/{personalTargets.hours.target || 0}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-body uppercase">Hours Worked</div>
                                        <div className="text-[10px] text-primary font-body">
                                            {(personalTargets.hours.progress || 0).toFixed(0)}%
                                        </div>
                                    </div>
                                )}

                                {/* New Clients */}
                                {personalTargets.newClients && (personalTargets.newClients.target || personalTargets.newClients.current) && (
                                    <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                        <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                            {personalTargets.newClients.current || 0}/{personalTargets.newClients.target || 0}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-body uppercase">New Clients</div>
                                        <div className="text-[10px] text-primary font-body">
                                            {(personalTargets.newClients.progress || 0).toFixed(0)}%
                                        </div>
                                    </div>
                                )}

                                {/* New Leads */}
                                {personalTargets.newLeads && (personalTargets.newLeads.target || personalTargets.newLeads.current) && (
                                    <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                        <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                            {personalTargets.newLeads.current || 0}/{personalTargets.newLeads.target || 0}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-body uppercase">New Leads</div>
                                        <div className="text-[10px] text-primary font-body">
                                            {(personalTargets.newLeads.progress || 0).toFixed(0)}%
                                        </div>
                                    </div>
                                )}

                                {/* Check-ins/Visits */}
                                {personalTargets.checkIns && (personalTargets.checkIns.target || personalTargets.checkIns.current) && (
                                    <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                        <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                            {personalTargets.checkIns.current || 0}/{personalTargets.checkIns.target || 0}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-body uppercase">Visits</div>
                                        <div className="text-[10px] text-primary font-body">
                                            {(personalTargets.checkIns.progress || 0).toFixed(0)}%
                                        </div>
                                    </div>
                                )}

                                {/* Calls */}
                                {personalTargets.calls && (personalTargets.calls.target || personalTargets.calls.current) && (
                                    <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                        <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                            {personalTargets.calls.current || 0}/{personalTargets.calls.target || 0}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-body uppercase">Calls</div>
                                        <div className="text-[10px] text-primary font-body">
                                            {(personalTargets.calls.progress || 0).toFixed(0)}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                                <div key={i} className="flex justify-between items-center p-4 rounded-lg border">
                                    <div className="flex gap-3 items-center">
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
                        <div className="py-8 text-center">
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
                        <div className="py-8 text-center">
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
                                    className="flex justify-between items-center p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 group"
                                >
                                    <div className="flex gap-4 items-center">
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
                                            <div className="flex gap-2 items-center mb-1">
                                                <h4 className="text-sm font-medium">
                                                    {getDateLabel(record.checkIn)}
                                                </h4>
                                                <Badge className={cn("text-xs", getAttendanceStatusColor(record.status))}>
                                                    {record.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-4 items-center text-xs text-muted-foreground">
                                                <div className="flex gap-1 items-center">
                                                    <Clock className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                    <span>
                                                        {extractTime(record.checkIn)}
                                                        {record.checkOut && ` - ${extractTime(record.checkOut)}`}
                                                    </span>
                                                </div>
                                                {record.duration && (
                                                    <div className="flex gap-1 items-center">
                                                        <Timer className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                        <span>{record.duration}</span>
                                                    </div>
                                                )}
                                                {record.breakCount && record.breakCount > 0 && (
                                                    <div className="flex gap-1 items-center">
                                                        <Coffee className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                        <span>{record.breakCount} break{record.breakCount > 1 ? 's' : ''}</span>
                                                    </div>
                                                )}
                                                {record.branch && (
                                                    <div className="flex gap-1 items-center">
                                                        <Building className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                                                        <span>{record.branch.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Indicators */}
                                    <div className="flex gap-2 items-center">
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
                                <div className="pt-4 text-center">
                                    <Button variant="outline" className="text-xs">
                                        <FileText className="mr-2 w-4 h-4" />
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

            {/* Daily Reports Archive */}
            <DailyReportsSection variant="personal" />
        </div>
    );
};
