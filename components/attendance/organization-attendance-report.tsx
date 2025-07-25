'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    RefreshCw,
    Download,
    Users,
    Clock,
    TrendingUp,
    TrendingDown,
    Building,
    Calendar,
    BarChart3,
    LineChart,
    PieChart,
    Activity,
    Target,
    Award,
    Star,
    Eye,
    Filter,
    ArrowUp,
    ArrowDown,
    Minus,
    Zap,
    Timer,
    CheckCircle,
    AlertCircle,
    Info,
    MapPin,
    Briefcase,
    Trophy,
    ClipboardCheck,
    Calendar as CalendarIcon,
    FileText,
    Settings,
    Coffee,
    Sunrise,
    Sunset,
    UserCheck,
    UserX,
    Gauge,
    BarChart2,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
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
    ComposedChart,
    ReferenceLine,
    ScatterChart,
    Scatter,
    RadialBarChart,
    RadialBar,
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import {
    OrganizationAttendanceReport,
    AttendanceReportUser,
    AttendanceReportBranch,
} from '@/types/attendance-reports';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface OrganizationAttendanceReportProps {
    report: OrganizationAttendanceReport;
    isLoading?: boolean;
    onRefresh?: () => void;
    onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
    onDateRangeChange?: (start: string, end: string) => void;
    className?: string;
}

export const OrganizationAttendanceReportComponent: React.FC<OrganizationAttendanceReportProps> = ({
    report,
    isLoading = false,
    onRefresh,
    onExport,
    onDateRangeChange,
    className = '',
}) => {
    const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'branches' | 'analytics'>('overview');
    const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [selectedBranch, setSelectedBranch] = useState<string>('all');
    const [showDetails, setShowDetails] = useState(false);

    const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
    const formatDate = (dateStr: string) => format(new Date(dateStr), 'MMM dd');
    const formatMonth = (dateStr: string) => format(new Date(dateStr), 'MMM yyyy');

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

    const renderOrganizationOverview = () => {
        const { summary, organization } = report;
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{organization.totalEmployees}</div>
                            <p className="text-xs text-muted-foreground">
                                Across {organization.totalBranches} branches
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {formatPercentage(summary.attendanceRate)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {summary.presentToday} present today
                            </p>
                            <Progress value={summary.attendanceRate} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Punctuality</CardTitle>
                            <Clock className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatPercentage(summary.punctualityRate)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {summary.lateToday} late today
                            </p>
                            <Progress value={summary.punctualityRate} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                            <Zap className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">
                                {formatPercentage(summary.organizationEfficiency)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Organization efficiency
                            </p>
                            <Progress value={summary.organizationEfficiency} className="mt-2" />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Branch Performance Comparison
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart data={report.branches.map(branch => ({
                                    name: branch.name,
                                    attendance: branch.attendanceRate,
                                    punctuality: branch.punctualityRate,
                                    employees: branch.totalEmployees,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="attendance" fill="#3B82F6" name="Attendance %" />
                                    <Bar dataKey="punctuality" fill="#10B981" name="Punctuality %" />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5" />
                                Status Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsPieChart>
                                    <Pie
                                        data={[
                                            { name: 'Present', value: summary.presentToday, color: '#10B981' },
                                            { name: 'Absent', value: summary.absentToday, color: '#EF4444' },
                                            { name: 'Late', value: summary.lateToday, color: '#F59E0B' },
                                            { name: 'On Break', value: summary.onBreak, color: '#3B82F6' },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {[{ color: '#10B981' }, { color: '#EF4444' }, { color: '#F59E0B' }, { color: '#3B82F6' }].map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const renderTrendsAnalysis = () => {
        const trendsData = report.trends[selectedPeriod];
        
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'daily' | 'weekly' | 'monthly')}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily Trends</SelectItem>
                            <SelectItem value="weekly">Weekly Trends</SelectItem>
                            <SelectItem value="monthly">Monthly Trends</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Attendance & Punctuality Trends
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <RechartsLineChart data={trendsData.map(item => ({
                                ...item,
                                date: selectedPeriod === 'daily' ? formatDate(item.date || item.week || item.month) :
                                      selectedPeriod === 'weekly' ? item.week :
                                      formatMonth(item.month),
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="attendanceRate" stroke="#3B82F6" strokeWidth={2} name="Attendance Rate" />
                                <Line type="monotone" dataKey="punctualityRate" stroke="#10B981" strokeWidth={2} name="Punctuality Rate" />
                                <Line type="monotone" dataKey="productivity" stroke="#F59E0B" strokeWidth={2} name="Productivity" />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Performance Metrics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={trendsData.map(item => ({
                                    ...item,
                                    date: selectedPeriod === 'daily' ? formatDate(item.date || item.week || item.month) :
                                          selectedPeriod === 'weekly' ? item.week :
                                          formatMonth(item.month),
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="productivity" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Key Performance Indicators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUpIcon className="h-4 w-4 text-green-600" />
                                    <span className="font-medium">Peak Attendance</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">
                                        {Math.max(...trendsData.map(d => d.attendanceRate)).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Best day: {report.analytics.peakAttendanceDays[0] || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingDownIcon className="h-4 w-4 text-red-600" />
                                    <span className="font-medium">Lowest Attendance</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-600">
                                        {Math.min(...trendsData.map(d => d.attendanceRate)).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Concerning day: {report.analytics.lowAttendanceDays[0] || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">Avg Productivity</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-blue-600">
                                        {(trendsData.reduce((sum, d) => sum + d.productivity, 0) / trendsData.length).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Correlation: {report.analytics.productivityCorrelation.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    const renderBranchAnalysis = () => {
        const branchData = report.branches.map(branch => ({
            ...branch,
            efficiency: (branch.attendanceRate * branch.punctualityRate) / 100,
            performance: (branch.attendanceRate + branch.punctualityRate) / 2,
        }));

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {branchData.map((branch, index) => (
                        <Card key={branch.uid} className="relative">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    {branch.name}
                                </CardTitle>
                                <div className="absolute top-4 right-4">
                                    <Badge variant={branch.performance >= 90 ? "default" : branch.performance >= 75 ? "secondary" : "destructive"}>
                                        {branch.performance >= 90 ? "Excellent" : branch.performance >= 75 ? "Good" : "Needs Improvement"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Attendance Rate</span>
                                        <span className="text-sm font-bold">{formatPercentage(branch.attendanceRate)}</span>
                                    </div>
                                    <Progress value={branch.attendanceRate} className="h-2" />
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Punctuality Rate</span>
                                        <span className="text-sm font-bold">{formatPercentage(branch.punctualityRate)}</span>
                                    </div>
                                    <Progress value={branch.punctualityRate} className="h-2" />
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Efficiency Score</span>
                                        <span className="text-sm font-bold">{formatPercentage(branch.efficiency)}</span>
                                    </div>
                                    <Progress value={branch.efficiency} className="h-2" />
                                    
                                    <Separator />
                                    
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-lg font-bold text-green-600">{branch.presentEmployees}</p>
                                            <p className="text-xs text-muted-foreground">Present</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-red-600">{branch.absentEmployees}</p>
                                            <p className="text-xs text-muted-foreground">Absent</p>
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-yellow-600">{branch.lateEmployees}</p>
                                            <p className="text-xs text-muted-foreground">Late</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart2 className="h-5 w-5" />
                            Branch Performance Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                            <ComposedChart data={branchData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="attendanceRate" fill="#3B82F6" name="Attendance Rate" />
                                <Bar dataKey="punctualityRate" fill="#10B981" name="Punctuality Rate" />
                                <Line type="monotone" dataKey="efficiency" stroke="#F59E0B" strokeWidth={2} name="Efficiency" />
                                <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="5 5" label="Target" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderAnalyticsInsights = () => {
        const { analytics, insights } = report;
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Top Performing Branches
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-3">
                                    {insights.branchComparisons
                                        .sort((a, b) => b.attendanceRate - a.attendanceRate)
                                        .slice(0, 5)
                                        .map((branch, index) => (
                                            <div key={branch.uid} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                                        <span className="text-sm font-bold text-green-600">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{branch.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {branch.totalEmployees} employees
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-green-600">
                                                        {formatPercentage(branch.attendanceRate)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatPercentage(branch.punctualityRate)} punctuality
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Areas for Improvement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[300px]">
                                <div className="space-y-3">
                                    {insights.branchComparisons
                                        .sort((a, b) => a.attendanceRate - b.attendanceRate)
                                        .slice(0, 5)
                                        .map((branch, index) => (
                                            <div key={branch.uid} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{branch.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {branch.totalEmployees} employees
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-red-600">
                                                        {formatPercentage(branch.attendanceRate)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatPercentage(branch.punctualityRate)} punctuality
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Key Insights & Patterns
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3">Seasonal Patterns</h4>
                                <div className="space-y-2">
                                    {analytics.seasonalPatterns.map((pattern, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm">{pattern}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Performance Insights</h4>
                                <div className="space-y-3">
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUpIcon className="h-4 w-4 text-green-600" />
                                            <span className="font-medium text-sm">Peak Performance Days</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {analytics.peakAttendanceDays.join(', ')}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingDownIcon className="h-4 w-4 text-red-600" />
                                            <span className="font-medium text-sm">Low Performance Days</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {analytics.lowAttendanceDays.join(', ')}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium text-sm">Productivity Correlation</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {analytics.productivityCorrelation.toFixed(2)} correlation coefficient
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Strategic Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {report.recommendations.immediate.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        Immediate Actions Required
                                    </h4>
                                    <ul className="space-y-1">
                                        {report.recommendations.immediate.map((item, index) => (
                                            <li key={index} className="text-sm text-muted-foreground">
                                                • {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {report.recommendations.longTerm.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <TrendingUpIcon className="h-4 w-4 text-green-500" />
                                        Long-term Strategic Initiatives
                                    </h4>
                                    <ul className="space-y-1">
                                        {report.recommendations.longTerm.map((item, index) => (
                                            <li key={index} className="text-sm text-muted-foreground">
                                                • {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {report.recommendations.policies.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        Policy Recommendations
                                    </h4>
                                    <ul className="space-y-1">
                                        {report.recommendations.policies.map((item, index) => (
                                            <li key={index} className="text-sm text-muted-foreground">
                                                • {item}
                                            </li>
                                        ))}
                                    </ul>
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Building className="h-6 w-6 text-blue-500" />
                        Organization Attendance Report
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(report.dateRange.start), 'MMM dd, yyyy')} - {format(new Date(report.dateRange.end), 'MMM dd, yyyy')}
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

            <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as any)}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="branches">Branches</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {renderOrganizationOverview()}
                </TabsContent>

                <TabsContent value="trends" className="space-y-6">
                    {renderTrendsAnalysis()}
                </TabsContent>

                <TabsContent value="branches" className="space-y-6">
                    {renderBranchAnalysis()}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    {renderAnalyticsInsights()}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OrganizationAttendanceReportComponent; 