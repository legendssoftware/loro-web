import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Loader2,
    Clock,
    CalendarDays,
    Timer,
    Zap,
    TrendingUp,
    CheckCircle,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    BarChart3,
    Activity,
    Target,
    Award,
    Calendar,
    Coffee,
    MapPin,
    Sunrise,
    Sunset,
    Users,
    Eye,
    EyeOff,
    Gauge,
    Star,
    AlertTriangle,
    ChevronRight,
    Info
} from 'lucide-react';
import { TabProps } from './rewards-tab';

export const AttendanceTab: React.FC<TabProps> = ({
    profileData,
    targetsData,
    attendanceData,
    isTargetsLoading,
    isAttendanceLoading,
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [activeView, setActiveView] = useState('overview');

    // Helper functions
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    const formatTime = (timeStr: string | null | undefined) => {
        if (!timeStr || timeStr === 'N/A') return 'N/A';
        return timeStr;
    };

    const formatDaysAgo = (days: number | null) => {
        if (days === null) return 'N/A';
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    const formatMinutes = (minutes: number) => {
        if (minutes === 0) return '0m';
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours === 0) return `${remainingMinutes}m`;
        if (remainingMinutes === 0) return `${hours}h`;
        return `${hours}h ${remainingMinutes}m`;
    };

    const getPerformanceColor = (value: number, target: number) => {
        const percentage = (value / target) * 100;
        if (percentage >= 100) return 'text-green-600 dark:text-green-400';
        if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getProgressColor = (value: number, target: number) => {
        const percentage = (value / target) * 100;
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const calculateEfficiencyScore = (worked: number, breaks: number) => {
        if (worked === 0) return 0;
        const efficiency = ((worked - breaks) / worked) * 100;
        return Math.max(0, Math.min(100, efficiency));
    };

    const getAttendanceGrade = (score: number) => {
        if (score >= 95) return { grade: 'A+', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' };
        if (score >= 90) return { grade: 'A', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' };
        if (score >= 85) return { grade: 'B+', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' };
        if (score >= 80) return { grade: 'B', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' };
        if (score >= 75) return { grade: 'C+', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' };
        if (score >= 70) return { grade: 'C', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10' };
        return { grade: 'D', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' };
    };

    if (isAttendanceLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="py-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-[10px] text-muted-foreground font-body uppercase">
                                Loading attendance data...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!attendanceData) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-muted-foreground" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                No Attendance Data
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-muted-foreground font-body uppercase">
                            No attendance data available for this user.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const metrics = attendanceData;
    const attendanceGrade = getAttendanceGrade(metrics.timingPatterns.punctualityScore || 0);

    return (
        <div className="space-y-6">
            {/* Performance Dashboard */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Performance Dashboard
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full ${attendanceGrade.bg}`}>
                                <span className={`text-sm font-bold ${attendanceGrade.color} font-body`}>
                                    {attendanceGrade.grade}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDetails(!showDetails)}
                                className="text-xs uppercase font-body"
                            >
                                {showDetails ? (
                                    <><EyeOff className="w-3 h-3 mr-1" strokeWidth={1.5} /> Hide Details</>
                                ) : (
                                    <><Eye className="w-3 h-3 mr-1" strokeWidth={1.5} /> Show Details</>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="relative flex flex-col items-center p-4 overflow-hidden border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 dark:border-green-500/20">
                            <div className="absolute top-2 right-2">
                                <Star className="w-4 h-4 text-green-400" />
                            </div>
                            <CheckCircle className="w-6 h-6 mb-2 text-green-500 dark:text-green-400" />
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Total Days</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400 font-body">
                                {metrics.totalShifts.allTime || 0}
                            </p>
                            <p className="text-[8px] text-green-600/70 dark:text-green-400/70 font-body">
                                +{metrics.totalShifts.thisWeek || 0} this week
                            </p>
                        </div>
                        <div className="relative flex flex-col items-center p-4 overflow-hidden border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 dark:border-blue-500/20">
                            <div className="absolute top-2 right-2">
                                <Gauge className="w-4 h-4 text-blue-400" />
                            </div>
                            <Clock className="w-6 h-6 mb-2 text-blue-500 dark:text-blue-400" />
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Total Hours</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 font-body">
                                {metrics.totalHours.allTime || 0}h
                            </p>
                            <p className="text-[8px] text-blue-600/70 dark:text-blue-400/70 font-body">
                                {(metrics.averageHoursPerDay || 0).toFixed(1)}h avg/day
                            </p>
                        </div>
                        <div className="relative flex flex-col items-center p-4 overflow-hidden border border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 dark:border-purple-500/20">
                            <div className="absolute top-2 right-2">
                                <Target className="w-4 h-4 text-purple-400" />
                            </div>
                            <Target className="w-6 h-6 mb-2 text-purple-500 dark:text-purple-400" />
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Efficiency</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400 font-body">
                                {calculateEfficiencyScore(
                                    metrics.totalHours.allTime || 0,
                                    Math.round((metrics.breakAnalytics?.totalBreakTime?.allTime || 0) / 60)
                                ).toFixed(0)}%
                            </p>
                            <p className="text-[8px] text-purple-600/70 dark:text-purple-400/70 font-body">
                                {metrics.productivityInsights.workEfficiencyScore || 0}% work score
                            </p>
                        </div>
                        <div className="relative flex flex-col items-center p-4 overflow-hidden border rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/20">
                            <div className="absolute top-2 right-2">
                                <Award className="w-4 h-4 text-amber-400" />
                            </div>
                            <Award className="w-6 h-6 mb-2 text-amber-500 dark:text-amber-400" />
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Punctuality</p>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-body">
                                {metrics.timingPatterns.punctualityScore || 0}%
                            </p>
                            <p className="text-[8px] text-amber-600/70 dark:text-amber-400/70 font-body">
                                {metrics.productivityInsights.lateArrivalsCount || 0} late arrivals
                            </p>
                        </div>
                    </div>

                    {/* Performance Trends */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="p-4 border rounded-lg bg-card">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-medium uppercase text-foreground font-body">This Week Progress</h4>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {metrics.totalHours.thisWeek || 0}h / 40h
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-body">Weekly Target</span>
                                    <div className="flex items-center gap-1">
                                        <span className={`font-medium ${getPerformanceColor(metrics.totalHours.thisWeek || 0, 40)} font-body`}>
                                            {Math.round(((metrics.totalHours.thisWeek || 0) / 40) * 100)}%
                                        </span>
                                        {((metrics.totalHours.thisWeek || 0) / 40) >= 1 ? (
                                            <ArrowUp className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <ArrowDown className="w-3 h-3 text-red-500" />
                                        )}
                                    </div>
                                </div>
                                <Progress
                                    value={Math.min(100, ((metrics.totalHours.thisWeek || 0) / 40) * 100)}
                                    className="h-2"
                                />
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>{metrics.totalShifts.thisWeek || 0} days worked</span>
                                    <span>{40 - (metrics.totalHours.thisWeek || 0)}h remaining</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg bg-card">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-medium uppercase text-foreground font-body">Monthly Progress</h4>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {metrics.totalHours.thisMonth || 0}h / 160h
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground font-body">Monthly Target</span>
                                    <div className="flex items-center gap-1">
                                        <span className={`font-medium ${getPerformanceColor(metrics.totalHours.thisMonth || 0, 160)} font-body`}>
                                            {Math.round(((metrics.totalHours.thisMonth || 0) / 160) * 100)}%
                                        </span>
                                        {((metrics.totalHours.thisMonth || 0) / 160) >= 0.8 ? (
                                            <ArrowUp className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <ArrowDown className="w-3 h-3 text-yellow-500" />
                                        )}
                                    </div>
                                </div>
                                <Progress
                                    value={Math.min(100, ((metrics.totalHours.thisMonth || 0) / 160) * 100)}
                                    className="h-2"
                                />
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>{metrics.totalShifts.thisMonth || 0} days worked</span>
                                    <span>{160 - (metrics.totalHours.thisMonth || 0)}h remaining</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showDetails && (
                        <div className="pt-4 border-t">
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <div className="p-3 text-center rounded-lg bg-muted/50">
                                    <div className="text-sm font-bold text-foreground font-body">
                                        {metrics.productivityInsights.shiftCompletionRate || 0}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Completion Rate</div>
                                </div>
                                <div className="p-3 text-center rounded-lg bg-muted/50">
                                    <div className="text-sm font-bold text-foreground font-body">
                                        {metrics.timingPatterns.overtimeFrequency || 0}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Overtime Freq</div>
                                </div>
                                <div className="p-3 text-center rounded-lg bg-muted/50">
                                    <div className="text-sm font-bold text-foreground font-body">
                                        {metrics.productivityInsights.earlyDeparturesCount || 0}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Early Exits</div>
                                </div>
                                <div className="p-3 text-center rounded-lg bg-muted/50">
                                    <div className="text-sm font-bold text-foreground font-body">
                                        {formatMinutes(metrics.breakAnalytics.averageBreakDuration || 0)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Avg Break</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Analytics */}
            <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="text-xs font-body">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="timing" className="text-xs font-body">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Timing</span>
                    </TabsTrigger>
                    <TabsTrigger value="breaks" className="text-xs font-body">
                        <Coffee className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Breaks</span>
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="text-xs font-body">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Insights</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-4">
                    {/* First & Last Attendance */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                                <CardTitle className="text-sm font-normal uppercase font-body">
                                    Attendance Timeline
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* First Attendance */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Sunrise className="w-4 h-4 text-orange-500" />
                                        <h4 className="text-[10px] font-medium text-muted-foreground uppercase font-body">
                                            Journey Started
                                        </h4>
                                    </div>
                                    <div className="relative p-4 border border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/10 dark:border-orange-500/20">
                                        <div className="absolute top-2 right-2">
                                            <Info className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-lg font-bold text-orange-800 dark:text-orange-300 font-body">
                                                {formatDate(metrics.firstAttendance.date)}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-orange-600" />
                                                    <p className="text-[10px] text-orange-700 dark:text-orange-400 font-body uppercase">
                                                        First Check-in: {formatTime(metrics.firstAttendance.checkInTime)}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-800 dark:bg-orange-500/10 dark:text-orange-400">
                                                    {formatDaysAgo(metrics.firstAttendance.daysAgo)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Attendance */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Sunset className="w-4 h-4 text-blue-500" />
                                        <h4 className="text-[10px] font-medium text-muted-foreground uppercase font-body">
                                            Most Recent Day
                                        </h4>
                                    </div>
                                    <div className="relative p-4 border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 dark:border-blue-500/20">
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-lg font-bold text-blue-800 dark:text-blue-300 font-body">
                                                {formatDate(metrics.lastAttendance.date)}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-blue-600" />
                                                    <p className="text-[10px] text-blue-700 dark:text-blue-400 font-body uppercase">
                                                        In: {formatTime(metrics.lastAttendance.checkInTime)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3 h-3 text-blue-600" />
                                                    <p className="text-[10px] text-blue-700 dark:text-blue-400 font-body uppercase">
                                                        Out: {formatTime(metrics.lastAttendance.checkOutTime)}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400">
                                                    {formatDaysAgo(metrics.lastAttendance.daysAgo)}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Working Hours Breakdown */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                <CardTitle className="text-sm font-normal uppercase font-body">
                                    Working Hours Analysis
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {[
                                    { label: 'Today', value: metrics.totalHours.today || 0, icon: Calendar, color: 'emerald' },
                                    { label: 'This Week', value: metrics.totalHours.thisWeek || 0, icon: CalendarDays, color: 'blue' },
                                    { label: 'This Month', value: metrics.totalHours.thisMonth || 0, icon: BarChart3, color: 'purple' },
                                    { label: 'All Time', value: metrics.totalHours.allTime || 0, icon: Activity, color: 'amber' }
                                ].map((item, index) => (
                                    <div key={index} className={`text-center p-4 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-500/10 border border-${item.color}-200 dark:border-${item.color}-500/20`}>
                                        <item.icon className={`w-5 h-5 text-${item.color}-500 dark:text-${item.color}-400 mx-auto mb-2`} />
                                        <div className={`text-2xl font-bold text-${item.color}-600 dark:text-${item.color}-400 font-body`}>
                                            {item.value}h
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-body uppercase">{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timing" className="mt-6 space-y-4">
                    {/* Timing Patterns */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                                <CardTitle className="text-sm font-normal uppercase font-body">
                                    Daily Timing Patterns
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="p-6 text-center border border-indigo-200 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 dark:border-indigo-500/20">
                                    <Sunrise className="w-8 h-8 mx-auto mb-3 text-indigo-500" />
                                    <div className="text-xl font-bold text-indigo-800 dark:text-indigo-300 font-body">
                                        {formatTime(metrics.timingPatterns.averageCheckInTime)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Average Check-in</div>
                                </div>
                                <div className="p-6 text-center border border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 dark:border-orange-500/20">
                                    <Sunset className="w-8 h-8 mx-auto mb-3 text-orange-500" />
                                    <div className="text-xl font-bold text-orange-800 dark:text-orange-300 font-body">
                                        {formatTime(metrics.timingPatterns.averageCheckOutTime)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Average Check-out</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 text-center rounded-lg bg-muted/50">
                                    <div className={`text-lg font-bold ${getPerformanceColor(metrics.timingPatterns.punctualityScore || 0, 90)} font-body`}>
                                        {metrics.timingPatterns.punctualityScore || 0}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Punctuality Score</div>
                                </div>
                                <div className="p-4 text-center rounded-lg bg-muted/50">
                                    <div className={`text-lg font-bold ${getPerformanceColor(100 - (metrics.timingPatterns.overtimeFrequency || 0), 80)} font-body`}>
                                        {metrics.timingPatterns.overtimeFrequency || 0}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Overtime Frequency</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="breaks" className="mt-6 space-y-4">
                    {/* Break Analytics */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Coffee className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                <CardTitle className="text-sm font-normal uppercase font-body">
                                    Break Time Analysis
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Break Time Breakdown */}
                            <div>
                                <h4 className="text-[10px] font-medium text-muted-foreground uppercase font-body mb-4">
                                    Total Break Time Distribution
                                </h4>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    {[
                                        { label: 'Today', value: metrics.breakAnalytics.totalBreakTime.today || 0, color: 'emerald' },
                                        { label: 'This Week', value: metrics.breakAnalytics.totalBreakTime.thisWeek || 0, color: 'blue' },
                                        { label: 'This Month', value: metrics.breakAnalytics.totalBreakTime.thisMonth || 0, color: 'purple' },
                                        { label: 'All Time', value: metrics.breakAnalytics.totalBreakTime.allTime || 0, color: 'amber' }
                                    ].map((item, index) => (
                                        <div key={index} className={`text-center p-4 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-500/10 border border-${item.color}-200 dark:border-${item.color}-500/20`}>
                                            <div className={`text-lg font-bold text-${item.color}-600 dark:text-${item.color}-400 font-body`}>
                                                {formatMinutes(item.value)}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-body uppercase">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Break Patterns */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="p-4 text-center border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 dark:border-green-500/20">
                                    <Timer className="w-5 h-5 mx-auto mb-2 text-green-500" />
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400 font-body">
                                        {formatMinutes(metrics.breakAnalytics.averageBreakDuration || 0)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Avg Duration</div>
                                </div>
                                <div className="p-4 text-center border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 dark:border-blue-500/20">
                                    <Users className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400 font-body">
                                        {metrics.breakAnalytics.breakFrequency?.toFixed(1) || '0.0'}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Per Shift</div>
                                </div>
                                <div className="p-4 text-center border border-orange-200 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 dark:border-orange-500/20">
                                    <ArrowUp className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400 font-body">
                                        {formatMinutes(metrics.breakAnalytics.longestBreak || 0)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Longest</div>
                                </div>
                                <div className="p-4 text-center border border-purple-200 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 dark:border-purple-500/20">
                                    <ArrowDown className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400 font-body">
                                        {formatMinutes(metrics.breakAnalytics.shortestBreak || 0)}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Shortest</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="mt-6 space-y-4">
                    {/* Productivity Insights */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-red-500 dark:text-red-400" />
                                <CardTitle className="text-sm font-normal uppercase font-body">
                                    Performance Insights
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="p-6 text-center border border-green-200 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 dark:border-green-500/20">
                                    <Gauge className="w-8 h-8 mx-auto mb-3 text-green-500" />
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-body">
                                        {metrics.productivityInsights.workEfficiencyScore || 0}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Work Efficiency</div>
                                </div>
                                <div className="p-6 text-center border border-blue-200 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 dark:border-blue-500/20">
                                    <CheckCircle className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-body">
                                        {metrics.productivityInsights.shiftCompletionRate || 0}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Shift Completion</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 text-center border border-red-200 rounded-lg bg-red-50 dark:bg-red-500/10 dark:border-red-500/20">
                                    <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-red-500" />
                                    <div className="text-lg font-bold text-red-600 dark:text-red-400 font-body">
                                        {metrics.productivityInsights.lateArrivalsCount || 0}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Late Arrivals</div>
                                </div>
                                <div className="p-4 text-center border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-500/10 dark:border-orange-500/20">
                                    <ChevronRight className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400 font-body">
                                        {metrics.productivityInsights.earlyDeparturesCount || 0}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Early Departures</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Stats */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-green-500 dark:text-green-400" />
                                <CardTitle className="text-sm font-normal uppercase font-body">
                                    Performance Metrics
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 text-center border rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 border-emerald-200 dark:border-emerald-500/20">
                                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-body">
                                        {metrics.averageHoursPerDay?.toFixed(1) || '0.0'}h
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Avg Hours/Day</div>
                                </div>
                                <div className="p-4 text-center border rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 border-violet-200 dark:border-violet-500/20">
                                    <div className="text-lg font-bold text-violet-600 dark:text-violet-400 font-body">
                                        {metrics.timingPatterns?.punctualityScore?.toFixed(0) || '0'}%
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">Consistency</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
