import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Clock,
    TrendingUp,
    UserCheck,
    Coffee,
    Target,
    AlertTriangle,
    CheckCircle2,
    Activity,
    BarChart3,
    UserX,
    UserPlus,
    Download,
    Phone,
    Mail
} from 'lucide-react';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { DailyReportsSection } from '@/components/reports/daily-reports-section';

interface HRReportsDashboardProps {
    className?: string;
}

interface TodayAttendanceData {
    message: string;
    checkIns: Array<{
        uid: number;
        status: string;
        checkIn: string;
        checkOut?: string;
        duration?: string;
        totalBreakTime?: string;
        breakCount?: number;
        owner: {
            uid: number;
            name: string;
            surname: string;
            email: string;
            accessLevel: string;
            branch?: {
                name: string;
                ref: string;
            };
        };
    }>;
    analytics?: {
        totalEmployees: number;
        presentEmployees: number;
        completedShifts: number;
        averageCheckInTime: string;
        averageCheckOutTime: string;
        punctualityRate: number;
        overtimeShifts: number;
        totalWorkHours: number;
        totalBreakTime: number;
        attendanceRate: number;
    };
}

interface DailyAttendanceOverview {
    message: string;
    data: {
        date: string;
        totalEmployees: number;
        presentEmployees: number;
        absentEmployees: number;
        attendanceRate: number;
        presentUsers: Array<{
            uid: number;
            name: string;
            surname: string;
            fullName: string;
            email: string;
            phoneNumber: string;
            profileImage: string | null;
            branchId: number | null;
            branchName: string;
            accessLevel: string;
            checkInTime: string;
            checkOutTime: string | null;
            status: string;
            workingHours: string | null;
            isOnBreak: boolean;
            shiftDuration: string;
        }>;
        absentUsers: Array<{
            uid: number;
            name: string;
            surname: string;
            fullName: string;
            email: string;
            phoneNumber: string;
            profileImage: string | null;
            branchId: number | null;
            branchName: string;
            accessLevel: string;
            lastSeenDate: string | null;
            employeeSince: string;
            isActive: boolean;
            role: string;
        }>;
    };
}

interface OrganizationReportData {
    message: string;
    report: {
        reportPeriod: {
            from: string;
            to: string;
            totalDays: number;
            generatedAt: string;
        };
        organizationMetrics: {
            summary: {
                totalEmployees: number;
                activeEmployees: number;
                totalHours: number;
                totalShifts: number;
                overtimeHours: number;
                averageHoursPerEmployee: number;
            };
            averageTimes: {
                startTime: string;
                endTime: string;
                shiftDuration: number;
                breakDuration: number;
            };
            insights: {
                attendanceRate: number;
                punctualityRate: number;
                averageHoursPerDay: number;
                peakCheckInTime: string;
                peakCheckOutTime: string;
                productivityScore: number;
            };
        };
    };
}

// Utility function to format date
const formatDate = (date: Date): string => {
    return date?.toISOString()?.split('T')[0];
};

// Utility function to format time
const formatTime = (timeString: string): string => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
        // If already formatted (contains AM/PM), return as-is
        if (timeString.includes('AM') || timeString.includes('PM')) {
            return timeString;
        }
        // Parse HH:mm format and display without timezone conversion
        const [hours, minutes] = timeString.split(':');
        if (hours && minutes) {
            return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        return timeString;
    } catch {
        return timeString;
    }
};

// CSV Export utility functions
const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const exportPresentUsersToCSV = (users: DailyAttendanceOverview['data']['presentUsers'], date: string) => {
    const headers = [
        'Employee ID',
        'Full Name',
        'Email',
        'Phone Number',
        'Branch',
        'Access Level',
        'Check In Time',
        'Check Out Time',
        'Status',
        'Working Hours',
        'Shift Duration',
        'Is On Break'
    ];

    const csvContent = [
        headers.join(','),
        ...users.map(user => [
            user.uid,
            `"${user.fullName}"`,
            `"${user.email}"`,
            `"${user.phoneNumber || 'N/A'}"`,
            `"${user.branchName}"`,
            user.accessLevel,
            `"${typeof user.checkInTime === 'string' && (user.checkInTime.includes('AM') || user.checkInTime.includes('PM')) ? user.checkInTime : new Date(user.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}"`,
            `"${user.checkOutTime ? (typeof user.checkOutTime === 'string' && (user.checkOutTime.includes('AM') || user.checkOutTime.includes('PM')) ? user.checkOutTime : new Date(user.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })) : 'Still Working'}"`,
            user.status,
            user.workingHours || 'N/A',
            `"${user.shiftDuration}"`,
            user.isOnBreak ? 'Yes' : 'No'
        ].join(','))
    ].join('\n');

    downloadCSV(csvContent, `present-employees-${date}.csv`);
};

const exportAbsentUsersToCSV = (users: DailyAttendanceOverview['data']['absentUsers'], date: string) => {
    const headers = [
        'Employee ID',
        'Full Name',
        'Email',
        'Phone Number',
        'Branch',
        'Access Level',
        'Role',
        'Employee Since',
        'Status'
    ];

    const csvContent = [
        headers.join(','),
        ...users.map(user => [
            user.uid,
            `"${user.fullName}"`,
            `"${user.email}"`,
            `"${user.phoneNumber || 'N/A'}"`,
            `"${user.branchName}"`,
            user.accessLevel,
            user.role,
            user.employeeSince,
            user.isActive ? 'Active' : 'Inactive'
        ].join(','))
    ].join('\n');

    downloadCSV(csvContent, `absent-employees-${date}.csv`);
};

// Utility function to parse duration string to hours
const parseDurationToHours = (duration?: string): number => {
    if (!duration) return 0;
    const match = duration?.match(/(\d+)h\s*(\d+)m/);
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        return hours + minutes / 60;
    }
    return 0;
};

// Custom hook for today's attendance data
const useTodayAttendance = () => {
    const { accessToken } = useAuthStore();
    const today = formatDate(new Date());

    return useQuery<TodayAttendanceData>({
        queryKey: ['todayAttendance', today],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/date/${today}`);
            return response.data;
        },
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000, // 2 minutes for real-time feel
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        retry: 2,
    });
};

// Custom hook for organization report (today)
const useOrganizationTodayReport = () => {
    const { accessToken } = useAuthStore();
    const today = formatDate(new Date());

    return useQuery<OrganizationReportData>({
        queryKey: ['organizationTodayReport', today],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/report?dateFrom=${today}&dateTo=${today}&includeUserDetails=false`);
            return response?.data;
        },
        enabled: !!accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
        retry: 2,
    });
};

// Custom hook for current user status
const useCurrentUserStatus = () => {
    const { accessToken, profileData } = useAuthStore();

    return useQuery({
        queryKey: ['currentUserStatus', profileData?.uid],
        queryFn: async () => {
            if (!profileData?.uid) throw new Error('User not found');
            const response = await axiosInstance.get(`/att/status/${profileData.uid}`);
            return response.data;
        },
        enabled: !!accessToken && !!profileData?.uid,
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 60 * 1000, // Auto-refresh every minute
        retry: 2,
    });
};

// Custom hook for current user metrics
const useCurrentUserMetrics = () => {
    const { accessToken, profileData } = useAuthStore();

    return useQuery({
        queryKey: ['currentUserMetrics', profileData?.uid],
        queryFn: async () => {
            if (!profileData?.uid) throw new Error('User not found');
            const response = await axiosInstance.get(`/att/metrics/${profileData.uid}`);
            return response.data;
        },
        enabled: !!accessToken && !!profileData?.uid,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
        retry: 2,
    });
};

// Custom hook for daily stats
const useDailyStats = () => {
    const { accessToken, profileData } = useAuthStore();

    return useQuery({
        queryKey: ['dailyStats', profileData?.uid],
        queryFn: async () => {
            if (!profileData?.uid) throw new Error('User not found');
            const response = await axiosInstance.get(`/att/daily-stats/${profileData.uid}`);
            return response.data;
        },
        enabled: !!accessToken && !!profileData?.uid,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        retry: 2,
    });
};

// Custom hook for daily attendance overview
const useDailyAttendanceOverview = () => {
    const { accessToken } = useAuthStore();

    return useQuery({
        queryKey: ['dailyAttendanceOverview'],
        queryFn: async () => {
            const response = await axiosInstance.get('/att/daily-overview');
            return response.data;
        },
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        retry: 2,
    });
};

// Stats card component
const StatsCard: React.FunctionComponent<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
}> = ({ title, value, subtitle, icon, trend, className }) => (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="w-4 h-4 text-muted-foreground">
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
            {trend && (
                <div className={`text-xs flex items-center gap-1 ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                    <TrendingUp className="w-3 h-3" />
                    {trend.value}% from yesterday
                </div>
            )}
        </CardContent>
    </Card>
);

// Work hours breakdown component
const WorkHoursBreakdown: React.FunctionComponent<{
    data: TodayAttendanceData;
    orgReport?: OrganizationReportData;
}> = ({ data, orgReport }) => {
    const totalHoursWorked = data?.checkIns?.reduce((total, record) => {
        return total + parseDurationToHours(record?.duration);
    }, 0) || 0;

    const totalBreakHours = data.checkIns?.reduce((total, record) => {
        return total + parseDurationToHours(record?.totalBreakTime);
    }, 0) || 0;

    const averageHoursPerEmployee = data.checkIns?.length > 0
        ? totalHoursWorked / data?.checkIns?.length
        : 0;

    const progressPercentage = Math.min((totalHoursWorked / (data?.checkIns?.length * 8 || 1)) * 100, 100);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <Clock className="w-5 h-5" />
                    Work Hours Breakdown
                </CardTitle>
                <CardDescription>
                    Daily work hours analysis and productivity metrics
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Total hours overview */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="p-4 text-center rounded-lg border">
                        <div className="text-2xl font-bold text-primary">
                            {totalHoursWorked.toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">Total Work Hours</div>
                    </div>
                    <div className="p-4 text-center rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">
                            {totalBreakHours.toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">Total Break Time</div>
                    </div>
                    <div className="p-4 text-center rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">
                            {averageHoursPerEmployee.toFixed(1)}h
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Hours/Employee</div>
                    </div>
                </div>

                {/* Progress indicator */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Daily Progress</span>
                        <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="w-full" />
                    <div className="text-xs text-muted-foreground">
                        Based on {data?.checkIns?.length || 0} employees working today
                    </div>
                </div>

                {/* Timing insights */}
                {orgReport?.report?.organizationMetrics?.averageTimes && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <div className="text-sm font-medium">Average Start Time</div>
                            <div className="text-lg font-semibold text-green-600">
                                {formatTime(orgReport?.report?.organizationMetrics?.averageTimes?.startTime)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Average End Time</div>
                            <div className="text-lg font-semibold text-blue-600">
                                {formatTime(orgReport?.report?.organizationMetrics?.averageTimes?.endTime)}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Employee status overview component
const EmployeeStatusOverview: React.FunctionComponent<{
    data: TodayAttendanceData;
    orgReport?: OrganizationReportData;
}> = ({ data, orgReport }) => {
    const statusCounts = {
        present: data.checkIns?.filter(record => record.status === 'PRESENT').length || 0,
        completed: data.checkIns?.filter(record => record.status === 'COMPLETED').length || 0,
        onBreak: data.checkIns?.filter(record => record.status === 'ON_BREAK').length || 0,
    };

    const totalEmployees = orgReport?.report.organizationMetrics?.summary?.totalEmployees || data.checkIns?.length || 0;
    const activeToday = statusCounts.present + statusCounts.completed + statusCounts.onBreak;
    const attendanceRate = totalEmployees > 0 ? (activeToday / totalEmployees) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <Users className="w-5 h-5" />
                    Employee Status Overview
                </CardTitle>
                <CardDescription>
                    Real-time employee attendance and status tracking
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Attendance rate */}
                <div className="p-4 text-center rounded-lg bg-primary/5">
                    <div className="text-3xl font-bold text-primary">
                        {attendanceRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Attendance Rate ({activeToday}/{totalEmployees})
                    </div>
                </div>

                {/* Status breakdown */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 text-center rounded-lg border">
                        <div className="flex justify-center items-center mb-2">
                            <Activity className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-lg font-bold text-green-600">
                            {statusCounts.present}
                        </div>
                        <div className="text-xs text-muted-foreground">Currently Working</div>
                    </div>
                    <div className="p-3 text-center rounded-lg border">
                        <div className="flex justify-center items-center mb-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                            {statusCounts.completed}
                        </div>
                        <div className="text-xs text-muted-foreground">Shifts Completed</div>
                    </div>
                    <div className="p-3 text-center rounded-lg border">
                        <div className="flex justify-center items-center mb-2">
                            <Coffee className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                            {statusCounts.onBreak}
                        </div>
                        <div className="text-xs text-muted-foreground">On Break</div>
                    </div>
                </div>

                {/* Punctuality insight */}
                {orgReport?.report.organizationMetrics.insights.punctualityRate && (
                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Punctuality Rate</span>
                            <Badge variant={orgReport.report.organizationMetrics.insights.punctualityRate >= 90 ? "default" : "secondary"}>
                                {orgReport.report.organizationMetrics.insights.punctualityRate.toFixed(1)}%
                            </Badge>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Personal Metrics Component
const PersonalMetrics: React.FunctionComponent<{
    userMetrics: any;
    dailyStats: any;
}> = ({ userMetrics, dailyStats }) => {
    if (!userMetrics?.metrics) return null;

    const metrics = userMetrics.metrics;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <UserPlus className="w-5 h-5" />
                    My Attendance Metrics
                </CardTitle>
                <CardDescription>
                    Your personal attendance statistics and insights
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Current Streak */}
                <div className="p-4 text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {metrics.attendanceStreak || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="p-3 text-center rounded-lg border">
                        <div className="text-lg font-bold text-blue-600">
                            {metrics.totalHours?.today || 0}h
                        </div>
                        <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                    <div className="p-3 text-center rounded-lg border">
                        <div className="text-lg font-bold text-green-600">
                            {metrics.totalHours?.thisWeek || 0}h
                        </div>
                        <div className="text-xs text-muted-foreground">This Week</div>
                    </div>
                    <div className="p-3 text-center rounded-lg border">
                        <div className="text-lg font-bold text-orange-600">
                            {metrics.totalHours?.thisMonth || 0}h
                        </div>
                        <div className="text-xs text-muted-foreground">This Month</div>
                    </div>
                    <div className="p-3 text-center rounded-lg border">
                        <div className="text-lg font-bold text-purple-600">
                            {metrics.totalHours?.allTime || 0}h
                        </div>
                        <div className="text-xs text-muted-foreground">All Time</div>
                    </div>
                </div>

                {/* Average Hours Per Day */}
                <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Hours/Day</span>
                        <span className="text-lg font-bold text-primary">
                            {metrics.averageHoursPerDay?.toFixed(1) || 0}h
                        </span>
                    </div>
                </div>

                {/* Break Analytics */}
                {metrics.breakAnalytics && (
                    <div className="pt-2 border-t">
                        <div className="mb-2 text-sm font-medium">Break Analytics</div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 text-center bg-blue-50 rounded dark:bg-blue-900/20">
                                <div className="text-sm font-bold text-blue-600">
                                    {metrics.breakAnalytics.totalBreakTime?.today || 0}m
                                </div>
                                <div className="text-xs text-muted-foreground">Today</div>
                            </div>
                            <div className="p-2 text-center bg-green-50 rounded dark:bg-green-900/20">
                                <div className="text-sm font-bold text-green-600">
                                    {metrics.breakAnalytics.averageBreakDuration || 0}m
                                </div>
                                <div className="text-xs text-muted-foreground">Average</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Daily Stats */}
                {dailyStats && (
                    <div className="pt-2 border-t">
                        <div className="mb-2 text-sm font-medium">Today's Progress</div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Work Time</span>
                                <span className="font-medium">{dailyStats.dailyWorkTime || 0}h</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Break Time</span>
                                <span className="font-medium">{dailyStats.dailyBreakTime || 0}h</span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Daily Attendance Table Component
const DailyAttendanceTable: React.FunctionComponent = () => {
    const { data: attendanceOverview, isLoading, error } = useDailyAttendanceOverview();

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Summary Stats Skeleton */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center">
                            <Users className="w-5 h-5" />
                            Daily Attendance Overview
                        </CardTitle>
                        <CardDescription>Today's attendance details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                            {[...Array(4)]?.map((_, i) => (
                                <Skeleton key={i} className="h-16 rounded-lg" />
                            ))}
                        </div>
                        <Skeleton className="mb-6 w-full h-2" />
                    </CardContent>
                </Card>

                {/* Cards Skeleton */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Skeleton className="h-64 rounded-lg" />
                    <Skeleton className="h-64 rounded-lg" />
                </div>
            </div>
        );
    }

    if (error || !attendanceOverview?.data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Users className="w-5 h-5" />
                        Daily Attendance Overview
                    </CardTitle>
                    <CardDescription>Today's attendance details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-6 text-center text-muted-foreground">
                        Failed to load attendance data
                    </div>
                </CardContent>
            </Card>
        );
    }

    const { data } = attendanceOverview;

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Users className="w-5 h-5" />
                        Daily Attendance Overview
                    </CardTitle>
                    <CardDescription>
                        Attendance details for {new Date(data.date).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                        <div className="p-3 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">{data?.totalEmployees}</div>
                            <div className="text-sm text-muted-foreground">Total Employees</div>
                        </div>
                        <div className="p-3 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">{data?.presentEmployees}</div>
                            <div className="text-sm text-muted-foreground">Present</div>
                        </div>
                        <div className="p-3 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-red-600">{data?.absentEmployees}</div>
                            <div className="text-sm text-muted-foreground">Absent</div>
                        </div>
                        <div className="p-3 text-center rounded-lg border">
                            <div className="text-2xl font-bold text-purple-600">{data?.attendanceRate}%</div>
                            <div className="text-sm text-muted-foreground">Attendance Rate</div>
                        </div>
                    </div>

                    {/* Attendance Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between mb-2 text-sm">
                            <span>Attendance Progress</span>
                            <span>{data?.attendanceRate}%</span>
                        </div>
                        <Progress value={data?.attendanceRate} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Employee Cards - Responsive Grid */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {/* Present Employees Card */}
                <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                            <CardTitle className="flex gap-2 items-center text-lg">
                                <UserCheck className="w-5 h-5 text-green-600" />
                                Present Employees ({data.presentUsers.length})
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportPresentUsersToCSV(data.presentUsers, data.date)}
                                className="flex gap-2 items-center self-start sm:self-center"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                                <span className="sm:hidden">Export</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                    <div className="overflow-y-auto p-2 rounded-lg border" style={{ maxHeight: 'min(400px, 70vh)' }}>
                    {data.presentUsers.length > 0 ? (
                              <div className="flex flex-col gap-2">
                                    {data.presentUsers?.map((user: any) => (
                                        <div key={user?.uid} className="flex flex-col gap-3 p-4 rounded-md border transition-colors hover:bg-muted/50 sm:flex-row sm:items-center">
                                           <div className="flex gap-3 items-center md:w-1/2">
                                                <Avatar className="flex-shrink-0 w-10 h-10">
                                                    <AvatarImage
                                                        src={user?.profileImage || undefined}
                                                        alt={user?.fullName}
                                                    />
                                                    <AvatarFallback>
                                                        {user?.name?.charAt(0)}{user?.surname?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate sm:text-base">
                                                        {user?.fullName}
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:gap-4">
                                                        <span className="flex gap-1 items-center truncate">
                                                            <Mail className="flex-shrink-0 w-3 h-3" />
                                                            <span className="truncate">{user?.email}</span>
                                                        </span>
                                                        {user?.phoneNumber && (
                                                            <span className="flex gap-1 items-center">
                                                                <Phone className="flex-shrink-0 w-3 h-3" />
                                                                {user?.phoneNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 md:w-1/2 sm:items-end">
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <Badge variant="outline" className="text-xs">
                                                        {user?.branchName}
                                                    </Badge>
                                                    <Badge
                                                        variant={user?.isOnBreak ? 'secondary' : 'success'}
                                                        className="text-xs text-white"
                                                    >
                                                        {user?.isOnBreak ? 'On Break' : user?.status}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex flex-row gap-1 items-center text-sm font-medium">
                                                        <p>
                                                            {typeof user?.checkInTime === 'string' && user?.checkInTime.includes('AM') || user?.checkInTime.includes('PM')
                                                                ? user?.checkInTime
                                                                : new Date(user?.checkInTime).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    timeZone: 'UTC'
                                                                })
                                                            } -
                                                        </p>
                                                        <p>{user?.shiftDuration}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <UserCheck className="mx-auto mb-3 w-12 h-12 text-muted-foreground/50" />
                                    <p className="text-sm sm:text-base">No employees present today</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Absent Employees Card */}
                <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                            <CardTitle className="flex gap-2 items-center text-lg">
                                <UserX className="w-5 h-5 text-red-600" />
                                Absent Employees ({data.absentUsers.length})
                            </CardTitle>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => exportAbsentUsersToCSV(data.absentUsers, data.date)}
                                className="flex gap-2 items-center self-start sm:self-center"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export CSV</span>
                                <span className="sm:hidden">Export</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="overflow-y-auto p-2 rounded-lg border" style={{ maxHeight: 'min(400px, 70vh)' }}>
                            {data.absentUsers.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {data.absentUsers?.map((user: any) => (
                                        <div key={user?.uid} className="flex flex-col gap-3 p-4 rounded-md border transition-colors hover:bg-muted/50 sm:flex-row sm:items-center">
                                            <div className="flex gap-3 items-center md:w-1/2">
                                                <Avatar className="flex-shrink-0 w-10 h-10">
                                                    <AvatarImage
                                                        src={user?.profileImage || undefined}
                                                        alt={user?.fullName}
                                                    />
                                                    <AvatarFallback>
                                                        {user?.name?.charAt(0)}{user?.surname?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate sm:text-base">
                                                        {user?.fullName}
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:gap-4">
                                                        <span className="flex gap-1 items-center truncate">
                                                            <Mail className="flex-shrink-0 w-3 h-3" />
                                                            <span className="truncate">{user?.email}</span>
                                                        </span>
                                                        {user?.phoneNumber && (
                                                            <span className="flex gap-1 items-center">
                                                                <Phone className="flex-shrink-0 w-3 h-3" />
                                                                {user?.phoneNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center md:w-1/2 md:gap-3 md:justify-end">
                                                <div className="flex flex-wrap gap-2 justify-end items-center">
                                                    <Badge variant="outline" className="text-xs">
                                                        {user?.branchName}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {user?.role}
                                                    </Badge>
                                                    <Badge variant="destructive" className="mb-1 text-white">
                                                        Absent
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    <CheckCircle2 className="mx-auto mb-3 w-12 h-12 text-green-500" />
                                    <p className="text-sm sm:text-base">All employees are present today!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export const HRReportsDashboard: React.FunctionComponent<HRReportsDashboardProps> = ({
    className = '',
}) => {
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const queryClient = useQueryClient();

    // Fetch today's data
    const {
        data: todayAttendance,
        isLoading: todayLoading,
        error: todayError,
        refetch: refetchToday
    } = useTodayAttendance();

    const {
        data: orgReport,
        isLoading: orgLoading,
        refetch: refetchOrg
    } = useOrganizationTodayReport();

    // Auto-refresh tracker
    useEffect(() => {
        const interval = setInterval(() => {
            setLastRefresh(new Date());
            refetchToday();
            refetchOrg();
        }, 5 * 60 * 1000); // Refresh every 5 minutes

        return () => clearInterval(interval);
    }, [refetchToday, refetchOrg]);

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
            showSuccessToast('Shift Started!', toast); // Match mobile message
            queryClient.invalidateQueries({ queryKey: ['currentUserStatus'] });
            queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
            refetchToday();
            refetchOrg();
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
            queryClient.invalidateQueries({ queryKey: ['currentUserStatus'] });
            queryClient.invalidateQueries({ queryKey: ['todayAttendance'] });
            refetchToday();
            refetchOrg();
        },
        onError: (error) => {
            showErrorToast(`${error?.message}`, toast); // Match mobile error handling
        },
    });

    // Handle shift actions
    const handleShiftAction = async (action: 'start' | 'end') => {
        if (action === 'start') {
            await checkInMutation.mutateAsync();
        } else {
            await checkOutMutation.mutateAsync();
        }
    };

    // Manual refresh function
    const handleRefresh = () => {
        setLastRefresh(new Date());
        refetchToday();
        refetchOrg();
    };

    // Loading state
    if (todayLoading || orgLoading) {
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
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        );
    }

    // Error state
    if (todayError) {
        return (
            <div className={cn("space-y-6", className)}>
                <Card>
                    <CardContent className="flex justify-center items-center h-32">
                        <div className="text-center">
                            <AlertTriangle className="mx-auto mb-2 w-8 h-8 text-red-500" />
                            <p className="text-sm text-muted-foreground">
                                Failed to load HR reports. Please try again.
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

    // Calculate summary metrics
    const totalEmployees = orgReport?.report.organizationMetrics?.summary?.totalEmployees || 0;
    const activeToday = todayAttendance?.checkIns?.length || 0;
    const totalWorkHours = todayAttendance?.analytics?.totalWorkHours ||
                          todayAttendance?.checkIns?.reduce((total, record) => {
                              return total + parseDurationToHours(record?.duration);
                          }, 0) || 0;
    const punctualityRate = orgReport?.report.organizationMetrics.insights.punctualityRate || 0;

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Main Dashboard</h2>
                    <p className="text-muted-foreground">
                        Today's attendance overview and workforce analytics • Last updated: {lastRefresh.toLocaleTimeString()}
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="hidden gap-2 justify-center items-center md:flex"
                >
                    <Activity className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Employees"
                    value={totalEmployees}
                    subtitle={`${activeToday} active today`}
                    icon={<Users className="w-4 h-4" />}
                />
                <StatsCard
                    title="Active Today"
                    value={activeToday}
                    subtitle={`${((activeToday / totalEmployees) * 100).toFixed(1)}% attendance rate`}
                    icon={<UserCheck className="w-4 h-4" />}
                />
                <StatsCard
                    title="Total Work Hours"
                    value={`${totalWorkHours.toFixed(1)}h`}
                    subtitle={`${(totalWorkHours / (activeToday || 1)).toFixed(1)}h avg per person`}
                    icon={<Clock className="w-4 h-4" />}
                />
                <StatsCard
                    title="Punctuality Rate"
                    value={`${punctualityRate.toFixed(1)}%`}
                    subtitle="On-time arrivals today"
                    icon={<Target className="w-4 h-4" />}
                />
            </div>

            {/* Shift Management and Detailed Reports */}
            <div className="space-y-6">
                {/* Employee Status and Work Hours - Stack on mobile, 2 columns on larger screens */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <EmployeeStatusOverview
                        data={todayAttendance!}
                        orgReport={orgReport}
                    />
                    <WorkHoursBreakdown
                        data={todayAttendance!}
                        orgReport={orgReport}
                    />
                </div>
            </div>



            {/* Additional Insights */}
            {orgReport?.report.organizationMetrics.insights && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center">
                            <BarChart3 className="w-5 h-5" />
                            Daily Insights
                        </CardTitle>
                        <CardDescription>
                            Key performance indicators and trends for today
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="p-3 text-center rounded-lg border">
                                <div className="text-lg font-bold">
                                    {orgReport.report.organizationMetrics.insights.averageHoursPerDay.toFixed(1)}h
                                </div>
                                <div className="text-xs text-muted-foreground">Avg Hours/Day</div>
                            </div>
                            <div className="p-3 text-center rounded-lg border">
                                <div className="text-lg font-bold">
                                    {formatTime(orgReport.report.organizationMetrics.insights.peakCheckInTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">Peak Check-in</div>
                            </div>
                            <div className="p-3 text-center rounded-lg border">
                                <div className="text-lg font-bold">
                                    {formatTime(orgReport.report.organizationMetrics.insights.peakCheckOutTime)}
                                </div>
                                <div className="text-xs text-muted-foreground">Peak Check-out</div>
                            </div>
                            <div className="p-3 text-center rounded-lg border">
                                <div className="text-lg font-bold">
                                    {orgReport.report.organizationMetrics.insights.productivityScore?.toFixed(1) || 'N/A'}%
                                </div>
                                <div className="text-xs text-muted-foreground">Productivity Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Daily Attendance Table */}
            <DailyAttendanceTable />

            {/* Daily Reports Archive */}
            <DailyReportsSection variant="organization" />
        </div>
    );
};
