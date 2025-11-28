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
    AlertCircle,
    CheckCircle,
    Sunrise,
    UserCheck,
    UserX,
    Timer,
    Coffee,
    Zap,
    Eye,
    Calendar,
    MapPin,
    Building,
    Activity,
    Target,
    Award,
    Info,
    Star,
    Gauge,
    ArrowUp,
    ArrowDown,
    Minus,
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
    AreaChart,
    Area,
} from 'recharts';
import {
    MorningAttendanceReport,
    AttendanceReportUser,
    AttendanceReportBranch,
} from '@/types/attendance-reports';

const PUNCTUALITY_COLORS = {
    'on-time': '#10B981',
    'late': '#F59E0B',
    'very-late': '#EF4444',
    'extremely-late': '#DC2626',
};

const STATUS_COLORS = {
    'present': '#10B981',
    'absent': '#EF4444',
    'late': '#F59E0B',
    'on-break': '#3B82F6',
};

interface MorningAttendanceReportProps {
    report: MorningAttendanceReport;
    isLoading?: boolean;
    onRefresh?: () => void;
    onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
    className?: string;
}

export const MorningAttendanceReportComponent: React.FunctionComponent<MorningAttendanceReportProps> = ({
    report,
    isLoading = false,
    onRefresh,
    onExport,
    className = '',
}) => {
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [showDetails, setShowDetails] = useState(false);

    const formatTime = (timeStr: string | undefined) => {
        if (!timeStr) return 'N/A';
        try {
            const time = new Date(timeStr);
            return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timeStr;
        }
    };

    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

    const getChangeIndicator = (current: number, previous: number) => {
        const change = current - previous;
        if (change > 0) {
            return (
                <span className="flex items-center text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {change.toFixed(1)}%
                </span>
            );
        } else if (change < 0) {
            return (
                <span className="flex items-center text-red-600">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    {Math.abs(change).toFixed(1)}%
                </span>
            );
        }
        return (
            <span className="flex items-center text-gray-600">
                <Minus className="h-3 w-3 mr-1" />
                0%
            </span>
        );
    };

    const getLateStatusColor = (lateStatus: string) => {
        switch (lateStatus) {
            case 'on-time':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'late':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'very-late':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'extremely-late':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const renderMorningOverview = () => {
        const { summary, comparisons } = report;
        
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {summary.presentToday}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>of {summary.totalEmployees} employees</span>
                            {getChangeIndicator(summary.attendanceRate, comparisons.yesterdayAttendanceRate)}
                        </div>
                        <Progress 
                            value={summary.attendanceRate} 
                            className="mt-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Punctuality Rate</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {formatPercentage(summary.punctualityRate)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{summary.lateToday} late arrivals</span>
                            {getChangeIndicator(summary.punctualityRate, comparisons.yesterdayPunctualityRate)}
                        </div>
                        <Progress 
                            value={summary.punctualityRate} 
                            className="mt-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
                        <UserX className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {summary.absentToday}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>employees absent</span>
                            <span className="text-red-600">
                                {formatPercentage(100 - summary.attendanceRate)}
                            </span>
                        </div>
                        <Progress 
                            value={100 - summary.attendanceRate} 
                            className="mt-2"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                        <Zap className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatPercentage(summary.organizationEfficiency)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>organization efficiency</span>
                            <span className="text-purple-600">
                                {summary.organizationEfficiency >= 80 ? 'Excellent' : 
                                 summary.organizationEfficiency >= 60 ? 'Good' : 'Needs Improvement'}
                            </span>
                        </div>
                        <Progress 
                            value={summary.organizationEfficiency} 
                            className="mt-2"
                        />
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderPunctualityBreakdown = () => {
        const punctualityData = report.branches.reduce((acc, branch) => {
            branch.users.forEach(user => {
                const status = user.lateStatus || 'on-time';
                acc[status] = (acc[status] || 0) + 1;
            });
            return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(punctualityData).map(([status, count]) => ({
            name: status.replace('-', ' ').toUpperCase(),
            value: count,
            color: PUNCTUALITY_COLORS[status as keyof typeof PUNCTUALITY_COLORS] || '#8B5CF6',
        }));

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        Punctuality Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            {chartData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold">{item.value}</span>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({((item.value / report.summary.totalEmployees) * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderBranchPerformance = () => {
        const branchData = report.branches.map(branch => ({
            name: branch.name,
            attendance: branch.attendanceRate,
            punctuality: branch.punctualityRate,
            present: branch.presentEmployees,
            total: branch.totalEmployees,
            late: branch.lateEmployees,
        }));

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Branch Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={branchData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="attendance" fill="#3B82F6" name="Attendance Rate" />
                            <Bar dataKey="punctuality" fill="#10B981" name="Punctuality Rate" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        );
    };

    const renderTopPerformers = () => {
        const topPerformers = report.insights.topPerformers || [];
        
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Top Performers Today
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                            {topPerformers.length > 0 ? (
                                topPerformers.slice(0, 10).map((user, index) => (
                                    <div key={user.uid} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
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
                                            <Badge 
                                                variant="outline" 
                                                className={getLateStatusColor(user.lateStatus || 'on-time')}
                                            >
                                                {user.lateStatus?.replace('-', ' ').toUpperCase() || 'ON TIME'}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatTime(user.checkInTime)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No performance data available</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };

    const renderConcerningUsers = () => {
        const concerningUsers = report.insights.concerningUsers || [];
        
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        Needs Attention
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                            {concerningUsers.length > 0 ? (
                                concerningUsers.slice(0, 10).map((user, index) => (
                                    <div key={user.uid} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.fullName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.branch?.name} • {user.role}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge 
                                                variant="outline" 
                                                className={getLateStatusColor(user.lateStatus || 'absent')}
                                            >
                                                {user.attendanceStatus?.toUpperCase() || 'ABSENT'}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {user.lateMinutes ? `${user.lateMinutes} min late` : 'Not checked in'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50 text-green-500" />
                                    <p>No concerning attendance issues</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };

    const renderAlerts = () => {
        if (!report.alerts) return null;

        const { alerts } = report;
        const hasAlerts = alerts.critical.length > 0 || alerts.warning.length > 0 || alerts.info.length > 0;

        if (!hasAlerts) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        Morning Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {alerts.critical.map((alert, index) => (
                        <Alert key={index} className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-700">
                                {alert}
                            </AlertDescription>
                        </Alert>
                    ))}
                    {alerts.warning.map((alert, index) => (
                        <Alert key={index} className="border-yellow-200 bg-yellow-50">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-700">
                                {alert}
                            </AlertDescription>
                        </Alert>
                    ))}
                    {alerts.info.map((alert, index) => (
                        <Alert key={index} className="border-blue-200 bg-blue-50">
                            <Info className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-700">
                                {alert}
                            </AlertDescription>
                        </Alert>
                    ))}
                </CardContent>
            </Card>
        );
    };

    const renderRecommendations = () => {
        const { recommendations } = report;
        
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Morning Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recommendations.immediate.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                Immediate Actions
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
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                Today's Focus
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
                </CardContent>
            </Card>
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Sunrise className="h-6 w-6 text-orange-500" />
                        Morning Attendance Report
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {report.reportDate} • Generated at {formatTime(report.generatedAt)}
                    </p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        <Eye className="h-4 w-4 mr-2" />
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
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {renderAlerts()}
            {renderMorningOverview()}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderPunctualityBreakdown()}
                {renderBranchPerformance()}
                {renderTopPerformers()}
                {renderConcerningUsers()}
                {renderRecommendations()}
            </div>

            {showDetails && (
                <Card>
                    <CardHeader>
                        <CardTitle>Detailed Branch Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {report.branches.map((branch) => (
                                <div key={branch.uid} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">{branch.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {branch.presentEmployees}/{branch.totalEmployees}
                                            </Badge>
                                            <Badge variant="outline">
                                                {formatPercentage(branch.attendanceRate)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {branch.users.map((user) => (
                                            <div key={user.uid} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="font-medium text-sm">{user.fullName}</p>
                                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                                </div>
                                                <div className="text-right">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={getLateStatusColor(user.lateStatus || 'absent')}
                                                    >
                                                        {user.attendanceStatus?.toUpperCase() || 'ABSENT'}
                                                    </Badge>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTime(user.checkInTime)}
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

export default MorningAttendanceReportComponent; 