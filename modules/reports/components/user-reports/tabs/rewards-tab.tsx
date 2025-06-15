import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, Crown, Star, Zap, Calendar, Clock, CheckCircle, Target, FileText, BookOpen, LogIn, Plus, Gamepad2, AlertCircle } from 'lucide-react';
import { ExtendedProfileData } from '@/hooks/use-user-profile';
import { UserTarget } from '@/hooks/use-user-targets';
import { AttendanceMetrics } from '@/hooks/use-attendance-metrics';
import { UserRewards } from '@/hooks/use-user-rewards';

export interface TabProps {
    profileData: ExtendedProfileData | any;
    targetsData: UserTarget | null;
    attendanceData: AttendanceMetrics | null;
    rewardsData: UserRewards | null;
    isTargetsLoading: boolean;
    isAttendanceLoading: boolean;
    isRewardsLoading: boolean;
}

export const RewardsTab: React.FunctionComponent<TabProps> = ({
    profileData,
    targetsData,
    attendanceData,
    rewardsData,
    isTargetsLoading,
    isAttendanceLoading,
    isRewardsLoading,
}) => {
    const getXPIcon = (key: string) => {
        switch (key) {
            case 'attendance':
                return Clock;
            case 'check-in-client':
                return CheckCircle;
            case 'claim':
                return FileText;
            case 'journal':
                return BookOpen;
            case 'lead':
            case 'leads':
                return Target;
            case 'login':
                return LogIn;
            case 'task':
            case 'tasks':
                return CheckCircle;
            default:
                return Plus;
        }
    };

    const getXPIconColor = (key: string) => {
        switch (key) {
            case 'attendance':
                return 'text-emerald-500 dark:text-emerald-400';
            case 'check-in-client':
                return 'text-blue-500 dark:text-blue-400';
            case 'claim':
                return 'text-amber-500 dark:text-amber-400';
            case 'journal':
                return 'text-purple-500 dark:text-purple-400';
            case 'lead':
            case 'leads':
                return 'text-red-500 dark:text-red-400';
            case 'login':
                return 'text-cyan-500 dark:text-cyan-400';
            case 'task':
            case 'tasks':
                return 'text-lime-500 dark:text-lime-400';
            default:
                return 'text-gray-500 dark:text-gray-400';
        }
    };

    const getXPIconBgColor = (key: string) => {
        switch (key) {
            case 'attendance':
                return 'bg-emerald-50 dark:bg-emerald-500/10';
            case 'check-in-client':
                return 'bg-blue-50 dark:bg-blue-500/10';
            case 'claim':
                return 'bg-amber-50 dark:bg-amber-500/10';
            case 'journal':
                return 'bg-purple-50 dark:bg-purple-500/10';
            case 'lead':
            case 'leads':
                return 'bg-red-50 dark:bg-red-500/10';
            case 'login':
                return 'bg-cyan-50 dark:bg-cyan-500/10';
            case 'task':
            case 'tasks':
                return 'bg-lime-50 dark:bg-lime-500/10';
            default:
                return 'bg-gray-50 dark:bg-gray-500/10';
        }
    };

    const formatXP = (xp: number) => {
        if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
        if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
        return xp.toLocaleString();
    };

    const getLevelProgress = (currentXP: number, level: number) => {
        const baseXPForLevel = level * 5000;
        const xpForNextLevel = (level + 1) * 5000;
        const progress = ((currentXP - baseXPForLevel) / (xpForNextLevel - baseXPForLevel)) * 100;
        return Math.max(0, Math.min(100, progress));
    };

    if (isRewardsLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardContent className="py-8">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-[10px] text-muted-foreground font-body uppercase">
                                Loading rewards data...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!rewardsData) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-muted-foreground" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                No Rewards Data
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[10px] text-muted-foreground font-body uppercase">
                            No rewards data available for this user yet.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* XP Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            Experience Overview
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Current Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10">
                            <Crown className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                            <p className="mt-1 text-[10px] text-muted-foreground font-body uppercase">Current Rank</p>
                            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 font-body">
                                {rewardsData.rank}
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                            <Star className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            <p className="mt-1 text-[10px] text-muted-foreground font-body uppercase">Level</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 font-body">
                                {rewardsData.level}
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                            <Zap className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                            <p className="mt-1 text-[10px] text-muted-foreground font-body uppercase">Total XP</p>
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400 font-body">
                                {formatXP(rewardsData.totalXP)}
                            </p>
                        </div>
                    </div>

                    {/* XP Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground font-body uppercase">
                                Level Progress
                            </p>
                            <Badge variant="outline" className="text-[10px] font-body">
                                {Math.round(getLevelProgress(rewardsData.currentXP, rewardsData.level))}%
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body">
                            <span>{formatXP(rewardsData.currentXP)} / {formatXP((rewardsData.level + 1) * 5000)} XP</span>
                        </div>
                        <Progress
                            value={getLevelProgress(rewardsData.currentXP, rewardsData.level)}
                            className="h-3"
                        />
                    </div>

                    {/* Last Activity */}
                    <div className="flex items-center p-3 rounded-lg bg-muted/50">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="ml-3">
                            <p className="text-[10px] text-muted-foreground font-body uppercase">Last Activity</p>
                            <p className="text-xs font-medium font-body">
                                {new Date(rewardsData.lastAction).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* XP Breakdown */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            XP Breakdown
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(rewardsData.xpBreakdown)
                            .filter(([key, value]) => Number(value) > 0)
                            .sort(([, a], [, b]) => Number(b) - Number(a))
                            .map(([key, value]) => {
                                const IconComponent = getXPIcon(key);
                                return (
                                    <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                        <div className="flex items-center flex-1">
                                            <div className={`p-2 rounded-md ${getXPIconBgColor(key)}`}>
                                                <IconComponent className={`w-4 h-4 ${getXPIconColor(key)}`} />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-xs font-medium capitalize font-body">
                                                    {key.replace('-', ' ')}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-body uppercase">
                                                    Activity points earned
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold font-body ${getXPIconColor(key)}`}>
                                                {formatXP(Number(value))}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground font-body uppercase">XP</p>
                                        </div>
                                    </div>
                                );
                            })}

                        {Object.entries(rewardsData.xpBreakdown).every(([, value]) => Number(value) === 0) && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Trophy className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-[10px] text-muted-foreground font-body uppercase">
                                    No activity recorded yet
                                </p>
                                <p className="text-[10px] text-muted-foreground font-body mt-1">
                                    Complete tasks and activities to start earning XP
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Achievements */}
            {rewardsData.achievements && rewardsData.achievements.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Achievements
                            </CardTitle>
                            <Badge variant="secondary" className="text-[10px] font-body">
                                {rewardsData.achievements.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {rewardsData.achievements.map((achievement) => (
                                <div key={achievement.uid} className="flex items-center p-3 rounded-lg bg-muted/30">
                                    <div className="p-2 rounded-md bg-yellow-50 dark:bg-yellow-500/10">
                                        <Trophy className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-xs font-medium font-body">{achievement.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-body">{achievement.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] font-body">
                                                {achievement.xpValue} XP
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px] font-body">
                                                {achievement.category}
                                            </Badge>
                                        </div>
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
