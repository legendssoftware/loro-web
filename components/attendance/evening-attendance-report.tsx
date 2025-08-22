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

export const EveningAttendanceReportComponent: React.FC<EveningAttendanceReportProps> = ({
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
                        onClick={() => onExport?.('csv')}
                        disabled={isLoading}
                    >
                        <Download className="mr-2 w-4 h-4" />
                        Export
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
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {report.branchBreakdown.map((branch) => (
                                <div key={branch.uid} className="p-4 rounded-lg border">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold">{branch.name}</h4>
                                        <div className="flex gap-2 items-center">
                                            <Badge variant="secondary">
                                                {branch.presentEmployees} employees
                                            </Badge>
                                            <Badge variant="outline">
                                                {formatHours(branch.averageWorkingHours * 60)} avg
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                        {branch.users.map((user) => (
                                            <div key={user.uid} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="text-sm font-medium">{user.fullName}</p>
                                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {user.totalWorkingMinutes ? formatHours(user.totalWorkingMinutes) : 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {user.efficiency?.toFixed(1) || 'N/A'}% efficiency
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EveningAttendanceReportComponent;
