import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Shield,
    Calendar,
    Clock,
    Crown,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Users,
    Zap,
    Settings,
    CreditCard,
    Loader2,
    AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { TabProps } from './rewards-tab';

export const LicenseTab: React.FC<TabProps> = ({
    profileData,
    targetsData,
    attendanceData,
    isTargetsLoading,
    isAttendanceLoading,
}) => {
    // Mock license data - replace with actual API data when available
    const licenseData = {
        planName: 'Professional',
        planType: 'Monthly',
        status: 'Active',
        startDate: '2024-01-15',
        endDate: '2024-12-15',
        maxUsers: 50,
        currentUsers: 23,
        features: {
            dashboard: true,
            reports: true,
            analytics: true,
            apiAccess: true,
            customBranding: false,
            prioritySupport: true,
            mobileApp: true,
            integrations: 5,
            storage: '100GB',
        },
        billing: {
            amount: 'R1,299.00',
            currency: 'ZAR',
            nextPayment: '2024-02-15',
            paymentMethod: 'Credit Card (****4532)',
        },
        organization: (profileData as any)?.organization,
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10';
            case 'expired':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
            case 'suspended':
                return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10';
        }
    };

    const getUsagePercentage = () => {
        return (licenseData.currentUsers / licenseData.maxUsers) * 100;
    };

    const getDaysRemaining = () => {
        const today = new Date();
        const endDate = new Date(licenseData.endDate);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Plan Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            Subscription Plan
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Plan Details */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10">
                            <Crown className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                            <p className="mt-1 text-[10px] text-muted-foreground font-body uppercase">Plan</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 font-body">
                                {licenseData.planName}
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-purple-50 dark:bg-purple-500/10">
                            <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                            <p className="mt-1 text-[10px] text-muted-foreground font-body uppercase">Billing</p>
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400 font-body">
                                {licenseData.planType}
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg">
                            <div className={`p-2 rounded-full ${getStatusColor(licenseData.status)}`}>
                                <CheckCircle className="w-3 h-3" />
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground font-body uppercase">Status</p>
                            <Badge variant="outline" className="text-[10px] font-body mt-1">
                                {licenseData.status}
                            </Badge>
                        </div>
                    </div>

                    {/* License Period */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium uppercase text-foreground font-body">
                                License Period
                            </p>
                            <Badge variant="outline" className="text-[10px] font-body">
                                {getDaysRemaining()} days remaining
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-body">
                            <span>{formatDate(licenseData.startDate)}</span>
                            <span>{formatDate(licenseData.endDate)}</span>
                        </div>
                        <Progress
                            value={100 - (getDaysRemaining() / 365) * 100}
                            className="h-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* User Allocation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            User Allocation
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-lg font-bold text-foreground font-body">
                                {licenseData.currentUsers} / {licenseData.maxUsers}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-body uppercase">
                                Users Active
                            </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-body">
                            {Math.round(getUsagePercentage())}% Used
                        </Badge>
                    </div>
                    <Progress value={getUsagePercentage()} className="h-2" />
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-body">
                        <AlertTriangle className="w-3 h-3" />
                        <span>
                            {licenseData.maxUsers - licenseData.currentUsers} seats available
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Features & Capabilities */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            Features & Capabilities
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(licenseData.features).map(([key, value]) => {
                            if (typeof value === 'boolean') {
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        {value ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                                        )}
                                        <span className="text-[10px] font-body uppercase text-foreground">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <Settings className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                                        <span className="text-[10px] font-body uppercase text-foreground">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                                        </span>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            Billing Information
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-body uppercase">
                                Current Amount
                            </p>
                            <p className="text-lg font-bold text-foreground font-body">
                                {licenseData.billing.amount}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground font-body uppercase">
                                Next Payment
                            </p>
                            <p className="text-sm text-foreground font-body">
                                {formatDate(licenseData.billing.nextPayment)}
                            </p>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border/10">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[10px] font-body uppercase text-muted-foreground">
                                {licenseData.billing.paymentMethod}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Organization Info */}
            {licenseData.organization && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            <CardTitle className="text-sm font-normal uppercase font-body">
                                Organization
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-body uppercase">
                                    Organization Name
                                </p>
                                <p className="text-sm text-foreground font-body">
                                    {licenseData.organization.name}
                                </p>
                            </div>
                            {licenseData.organization.industry && (
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-body uppercase">
                                        Industry
                                    </p>
                                    <p className="text-sm text-foreground font-body">
                                        {licenseData.organization.industry}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
