'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Loader2,
    RefreshCw,
    Download,
    Users,
    Clock,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Calendar as CalendarIcon,
    Sunrise,
    Sunset,
    Target,
    Building,
    UserCheck,
    Zap,
    Mail,
    Settings,
    Info,
    Star,
    Filter,
} from 'lucide-react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    BarChart as RechartsBarChart,
    Bar,
    AreaChart,
    Area,
    Legend,
} from 'recharts';
import { useAttendanceReports } from '@/hooks/use-attendance-reports';
import { useBusinessHours } from '@/hooks/use-organization-settings';
import { useAuthStore } from '@/store/auth-store';
import { axiosInstance } from '@/lib/services/api-client';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import {
    MorningAttendanceReport,
    EveningAttendanceReport,
    OrganizationAttendanceReport,
    AttendanceReportFilters,
} from '@/types/attendance-reports';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface AttendanceReportsDashboardProps {
    className?: string;
}

// Helper function to format date for API calls
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Custom hook for today's attendance data
const useTodayAttendance = () => {
    const { accessToken } = useAuthStore();
    const today = formatDate(new Date());

    return useQuery({
        queryKey: ['todayAttendance', today],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/date/${today}`);
            return response.data;
        },
        enabled: !!accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

// Custom hook for organization report
const useOrganizationReport = (dateRange?: { from: Date; to: Date }) => {
    const { accessToken } = useAuthStore();

    return useQuery({
        queryKey: ['organizationReport', dateRange],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (dateRange) {
                params.append('dateFrom', formatDate(dateRange.from));
                params.append('dateTo', formatDate(dateRange.to));
            }
            const response = await axiosInstance.get(`/att/report?${params.toString()}`);
            return response.data;
        },
        enabled: !!accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

// Custom hook for daily stats
const useDailyStats = (userId?: number, date?: string) => {
    const { accessToken, profileData } = useAuthStore();
    const targetUserId = userId || profileData?.uid;
    const targetDate = date || formatDate(new Date());

    return useQuery({
        queryKey: ['dailyStats', targetUserId, targetDate],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/daily-stats/${targetUserId}?date=${targetDate}`);
            return response.data;
        },
        enabled: !!accessToken && !!targetUserId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

export const AttendanceReportsDashboard: React.FC<AttendanceReportsDashboardProps> = ({
    className = '',
}) => {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
    const [showFilters, setShowFilters] = useState(false);

    const {
        isLoading,
        error,
        lastUpdated,
        currentReport,
        chartData,
        sendMorningReport,
        sendEveningReport,
        requestReport,
        refreshData,
        exportReport,
        setFilters,
    } = useAttendanceReports();

    // Fetch today's attendance data for admin accounts
    const { data: todayAttendance, isLoading: todayLoading } = useTodayAttendance();
    const { data: organizationReport, isLoading: orgLoading } = useOrganizationReport(dateRange);
    const { data: dailyStats, isLoading: dailyStatsLoading } = useDailyStats();

    // Fetch organization hours for dynamic report scheduling
    const { data: organizationHours, isLoading: hoursLoading } = useBusinessHours();

    // Auto-refresh data every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [refreshData]);

    // Helper function to calculate next report times
    const calculateNextReportTime = (type: 'morning' | 'evening') => {
        if (!organizationHours?.schedule) {
            // Fallback to default times if no schedule is available
            return type === 'morning' ? 'Tomorrow at 8:05 AM' : 'Today at 5:30 PM';
        }

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Get current day of week (0 = Sunday, 1 = Monday, etc.)
        const currentDay = today.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDayName = dayNames[currentDay] as keyof typeof organizationHours.schedule;
        const tomorrowDayName = dayNames[(currentDay + 1) % 7] as keyof typeof organizationHours.schedule;

        try {
            if (type === 'morning') {
                // Morning report is sent 5 minutes after opening time
                const tomorrowSchedule = organizationHours.schedule[tomorrowDayName];
                if (tomorrowSchedule && !tomorrowSchedule.closed) {
                    const [hours, minutes] = tomorrowSchedule.start.split(':').map(Number);
                    const reportTime = new Date(tomorrow);
                    reportTime.setHours(hours, minutes + 5, 0, 0);
                    return `Tomorrow at ${reportTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                }
                return 'Next working day at opening + 5 min';
            } else {
                // Evening report is sent 30 minutes after closing time
                const todaySchedule = organizationHours.schedule[currentDayName];
                if (todaySchedule && !todaySchedule.closed) {
                    const [hours, minutes] = todaySchedule.end.split(':').map(Number);
                    const reportTime = new Date(today);
                    reportTime.setHours(hours, minutes + 30, 0, 0);
                    
                    // If the time has already passed today, calculate for tomorrow
                    if (reportTime < new Date()) {
                        const tomorrowSchedule = organizationHours.schedule[tomorrowDayName];
                        if (tomorrowSchedule && !tomorrowSchedule.closed) {
                            const [tomorrowHours, tomorrowMinutes] = tomorrowSchedule.end.split(':').map(Number);
                            const tomorrowReportTime = new Date(tomorrow);
                            tomorrowReportTime.setHours(tomorrowHours, tomorrowMinutes + 30, 0, 0);
                            return `Tomorrow at ${tomorrowReportTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                        }
                        return 'Next working day at closing + 30 min';
                    }
                    
                    return `Today at ${reportTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                }
                return 'Next working day at closing + 30 min';
            }
        } catch (error) {
            console.warn('Error calculating report time:', error);
            return type === 'morning' ? 'Tomorrow at 8:05 AM' : 'Today at 5:30 PM';
        }
    };

    // Helper function to get organization timezone or default
    const getOrganizationTimezone = () => {
        return organizationHours?.timezone || 'UTC';
    };

    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'absent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'late':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'on-break':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const renderSummaryCards = () => {
        // Use today's attendance data for admin accounts
        const summary = currentReport?.summary || {
            totalEmployees: todayAttendance?.analytics?.totalEmployees || 0,
            presentToday: todayAttendance?.analytics?.presentEmployees || 0,
            attendanceRate: todayAttendance?.analytics?.attendanceRate || 0,
            punctualityRate: todayAttendance?.analytics?.punctualityRate || 0,
            lateToday: 0,
            organizationEfficiency: 0,
        };

        return (
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            Active workforce
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <UserCheck className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatPercentage(summary.attendanceRate)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary.presentToday} present today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Punctuality</CardTitle>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatPercentage(summary.punctualityRate)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summary.lateToday} late arrivals
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Work Hours</CardTitle>
                        <Zap className="w-4 h-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {todayAttendance?.analytics?.totalWorkHours || 0}h
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total work hours today
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderAttendanceChart = () => {
        if (!chartData?.attendanceRate && !todayAttendance?.analytics) return null;

        // Use today's attendance data if available
        const data = chartData?.attendanceRate 
            ? chartData.attendanceRate.labels.map((label, index) => ({
                name: label,
                value: chartData.attendanceRate.datasets[0].data[index],
            }))
            : [
                { name: 'Present', value: todayAttendance?.analytics?.presentEmployees || 0 },
                { name: 'Absent', value: (todayAttendance?.analytics?.totalEmployees || 0) - (todayAttendance?.analytics?.presentEmployees || 0) },
            ];

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    };

    const renderBranchComparison = () => {
        // Get branches data based on report type
        let branches: any[] = [];
        
        if (currentReport) {
            if (currentReport.reportType === 'evening') {
                // Evening reports use branchBreakdown instead of branches
                branches = (currentReport as EveningAttendanceReport).branchBreakdown || [];
            } else if (currentReport.reportType === 'morning' || currentReport.reportType === 'organization') {
                // Morning and organization reports use branches
                branches = (currentReport as MorningAttendanceReport | OrganizationAttendanceReport).branches || [];
            }
        } else if (organizationReport?.report?.organizationMetrics?.byBranch) {
            branches = organizationReport.report.organizationMetrics.byBranch;
        }

        if (!branches || branches.length === 0) return null;

        const data = branches.map((branch: any) => ({
            name: branch.name || branch.branchName,
            attendance: branch.attendanceRate,
            punctuality: branch.punctualityRate,
            employees: branch.totalEmployees || branch.employeeCount,
        }));

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Branch Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="attendance" fill="#3B82F6" name="Attendance Rate" />
                            <Bar dataKey="punctuality" fill="#10B981" name="Punctuality Rate" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    };

    const handleMorningReport = async () => {
        try {
            await sendMorningReport();
            showSuccessToast('Morning report request sent successfully', toast);
        } catch (error) {
            showErrorToast('Failed to send morning report', toast);
        }
    };

    const handleEveningReport = async () => {
        try {
            await sendEveningReport();
            showSuccessToast('Evening report request sent successfully', toast);
        } catch (error) {
            showErrorToast('Failed to send evening report', toast);
        }
    };

    const handleRequestReport = async (reportType: 'morning' | 'evening') => {
        try {
            await requestReport(reportType);
            showSuccessToast(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report requested successfully`, toast);
        } catch (error) {
            showErrorToast(`Failed to request ${reportType} report`, toast);
        }
    };

    const renderAutomationControls = () => {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Automated Report Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h4 className="font-semibold">Morning Reports</h4>
                                <p className="text-sm text-muted-foreground">
                                    {organizationHours?.schedule 
                                        ? `Sent automatically 5 minutes after opening time (${getOrganizationTimezone()})`
                                        : 'Sent automatically 5 minutes after organization opening time'
                                    }
                                </p>
                                {organizationHours?.holidayMode && (
                                    <p className="p-2 text-xs text-yellow-600 bg-yellow-50 rounded">
                                        ⚠️ Currently paused due to holiday mode
                                    </p>
                                )}
                                <Button
                                    onClick={handleMorningReport}
                                    disabled={isLoading || organizationHours?.holidayMode}
                                    className="w-full"
                                >
                                    <Mail className="mr-2 w-4 h-4" />
                                    Send Morning Report Now
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-semibold">Evening Reports</h4>
                                <p className="text-sm text-muted-foreground">
                                    {organizationHours?.schedule 
                                        ? `Sent automatically 30 minutes after closing time (${getOrganizationTimezone()})`
                                        : 'Sent automatically 30 minutes after organization closing time'
                                    }
                                </p>
                                {organizationHours?.holidayMode && (
                                    <p className="p-2 text-xs text-yellow-600 bg-yellow-50 rounded">
                                        ⚠️ Currently paused due to holiday mode
                                    </p>
                                )}
                                <Button
                                    onClick={handleEveningReport}
                                    disabled={isLoading || organizationHours?.holidayMode}
                                    className="w-full"
                                >
                                    <Mail className="mr-2 w-4 h-4" />
                                    Send Evening Report Now
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <h4 className="font-semibold">Personal Report Requests</h4>
                            <p className="text-sm text-muted-foreground">
                                Request reports for personal viewing without affecting automated distribution
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleRequestReport('morning')}
                                    disabled={isLoading}
                                >
                                    <Sunrise className="mr-2 w-4 h-4" />
                                    Request Morning Report
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleRequestReport('evening')}
                                    disabled={isLoading}
                                >
                                    <Sunset className="mr-2 w-4 h-4" />
                                    Request Evening Report
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center">
                            Report Schedule & Status
                            {hoursLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        </CardTitle>
                        {organizationHours?.timezone && (
                            <p className="text-xs text-muted-foreground">
                                Timezone: {getOrganizationTimezone()}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {hoursLoading ? (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                                        <div className="mb-2 h-4 bg-gray-200 rounded"></div>
                                        <div className="mb-1 h-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg animate-pulse">
                                        <div className="mb-2 h-4 bg-gray-200 rounded"></div>
                                        <div className="mb-1 h-3 bg-gray-200 rounded"></div>
                                        <div className="h-3 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="flex gap-2 items-center mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="font-medium">Morning Reports</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Status: Active
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Sent: 5 minutes after opening time
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Next: {calculateNextReportTime('morning')}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="flex gap-2 items-center mb-2">
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                            <span className="font-medium">Evening Reports</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Status: Active
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Sent: 30 minutes after closing time
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Next: {calculateNextReportTime('evening')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {organizationHours?.holidayMode && (
                                <Alert className="bg-yellow-50 border-yellow-200">
                                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                                    <AlertDescription className="text-yellow-800">
                                        Holiday mode is active
                                        {organizationHours.holidayUntil && (
                                            <> until {new Date(organizationHours.holidayUntil).toLocaleDateString()}</>
                                        )}
                                        . Reports will be paused during this period.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {organizationHours?.schedule && (
                                <div className="p-3 mt-4 bg-gray-50 rounded-lg">
                                    <h5 className="mb-2 text-sm font-medium">Working Days</h5>
                                    <div className="grid grid-cols-7 gap-1 text-xs">
                                        {/* Fixed order: Sunday to Saturday */}
                                        {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) => {
                                            const schedule = organizationHours.schedule[day as keyof typeof organizationHours.schedule];
                                            return (
                                                <div key={day} className="text-center">
                                                    <div className="mb-1 font-medium capitalize">
                                                        {day.slice(0, 3)}
                                                    </div>
                                                    <div className={`p-1 rounded ${
                                                        schedule.closed 
                                                            ? 'bg-red-100 text-red-600' 
                                                            : 'bg-green-100 text-green-600'
                                                    }`}>
                                                        {schedule.closed ? 'Closed' : `${schedule.start}-${schedule.end}`}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Attendance Reports</h1>
                    <p className="text-muted-foreground">
                        Automated attendance report management and analytics
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="mr-2 w-4 h-4" />
                        Filters
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshData}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportReport('csv')}
                        disabled={!currentReport || isLoading}
                    >
                        <Download className="mr-2 w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {error && (
                <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {lastUpdated && (
                <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(lastUpdated).toLocaleString()}
                </div>
            )}

            {/* Overview Section */}
            <div className="space-y-6">
                {isLoading || todayLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        {renderSummaryCards()}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {renderAttendanceChart()}
                            {renderBranchComparison()}
                        </div>
                    </>
                )}
            </div>

            {/* Automation Controls */}
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-semibold">Automation Controls</h2>
                    </div>
                </div>
                {renderAutomationControls()}
            </div>
        </div>
    );
};

export default AttendanceReportsDashboard;
