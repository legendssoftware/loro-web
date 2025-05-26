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
    const hasError = profileError || targetsError || attendanceError || rewardsError;

    // Export to PDF functionality
    const handleExportPdf = async () => {
        try {
            // Future implementation will handle PDF generation
            console.log('Exporting user report to PDF...');
            // This would generate a PDF report containing all the user's data
            // For now, we'll show a placeholder message
            alert('PDF export functionality will be implemented soon');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Failed to export PDF. Please try again.');
        }
    };

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
                            {String(profileError || targetsError || attendanceError || rewardsError)}
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
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-normal uppercase font-body">
                            User Reports
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-body">
                            {profileData.name} {profileData.surname}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge
                            variant="secondary"
                            className="text-xs font-body"
                        >
                            {(profileData as any)?.role || 'User'}
                        </Badge>
                        {(profileData as any)?.organization?.name && (
                            <Badge
                                variant="outline"
                                className="text-xs font-body"
                            >
                                {(profileData as any)?.organization?.name}
                            </Badge>
                        )}
                        <Button
                            onClick={handleExportPdf}
                            variant="outline"
                            size="sm"
                            className="text-xs uppercase font-body"
                        >
                            <Download className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            Export PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>

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
