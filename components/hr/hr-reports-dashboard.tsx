import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
    Users, 
    Clock, 
    TrendingUp, 
    Calendar, 
    UserCheck, 
    Timer, 
    Coffee,
    Target,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Activity,
    BarChart3
} from 'lucide-react';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

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
    return date.toISOString().split('T')[0];
};

// Utility function to format time
const formatTime = (timeString: string): string => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    try {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    } catch {
        return timeString;
    }
};

// Utility function to parse duration string to hours
const parseDurationToHours = (duration?: string): number => {
    if (!duration) return 0;
    const match = duration.match(/(\d+)h\s*(\d+)m/);
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
            return response.data;
        },
        enabled: !!accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
        retry: 2,
    });
};

// Stats card component
const StatsCard: React.FC<{
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
const WorkHoursBreakdown: React.FC<{
    data: TodayAttendanceData;
    orgReport?: OrganizationReportData;
}> = ({ data, orgReport }) => {
    const totalHoursWorked = data.checkIns?.reduce((total, record) => {
        return total + parseDurationToHours(record.duration);
    }, 0) || 0;

    const totalBreakHours = data.checkIns?.reduce((total, record) => {
        return total + parseDurationToHours(record.totalBreakTime);
    }, 0) || 0;

    const averageHoursPerEmployee = data.checkIns?.length > 0 
        ? totalHoursWorked / data.checkIns.length 
        : 0;

    const progressPercentage = Math.min((totalHoursWorked / (data.checkIns?.length * 8 || 1)) * 100, 100);

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
                        Based on {data.checkIns?.length || 0} employees working today
                    </div>
                </div>

                {/* Timing insights */}
                {orgReport?.report.organizationMetrics.averageTimes && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <div className="text-sm font-medium">Average Start Time</div>
                            <div className="text-lg font-semibold text-green-600">
                                {formatTime(orgReport.report.organizationMetrics.averageTimes.startTime)}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Average End Time</div>
                            <div className="text-lg font-semibold text-blue-600">
                                {formatTime(orgReport.report.organizationMetrics.averageTimes.endTime)}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Employee status overview component
const EmployeeStatusOverview: React.FC<{
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

export const HRReportsDashboard: React.FC<HRReportsDashboardProps> = ({
    className = '',
}) => {
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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
                    <h2 className="text-2xl font-bold tracking-tight">HR Reports Dashboard</h2>
                    <p className="text-muted-foreground">
                        Today's attendance overview and workforce analytics • Last updated: {lastRefresh.toLocaleTimeString()}
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="gap-2"
                >
                    <Activity className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Employee Status Overview */}
                <EmployeeStatusOverview 
                    data={todayAttendance!} 
                    orgReport={orgReport} 
                />

                {/* Work Hours Breakdown */}
                <WorkHoursBreakdown 
                    data={todayAttendance!} 
                    orgReport={orgReport} 
                />
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
        </div>
    );
}; 