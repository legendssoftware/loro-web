'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Loader2,
    Send,
    Clock,
    CheckCircle,
    AlertCircle,
    Info,
    Settings,
    Mail,
    Calendar,
    Users,
    Sunrise,
    Sunset,
    RefreshCw,
    Play,
    Pause,
    Square,
    Edit,
    Trash2,
    Plus,
    Eye,
    Download,
    Bell,
    Timer,
    Activity,
    Target,
    FileText,
    BarChart3,
    History,
    Zap,
    Building,
    Coffee,
    MapPin,
    UserCheck,
    Clock4,
    ChevronRight,
    ArrowRight,
    Save,
    X,
} from 'lucide-react';
import { format, addDays, addHours, addMinutes } from 'date-fns';
import { toast } from 'sonner';

interface ReportSchedule {
    id: string;
    name: string;
    type: 'morning' | 'evening' | 'weekly' | 'monthly';
    isEnabled: boolean;
    schedule: string; // cron expression
    nextRun: Date;
    lastRun?: Date;
    recipients: string[];
    description?: string;
    status: 'active' | 'paused' | 'failed';
}

interface ReportHistory {
    id: string;
    scheduleId: string;
    type: 'morning' | 'evening' | 'weekly' | 'monthly';
    executedAt: Date;
    status: 'success' | 'failed' | 'pending';
    recipientCount: number;
    errorMessage?: string;
    executionTime: number; // in milliseconds
}

interface AutomatedReportManagementProps {
    onSendMorningReport?: () => Promise<void>;
    onSendEveningReport?: () => Promise<void>;
    onRequestReport?: (type: 'morning' | 'evening') => Promise<void>;
    className?: string;
}

export const AutomatedReportManagement: React.FunctionComponent<AutomatedReportManagementProps> = ({
    onSendMorningReport,
    onSendEveningReport,
    onRequestReport,
    className = '',
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [schedules, setSchedules] = useState<ReportSchedule[]>([
        {
            id: '1',
            name: 'Daily Morning Report',
            type: 'morning',
            isEnabled: true,
            schedule: '5 8 * * 1-5', // 8:05 AM weekdays
            nextRun: addHours(new Date(), 16),
            lastRun: new Date(),
            recipients: ['admin@company.com', 'hr@company.com', 'manager@company.com'],
            description: 'Automated morning attendance report sent to management team',
            status: 'active',
        },
        {
            id: '2',
            name: 'Daily Evening Report',
            type: 'evening',
            isEnabled: true,
            schedule: '30 17 * * 1-5', // 5:30 PM weekdays
            nextRun: addHours(new Date(), 1),
            recipients: ['admin@company.com', 'hr@company.com'],
            description: 'End-of-day productivity and completion report',
            status: 'active',
        },
        {
            id: '3',
            name: 'Weekly Summary',
            type: 'weekly',
            isEnabled: false,
            schedule: '0 9 * * 1', // 9:00 AM Mondays
            nextRun: addDays(new Date(), 7),
            recipients: ['ceo@company.com', 'admin@company.com'],
            description: 'Weekly attendance and productivity summary',
            status: 'paused',
        },
    ]);

    const [reportHistory, setReportHistory] = useState<ReportHistory[]>([
        {
            id: '1',
            scheduleId: '1',
            type: 'morning',
            executedAt: new Date(),
            status: 'success',
            recipientCount: 3,
            executionTime: 1250,
        },
        {
            id: '2',
            scheduleId: '2',
            type: 'evening',
            executedAt: new Date(Date.now() - 3600000),
            status: 'success',
            recipientCount: 2,
            executionTime: 980,
        },
        {
            id: '3',
            scheduleId: '1',
            type: 'morning',
            executedAt: new Date(Date.now() - 86400000),
            status: 'failed',
            recipientCount: 0,
            errorMessage: 'SMTP server timeout',
            executionTime: 5000,
        },
    ]);

    const [selectedSchedule, setSelectedSchedule] = useState<ReportSchedule | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [newSchedule, setNewSchedule] = useState<Partial<ReportSchedule>>({});

    const handleSendReport = async (type: 'morning' | 'evening') => {
        setIsLoading(true);
        try {
            if (type === 'morning' && onSendMorningReport) {
                await onSendMorningReport();
            } else if (type === 'evening' && onSendEveningReport) {
                await onSendEveningReport();
            }
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report sent successfully`);
        } catch (error) {
            toast.error(`Failed to send ${type} report`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestReport = async (type: 'morning' | 'evening') => {
        setIsLoading(true);
        try {
            if (onRequestReport) {
                await onRequestReport(type);
            }
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report requested successfully`);
        } catch (error) {
            toast.error(`Failed to request ${type} report`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSchedule = (scheduleId: string) => {
        setSchedules(schedules.map(schedule => 
            schedule.id === scheduleId 
                ? { ...schedule, isEnabled: !schedule.isEnabled, status: schedule.isEnabled ? 'paused' : 'active' }
                : schedule
        ));
        toast.success('Schedule updated successfully');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'success':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'morning':
                return <Sunrise className="h-4 w-4" />;
            case 'evening':
                return <Sunset className="h-4 w-4" />;
            case 'weekly':
                return <Calendar className="h-4 w-4" />;
            case 'monthly':
                return <BarChart3 className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const renderQuickActions = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Morning Reports</h4>
                            <p className="text-sm text-muted-foreground">
                                Generate and send morning attendance reports
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleSendReport('morning')}
                                    disabled={isLoading}
                                    size="sm"
                                    className="flex-1"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Now
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleRequestReport('morning')}
                                    disabled={isLoading}
                                    size="sm"
                                    className="flex-1"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Evening Reports</h4>
                            <p className="text-sm text-muted-foreground">
                                Generate and send evening productivity reports
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleSendReport('evening')}
                                    disabled={isLoading}
                                    size="sm"
                                    className="flex-1"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Now
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleRequestReport('evening')}
                                    disabled={isLoading}
                                    size="sm"
                                    className="flex-1"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="font-semibold">Bulk Operations</h4>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    schedules.forEach(schedule => {
                                        if (schedule.isEnabled) {
                                            // Simulate sending report for enabled schedules
                                            console.log(`Triggering ${schedule.type} report`);
                                        }
                                    });
                                    toast.success('All enabled reports triggered');
                                }}
                                disabled={isLoading}
                                size="sm"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Run All Enabled
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSchedules(schedules.map(s => ({ ...s, isEnabled: false, status: 'paused' as const })));
                                    toast.success('All schedules paused');
                                }}
                                size="sm"
                            >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause All
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderScheduleList = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Report Schedules
                        </span>
                        <Button size="sm" onClick={() => setIsEditDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Schedule
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {schedules.map((schedule) => (
                            <div key={schedule.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                                            {getTypeIcon(schedule.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{schedule.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {schedule.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={getStatusColor(schedule.status)}>
                                            {schedule.status.toUpperCase()}
                                        </Badge>
                                        <Switch
                                            checked={schedule.isEnabled}
                                            onCheckedChange={() => toggleSchedule(schedule.id)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Next Run:</span>
                                        <p className="text-muted-foreground">
                                            {format(schedule.nextRun, 'MMM dd, yyyy HH:mm')}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Last Run:</span>
                                        <p className="text-muted-foreground">
                                            {schedule.lastRun ? format(schedule.lastRun, 'MMM dd, yyyy HH:mm') : 'Never'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="font-medium">Recipients:</span>
                                        <p className="text-muted-foreground">
                                            {schedule.recipients.length} recipient(s)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedSchedule(schedule);
                                            setIsEditDialogOpen(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // Simulate running the specific schedule
                                            console.log(`Running schedule: ${schedule.name}`);
                                            toast.success(`${schedule.name} executed successfully`);
                                        }}
                                        disabled={!schedule.isEnabled}
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Run Now
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderReportHistory = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Execution History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px]">
                        <div className="space-y-3">
                            {reportHistory.map((execution) => {
                                const schedule = schedules.find(s => s.id === execution.scheduleId);
                                return (
                                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                                {getTypeIcon(execution.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {schedule?.name || 'Unknown Schedule'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(execution.executedAt, 'MMM dd, yyyy HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="outline" className={getStatusColor(execution.status)}>
                                                {execution.status.toUpperCase()}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {execution.status === 'success' 
                                                    ? `${execution.recipientCount} recipients • ${execution.executionTime}ms`
                                                    : execution.errorMessage || 'Failed'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };

    const renderSystemStatus = () => {
        const activeSchedules = schedules.filter(s => s.isEnabled).length;
        const totalSchedules = schedules.length;
        const successRate = reportHistory.filter(h => h.status === 'success').length / reportHistory.length * 100;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        System Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{activeSchedules}</div>
                            <p className="text-sm text-muted-foreground">Active Schedules</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{totalSchedules}</div>
                            <p className="text-sm text-muted-foreground">Total Schedules</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{successRate.toFixed(1)}%</div>
                            <p className="text-sm text-muted-foreground">Success Rate</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {reportHistory.filter(h => h.executedAt > new Date(Date.now() - 86400000)).length}
                            </div>
                            <p className="text-sm text-muted-foreground">Reports Today</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="font-semibold mb-3">System Health</h4>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Email Service</span>
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    ONLINE
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Database Connection</span>
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    HEALTHY
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Report Generation</span>
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    OPERATIONAL
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Scheduled Tasks</span>
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                    RUNNING
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="h-6 w-6 text-blue-500" />
                        Automated Report Management
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Configure and manage automated attendance report schedules
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderQuickActions()}
                {renderSystemStatus()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderScheduleList()}
                {renderReportHistory()}
            </div>

            {/* Edit/Add Schedule Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedSchedule ? 'Edit Schedule' : 'Add New Schedule'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure the automated report schedule settings.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="schedule-name">Schedule Name</Label>
                            <Input
                                id="schedule-name"
                                placeholder="Enter schedule name"
                                value={newSchedule.name || selectedSchedule?.name || ''}
                                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="schedule-type">Report Type</Label>
                            <Select
                                value={newSchedule.type || selectedSchedule?.type || ''}
                                onValueChange={(value) => setNewSchedule({ ...newSchedule, type: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="morning">Morning Report</SelectItem>
                                    <SelectItem value="evening">Evening Report</SelectItem>
                                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                                    <SelectItem value="monthly">Monthly Report</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="schedule-description">Description</Label>
                            <Textarea
                                id="schedule-description"
                                placeholder="Enter schedule description"
                                value={newSchedule.description || selectedSchedule?.description || ''}
                                onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditDialogOpen(false);
                                    setSelectedSchedule(null);
                                    setNewSchedule({});
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    // Handle save logic here
                                    setIsEditDialogOpen(false);
                                    setSelectedSchedule(null);
                                    setNewSchedule({});
                                    toast.success('Schedule saved successfully');
                                }}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AutomatedReportManagement; 