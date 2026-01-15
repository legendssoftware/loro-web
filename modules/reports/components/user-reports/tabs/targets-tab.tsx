import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Building2, UserCheck, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    Loader2,
    Target,
    TrendingUp,
    CheckCircle,
    Goal,
    AlertCircle,
    Brain,
    Lightbulb,
    Mail,
    RefreshCw,
    Star,
    Zap,
    Settings,
    CreditCard
} from 'lucide-react';
import { TabProps } from './rewards-tab';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';

// Pie Chart Component for Target Performance
interface PieChartProps {
    achieved: number;
    remaining: number;
    currency: string;
    title: string;
}

const PieChart: React.FunctionComponent<PieChartProps> = ({ achieved, remaining, currency, title }) => {
    const total = achieved + remaining;
    const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0;
    const radius = 90;
    const strokeWidth = 20;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <Card className="relative bg-white dark:bg-gray-900">
            <CardHeader>
                <div className="flex gap-2 items-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <CardTitle className="text-sm font-normal uppercase font-body">
                        {title}
                    </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-body w-fit">
                    {percentage}% Complete
                </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Pie Chart */}
                <div className="flex justify-center">
                    <div className="relative">
                        <svg
                            height={radius * 2}
                            width={radius * 2}
                            className="transform -rotate-90"
                        >
                            {/* Background circle */}
                            <circle
                                stroke="#e5e7eb"
                                fill="transparent"
                                strokeWidth={strokeWidth}
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                            />
                            {/* Progress circle */}
                            <circle
                                stroke="#ef4444"
                                fill="transparent"
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                style={{ strokeDashoffset }}
                                strokeLinecap="round"
                                r={normalizedRadius}
                                cx={radius}
                                cy={radius}
                                className="transition-all duration-300 ease-in-out"
                            />
                        </svg>
                        {/* Center text */}
                        <div className="flex absolute inset-0 flex-col justify-center items-center">
                            <div className="text-2xl font-bold text-primary font-body">
                                {percentage}%
                            </div>
                            <div className="text-xs uppercase text-muted-foreground font-body">
                                Complete
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                        <span className="text-sm font-medium text-foreground font-body">
                            Achieved
                        </span>
                        <span className="ml-auto text-sm font-bold text-foreground font-body">
                            {currency} {achieved.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                        <span className="text-sm font-medium text-muted-foreground font-body">
                            Remaining
                        </span>
                        <span className="ml-auto text-sm font-bold text-muted-foreground font-body">
                            {currency} {remaining.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Summary */}
                <div className="text-center">
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-body">
                        {currency} {remaining.toLocaleString()} remaining to achieve target
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

// Helper function for consistent date formatting: "Monday 1st August 2025"
const formatDateLong = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    try {
        const date = new Date(dateStr);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }); // Monday
        const day = date.getDate();
        const monthName = date.toLocaleDateString('en-US', { month: 'long' }); // August
        const year = date.getFullYear();

        // Add ordinal suffix to day
        const getOrdinalSuffix = (day: number) => {
            if (day >= 11 && day <= 13) return 'th';
            switch (day % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };

        return `${dayName} ${day}${getOrdinalSuffix(day)} ${monthName} ${year}`;
    } catch (error) {
        console.warn('Failed to format date:', dateStr, error);
        return 'Invalid date';
    }
};

// Types for AI requests - keeping only what we need
interface TargetData {
    currentValue: number;
    targetValue: number;
    progress: number;
    period: string;
    category: 'sales' | 'work_hours' | 'clients' | 'leads' | 'check_ins' | 'calls_made';
}

export const TargetsTab: React.FunctionComponent<TabProps> = ({
    profileData,
    targetsData,
    attendanceData,
    isTargetsLoading,
}) => {
    // AI Insights State
    const [insights, setInsights] = useState<string[]>([]);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [quickSummary, setQuickSummary] = useState<string>('');
    const [emailTemplate, setEmailTemplate] = useState<string>('');
    const [activeInsightTab, setActiveInsightTab] = useState('insights');
    const [insightsGenerated, setInsightsGenerated] = useState(false);
    const [activeMainTab, setActiveMainTab] = useState('personal');

    // Fetch profile sales data
    const { data: profileSalesData } = useQuery({
        queryKey: ['profile-sales', profileData?.uid],
        queryFn: async () => {
            const response = await axiosInstance.get('/erp/profile/sales');
            return response.data;
        },
        enabled: !!profileData?.uid,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Helper functions
    const getProgressPercentage = (current: number | undefined, target: number | undefined) => {
        if (!current || !target || target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    const formatCurrency = (amount: number | undefined, currency: string = 'ZAR') => {
        if (!amount) return `${currency} 0`;
        return `${currency} ${amount.toLocaleString()}`;
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatAddress = (address: any) => {
        if (!address) return 'Address not available';
        return `${address.street}, ${address.suburb}, ${address.city}, ${address.state} ${address.postalCode}`;
    };

    const renderStaffTargetCard = (staff: any) => {
        if (!staff.hasTargets || !staff.targets) {
            return (
                <Card key={staff.uid} className="p-4">
                    <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={staff.avatar} alt={staff.fullName} />
                            <AvatarFallback>{getInitials(staff.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h4 className="font-medium font-body">{staff.fullName}</h4>
                            <p className="text-sm text-muted-foreground font-body">{staff.email}</p>
                            <Badge variant="outline" className="mt-1 font-body">No targets set</Badge>
                        </div>
                    </div>
                </Card>
            );
        }

        const targets = staff.targets;

        return (
            <Card key={staff.uid} className="p-4">
                <div className="flex items-center mb-4 space-x-4">
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={staff.avatar} alt={staff.fullName} />
                        <AvatarFallback>{getInitials(staff.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h4 className="font-medium font-body">{staff.fullName}</h4>
                        <p className="text-sm text-muted-foreground font-body">{staff.email}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Sales Target - New format support */}
                    {targets.sales && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{targets.sales.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {targets.sales.currency} {targets.sales.current?.toLocaleString()} / {targets.sales.currency} {targets.sales.target?.toLocaleString()}
                                </span>
                            </div>
                            <Progress value={targets.sales.progress || 0} className="h-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">{Math.round(targets.sales.progress || 0)}% complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {targets.sales.currency} {targets.sales.remaining?.toLocaleString()} remaining
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Hours Target - New format support */}
                    {targets.hours && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{targets.hours.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {targets.hours.current || 0}{targets.hours.unit} / {targets.hours.target}{targets.hours.unit}
                                </span>
                            </div>
                            <Progress value={targets.hours.progress || 0} className="h-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">{Math.round(targets.hours.progress || 0)}% complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {targets.hours.remaining}{targets.hours.unit} remaining
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Quotations Target - New format support */}
                    {targets.quotations && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{targets.quotations.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {targets.quotations.currency} {targets.quotations.current?.toLocaleString()} / {targets.quotations.currency} {targets.quotations.target?.toLocaleString()}
                                </span>
                            </div>
                            <Progress value={targets.quotations.progress || 0} className="h-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">{Math.round(targets.quotations.progress || 0)}% complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {targets.quotations.currency} {targets.quotations.remaining?.toLocaleString()} remaining
                                </span>
                            </div>
                        </div>
                    )}

                    {/* New Leads Target - New format support */}
                    {targets.newLeads && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{targets.newLeads.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {targets.newLeads.current || 0} / {targets.newLeads.target}
                                </span>
                            </div>
                            <Progress value={targets.newLeads.progress || 0} className="h-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">{Math.round(targets.newLeads.progress || 0)}% complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {targets.newLeads.remaining} remaining
                                </span>
                            </div>
                        </div>
                    )}

                    {/* New Clients Target - New format support */}
                    {targets.newClients && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{targets.newClients.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {targets.newClients.current || 0} / {targets.newClients.target}
                                </span>
                            </div>
                            <Progress value={targets.newClients.progress || 0} className="h-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">{Math.round(targets.newClients.progress || 0)}% complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {targets.newClients.remaining} remaining
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Check-ins Target - New format support */}
                    {targets.checkIns && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{targets.checkIns.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {targets.checkIns.current || 0} / {targets.checkIns.target}
                                </span>
                            </div>
                            <Progress value={targets.checkIns.progress || 0} className="h-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">{Math.round(targets.checkIns.progress || 0)}% complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {targets.checkIns.remaining} remaining
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Calls Target - New format support */}
                    {targets.calls && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">{targets.calls.name}</span>
                                <span className="text-sm text-muted-foreground">
                                    {targets.calls.current || 0} / {targets.calls.target}
                                </span>
                            </div>
                            <Progress value={targets.calls.progress || 0} className="h-2" />
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-xs text-muted-foreground">{Math.round(targets.calls.progress || 0)}% complete</span>
                                <span className="text-xs text-muted-foreground">
                                    {targets.calls.remaining} remaining
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    // Helper function to transform UserTarget to TargetData array
    const transformUserTargetToTargetData = (userTarget: any): TargetData[] => {
        const targetData: TargetData[] = [];

        // Sales target
        if (userTarget.targetSalesAmount || userTarget.currentSalesAmount) {
            targetData.push({
                currentValue: userTarget.currentSalesAmount || 0,
                targetValue: userTarget.targetSalesAmount || 0,
                progress: userTarget.targetSalesAmount ?
                    Math.min((userTarget.currentSalesAmount || 0) / userTarget.targetSalesAmount * 100, 100) : 0,
                period: userTarget.targetPeriod || 'Monthly',
                category: 'sales' as const
            });
        }

        // Hours worked target
        if (userTarget.targetHoursWorked || userTarget.currentHoursWorked) {
            targetData.push({
                currentValue: userTarget.currentHoursWorked || 0,
                targetValue: userTarget.targetHoursWorked || 0,
                progress: userTarget.targetHoursWorked ?
                    Math.min((userTarget.currentHoursWorked || 0) / userTarget.targetHoursWorked * 100, 100) : 0,
                period: userTarget.targetPeriod || 'Monthly',
                category: 'work_hours' as const
            });
        }

        // Leads target
        if (userTarget.targetNewLeads || userTarget.currentNewLeads) {
            targetData.push({
                currentValue: userTarget.currentNewLeads || 0,
                targetValue: userTarget.targetNewLeads || 0,
                progress: userTarget.targetNewLeads ?
                    Math.min((userTarget.currentNewLeads || 0) / userTarget.targetNewLeads * 100, 100) : 0,
                period: userTarget.targetPeriod || 'Monthly',
                category: 'leads' as const
            });
        }

        // Clients target
        if (userTarget.targetNewClients || userTarget.currentNewClients) {
            targetData.push({
                currentValue: userTarget.currentNewClients || 0,
                targetValue: userTarget.targetNewClients || 0,
                progress: userTarget.targetNewClients ?
                    Math.min((userTarget.currentNewClients || 0) / userTarget.targetNewClients * 100, 100) : 0,
                period: userTarget.targetPeriod || 'Monthly',
                category: 'clients' as const
            });
        }

        // Check-ins target
        if (userTarget.targetCheckIns || userTarget.currentCheckIns) {
            targetData.push({
                currentValue: userTarget.currentCheckIns || 0,
                targetValue: userTarget.targetCheckIns || 0,
                progress: userTarget.targetCheckIns ?
                    Math.min((userTarget.currentCheckIns || 0) / userTarget.targetCheckIns * 100, 100) : 0,
                period: userTarget.targetPeriod || 'Monthly',
                category: 'check_ins' as const
            });
        }

        // Calls target
        if (userTarget.targetCalls || userTarget.currentCalls) {
            targetData.push({
                currentValue: userTarget.currentCalls || 0,
                targetValue: userTarget.targetCalls || 0,
                progress: userTarget.targetCalls ?
                    Math.min((userTarget.currentCalls || 0) / userTarget.targetCalls * 100, 100) : 0,
                period: userTarget.targetPeriod || 'Monthly',
                category: 'calls_made' as const
            });
        }

        return targetData;
    };

    // Helper function to transform AttendanceMetrics to AttendanceData
    const transformAttendanceData = (attendanceMetrics: any) => {
        if (!attendanceMetrics) return undefined;

        return {
            hoursWorked: attendanceMetrics.totalHours?.thisMonth || 0,
            expectedHours: 160, // Default to 160 hours per month (40 hours/week * 4 weeks)
            attendanceRate: attendanceMetrics.productivityInsights?.shiftCompletionRate || 0,
            punctualityScore: attendanceMetrics.timingPatterns?.punctualityScore || 0
        };
    };

    // AI Functions - now using routes directly
    const generateInsights = async () => {
        if (!targetsData) return;

        setIsGeneratingInsights(true);
        try {
            // Transform UserTarget to TargetData array
            const transformedTargetData = transformUserTargetToTargetData(targetsData);

            const [insightsResult, summaryResult] = await Promise.all([
                // Call insights API route directly
                fetch('/api/ai/insights', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        targetData: transformedTargetData,
                        attendanceData: transformAttendanceData(attendanceData),
                        profileData,
                        type: 'comprehensive_performance',
                        timeFrame: 'monthly'
                    }),
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                }).catch((error: any) => {
                    console.error('Failed to generate target insights:', error);
                    // Return fallback insights on API failure
                    return {
                        insights: [
                            'Unable to generate AI insights at this time due to service unavailability.',
                            'Consider reviewing your current target progress manually.',
                            'Focus on your highest priority targets for optimal performance.',
                            'Contact support if this issue persists.'
                        ],
                        feasibilityAnalysis: [],
                        actionableRecommendations: [],
                        urgencyLevel: 'medium' as const
                    };
                }),
                // Call summary API route directly
                fetch('/api/ai/summary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        targetData: transformedTargetData
                    }),
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                }).catch((error: any) => {
                    console.error('Failed to generate quick summary:', error);
                    return { summary: 'Continue working towards your targets! Your progress shows dedication.' };
                })
            ]);

            // Handle both old and new response formats
            const insights = Array.isArray(insightsResult) ? insightsResult : (insightsResult.insights || []);

            setInsights(insights);
            // Handle summary result which might be string or object
            const summary = typeof summaryResult === 'string' ? summaryResult : summaryResult.summary;
            setQuickSummary(summary);
            setInsightsGenerated(true);
        } catch (error: any) {
            console.error('Error generating insights:', error);
            // Provide helpful fallback insights
            setInsights([
                'Unable to generate AI insights at this time.',
                'Your target progress shows commitment to your goals.',
                'Continue focusing on your highest priority objectives.',
                'For immediate assistance, contact your manager or team lead.'
            ]);
            setQuickSummary('Keep working towards your targets!');
            setInsightsGenerated(true); // Mark as generated to prevent loops
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    const generateEmail = async () => {
        if (!targetsData || insights.length === 0) return;

        setIsGeneratingInsights(true);
        try {
            // Transform UserTarget to TargetData array
            const transformedTargetData = transformUserTargetToTargetData(targetsData);

            // Call email API route directly
            const template = await fetch('/api/ai/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientName: `${profileData?.name || 'User'} ${profileData?.surname || ''}`.trim(),
                    recipientEmail: profileData?.email || '',
                    templateType: 'follow_up',
                    tone: {
                        baseTone: 'encouraging',
                        intensity: 'moderate',
                        regionalAdaptation: 'south_african',
                        industrySpecific: false
                    },
                    customMessage: insights.join('\n\n') // Include insights as custom message
                }),
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            }).catch((error: any) => {
                console.error('Failed to generate email template:', error);
                // Return fallback template
                return {
                    subject: 'Performance Update and Encouragement',
                    body: `Hi ${profileData?.name || 'there'},\n\nI wanted to touch base regarding your recent performance. While our AI insights are temporarily unavailable, I can see you're making progress on your targets.\n\nKeep up the great work and don't hesitate to reach out if you need any support.\n\nBest regards,\nYour Team`
                };
            });

            // Handle the template response which has subject and body structure
            const templateText = typeof template === 'string' ? template :
                `Subject: ${template.subject}\n\n${template.body}`;
            setEmailTemplate(templateText);
            setActiveInsightTab('email');
        } catch (error: any) {
            console.error('Error generating email:', error);
            setEmailTemplate('Unable to generate email template at this time. Please try again later or contact support.');
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    // Auto-generate insights on data load
    useEffect(() => {
        if (targetsData && !insightsGenerated && !isGeneratingInsights) {
            generateInsights();
        }
    }, [targetsData, insightsGenerated, isGeneratingInsights]);

    if (isTargetsLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="py-8">
                        <div className="flex flex-col justify-center items-center space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-[10px] text-muted-foreground font-body uppercase">
                                Loading targets data...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if no targets data OR if all targets are 0/not set (no meaningful targets)
    // Using explicit > 0 checks to catch cases where target is set to 0
    const hasMeaningfulTargets = targetsData && (
        (targetsData.targetSalesAmount && targetsData.targetSalesAmount > 0) ||
        (targetsData.targetHoursWorked && targetsData.targetHoursWorked > 0) ||
        (targetsData.targetNewClients && targetsData.targetNewClients > 0) ||
        (targetsData.targetNewLeads && targetsData.targetNewLeads > 0) ||
        (targetsData.targetCheckIns && targetsData.targetCheckIns > 0) ||
        (targetsData.targetCalls && targetsData.targetCalls > 0)
    );

    if (!hasMeaningfulTargets) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex gap-2 items-center">
                            <Target className="w-5 h-5 text-muted-foreground" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                No Targets Set
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center py-8">
                        <div className="mb-4 text-6xl">🎯</div>
                        <p className="mb-2 text-sm font-medium text-center text-foreground font-body">
                            No targets have been set for you yet
                        </p>
                        <p className="text-[10px] text-muted-foreground font-body uppercase text-center">
                            Contact your manager to set up your performance targets
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Tabs */}
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="personal" className="flex gap-2 items-center">
                        <Target className="w-4 h-4" />
                        My Targets
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex gap-2 items-center">
                        <Users className="w-4 h-4" />
                        My Team
                    </TabsTrigger>
                </TabsList>

                {/* Personal Targets Tab */}
                <TabsContent value="personal" className="mt-6 space-y-6">
                    {/* Target Period Info */}
                    <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <Goal className="w-5 h-5 text-primary" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Performance Targets
                            </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-body">
                            {targetsData.targetPeriod || 'Monthly'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Period Start</p>
                            <p className="text-sm font-medium font-body">
                                {targetsData.periodStartDate
                                    ? formatDateLong(targetsData.periodStartDate)
                                    : 'Not set'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Period End</p>
                            <p className="text-sm font-medium font-body">
                                {targetsData.periodEndDate
                                    ? formatDateLong(targetsData.periodEndDate)
                                    : 'Not set'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sales Targets - Pie Chart - Only show if target is set */}
            {targetsData.targetSalesAmount && targetsData.targetSalesAmount > 0 && (
                <>
                    <PieChart
                        achieved={targetsData.currentSalesAmount || 0}
                        remaining={(targetsData.targetSalesAmount || 0) - (targetsData.currentSalesAmount || 0)}
                        currency={targetsData.targetCurrency || 'ZAR'}
                        title="Sales Performance"
                    />

                    {/* Sales Metrics */}
                    {profileSalesData?.data && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 gap-4">
                                    {profileSalesData.data.transactionCount > 0 && (
                                        <div className="flex gap-3 items-center">
                                            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-body uppercase">Transactions</p>
                                                <p className="text-sm font-medium font-body">{profileSalesData.data.transactionCount}</p>
                                            </div>
                                        </div>
                                    )}
                                    {profileSalesData.data.uniqueCustomers > 0 && (
                                        <div className="flex gap-3 items-center">
                                            <Users className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-[10px] text-muted-foreground font-body uppercase">Customers</p>
                                                <p className="text-sm font-medium font-body">{profileSalesData.data.uniqueCustomers}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {profileSalesData.data.uniqueCustomers > 0 && (
                                    <div className="pt-4 mt-4 border-t">
                                        <p className="text-sm text-center text-muted-foreground font-body">
                                            You have assisted <span className="font-semibold text-foreground">{profileSalesData.data.uniqueCustomers}</span> customer{profileSalesData.data.uniqueCustomers !== 1 ? 's' : ''} this month
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Quotations Targets - Pie Chart - Only show if target is set */}
            {targetsData.targetQuotationsAmount && targetsData.targetQuotationsAmount > 0 && (
                <PieChart
                    achieved={targetsData.currentQuotationsAmount || 0}
                    remaining={(targetsData.targetQuotationsAmount || 0) - (targetsData.currentQuotationsAmount || 0)}
                    currency={targetsData.targetCurrency || 'ZAR'}
                    title="Quotations Performance"
                />
            )}

            {/* Orders Performance - Shows current orders without target */}
            {targetsData.currentOrdersAmount && (
                <Card className="relative">
                    <CardHeader>
                        <div className="flex gap-2 items-center">
                            <Zap className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Orders Performance
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-medium text-muted-foreground font-body uppercase">Current Orders</p>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {formatCurrency(targetsData.currentOrdersAmount, targetsData.targetCurrency)}
                                </Badge>
                            </div>
                        <div className="text-center">
                            <div className="text-2xl text-orange-600 dark:text-orange-400 font-body">
                                {formatCurrency(targetsData.currentOrdersAmount, targetsData.targetCurrency)}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">
                                Total Orders (Converted from Quotations)
                            </div>
                        </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Work Hours Target - Only show if target is set */}
            {targetsData.targetHoursWorked && targetsData.targetHoursWorked > 0 && (
                <Card className="relative">
                    <CardHeader>
                        <div className="flex gap-2 items-center">
                            <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Work Hours
                            </CardTitle>
                        </div>
                        {/* Green badge for target reached */}
                        {getProgressPercentage(targetsData.currentHoursWorked, targetsData.targetHoursWorked) >= 100 && (
                            <div className="absolute top-2 right-2">
                                <Badge variant="default" className="bg-emerald-500 text-white text-[10px] font-body">
                                    <CheckCircle className="mr-1 w-3 h-3" />
                                    Target Reached
                                </Badge>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-medium text-muted-foreground font-body uppercase">Hours Target</p>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {getProgressPercentage(targetsData.currentHoursWorked, targetsData.targetHoursWorked).toFixed(1)}%
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body">
                                <span>{targetsData.currentHoursWorked || 0}h</span>
                                <span>{targetsData.targetHoursWorked || 0}h</span>
                            </div>
                            <Progress
                                value={getProgressPercentage(targetsData.currentHoursWorked, targetsData.targetHoursWorked)}
                                className="h-3"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body uppercase">
                                <span>Complete</span>
                                <span>
                                    {targetsData.targetHoursWorked && targetsData.currentHoursWorked
                                        ? `${targetsData.targetHoursWorked - targetsData.currentHoursWorked}h remaining`
                                        : 'Target needed'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* General Metrics */}
            <Card>
                <CardHeader>
                    <div className="flex gap-2 items-center">
                        <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            General Metrics
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                        {/* Work Hours */}
                        {(targetsData.targetHoursWorked || targetsData.currentHoursWorked) && (
                            <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                    {targetsData.currentHoursWorked || 0}/{targetsData.targetHoursWorked || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">Hours Worked</div>
                                <div className="text-[10px] text-primary font-body">
                                    {getProgressPercentage(targetsData.currentHoursWorked, targetsData.targetHoursWorked).toFixed(0)}%
                                </div>
                            </div>
                        )}

                        {/* New Clients */}
                        {(targetsData.targetNewClients || targetsData.currentNewClients) && (
                            <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                    {targetsData.currentNewClients || 0}/{targetsData.targetNewClients || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">New Clients</div>
                                <div className="text-[10px] text-primary font-body">
                                    {getProgressPercentage(targetsData.currentNewClients, targetsData.targetNewClients).toFixed(0)}%
                                </div>
                            </div>
                        )}

                        {/* New Leads */}
                        {(targetsData.targetNewLeads || targetsData.currentNewLeads) && (
                            <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                    {targetsData.currentNewLeads || 0}/{targetsData.targetNewLeads || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">New Leads</div>
                                <div className="text-[10px] text-primary font-body">
                                    {getProgressPercentage(targetsData.currentNewLeads, targetsData.targetNewLeads).toFixed(0)}%
                                </div>
                            </div>
                        )}

                        {/* Check-ins/Visits */}
                        {(targetsData.targetCheckIns || targetsData.currentCheckIns) && (
                            <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                    {targetsData.currentCheckIns || 0}/{targetsData.targetCheckIns || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">Visits</div>
                                <div className="text-[10px] text-primary font-body">
                                    {getProgressPercentage(targetsData.currentCheckIns, targetsData.targetCheckIns).toFixed(0)}%
                                </div>
                            </div>
                        )}

                        {/* Calls */}
                        {(targetsData.targetCalls || targetsData.currentCalls) && (
                            <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                                <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                    {targetsData.currentCalls || 0}/{targetsData.targetCalls || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">Calls</div>
                                <div className="text-[10px] text-primary font-body">
                                    {getProgressPercentage(targetsData.currentCalls, targetsData.targetCalls).toFixed(0)}%
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Cost Breakdown */}
            {targetsData && (
                <Card>
                    <CardHeader>
                        <div className="flex gap-2 items-center">
                            <CreditCard className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Monthly Cost Breakdown ({(targetsData as any)?.personalTargets?.sales?.currency || targetsData.targetCurrency || 'ZAR'})
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {(() => {
                            // Map individual cost components from entity (do NOT use totalCost column)
                            // Check both personalTargets (new format) and direct access (legacy format) for backward compatibility
                            const personalTargets = (targetsData as any)?.personalTargets;
                            const baseSalary = personalTargets?.baseSalary || targetsData.baseSalary || 0;
                            const carInstalment = personalTargets?.carInstalment || targetsData.carInstalment || 0;
                            const carInsurance = personalTargets?.carInsurance || targetsData.carInsurance || 0;
                            const fuel = personalTargets?.fuel || targetsData.fuel || 0;
                            const cellPhoneAllowance = personalTargets?.cellPhoneAllowance || targetsData.cellPhoneAllowance || 0;
                            const carMaintenance = personalTargets?.carMaintenance || targetsData.carMaintenance || 0;
                            const cgicCosts = personalTargets?.cgicCosts || targetsData.cgicCosts || 0;

                            // Calculate total from individual components only (never use totalCost column)
                            const totalCost = baseSalary + carInstalment + carInsurance + fuel + cellPhoneAllowance + carMaintenance + cgicCosts;

                            // All cost items - display all components
                            const costItems = [
                                { label: 'Base Salary', value: baseSalary, color: 'bg-blue-500' },
                                { label: 'Car Instalment', value: carInstalment, color: 'bg-purple-500' },
                                { label: 'Car Insurance', value: carInsurance, color: 'bg-pink-500' },
                                { label: 'Fuel', value: fuel, color: 'bg-amber-500' },
                                { label: 'Cell Phone Allowance', value: cellPhoneAllowance, color: 'bg-green-500' },
                                { label: 'Car Maintenance', value: carMaintenance, color: 'bg-red-500' },
                                { label: 'CGIC Costs', value: cgicCosts, color: 'bg-indigo-500' },
                            ];

                            // Check if any cost data exists
                            const hasCostData = costItems.some(item => item.value > 0);

                            if (!hasCostData) {
                                return (
                                    <div className="py-8 text-center">
                                        <p className="text-sm text-muted-foreground font-body">
                                            No cost breakdown data available
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <div className="space-y-4">
                                    {/* Table-like Cost Breakdown */}
                                    <div className="overflow-hidden rounded-lg border dark:border-gray-700">
                                        {/* Table Header */}
                                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700">
                                            <span className="text-xs font-semibold text-gray-700 uppercase dark:text-gray-300 font-body">
                                                Cost Component
                                            </span>
                                            <span className="text-xs font-semibold text-right text-gray-700 uppercase dark:text-gray-300 font-body">
                                                Amount ({(targetsData as any)?.personalTargets?.sales?.currency || targetsData.targetCurrency || 'ZAR'})
                                            </span>
                                        </div>

                                        {/* Table Rows */}
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {costItems.map((item, index) => (
                                                <div key={index} className="grid grid-cols-2 gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <div className="flex gap-3 items-center">
                                                        <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
                                                        <span className="text-sm font-medium text-foreground font-body">
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-bold text-right text-foreground font-body">
                                                        {formatCurrency(item.value, (targetsData as any)?.personalTargets?.sales?.currency || targetsData.targetCurrency)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total Cost Row */}
                                    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg border-2 border-gray-300 dark:bg-gray-800 dark:border-gray-700">
                                        <span className="text-base font-bold uppercase text-foreground font-body">
                                            Total Cost
                                        </span>
                                        <span className="text-base font-bold text-foreground font-body">
                                            {formatCurrency(totalCost, (targetsData as any)?.personalTargets?.sales?.currency || targetsData.targetCurrency)}
                                        </span>
                                    </div>

                                    {/* Cost vs Sales Analysis */}
                                    {totalCost > 0 && targetsData.targetSalesAmount && targetsData.targetSalesAmount > 0 && (
                                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                                            <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200 font-body">
                                                Cost vs Target Analysis
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-amber-700 dark:text-amber-300 font-body">
                                                        Cost Coverage Ratio:
                                                    </span>
                                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200 font-body">
                                                        {(() => {
                                                            const currentSales = targetsData.currentSalesAmount || 0;
                                                            const coverageRatio = totalCost > 0 ? (currentSales / totalCost) * 100 : 0;
                                                            return `${coverageRatio.toFixed(1)}%`;
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-amber-700 dark:text-amber-300 font-body">
                                                        Target Coverage:
                                                    </span>
                                                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200 font-body">
                                                        {(() => {
                                                            const targetCoverage = totalCost > 0 ? (targetsData.targetSalesAmount / totalCost) * 100 : 0;
                                                            return `${targetCoverage.toFixed(1)}%`;
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            )}

            {/* AI Insights Section */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                            <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                AI Performance Insights
                            </CardTitle>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={generateInsights}
                                disabled={isGeneratingInsights}
                                className="text-xs uppercase font-body"
                            >
                                {isGeneratingInsights ? (
                                    <><Loader2 className="mr-1 w-3 h-3 animate-spin" strokeWidth={1.5} /> Generating</>
                                ) : (
                                    <><RefreshCw className="mr-1 w-3 h-3" strokeWidth={1.5} /> Refresh</>
                                )}
                            </Button>
                        </div>
                    </div>
                    {quickSummary && (
                        <div className="p-3 mt-3 bg-white rounded-lg border dark:bg-gray-900">
                            <div className="flex gap-2 items-start">
                                <Star className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <p className="text-sm text-foreground font-body">
                                    {quickSummary}
                                </p>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab} className="w-full">
                        <TabsList className="grid grid-cols-2 w-full">
                            <TabsTrigger value="insights" className="text-xs font-body">
                                <Lightbulb className="mr-1 w-3 h-3" />
                                <span className="hidden sm:inline">Insights</span>
                            </TabsTrigger>
                            <TabsTrigger value="email" className="text-xs font-body">
                                <Mail className="mr-1 w-3 h-3" />
                                <span className="hidden sm:inline">Email Template</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="insights" className="mt-6 space-y-4">
                            {isGeneratingInsights ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="mx-auto mb-3 w-6 h-6 text-purple-500 animate-spin" />
                                    <p className="text-sm text-muted-foreground font-body">
                                        AI is analyzing your performance data...
                                    </p>
                                </div>
                            ) : insights.length > 0 ? (
                                <div className="space-y-3">
                                    {insights?.map((insight, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-3 items-start p-4 bg-white rounded-lg border dark:bg-gray-900"
                                        >
                                            <div className="flex justify-center items-center w-6 h-6 text-xs font-bold text-white bg-gray-500 rounded-full font-body">
                                                {index + 1}
                                            </div>
                                            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-body">
                                                {insight}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-muted">
                                        <Brain className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-foreground font-body">No Insights Yet</h3>
                                    <p className="mb-4 text-sm text-muted-foreground font-body">
                                        Click refresh to generate AI-powered insights about your performance.
                                    </p>
                                    <Button
                                        onClick={generateInsights}
                                        size="sm"
                                        className="text-xs uppercase font-body"
                                    >
                                        <Zap className="mr-1 w-3 h-3" strokeWidth={1.5} />
                                        Generate Insights
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="email" className="mt-6 space-y-4">
                            {emailTemplate ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-white rounded-lg border dark:bg-gray-900">
                                        <div className="flex gap-2 items-center mb-3">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <h4 className="text-sm font-medium uppercase text-foreground font-body">
                                                Generated Email Template
                                            </h4>
                                        </div>
                                        <div className="p-4 bg-white rounded-lg border dark:bg-gray-800">
                                            <pre className="text-xs text-gray-800 whitespace-pre-wrap dark:text-gray-200 font-body">
                                                {emailTemplate}
                                            </pre>
                                        </div>
                                        <div className="flex gap-2 items-center mt-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigator.clipboard.writeText(emailTemplate)}
                                                className="text-xs uppercase font-body"
                                            >
                                                Copy Template
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={generateEmail}
                                                disabled={isGeneratingInsights}
                                                className="text-xs uppercase font-body"
                                            >
                                                {isGeneratingInsights ? (
                                                    <><Loader2 className="mr-1 w-3 h-3 animate-spin" strokeWidth={1.5} /> Generating</>
                                                ) : (
                                                    <><RefreshCw className="mr-1 w-3 h-3" strokeWidth={1.5} /> Regenerate</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 rounded-full bg-muted">
                                        <Mail className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-medium text-foreground font-body">No Email Template</h3>
                                    <p className="mb-4 text-sm text-muted-foreground font-body">
                                        Generate insights first, then create a personalized email template.
                                    </p>
                                    <Button
                                        onClick={generateEmail}
                                        disabled={insights.length === 0 || isGeneratingInsights}
                                        size="sm"
                                        className="text-xs uppercase font-body"
                                    >
                                        <Mail className="mr-1 w-3 h-3" strokeWidth={1.5} />
                                        Generate Email
                                    </Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Separator />

            {/* Target Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-normal uppercase font-body">
                        Target Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                            <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                {targetsData.createdAt
                                    ? formatDateLong(targetsData.createdAt)
                                    : 'N/A'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Created</div>
                        </div>
                        <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                            <div className="text-lg text-gray-900 dark:text-gray-100 font-body">
                                {targetsData.updatedAt
                                    ? formatDateLong(targetsData.updatedAt)
                                    : 'N/A'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Last Updated</div>
                        </div>
                        <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                            <div className="text-lg text-primary font-body">
                                {targetsData.targetCurrency || 'ZAR'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Currency</div>
                        </div>
                        <div className="p-3 text-center bg-white rounded-lg border dark:bg-gray-900">
                            <div className="text-lg text-foreground font-body">
                                {targetsData.id || 'N/A'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Target ID</div>
                        </div>
                    </div>
                    {/* ERP Sales Rep Code */}
                    {(targetsData as any).erpSalesRepCode && (
                        <div className="p-3 mt-4 bg-white rounded-lg border dark:bg-gray-900">
                            <div className="flex gap-2 items-center">
                                <Settings className="w-4 h-4 text-primary" />
                                <div>
                                    <div className="text-[10px] text-muted-foreground font-body uppercase">ERP Sales Rep Code</div>
                                    <div className="text-sm font-medium text-foreground font-body">
                                        {(targetsData as any).erpSalesRepCode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
                </TabsContent>

                {/* My Team Tab */}
                <TabsContent value="team" className="mt-6 space-y-6">
                    {/* Managed Branches Section */}
                    {(targetsData as any)?.managedBranches?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex gap-2 items-center">
                                    <Building2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                                    <CardTitle className="text-sm font-normal uppercase font-body">
                                        Managed Branches ({(targetsData as any).managedBranches.length})
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {(targetsData as any).managedBranches.map((branch: any) => (
                                        <Card key={branch.uid} className="p-4">
                                            <div className="space-y-3">
                                                <div>
                                                    <h4 className="font-medium font-body">{branch.name}</h4>
                                                    <p className="text-sm text-muted-foreground font-body">{formatAddress(branch.address)}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 items-center">
                                                        <UserCheck className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-body">{branch.contactPerson}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-sm text-muted-foreground">📧</span>
                                                        <span className="text-sm font-body">{branch.email}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-sm text-muted-foreground">📱</span>
                                                        <span className="text-sm font-body">{branch.phone}</span>
                                                    </div>
                                                </div>
                                                <Badge variant={branch.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {branch.status}
                                                </Badge>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Managed Staff Section */}
                    {(targetsData as any)?.managedStaff?.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex gap-2 items-center">
                                    <Users className="w-5 h-5 text-green-500 dark:text-green-400" />
                                    <CardTitle className="text-sm font-normal uppercase font-body">
                                        Managed Staff ({(targetsData as any).managedStaff.length})
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                                    {(targetsData as any).managedStaff.map(renderStaffTargetCard)}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* No managed data message */}
                    {(!(targetsData as any)?.managedBranches?.length && !(targetsData as any)?.managedStaff?.length) && (
                        <Card>
                            <CardContent className="py-8">
                                <div className="space-y-4 text-center">
                                    <Users className="mx-auto w-12 h-12 text-muted-foreground" />
                                    <div>
                                        <h3 className="text-lg font-medium font-body">No Team Management</h3>
                                        <p className="text-sm text-muted-foreground font-body">
                                            You don't have any managed branches or staff members assigned to you.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
