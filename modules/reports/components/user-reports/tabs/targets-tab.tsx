import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Info
} from 'lucide-react';
import { TabProps } from './rewards-tab';
import { generateTargetInsights, generateEmailTemplate, generateQuickSummary } from '@/lib/ai-service';

export const TargetsTab: React.FC<TabProps> = ({
    profileData,
    targetsData,
    attendanceData,
    isTargetsLoading,
    isAttendanceLoading,
}) => {
    // AI Insights State
    const [insights, setInsights] = useState<string[]>([]);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
    const [quickSummary, setQuickSummary] = useState<string>('');
    const [emailTemplate, setEmailTemplate] = useState<string>('');
    const [activeInsightTab, setActiveInsightTab] = useState('insights');
    const [insightsGenerated, setInsightsGenerated] = useState(false);

    // Helper functions
    const getProgressPercentage = (current: number | undefined, target: number | undefined) => {
        if (!current || !target || target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-green-500';
        if (percentage >= 70) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatCurrency = (amount: number | undefined, currency: string = 'ZAR') => {
        if (!amount) return `${currency} 0`;
        return `${currency} ${amount.toLocaleString()}`;
    };

    // AI Functions
    const generateInsights = async () => {
        if (!targetsData) return;

        setIsGeneratingInsights(true);
        try {
            const [insightsResult, summaryResult] = await Promise.all([
                generateTargetInsights({
                    targetData: targetsData,
                    attendanceData,
                    profileData,
                    type: 'performance'
                }),
                generateQuickSummary(targetsData)
            ]);

            setInsights(insightsResult);
            setQuickSummary(summaryResult);
            setInsightsGenerated(true);
        } catch (error) {
            console.error('Error generating insights:', error);
            setInsights(['Unable to generate insights at this time. Please try again later.']);
            setQuickSummary('Keep working towards your targets!');
        } finally {
            setIsGeneratingInsights(false);
        }
    };

    const generateEmail = async () => {
        if (!targetsData || insights.length === 0) return;

        setIsGeneratingInsights(true);
        try {
            const template = await generateEmailTemplate({
                recipientName: `${profileData?.name || 'User'} ${profileData?.surname || ''}`.trim(),
                insights,
                targetMetrics: targetsData,
                tone: 'encouraging'
            });
            setEmailTemplate(template);
            setActiveInsightTab('email');
        } catch (error) {
            console.error('Error generating email:', error);
            setEmailTemplate('Unable to generate email template at this time.');
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
                        <div className="flex flex-col items-center justify-center space-y-4">
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

    if (!targetsData) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-muted-foreground" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                No Targets Set
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-muted-foreground font-body uppercase">
                            No performance targets have been set for this user yet.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Target Period Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
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
                                    ? new Date(targetsData.periodStartDate).toLocaleDateString()
                                    : 'Not set'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Period End</p>
                            <p className="text-sm font-medium font-body">
                                {targetsData.periodEndDate
                                    ? new Date(targetsData.periodEndDate).toLocaleDateString()
                                    : 'Not set'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sales Targets */}
            {(targetsData.targetSalesAmount || targetsData.currentSalesAmount) && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Sales Performance
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-medium text-muted-foreground font-body uppercase">Sales Target</p>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {getProgressPercentage(targetsData.currentSalesAmount, targetsData.targetSalesAmount).toFixed(1)}%
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body">
                                <span>{formatCurrency(targetsData.currentSalesAmount, targetsData.targetCurrency)}</span>
                                <span>{formatCurrency(targetsData.targetSalesAmount, targetsData.targetCurrency)}</span>
                            </div>
                            <Progress
                                value={getProgressPercentage(targetsData.currentSalesAmount, targetsData.targetSalesAmount)}
                                className="h-3"
                            />
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body uppercase">
                                <span>Complete</span>
                                <span>
                                    {targetsData.targetSalesAmount && targetsData.currentSalesAmount
                                        ? formatCurrency(targetsData.targetSalesAmount - targetsData.currentSalesAmount, targetsData.targetCurrency) + ' remaining'
                                        : 'Target needed'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Work Hours Target */}
            {(targetsData.targetHoursWorked || targetsData.currentHoursWorked) && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Work Hours
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
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

            {/* Client & Lead Targets */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* New Clients */}
                {(targetsData.targetNewClients || targetsData.currentNewClients) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                New Clients
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-center">
                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-body">
                                    {targetsData.currentNewClients || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">
                                    of {targetsData.targetNewClients || 0} target
                                </div>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {getProgressPercentage(targetsData.currentNewClients, targetsData.targetNewClients).toFixed(1)}%
                                </Badge>
                            </div>
                            <Progress
                                value={getProgressPercentage(targetsData.currentNewClients, targetsData.targetNewClients)}
                                className="h-2"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* New Leads */}
                {(targetsData.targetNewLeads || targetsData.currentNewLeads) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                New Leads
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-center">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-body">
                                    {targetsData.currentNewLeads || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">
                                    of {targetsData.targetNewLeads || 0} target
                                </div>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {getProgressPercentage(targetsData.currentNewLeads, targetsData.targetNewLeads).toFixed(1)}%
                                </Badge>
                            </div>
                            <Progress
                                value={getProgressPercentage(targetsData.currentNewLeads, targetsData.targetNewLeads)}
                                className="h-2"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Activity Targets */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Check-ins */}
                {(targetsData.targetCheckIns || targetsData.currentCheckIns) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Check-ins
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-center">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-body">
                                    {targetsData.currentCheckIns || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">
                                    of {targetsData.targetCheckIns || 0} target
                                </div>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {getProgressPercentage(targetsData.currentCheckIns, targetsData.targetCheckIns).toFixed(1)}%
                                </Badge>
                            </div>
                            <Progress
                                value={getProgressPercentage(targetsData.currentCheckIns, targetsData.targetCheckIns)}
                                className="h-2"
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Calls */}
                {(targetsData.targetCalls || targetsData.currentCalls) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Calls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-center">
                                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-body">
                                    {targetsData.currentCalls || 0}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-body uppercase">
                                    of {targetsData.targetCalls || 0} target
                                </div>
                                <Badge variant="outline" className="text-[10px] font-body">
                                    {getProgressPercentage(targetsData.currentCalls, targetsData.targetCalls).toFixed(1)}%
                                </Badge>
                            </div>
                            <Progress
                                value={getProgressPercentage(targetsData.currentCalls, targetsData.targetCalls)}
                                className="h-2"
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* AI Insights Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                AI Performance Insights
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={generateInsights}
                                disabled={isGeneratingInsights}
                                className="text-xs uppercase font-body"
                            >
                                {isGeneratingInsights ? (
                                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" strokeWidth={1.5} /> Generating</>
                                ) : (
                                    <><RefreshCw className="w-3 h-3 mr-1" strokeWidth={1.5} /> Refresh</>
                                )}
                            </Button>
                        </div>
                    </div>
                    {quickSummary && (
                        <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 border border-purple-200 dark:border-purple-500/20">
                            <div className="flex items-start gap-2">
                                <Star className="w-4 h-4 text-purple-500 mt-0.5" />
                                <p className="text-sm text-purple-800 dark:text-purple-300 font-body">
                                    {quickSummary}
                                </p>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="insights" className="text-xs font-body">
                                <Lightbulb className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Insights</span>
                            </TabsTrigger>
                            <TabsTrigger value="email" className="text-xs font-body">
                                <Mail className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Email Template</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="insights" className="mt-6 space-y-4">
                            {isGeneratingInsights ? (
                                <div className="py-8 text-center">
                                    <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-purple-500" />
                                    <p className="text-sm text-muted-foreground font-body">
                                        AI is analyzing your performance data...
                                    </p>
                                </div>
                            ) : insights.length > 0 ? (
                                <div className="space-y-3">
                                    {insights.map((insight, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-500/20"
                                        >
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold font-body ${
                                                index === 0 ? 'bg-green-500' :
                                                index === 1 ? 'bg-blue-500' :
                                                index === 2 ? 'bg-purple-500' :
                                                index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <p className="text-sm text-gray-800 dark:text-gray-200 font-body leading-relaxed">
                                                {insight}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                                        <Brain className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground font-body mb-2">No Insights Yet</h3>
                                    <p className="text-sm text-muted-foreground font-body mb-4">
                                        Click refresh to generate AI-powered insights about your performance.
                                    </p>
                                    <Button
                                        onClick={generateInsights}
                                        size="sm"
                                        className="text-xs uppercase font-body"
                                    >
                                        <Zap className="w-3 h-3 mr-1" strokeWidth={1.5} />
                                        Generate Insights
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="email" className="mt-6 space-y-4">
                            {emailTemplate ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Mail className="w-4 h-4 text-green-600" />
                                            <h4 className="text-sm font-medium text-green-800 dark:text-green-300 font-body uppercase">
                                                Generated Email Template
                                            </h4>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
                                            <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap font-body">
                                                {emailTemplate}
                                            </pre>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2">
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
                                                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" strokeWidth={1.5} /> Generating</>
                                                ) : (
                                                    <><RefreshCw className="w-3 h-3 mr-1" strokeWidth={1.5} /> Regenerate</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                                        <Mail className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground font-body mb-2">No Email Template</h3>
                                    <p className="text-sm text-muted-foreground font-body mb-4">
                                        Generate insights first, then create a personalized email template.
                                    </p>
                                    <Button
                                        onClick={generateEmail}
                                        disabled={insights.length === 0 || isGeneratingInsights}
                                        size="sm"
                                        className="text-xs uppercase font-body"
                                    >
                                        <Mail className="w-3 h-3 mr-1" strokeWidth={1.5} />
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
                        <div className="p-3 text-center rounded-lg bg-muted/50">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-body">
                                {targetsData.createdAt
                                    ? new Date(targetsData.createdAt).toLocaleDateString()
                                    : 'N/A'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Created</div>
                        </div>
                        <div className="p-3 text-center rounded-lg bg-muted/50">
                            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 font-body">
                                {targetsData.updatedAt
                                    ? new Date(targetsData.updatedAt).toLocaleDateString()
                                    : 'N/A'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Last Updated</div>
                        </div>
                        <div className="p-3 text-center rounded-lg bg-muted/50">
                            <div className="text-lg font-bold text-primary font-body">
                                {targetsData.targetCurrency || 'ZAR'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Currency</div>
                        </div>
                        <div className="p-3 text-center rounded-lg bg-muted/50">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400 font-body">
                                {targetsData.id || 'N/A'}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-body uppercase">Target ID</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
