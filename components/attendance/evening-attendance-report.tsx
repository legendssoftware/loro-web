'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Loader2,
    RefreshCw,
    Download,
    Users,
    Clock,
    TrendingUp,
    TrendingDown,
    CheckCircle,
    Sunset,
    UserCheck,
    Timer,
    Zap,
    Eye,
    Calendar,
    Building,
    Activity,
    Target,
    Award,
    Star,
    Gauge,
    ArrowUp,
    ArrowDown,
    Minus,
    Coffee,
    BarChart3,
    LineChart,
    PieChart,
    Trophy,
    Briefcase,
    ClipboardCheck,
    TrendingDown as TrendingDownIcon,
    Info,
    AlertCircle,
    CheckCircle2,
    Clock4,
    Calendar as CalendarIcon,
    FileText,
    Settings,
    Mail,
    Send,
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
    Legend,
    AreaChart,
    Area,
    RadialBarChart,
    RadialBar,
} from 'recharts';
import {
    EveningAttendanceReport,
    AttendanceReportUser,
    AttendanceReportBranch,
} from '@/types/attendance-reports';

const PRODUCTIVITY_COLORS = {
    'high': '#10B981',
    'medium': '#F59E0B',
    'low': '#EF4444',
};

const COMPLETION_COLORS = {
    'completed': '#10B981',
    'in-progress': '#3B82F6',
    'pending': '#F59E0B',
    'overdue': '#EF4444',
};

interface EveningAttendanceReportProps {
    report: EveningAttendanceReport;
    isLoading?: boolean;
    onRefresh?: () => void;
    onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
    className?: string;
}

export const EveningAttendanceReportComponent: React.FunctionComponent<EveningAttendanceReportProps> = ({
    report,
    isLoading = false,
    onRefresh,
    onExport,
    className = '',
}) => {
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [showDetails, setShowDetails] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<'productivity' | 'completion' | 'efficiency'>('productivity');

    const formatTime = (timeStr: string | undefined) => {
        if (!timeStr) return 'N/A';
        try {
            const time = new Date(timeStr);
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timeStr;
        }
    };

    const formatHours = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

    const getProductivityColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getProductivityLabel = (score: number) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Improvement';
    };

    const generateCSVData = () => {
        const headers = [
            'Employee Name',
            'Email',
            'Role',
            'Branch',
            'Check In',
            'Check Out',
            'Hours Worked',
            'Status',
            'Yesterday Hours Change',
            'Punctuality Change',
            // Location & Visits
            'Total Visits',
            'Distance Traveled',
            'Average Time Per Location',
            // Leads & Customers
            'New Leads',
            'Lead Conversion Rate',
            'Converted Leads',
            'Client Interactions',
            'New Clients',
            // Tasks & Productivity
            'Tasks Completed',
            'Tasks Overdue',
            'Task Completion Rate',
            'Tasks Created',
            'Due Tomorrow Tasks',
            // Claims & Financial
            'Claims Made',
            'Claims Value',
            'Revenue Generated',
            'Total Quotations',
            'Revenue Per Hour',
            // Rewards & Gamification
            'Daily XP Earned',
            'Current XP',
            'Current Level',
            'Current Rank',
            'Leaderboard Position',
            // Wellness & Performance
            'Wellness Score',
            'Stress Level',
            'Work Life Balance Score',
            'Overtime Days',
            'Average Hours Per Day',
            'Efficiency Score',
            'Overall Performance Score',
            // Targets & Goals
            'Hours Target',
            'Hours Current',
            'Hours Progress',
            'Leads Target',
            'Leads Current',
            'Leads Progress',
            'Sales Target',
            'Sales Current',
            'Sales Progress',
            'Calls Target',
            'Calls Current',
            'Calls Progress',
            // Productivity Insights
            'Productivity Score',
            'Peak Productivity Hour',
            'Average Focus Time',
            'Consistency Score',
            'Preferred Start Time',
            'Preferred End Time',
            // Weekly Comparison
            'Weekly Trend',
            'Weekly Hours Change',
            'Weekly Leads Change',
            'Weekly Revenue Change',
            'Weekly Tasks Change',
            // Journal & Collaboration
            'Journal Entries',
            'Has Journal Entries',
            // Predictions & Insights
            'Target Achievement Probability',
            'Risk Factors Count',
            'Improvement Areas Count'
        ];

        const csvData: Array<Record<string, string | number>> = [];
        report.branchBreakdown.forEach(branch => {
            branch.users.forEach(user => {
                const metrics = user.dailyMetrics;
                csvData.push({
                    'Employee Name': user.fullName || `${user.name} ${user.surname}`,
                    'Email': user.email || 'N/A',
                    'Role': user.role || 'N/A',
                    'Branch': branch.name,
                    'Check In': user.checkInTime ? formatTime(user.checkInTime) : 'N/A',
                    'Check Out': user.checkOutTime ? formatTime(user.checkOutTime) : user.checkInTime ? 'Still Working' : 'N/A',
                    'Hours Worked': user.totalWorkingMinutes ? formatHours(user.totalWorkingMinutes) : '0h',
                    'Status': user.status || 'Unknown',
                    'Yesterday Hours Change': '+0h', // This would come from actual data
                    'Punctuality Change': 'same', // This would come from actual data

                    // Location & Visits - PRIORITIZE ENHANCED CALCULATION
                    'Total Visits': metrics?.location?.totalLocations || 0,
                    'Distance Traveled': (() => {
                        // Priority order: Enhanced tripSummary > gpsData > legacy location fields
                        const tripDistance = user.dailyReport?.gpsData?.tripSummary?.totalDistanceKm;
                        if (tripDistance !== undefined && tripDistance !== null) {
                            return `${tripDistance.toFixed(1)} km`;
                        }
                        const legacyDistance = metrics?.location?.totalDistanceKm || metrics?.location?.totalDistance;
                        if (typeof legacyDistance === 'number') {
                            return `${legacyDistance.toFixed(1)} km`;
                        }
                        if (typeof legacyDistance === 'string') {
                            return legacyDistance.includes('km') ? legacyDistance : `${legacyDistance} km`;
                        }
                        return '0.0 km';
                    })(),
                    'Average Time Per Location': metrics?.location?.trackingData?.averageTimePerLocation || '~',

                    // Leads & Customers
                    'New Leads': metrics?.leads?.newLeadsCount || 0,
                    'Lead Conversion Rate': `${(metrics?.leads?.conversionRate || 0).toFixed(1)}%`,
                    'Converted Leads': metrics?.leads?.convertedCount || 0,
                    'Client Interactions': metrics?.clients?.totalInteractions || 0,
                    'New Clients': metrics?.clients?.newClients || 0,

                    // Tasks & Productivity
                    'Tasks Completed': metrics?.tasks?.completedCount || 0,
                    'Tasks Overdue': metrics?.tasks?.overdueCount || 0,
                    'Task Completion Rate': `${(metrics?.tasks?.completionRate || 0).toFixed(1)}%`,
                    'Tasks Created': metrics?.tasks?.createdCount || 0,
                    'Due Tomorrow Tasks': metrics?.tasks?.dueTomorrowCount || 0,

                    // Claims & Financial
                    'Claims Made': metrics?.claims?.count || 0,
                    'Claims Value': 'R 0', // This would come from actual claims value calculation
                    'Revenue Generated': metrics?.quotations?.totalRevenueFormatted || 'R 0',
                    'Total Quotations': metrics?.quotations?.totalQuotations || 0,
                    'Revenue Per Hour': metrics?.performance?.revenuePerHour ? `R ${metrics.performance.revenuePerHour.toFixed(2)}` : 'R 0.00',

                    // Rewards & Gamification
                    'Daily XP Earned': metrics?.rewards?.dailyXPEarned || 0,
                    'Current XP': metrics?.rewards?.currentXP || 0,
                    'Current Level': metrics?.rewards?.currentLevel || 1,
                    'Current Rank': metrics?.rewards?.currentRank || 'ROOKIE',
                    'Leaderboard Position': metrics?.rewards?.leaderboardPosition || 'N/A',

                    // Wellness & Performance
                    'Wellness Score': `${metrics?.wellness?.wellnessScore || 75}/100`,
                    'Stress Level': (metrics?.wellness?.stressLevel || 'low').toUpperCase(),
                    'Work Life Balance Score': metrics?.wellness?.workLifeBalance?.score || 0,
                    'Overtime Days': metrics?.wellness?.workLifeBalance?.overtimeDays || 0,
                    'Average Hours Per Day': `${(metrics?.wellness?.workLifeBalance?.averageHoursPerDay || 0).toFixed(1)}h`,
                    'Efficiency Score': `${(user.efficiency || 0).toFixed(1)}%`,
                    'Overall Performance Score': `${(metrics?.performance?.overallScore || 0).toFixed(1)}`,

                    // Targets & Goals
                    'Hours Target': metrics?.targets?.hoursTarget?.target || 0,
                    'Hours Current': metrics?.targets?.hoursTarget?.current || 0,
                    'Hours Progress': `${metrics?.targets?.targetProgress?.hours?.progress || 0}%`,
                    'Leads Target': metrics?.targets?.leadsTarget?.target || 0,
                    'Leads Current': metrics?.targets?.leadsTarget?.current || 0,
                    'Leads Progress': `${metrics?.targets?.targetProgress?.leads?.progress || 0}%`,
                    'Sales Target': metrics?.targets?.salesTarget?.targetFormatted || 'R 0',
                    'Sales Current': metrics?.targets?.salesTarget?.formatted || 'R 0',
                    'Sales Progress': `${metrics?.targets?.targetProgress?.sales?.progress || 0}%`,
                    'Calls Target': metrics?.targets?.callsTarget?.target || 0,
                    'Calls Current': metrics?.targets?.callsTarget?.current || 0,
                    'Calls Progress': `${metrics?.targets?.targetProgress?.calls?.progress || 0}%`,

                    // Productivity Insights
                    'Productivity Score': metrics?.productivity?.productivityScore || 0,
                    'Peak Productivity Hour': metrics?.productivity?.peakProductivityHour || 0,
                    'Average Focus Time': metrics?.productivity?.averageFocusTime || '0h',
                    'Consistency Score': metrics?.productivity?.workPatterns?.consistencyScore || 0,
                    'Preferred Start Time': metrics?.productivity?.workPatterns?.preferredStartTime || 9,
                    'Preferred End Time': metrics?.productivity?.workPatterns?.preferredEndTime || 17,

                    // Weekly Comparison
                    'Weekly Trend': metrics?.weeklyComparison?.trend || 'stable',
                    'Weekly Hours Change': metrics?.weeklyComparison?.changes?.hoursWorked || '0%',
                    'Weekly Leads Change': metrics?.weeklyComparison?.changes?.leads || '0%',
                    'Weekly Revenue Change': metrics?.weeklyComparison?.changes?.revenue || '0%',
                    'Weekly Tasks Change': metrics?.weeklyComparison?.changes?.tasksCompleted || '0%',

                    // Journal & Collaboration
                    'Journal Entries': metrics?.journal?.count || 0,
                    'Has Journal Entries': metrics?.journal?.hasEntries ? 'Yes' : 'No',

                    // Predictions & Insights
                    'Target Achievement Probability': `${metrics?.predictions?.targetAchievementProbability || 0}%`,
                    'Risk Factors Count': metrics?.predictions?.riskFactors?.length || 0,
                    'Improvement Areas Count': metrics?.performance?.improvementAreas?.length || 0
                });
            });
        });

        return { headers, data: csvData };
    };

    const handleCSVExport = () => {
        const { headers, data } = generateCSVData();
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `evening-attendance-report-${report.reportDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderEveningOverview = () => {
        const { summary, productivity, completion } = report;

        return (
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Productive Hours</CardTitle>
                        <Clock className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatHours(productivity.totalProductiveHours * 60)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Avg: {formatHours(productivity.averageProductivity * 60)} per employee
                        </p>
                        <Progress
                            value={(productivity.totalProductiveHours / (summary.totalEmployees * 8)) * 100}
                            className="mt-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                        <Zap className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatPercentage(productivity.efficiencyScore)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {getProductivityLabel(productivity.efficiencyScore)}
                        </p>
                        <Progress
                            value={productivity.efficiencyScore}
                            className="mt-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {completion.tasksCompleted}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatPercentage(completion.completionRate)} completion rate
                        </p>
                        <Progress
                            value={completion.completionRate}
                            className="mt-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                        <Timer className="w-4 h-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {formatHours(productivity.overtimeHours * 60)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {((productivity.overtimeHours / summary.totalEmployees) * 100).toFixed(1)}% of workforce
                        </p>
                        <Progress
                            value={(productivity.overtimeHours / (summary.totalEmployees * 2)) * 100}
                            className="mt-2"
                        />
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderProductivityChart = () => {
        const productivityData = report.branchBreakdown.map(branch => ({
            name: branch.name,
            productivity: branch.averageWorkingHours,
            efficiency: (branch.averageWorkingHours / 8) * 100,
            employees: branch.totalEmployees,
        }));

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <BarChart3 className="w-5 h-5" />
                        Branch Productivity Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={productivityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="productivity" fill="#3B82F6" name="Avg Hours Worked" />
                            <Bar dataKey="efficiency" fill="#10B981" name="Efficiency %" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    };

    const renderCompletionMetrics = () => {
        const { completion } = report;

        const completionData = [
            { name: 'Tasks Completed', value: completion.tasksCompleted, color: '#10B981' },
            { name: 'Goals Achieved', value: completion.goalsAchieved, color: '#3B82F6' },
            { name: 'Projects Advanced', value: completion.projectsAdvanced, color: '#F59E0B' },
        ];

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <ClipboardCheck className="w-5 h-5" />
                        Completion Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="space-y-4">
                            {completionData.map((item, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex gap-3 items-center">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold">{item.value}</span>
                                        <span className="ml-2 text-sm text-muted-foreground">
                                            items
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">Overall Completion Rate</span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatPercentage(completion.completionRate)}
                                    </span>
                                </div>
                                <Progress
                                    value={completion.completionRate}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-center items-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <RechartsPieChart>
                                    <Pie
                                        data={completionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {completionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderTopPerformers = () => {
        const topPerformers = report.insights.topPerformers || [];

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Trophy className="w-5 h-5" />
                        Top Performers Today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                            {topPerformers.length > 0 ? (
                                topPerformers.slice(0, 10).map((user, index) => (
                                    <div key={user.uid} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <div className="flex gap-3 items-center">
                                            <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-full">
                                                <span className="text-sm font-bold text-green-600">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.fullName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.branch?.name} • {user.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex gap-1 items-center">
                                                <Star className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-medium">
                                                    {user.efficiency?.toFixed(1) || 'N/A'}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {user.totalWorkingMinutes ? formatHours(user.totalWorkingMinutes) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Users className="mx-auto mb-2 w-12 h-12 opacity-50" />
                                    <p>No performance data available</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };

    const renderNextDayPlanning = () => {
        const { nextDayPlanning } = report;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <CalendarIcon className="w-5 h-5" />
                        Tomorrow's Planning
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex gap-2 items-center mb-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">Expected Attendance</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {nextDayPlanning.expectedAttendance}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                employees expected
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex gap-2 items-center mb-2">
                                <ClipboardCheck className="w-5 h-5 text-green-600" />
                                <span className="font-medium">Planned Tasks</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {nextDayPlanning.plannedTasks}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                tasks scheduled
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex gap-2 items-center mb-2">
                                <Briefcase className="w-5 h-5 text-purple-600" />
                                <span className="font-medium">Resource Allocation</span>
                            </div>
                            <p className="text-sm text-purple-600">
                                {nextDayPlanning.resourceAllocation.length} departments
                            </p>
                            <p className="text-sm text-muted-foreground">
                                resources planned
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-2 text-sm font-semibold">Resource Allocation Details</h4>
                        <div className="space-y-2">
                            {nextDayPlanning.resourceAllocation.map((resource, index) => (
                                <div key={index} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                    <span className="text-sm">{resource}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderTimeDistribution = () => {
        const { summary } = report;

        const timeData = [
            { name: 'Working Hours', value: summary.totalWorkingMinutes / 60, color: '#10B981' },
            { name: 'Break Hours', value: summary.totalBreakMinutes / 60, color: '#F59E0B' },
            { name: 'Overtime Hours', value: report.productivity.overtimeHours, color: '#EF4444' },
        ];

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <PieChart className="w-5 h-5" />
                        Time Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie
                                data={timeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name}: ${value.toFixed(1)}h`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {timeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    };

    const renderRecommendations = () => {
        const { recommendations } = report;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Target className="w-5 h-5" />
                        Evening Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recommendations.immediate.length > 0 && (
                        <div>
                            <h4 className="flex gap-2 items-center mb-2 text-sm font-semibold">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                End-of-Day Actions
                            </h4>
                            <ul className="space-y-1">
                                {recommendations.immediate.map((item, index) => (
                                    <li key={index} className="text-sm text-muted-foreground">
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {recommendations.shortTerm.length > 0 && (
                        <div>
                            <h4 className="flex gap-2 items-center mb-2 text-sm font-semibold">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                Tomorrow's Preparation
                            </h4>
                            <ul className="space-y-1">
                                {recommendations.shortTerm.map((item, index) => (
                                    <li key={index} className="text-sm text-muted-foreground">
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {recommendations.longTerm.length > 0 && (
                        <div>
                            <h4 className="flex gap-2 items-center mb-2 text-sm font-semibold">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Strategic Planning
                            </h4>
                            <ul className="space-y-1">
                                {recommendations.longTerm.map((item, index) => (
                                    <li key={index} className="text-sm text-muted-foreground">
                                        • {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="flex gap-2 items-center text-xl font-bold">
                        <Sunset className="w-6 h-6 text-orange-500" />
                        Evening Attendance Report
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {report.reportDate} • Generated at {formatTime(report.generatedAt)}
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <Eye className="mr-2 w-4 h-4" />
                        {showDetails ? 'Hide' : 'Show'} Details
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCSVExport}
                        disabled={isLoading}
                    >
                        <Download className="mr-2 w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {renderEveningOverview()}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {renderProductivityChart()}
                {renderCompletionMetrics()}
                {renderTopPerformers()}
                {renderNextDayPlanning()}
                {renderTimeDistribution()}
                {renderRecommendations()}
            </div>

            {showDetails && (
                <div className="space-y-8">
                    {/* Individual Employee Detail Cards */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {report.branchBreakdown.map((branch) =>
                            branch.users.map((user) => (
                                <Card key={user.uid} className="shadow-lg hover:shadow-xl transition-shadow">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">
                                                    {user.fullName?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">{user.fullName}</h4>
                                                <p className="text-sm text-muted-foreground">{user.role} • {branch.name}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Attendance Section */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <h5 className="font-semibold text-sm text-blue-600">ATTENDANCE DETAILS</h5>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-6">
                                                <div className="bg-green-50 p-3 rounded-lg">
                                                    <p className="text-xs text-green-700 font-medium">Check In</p>
                                                    <p className="font-semibold text-green-800">
                                                        {user.checkInTime ? formatTime(user.checkInTime) : '--'}
                                                    </p>
                                                </div>
                                                <div className="bg-red-50 p-3 rounded-lg">
                                                    <p className="text-xs text-red-700 font-medium">Check Out</p>
                                                    <p className="font-semibold text-red-800">
                                                        {user.checkOutTime ? formatTime(user.checkOutTime) :
                                                         user.checkInTime ? 'Still Working' : '--'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-xs text-blue-700 font-medium">Total Hours Worked</p>
                                                <p className="font-bold text-blue-800 text-lg">
                                                    {user.totalWorkingMinutes ? formatHours(user.totalWorkingMinutes) : '0h 0m'}
                                                </p>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Leads & Customer Interaction */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Users className="w-4 h-4 text-purple-600" />
                                                <h5 className="font-semibold text-sm text-purple-600">LEADS & CUSTOMERS</h5>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-6">
                                                <div className="bg-purple-50 p-3 rounded-lg">
                                                    <p className="text-xs text-purple-700 font-medium">New Leads</p>
                                                    <p className="font-bold text-purple-800 text-xl">
                                                        {user.dailyMetrics?.leads?.newLeads || 0}
                                                    </p>
                                                    <p className="text-xs text-purple-600">
                                                        {(user.dailyMetrics?.leads?.conversionRate || 0).toFixed(1)}% conversion
                                                    </p>
                                                </div>
                                                <div className="bg-indigo-50 p-3 rounded-lg">
                                                    <p className="text-xs text-indigo-700 font-medium">Client Interactions</p>
                                                    <p className="font-bold text-indigo-800 text-xl">
                                                        {user.dailyMetrics?.clients?.totalInteractions || 0}
                                                    </p>
                                                    <p className="text-xs text-indigo-600">
                                                        {user.dailyMetrics?.clients?.newClients || 0} new clients
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Tasks & Productivity */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ClipboardCheck className="w-4 h-4 text-green-600" />
                                                <h5 className="font-semibold text-sm text-green-600">TASKS & PRODUCTIVITY</h5>
                                            </div>
                                            <div className="space-y-3 pl-6">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <p className="text-xs text-green-700 font-medium">Completed</p>
                                                        <p className="font-bold text-green-800 text-xl">
                                                            {user.dailyMetrics?.tasks?.completedCount || 0}
                                                        </p>
                                                    </div>
                                                    <div className="bg-red-50 p-3 rounded-lg">
                                                        <p className="text-xs text-red-700 font-medium">Overdue</p>
                                                        <p className="font-bold text-red-800 text-xl">
                                                            {user.dailyMetrics?.tasks?.overdueCount || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-xs text-gray-700 font-medium">Completion Rate</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-800 text-lg">
                                                            {(user.dailyMetrics?.tasks?.completionRate || 0).toFixed(1)}%
                                                        </p>
                                                        <Progress
                                                            value={user.dailyMetrics?.tasks?.completionRate || 0}
                                                            className="flex-1 h-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Rewards & Gamification */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Trophy className="w-4 h-4 text-yellow-600" />
                                                <h5 className="font-semibold text-sm text-yellow-600">REWARDS & PROGRESS</h5>
                                            </div>
                                            <div className="space-y-3 pl-6">
                                                <div className="bg-yellow-50 p-3 rounded-lg">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-xs text-yellow-700 font-medium">Daily XP Earned</p>
                                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                                            {user.dailyMetrics?.rewards?.currentRank || 'ROOKIE'}
                                                        </Badge>
                                                    </div>
                                                    <p className="font-bold text-yellow-800 text-2xl">
                                                        {user.dailyMetrics?.rewards?.dailyXPEarned || 0} XP
                                                    </p>
                                                    <p className="text-xs text-yellow-600">
                                                        Level {user.dailyMetrics?.rewards?.currentLevel || 1}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Claims & Revenue */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Activity className="w-4 h-4 text-teal-600" />
                                                <h5 className="font-semibold text-sm text-teal-600">FINANCIAL METRICS</h5>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-6">
                                                <div className="bg-teal-50 p-3 rounded-lg">
                                                    <p className="text-xs text-teal-700 font-medium">Revenue</p>
                                                    <p className="font-bold text-teal-800 text-lg">
                                                        {user.dailyMetrics?.quotations?.totalRevenueFormatted || 'R 0'}
                                                    </p>
                                                    <p className="text-xs text-teal-600">
                                                        {user.dailyMetrics?.quotations?.totalQuotations || 0} quotes
                                                    </p>
                                                </div>
                                                <div className="bg-orange-50 p-3 rounded-lg">
                                                    <p className="text-xs text-orange-700 font-medium">Claims</p>
                                                    <p className="font-bold text-orange-800 text-lg">
                                                        {user.dailyMetrics?.claims?.count || 0}
                                                    </p>
                                                    <p className="text-xs text-orange-600">
                                                        {user.dailyMetrics?.claims?.hasClaims ? 'Active' : 'None'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Wellness & Performance */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Activity className="w-4 h-4 text-pink-600" />
                                                <h5 className="font-semibold text-sm text-pink-600">WELLNESS & EFFICIENCY</h5>
                                            </div>
                                            <div className="space-y-3 pl-6">
                                                <div className="bg-pink-50 p-3 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <p className="text-xs text-pink-700 font-medium">Wellness Score</p>
                                                            <p className="font-bold text-pink-800 text-xl">
                                                                {user.dailyMetrics?.wellness?.wellnessScore || 75}/100
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-pink-700 font-medium">Stress Level</p>
                                                            <Badge
                                                                variant="outline"
                                                                className={`${
                                                                    (user.dailyMetrics?.wellness?.stressLevel || 'low') === 'low'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : (user.dailyMetrics?.wellness?.stressLevel || 'low') === 'medium'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}
                                                            >
                                                                {(user.dailyMetrics?.wellness?.stressLevel || 'low').toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-purple-50 p-3 rounded-lg">
                                                    <p className="text-xs text-purple-700 font-medium">Efficiency Score</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-purple-800 text-xl">
                                                            {user.efficiency?.toFixed(0) || 0}%
                                                        </p>
                                                        <Progress
                                                            value={user.efficiency || 0}
                                                            className="flex-1 h-2"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Location & Travel */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Building className="w-4 h-4 text-emerald-600" />
                                                <h5 className="font-semibold text-sm text-emerald-600">LOCATION & TRAVEL</h5>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pl-6">
                                                <div className="bg-emerald-50 p-3 rounded-lg">
                                                    <p className="text-xs text-emerald-700 font-medium">Visits</p>
                                                    <p className="font-bold text-emerald-800 text-xl">
                                                        {user.dailyMetrics?.location?.totalLocations || 0}
                                                    </p>
                                                </div>
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <p className="text-xs text-blue-700 font-medium">Distance</p>
                                                    <p className="font-bold text-blue-800 text-lg">
                                                        {(() => {
                                                            // Priority order: Enhanced tripSummary > gpsData > legacy location fields
                                                            const tripDistance = user.dailyReport?.gpsData?.tripSummary?.totalDistanceKm;
                                                            if (tripDistance !== undefined && tripDistance !== null) {
                                                                return `${tripDistance.toFixed(1)} km`;
                                                            }
                                                            const legacyDistance = user.dailyMetrics?.location?.totalDistanceKm || user.dailyMetrics?.location?.totalDistance;
                                                            if (typeof legacyDistance === 'number') {
                                                                return `${legacyDistance.toFixed(1)} km`;
                                                            }
                                                            if (typeof legacyDistance === 'string') {
                                                                return legacyDistance.includes('km') ? legacyDistance : `${legacyDistance} km`;
                                                            }
                                                            return '0.0 km';
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Comprehensive Summary Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex gap-2 items-center">
                            <FileText className="w-5 h-5" />
                                Comprehensive Performance Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="px-3 py-3 text-left font-semibold">Employee</th>
                                        <th className="px-3 py-3 text-center font-semibold">Hours</th>
                                        <th className="px-3 py-3 text-center font-semibold">Leads</th>
                                        <th className="px-3 py-3 text-center font-semibold">Tasks</th>
                                        <th className="px-3 py-3 text-center font-semibold">Revenue</th>
                                            <th className="px-3 py-3 text-center font-semibold">XP</th>
                                        <th className="px-3 py-3 text-center font-semibold">Wellness</th>
                                            <th className="px-3 py-3 text-center font-semibold">Efficiency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.branchBreakdown.map((branch) =>
                                        branch.users.map((user) => (
                                                <tr key={`summary-${user.uid}`} className="border-b hover:bg-gray-50">
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-bold text-blue-600">
                                                                {user.fullName?.charAt(0) || 'U'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{user.fullName}</p>
                                                            <p className="text-xs text-muted-foreground">{user.role}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                        <span className="font-semibold">
                                                            {user.totalWorkingMinutes ? formatHours(user.totalWorkingMinutes) : '0h'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                        <span className="font-medium text-purple-600">
                                                            {user.dailyMetrics?.leads?.newLeads || 0}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                        <span className="font-medium text-green-600">
                                                            {user.dailyMetrics?.tasks?.completedCount || 0}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                        <span className="font-medium text-teal-600">
                                                            {user.dailyMetrics?.quotations?.totalRevenueFormatted || 'R 0'}
                                                        </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                        <span className="font-medium text-yellow-600">
                                                            {user.dailyMetrics?.rewards?.dailyXPEarned || 0}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <span className="font-medium text-pink-600">
                                                                {user.dailyMetrics?.wellness?.wellnessScore || 75}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {user.dailyMetrics?.wellness?.stressLevel || 'low'}
                                                            </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                        <span className="font-medium text-blue-600">
                                                            {user.efficiency?.toFixed(0) || 0}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Branch Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex gap-2 items-center">
                                <Building className="w-5 h-5" />
                                Branch Performance Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {report.branchBreakdown.map((branch) => (
                                    <div key={branch.uid} className="p-6 rounded-lg border shadow-sm bg-gradient-to-br from-gray-50 to-white">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-lg">{branch.name}</h4>
                                            <Building className="w-6 h-6 text-gray-500" />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                    <p className="text-xs text-blue-700 font-medium">Present</p>
                                                    <p className="font-bold text-blue-800 text-xl">
                                                        {branch.presentEmployees}
                                                    </p>
                                                </div>
                                                <div className="bg-green-50 p-3 rounded-lg">
                                                    <p className="text-xs text-green-700 font-medium">Avg Hours</p>
                                                    <p className="font-bold text-green-800 text-lg">
                                                        {formatHours(branch.averageWorkingHours * 60)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <p className="text-xs text-purple-700 font-medium">Total Employees</p>
                                                <p className="font-bold text-purple-800 text-xl">
                                                    {branch.totalEmployees}
                                                </p>
                                                <div className="mt-2">
                                                    <Progress
                                                        value={(branch.presentEmployees / branch.totalEmployees) * 100}
                                                        className="h-2"
                                                    />
                                                    <p className="text-xs text-purple-600 mt-1">
                                                        {((branch.presentEmployees / branch.totalEmployees) * 100).toFixed(1)}% attendance
                                                    </p>
                                                </div>
                                            </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                </div>
            )}
        </div>
    );
};

export default EveningAttendanceReportComponent;
