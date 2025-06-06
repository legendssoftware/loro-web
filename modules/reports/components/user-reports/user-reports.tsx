import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    Trophy,
    Target,
    User,
    Shield,
    Clock,
    Loader2,
    AlertCircle,
    Download,
    FileText,
    Brain,
    TrendingUp,
    TrendingDown,
    Calendar,
    Award,
} from 'lucide-react';

// Import tab components

// Import hooks
import { useUserTargets } from '@/hooks/use-user-targets';
import { useAttendanceMetrics } from '@/hooks/use-attendance-metrics';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUserRewards } from '@/hooks/use-user-rewards';
import { RewardsTab } from './tabs/rewards-tab';
import { TargetsTab } from './tabs/targets-tab';
import { AccountTab } from './tabs/account-tab';
import { LicenseTab } from './tabs/license-tab';
import { AttendanceTab } from './tabs/attendance-tab';
import { Button } from '@/components/ui/button';

// Tab configuration matching mobile profile
const tabsConfig = [
    {
        id: 'attendance',
        label: 'Attendance',
        icon: Clock,
        description: 'Work hours & analytics',
        component: AttendanceTab,
    },
    {
        id: 'targets',
        label: 'Targets',
        icon: Target,
        description: 'Performance metrics & goals',
        component: TargetsTab,
    },
    {
        id: 'rewards',
        label: 'Rewards',
        icon: Trophy,
        description: 'XP, levels & achievements',
        component: RewardsTab,
    },
    {
        id: 'account',
        label: 'Account',
        icon: User,
        description: 'Personal & organization info',
        component: AccountTab,
    },
    {
        id: 'license',
        label: 'License',
        icon: Shield,
        description: 'Plan details & features',
        component: LicenseTab,
    },
];

export interface UserReportsProps {
    userId?: number;
    className?: string;
}

export const UserReports: React.FC<UserReportsProps> = ({
    userId,
    className,
}) => {
    const [activeTab, setActiveTab] = useState('attendance');
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

    // Data fetching hooks
    const {
        data: profileData,
        isLoading: profileLoading,
        error: profileError,
    } = useUserProfile(userId);

    const {
        data: targetsData,
        isLoading: targetsLoading,
        error: targetsError,
    } = useUserTargets(userId);

    const {
        data: attendanceData,
        isLoading: attendanceLoading,
        error: attendanceError,
    } = useAttendanceMetrics(userId);

    const {
        data: rewardsData,
        isLoading: rewardsLoading,
        error: rewardsError,
    } = useUserRewards(userId);

    // Loading state for any essential data
    const isLoading = profileLoading;

    // Error state
    const hasError =
        profileError || targetsError || attendanceError || rewardsError;

    // Enhanced AI v4 Insights Generation - Context-aware user performance analysis
    const generateAiInsights = React.useCallback(async () => {
        if (!profileData) return;

        setIsGeneratingInsights(true);

        // Enhanced context analysis for user insights
        const userContext = {
            // User basic info
            name: profileData.name,
            surname: profileData.surname,
            role: (profileData as any)?.role || 'User',
            organization: (profileData as any)?.organization?.name,

            // Attendance insights
            attendanceMetrics: attendanceData
                ? {
                      totalHours: (attendanceData as any)?.totalHours || 0,
                      avgDailyHours:
                          (attendanceData as any)?.avgDailyHours || 0,
                      attendanceRate:
                          (attendanceData as any)?.attendanceRate || 0,
                      lateArrivals: (attendanceData as any)?.lateArrivals || 0,
                      earlyDepartures:
                          (attendanceData as any)?.earlyDepartures || 0,
                      absences: (attendanceData as any)?.absences || 0,
                  }
                : null,

            // Target performance
            targetMetrics: targetsData
                ? {
                      completionRate: (targetsData as any)?.completionRate || 0,
                      activeTargets: (targetsData as any)?.activeTargets || 0,
                      overdueTasks: (targetsData as any)?.overdueTasks || 0,
                      avgTaskTime: (targetsData as any)?.avgTaskTime || 0,
                  }
                : null,

            // Rewards and engagement
            rewardMetrics: rewardsData
                ? {
                      totalXP: (rewardsData as any)?.totalXP || 0,
                      level: (rewardsData as any)?.level || 1,
                      achievements: (rewardsData as any)?.achievements || 0,
                      recentActivities:
                          (rewardsData as any)?.recentActivities || [],
                  }
                : null,

            // Time-aware context
            currentDate: new Date(),
            dayOfWeek: new Date().getDay(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            currentMonth: new Date().getMonth(),
            currentQuarter: Math.floor(new Date().getMonth() / 3) + 1,
        };

        // Mock AI insights generation with sophisticated analysis
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const generateContextualInsights = () => {
            const insights: string[] = [];

            // Performance trend analysis
            if (userContext.attendanceMetrics) {
                const { attendanceRate, avgDailyHours, lateArrivals } =
                    userContext.attendanceMetrics;

                if (attendanceRate >= 95) {
                    insights.push(
                        `🎯 Excellent attendance record at ${attendanceRate}% - demonstrates strong commitment and reliability.`,
                    );
                } else if (attendanceRate >= 85) {
                    insights.push(
                        `📈 Good attendance at ${attendanceRate}%. Consider strategies to reach the 95% excellence threshold.`,
                    );
                } else {
                    insights.push(
                        `⚠️ Attendance needs attention at ${attendanceRate}%. This may impact team productivity and personal growth.`,
                    );
                }

                if (avgDailyHours > 8.5) {
                    insights.push(
                        `🔥 High engagement with ${avgDailyHours.toFixed(1)} avg daily hours. Monitor for burnout and ensure work-life balance.`,
                    );
                } else if (avgDailyHours < 7.5) {
                    insights.push(
                        `💡 Opportunity to increase productivity - currently averaging ${avgDailyHours.toFixed(1)} hours daily.`,
                    );
                }

                if (lateArrivals > 5) {
                    insights.push(
                        `⏰ ${lateArrivals} late arrivals detected. Consider time management strategies or schedule adjustments.`,
                    );
                }
            }

            // Target achievement analysis
            if (userContext.targetMetrics) {
                const { completionRate, overdueTasks, activeTargets } =
                    userContext.targetMetrics;

                if (completionRate >= 90) {
                    insights.push(
                        `🏆 Outstanding target completion at ${completionRate}% - consistently exceeding expectations.`,
                    );
                } else if (completionRate >= 75) {
                    insights.push(
                        `📊 Solid performance at ${completionRate}% completion. Focus on the final 25% for excellence.`,
                    );
                } else {
                    insights.push(
                        `🎯 Target completion at ${completionRate}% needs improvement. Consider breaking down large tasks.`,
                    );
                }

                if (overdueTasks > 0) {
                    insights.push(
                        `📋 ${overdueTasks} overdue tasks require immediate attention to prevent project delays.`,
                    );
                }

                if (activeTargets > 10) {
                    insights.push(
                        `🔄 Managing ${activeTargets} active targets - consider prioritization strategies to maintain quality.`,
                    );
                }
            }

            // Engagement and growth analysis
            if (userContext.rewardMetrics) {
                const { level, totalXP, achievements } =
                    userContext.rewardMetrics;

                if (level >= 10) {
                    insights.push(
                        `🌟 Advanced level ${level} achiever with ${totalXP} XP - a valuable team contributor and potential mentor.`,
                    );
                } else if (level >= 5) {
                    insights.push(
                        `⭐ Level ${level} performance shows steady growth. Continue building expertise for leadership opportunities.`,
                    );
                } else {
                    insights.push(
                        `🌱 Early career stage at level ${level}. Focus on skill development and consistent performance.`,
                    );
                }

                if (achievements >= 5) {
                    insights.push(
                        `🏅 ${achievements} achievements demonstrate diverse skills and commitment to excellence.`,
                    );
                }
            }

            // Time-based insights
            if (userContext.isWeekend) {
                insights.push(
                    `📅 Weekend analysis shows dedication to continuous improvement and professional development.`,
                );
            }

            const quarterlyFocus = [
                'Q1: Focus on goal setting and establishing strong foundations for the year.',
                'Q2: Mid-year momentum - evaluate progress and adjust strategies for optimal results.',
                'Q3: Peak performance period - leverage summer energy for maximum productivity.',
                "Q4: Year-end sprint - consolidate achievements and prepare for next year's growth.",
            ];
            insights.push(
                `🗓️ ${quarterlyFocus[userContext.currentQuarter - 1]}`,
            );

            // Role-specific insights
            if (userContext.role === 'Manager' || userContext.role === 'Lead') {
                insights.push(
                    `👥 Leadership role requires balancing individual performance with team development and mentoring.`,
                );
            } else if (userContext.role === 'Senior') {
                insights.push(
                    `🎓 Senior position offers opportunities to guide junior team members and lead complex initiatives.`,
                );
            } else {
                insights.push(
                    `🚀 Current role provides excellent foundation for skill development and career advancement.`,
                );
            }

            // Organization context
            if (userContext.organization) {
                insights.push(
                    `🏢 Performance within ${userContext.organization} context shows alignment with organizational values and goals.`,
                );
            }

            return insights;
        };

        const insights = generateContextualInsights();
        setAiInsights(insights);
        setIsGeneratingInsights(false);
    }, [profileData, attendanceData, targetsData, rewardsData]);

    // Auto-generate insights when data is available
    React.useEffect(() => {
        if (profileData && !isGeneratingInsights && aiInsights.length === 0) {
            generateAiInsights();
        }
    }, [
        profileData,
        generateAiInsights,
        isGeneratingInsights,
        aiInsights.length,
    ]);

    if (isLoading) {
        return (
            <Card className={cn('w-full', className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-normal uppercase font-body">
                        User Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground font-body">
                            Loading user data...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (hasError) {
        return (
            <Card className={cn('w-full', className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-normal uppercase font-body">
                        User Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                        <p className="text-sm text-center text-muted-foreground font-body">
                            Error loading user data. Please try again.
                        </p>
                        <p className="text-xs text-center text-muted-foreground font-body">
                            {String(
                                profileError ||
                                    targetsError ||
                                    attendanceError ||
                                    rewardsError,
                            )}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profileData) {
        return (
            <Card className={cn('w-full', className)}>
                <CardHeader>
                    <CardTitle className="text-lg font-normal uppercase font-body">
                        User Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground font-body">
                            No user data available
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn('w-full p-0 border-0', className)}>
            <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-normal uppercase font-body">
                            User Reports
                        </CardTitle>
                        <p className="text-xs font-normal uppercase text-muted-foreground font-body">
                            {profileData.name} {profileData.surname}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge
                            variant="secondary"
                            className="text-[10px] font-body uppercase font-normal"
                        >
                            {(profileData as any)?.role || 'User'}
                        </Badge>
                        {(profileData as any)?.organization?.name && (
                            <Badge
                                variant="outline"
                                className="text-[10px] font-normal uppercase font-body"
                            >
                                {(profileData as any)?.organization?.name}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            {/* AI Insights Section v4 - Context-aware performance analysis */}
            {aiInsights.length > 0 || isGeneratingInsights ? (
                <div className="px-6 pb-6">
                    <div className="p-4 border rounded-lg border-border/50 bg-gradient-to-r from-primary/5 via-background to-primary/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain
                                className="w-4 h-4 text-primary"
                                strokeWidth={1.5}
                            />
                            <h3 className="text-sm font-medium uppercase font-body text-foreground">
                                AI Performance Insights
                            </h3>
                            {isGeneratingInsights && (
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            )}
                            <Button
                                onClick={generateAiInsights}
                                variant="ghost"
                                size="sm"
                                disabled={isGeneratingInsights}
                                className="ml-auto text-[10px] font-body h-6 px-2"
                            >
                                Refresh
                            </Button>
                        </div>

                        {isGeneratingInsights ? (
                            <div className="space-y-2">
                                <div className="h-4 rounded bg-muted/50 animate-LORO"></div>
                                <div className="w-3/4 h-4 rounded bg-muted/50 animate-LORO"></div>
                                <div className="w-1/2 h-4 rounded bg-muted/50 animate-LORO"></div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {aiInsights
                                    .slice(0, 4)
                                    .map((insight, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2 p-2 border rounded-md bg-background/50 border-border/20"
                                        >
                                            <div className="text-xs leading-relaxed font-body text-foreground/90">
                                                {insight}
                                            </div>
                                        </div>
                                    ))}
                                {aiInsights.length > 4 && (
                                    <div className="pt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-[10px] font-body h-6 px-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => {
                                                // Could expand to show all insights in a modal
                                                console.log(
                                                    'All insights:',
                                                    aiInsights,
                                                );
                                            }}
                                        >
                                            +{aiInsights.length - 4} more
                                            insights
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            <CardContent className="pt-0">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full h-auto grid-cols-5 gap-1 p-1 bg-muted/50">
                        {tabsConfig.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className={cn(
                                    'flex flex-col items-center justify-center p-3 space-y-1',
                                    'text-xs font-normal transition-all duration-200 font-body',
                                    'data-[state=active]:bg-background data-[state=active]:text-primary',
                                    'data-[state=active]:shadow-sm',
                                )}
                            >
                                <tab.icon
                                    className="w-4 h-4 mb-1"
                                    strokeWidth={1.5}
                                />
                                <span className="hidden sm:block">
                                    {tab.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground hidden lg:block">
                                    {tab.description}
                                </span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabsConfig.map((tab) => {
                        const TabComponent = tab.component;
                        return (
                            <TabsContent
                                key={tab.id}
                                value={tab.id}
                                className="mt-6 space-y-6"
                            >
                                <TabComponent
                                    profileData={profileData}
                                    targetsData={targetsData ?? null}
                                    attendanceData={attendanceData ?? null}
                                    rewardsData={rewardsData ?? null}
                                    isTargetsLoading={targetsLoading}
                                    isAttendanceLoading={attendanceLoading}
                                    isRewardsLoading={rewardsLoading}
                                />
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </CardContent>
        </Card>
    );
};
