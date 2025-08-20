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
    User,
    Clock,
    Calendar as CalendarIcon,
    Coffee,
    Target,
    Timer,
    Award,
    BarChart3,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Zap,
    Play,
    Square,
    UserCheck
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
const PersonalStatsCard: React.FC<{
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

// Current status component - Simplified to match mobile version logic
const CurrentStatusCard: React.FC<{
    status: UserAttendanceStatus;
}> = ({ status }) => {
    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A';
        try {
            return new Date(timeString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timeString;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <User className="w-5 h-5" />
                    Current Status
                </CardTitle>
                <CardDescription>
                    Your real-time attendance status and next action
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status indicator - Simplified like mobile version */}
                <div className="p-4 text-center rounded-lg bg-primary/5">
                    <div className={`text-lg font-bold ${status.checkedIn ? 'text-green-600' : 'text-gray-600'}`}>
                        {status.checkedIn ? 'CHECKED IN' : 'AVAILABLE'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Current Status
                    </div>
                </div>

                {/* Timing details - Show only when checked in */}
                {status.checkedIn && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <div className="text-sm font-medium">Check-in Time</div>
                            <div className="text-lg font-semibold text-green-600">
                                {formatTime(status.startTime)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Duration</div>
                            <div className="text-lg font-semibold text-blue-600">
                                {status.attendance?.duration || 'Ongoing'}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Shift Management Component - Exact mobile version logic
const ShiftManagement: React.FunctionComponent<{
    userStatus: any;
    onShiftAction: (action: 'start' | 'end' | 'startBreak' | 'endBreak') => void;
    isLoading: boolean;
}> = ({ userStatus, onShiftAction, isLoading }) => {
    // Exact mobile version logic - use checkedIn boolean only
    const isCheckedIn = userStatus?.checkedIn || false;
    const currentStatus = userStatus?.attendance?.status || 'Not Available';
    const isOnBreak = currentStatus === 'ON_BREAK';

    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A';
        try {
            return new Date(timeString).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return timeString;
        }
    };

    // Exact mobile logic implementation
    const getLeftButton = () => {
        if (!isCheckedIn) {
            // NO SHIFT OR NO BREAK -> SHOW START SHIFT
            return (
                <Button
                    onClick={() => onShiftAction('start')}
                    disabled={isLoading}
                    className="gap-2 text-white bg-green-600 hover:bg-green-700"
                >
                    <Play className="w-4 h-4" />
                    Start Shift
                </Button>
            );
        } else if (isCheckedIn && !isOnBreak) {
            // ON SHIFT & NO BREAK -> SHOW TAKE BREAK
            return (
                <Button
                    onClick={() => onShiftAction('startBreak')}
                    disabled={isLoading}
                    className="gap-2 text-white bg-orange-600 hover:bg-orange-700"
                >
                    <Coffee className="w-4 h-4" />
                    Take Break
                </Button>
            );
        } else {
            // ON BREAK & ON SHIFT -> END BREAK
            return (
                <Button
                    onClick={() => onShiftAction('endBreak')}
                    disabled={isLoading}
                    className="gap-2 text-white bg-purple-600 hover:bg-purple-700"
                >
                    <Timer className="w-4 h-4" />
                    End Break
                </Button>
            );
        }
    };

    const getRightButton = () => {
        // Always show End Shift button (matches mobile)
        return (
            <Button
                onClick={() => onShiftAction('end')}
                disabled={isLoading || !isCheckedIn}
                className={cn("gap-2", isCheckedIn && "bg-red-600 hover:bg-red-700 text-white")}
                variant={!isCheckedIn ? "outline" : "default"}
            >
                <Square className="w-4 h-4" />
                End Shift
            </Button>
        );
    };

    const getStatusColor = () => {
        if (isOnBreak) {
            return 'text-orange-600 bg-orange-100';
        }
        return isCheckedIn ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100';
    };

    const getStatusText = () => {
        if (isOnBreak) {
            return 'On Break';
        }
        return isCheckedIn ? 'Currently Working' : 'Not Available';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <UserCheck className="w-5 h-5" />
                    My Shift Status
                </CardTitle>
                <CardDescription>
                    Manage your work shifts and track attendance
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Status */}
                <div className="p-4 text-center rounded-lg bg-primary/5">
                    <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor()}`}>
                        <Activity className="mr-2 w-4 h-4" />
                        {getStatusText()}
                    </div>
                </div>

                {/* Action Buttons - Exact mobile logic */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Left Button - Dynamic based on exact mobile logic */}
                    {getLeftButton()}

                    {/* Right Button - Always End Shift */}
                    {getRightButton()}
                </div>

                {/* Status Details */}
                {userStatus && isCheckedIn && (
                    <div className="pt-4 space-y-2 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium">{currentStatus}</span>
                        </div>
                        {userStatus?.startTime && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Started:</span>
                                <span className="font-medium">{formatTime(userStatus.startTime)}</span>
                            </div>
                        )}
                        {isOnBreak && userStatus?.attendance?.breakStartTime && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Break Started:</span>
                                <span className="font-medium">{formatTime(userStatus.attendance.breakStartTime)}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export const PersonalReportsDashboard: React.FC<PersonalReportsDashboardProps> = ({
    className = '',
}) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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

    // Manual refresh function
    const handleRefresh = () => {
        refetchMetrics();
        refetchDaily();
        refetchStatus();
    };

    // Shift management mutations - Updated to match mobile version
    const checkInMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();

            if (!profileData) throw new Error('User not found');

            const checkInData = {
                status: 'present', // Match mobile version (lowercase)
                checkIn: `${new Date()}`, // Match mobile format
                checkInLatitude: null, // For web version, set to null (no GPS)
                checkInLongitude: null, // For web version, set to null (no GPS)
                checkInNotes: '',
                branch: { uid: Number(profileData.branch?.uid) },
                owner: { uid: Number(profileData.uid) }
            };

            const response = await axiosInstance.post('/att/in', checkInData);
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Shift started successfully!', toast);
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchMetrics();
            refetchDaily();
            refetchStatus();
        },
        onError: (error: any) => {
            showErrorToast(error?.response?.data?.message || 'Failed to start shift', toast);
        },
    });

    const checkOutMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();
            if (!profileData) throw new Error('profileData not found');

            const checkOutData = {
                checkOut: `${new Date()}`, // Match mobile format
                checkOutNotes: '',
                checkOutLatitude: null, // For web version, set to null (no GPS)
                checkOutLongitude: null, // For web version, set to null (no GPS)
                owner: { uid: Number(profileData.uid) }
            };

            const response = await axiosInstance.post('/att/out', checkOutData);
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Shift ended successfully!', toast);
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchMetrics();
            refetchDaily();
            refetchStatus();
        },
        onError: (error: any) => {
            showErrorToast(error?.response?.data?.message || 'Failed to end shift', toast);
        },
    });

    // Break management mutations
    const startBreakMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();

            if (!profileData) throw new Error('User not found');

            const breakData = {
                isStartingBreak: true,
                breakNotes: 'Starting break',
                owner: { uid: profileData.uid },
            };

            const response = await axiosInstance.post('/att/break', breakData);
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Break started successfully!', toast);
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchStatus();
        },
        onError: (error: any) => {
            showErrorToast(error?.response?.data?.message || 'Failed to start break', toast);
        },
    });

    const endBreakMutation = useMutation({
        mutationFn: async () => {
            const { profileData } = useAuthStore.getState();

            if (!profileData) throw new Error('User not found');

            const breakData = {
                isStartingBreak: false,
                breakNotes: 'Ending break',
                owner: { uid: profileData.uid },
            };

            const response = await axiosInstance.post('/att/break', breakData);
            return response.data;
        },
        onSuccess: () => {
            showSuccessToast('Break ended successfully!', toast);
            queryClient.invalidateQueries({ queryKey: ['userAttendanceStatus'] });
            refetchStatus();
        },
        onError: (error: any) => {
            showErrorToast(error?.response?.data?.message || 'Failed to end break', toast);
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
                {/* Shift Management */}
                {userStatus && (
                    <ShiftManagement
                        userStatus={userStatus}
                        onShiftAction={handleShiftAction}
                        isLoading={checkInMutation.isPending || checkOutMutation.isPending || startBreakMutation.isPending || endBreakMutation.isPending}
                    />
                )}

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
        </div>
    );
}; 