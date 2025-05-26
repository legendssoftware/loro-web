import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { TabProps } from './rewards-tab';
import {
    User,
    Mail,
    Phone,
    UserRound,
    Building2,
    Users,
    Building,
    Shield,
    Key,
    Globe,
    CircleUser,
    MapPin,
    Calendar,
    Clock,
    Award,
    Star,
    Crown,
    Briefcase,
    GraduationCap,
    CreditCard,
    ExternalLink,
    Edit,
    MoreHorizontal,
    Copy,
    Check,
    Activity,
    Target,
    TrendingUp,
    PersonStanding,
    Ruler,
    Weight,
    MapPinIcon,
    CalendarDays,
    Timer,
    AlertCircle,
    Eye,
    EyeOff,
    Info,
    Verified
} from 'lucide-react';

export const AccountTab: React.FC<TabProps> = ({
    profileData,
    targetsData,
    attendanceData,
    isTargetsLoading,
    isAttendanceLoading,
}) => {
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('personal');

    // Safely access profile data with fallbacks
    const safeProfileData = profileData || {};
    const organisation = safeProfileData?.organisation;
    const branch = safeProfileData?.branch;
    const profile = safeProfileData?.profile;
    const employmentProfile = safeProfileData?.employmentProfile;

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const getAccountStatus = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower === 'active') return { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10', icon: 'check' };
        if (statusLower === 'inactive') return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', icon: 'x' };
        if (statusLower === 'pending') return { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10', icon: 'clock' };
        return { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10', icon: 'help' };
    };

    const getRoleColor = (role: string) => {
        const roleLower = role?.toLowerCase() || '';
        if (roleLower.includes('admin')) return 'text-purple-600 dark:text-purple-400';
        if (roleLower.includes('manager')) return 'text-blue-600 dark:text-blue-400';
        if (roleLower.includes('lead')) return 'text-orange-600 dark:text-orange-400';
        return 'text-gray-600 dark:text-gray-400';
    };

    const statusInfo = getAccountStatus(safeProfileData?.status);

    // Personal Information Card
    const PersonalInfoCard = () => (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CircleUser className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <CardTitle className="text-sm font-normal uppercase font-body">
                            Personal Information
                        </CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                        className="text-xs uppercase font-body"
                    >
                        {showSensitiveInfo ? (
                            <><EyeOff className="w-3 h-3 mr-1" strokeWidth={1.5} /> Hide Details</>
                        ) : (
                            <><Eye className="w-3 h-3 mr-1" strokeWidth={1.5} /> Show All</>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-start gap-4 pb-6 border-b">
                    <div className="relative">
                        <Avatar className="w-20 h-20 border-2 border-border">
                            <AvatarImage
                                src={safeProfileData?.photoURL}
                                alt={`${safeProfileData?.name || 'User'} ${safeProfileData?.surname || ''}`}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-2xl font-bold text-blue-600 bg-blue-100 dark:bg-blue-500/10 font-body">
                                {(safeProfileData?.name?.[0] || 'U')}
                                {(safeProfileData?.surname?.[0] || '')}
                            </AvatarFallback>
                        </Avatar>
                        {safeProfileData?.status === 'active' && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                                <Verified className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <h3 className="text-xl font-bold text-foreground font-body">
                                {safeProfileData?.name || 'N/A'} {safeProfileData?.surname || ''}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-sm text-muted-foreground font-body">
                                    @{safeProfileData?.username || 'N/A'}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(safeProfileData?.username || '', 'username')}
                                    className="h-6 w-6 p-0"
                                >
                                    {copiedField === 'username' ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <Copy className="w-3 h-3" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className={`px-3 py-1 rounded-full ${statusInfo.bg}`}>
                                <span className={`text-sm font-medium ${statusInfo.color} font-body`}>
                                    {safeProfileData?.status || 'Unknown'}
                                </span>
                            </div>
                            {safeProfileData?.accessLevel && (
                                <Badge variant="outline" className={`text-xs font-body ${getRoleColor(safeProfileData.accessLevel)}`}>
                                    <Shield className="w-3 h-3 mr-1" />
                                    {safeProfileData.accessLevel}
                                </Badge>
                            )}
                        </div>

                        {showSensitiveInfo && (
                            <div className="p-3 rounded-lg bg-muted/50 border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground font-body uppercase">System Information</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground font-body">User ID:</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-xs font-mono font-body">{safeProfileData?.uid || safeProfileData?.userref || 'N/A'}</p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(safeProfileData?.uid || safeProfileData?.userref || '', 'uid')}
                                                className="h-4 w-4 p-0"
                                            >
                                                {copiedField === 'uid' ? (
                                                    <Check className="w-2 h-2 text-green-500" />
                                                ) : (
                                                    <Copy className="w-2 h-2" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    {safeProfileData?.createdAt && (
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground font-body">Created:</p>
                                            <p className="text-xs font-body">{new Date(safeProfileData.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase font-body">Contact Details</h4>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                <Mail className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-muted-foreground font-body uppercase">Email Address</p>
                                <p className="text-sm font-medium font-body">
                                    {safeProfileData?.email || 'Not provided'}
                                </p>
                            </div>
                            {safeProfileData?.email && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(safeProfileData.email, 'email')}
                                    className="h-8 w-8 p-0"
                                >
                                    {copiedField === 'email' ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <Copy className="w-3 h-3" />
                                    )}
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-center w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-lg">
                                <Phone className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-muted-foreground font-body uppercase">Phone Number</p>
                                <p className="text-sm font-medium font-body">
                                    {safeProfileData?.phone || 'Not provided'}
                                </p>
                            </div>
                            {safeProfileData?.phone && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(safeProfileData.phone, 'phone')}
                                    className="h-8 w-8 p-0"
                                >
                                    {copiedField === 'phone' ? (
                                        <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                        <Copy className="w-3 h-3" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details (if available) */}
                {profile && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-medium text-muted-foreground font-body uppercase">Personal Details</h4>
                            <Badge variant="secondary" className="text-[10px] font-body">
                                {Object.keys(profile).length} fields
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {profile.gender && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-500/10 dark:to-purple-500/10 border border-pink-200 dark:border-pink-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <PersonStanding className="w-3 h-3 text-pink-500" />
                                        <p className="text-[10px] text-muted-foreground font-body uppercase">Gender</p>
                                    </div>
                                    <p className="text-sm font-medium capitalize font-body">{profile.gender.toLowerCase()}</p>
                                </div>
                            )}
                            {profile.height && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 border border-blue-200 dark:border-blue-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Ruler className="w-3 h-3 text-blue-500" />
                                        <p className="text-[10px] text-muted-foreground font-body uppercase">Height</p>
                                    </div>
                                    <p className="text-sm font-medium font-body">{profile.height}</p>
                                </div>
                            )}
                            {profile.weight && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-200 dark:border-orange-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Weight className="w-3 h-3 text-orange-500" />
                                        <p className="text-[10px] text-muted-foreground font-body uppercase">Weight</p>
                                    </div>
                                    <p className="text-sm font-medium font-body">{profile.weight}</p>
                                </div>
                            )}
                            {profile.city && (
                                <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPinIcon className="w-3 h-3 text-green-500" />
                                        <p className="text-[10px] text-muted-foreground font-body uppercase">City</p>
                                    </div>
                                    <p className="text-sm font-medium font-body">{profile.city}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // Organization Information Card
    const OrganizationInfoCard = () => (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                    <CardTitle className="text-sm font-normal uppercase font-body">
                        Organization & Employment
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {organisation ? (
                    <>
                        {/* Organization Header */}
                        <div className="flex items-start gap-4 pb-6 border-b">
                            <div className="relative">
                                {organisation.logoURL ? (
                                    <img
                                        src={organisation.logoURL}
                                        alt={`${organisation.name} logo`}
                                        className="object-cover w-16 h-16 bg-gray-100 rounded-lg border"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-500/10 rounded-lg border">
                                        <Building className="w-8 h-8 text-purple-600" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground font-body">
                                        {organisation.name}
                                    </h3>
                                    {organisation.industry && (
                                        <p className="text-sm text-muted-foreground font-body">
                                            {organisation.industry}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-[10px] font-body">
                                        <Building className="w-3 h-3 mr-1" />
                                        Organization
                                    </Badge>
                                    {branch && (
                                        <Badge variant="secondary" className="text-[10px] font-body">
                                            <Users className="w-3 h-3 mr-1" />
                                            {branch.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Organization Contact Details */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-medium text-muted-foreground uppercase font-body">Organization Contact</h4>
                            <div className="grid gap-4">
                                {organisation.email && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-center w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                                            <Mail className="w-4 h-4 text-purple-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-muted-foreground font-body uppercase">Organization Email</p>
                                            <p className="text-sm font-medium font-body">{organisation.email}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(organisation.email, 'org-email')}
                                            className="h-8 w-8 p-0"
                                        >
                                            {copiedField === 'org-email' ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {organisation.phone && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                            <Phone className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-muted-foreground font-body uppercase">Organization Phone</p>
                                            <p className="text-sm font-medium font-body">{organisation.phone}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(organisation.phone, 'org-phone')}
                                            className="h-8 w-8 p-0"
                                        >
                                            {copiedField === 'org-phone' ? (
                                                <Check className="w-3 h-3 text-green-500" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {organisation.website && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                                            <Globe className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-muted-foreground font-body uppercase">Website</p>
                                            <a
                                                href={organisation.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-blue-600 font-body hover:text-blue-800 flex items-center gap-1"
                                            >
                                                {organisation.website}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {organisation.address && (
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-center w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                                            <MapPin className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] text-muted-foreground font-body uppercase">Address</p>
                                            <p className="text-sm font-medium font-body leading-relaxed">{organisation.address}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Employment Details */}
                        {employmentProfile && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-medium text-muted-foreground font-body uppercase">Employment Information</h4>
                                    <Badge variant="secondary" className="text-[10px] font-body">
                                        <Briefcase className="w-3 h-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {employmentProfile.position && (
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 border border-indigo-200 dark:border-indigo-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Crown className="w-4 h-4 text-indigo-500" />
                                                <p className="text-[10px] text-muted-foreground font-body uppercase">Position</p>
                                            </div>
                                            <p className="text-lg font-bold text-indigo-800 dark:text-indigo-300 font-body">{employmentProfile.position}</p>
                                        </div>
                                    )}

                                    {employmentProfile.department && (
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 border border-emerald-200 dark:border-emerald-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building className="w-4 h-4 text-emerald-500" />
                                                <p className="text-[10px] text-muted-foreground font-body uppercase">Department</p>
                                            </div>
                                            <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300 font-body">{employmentProfile.department}</p>
                                        </div>
                                    )}

                                    {employmentProfile.startDate && (
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 border border-violet-200 dark:border-violet-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-violet-500" />
                                                <p className="text-[10px] text-muted-foreground font-body uppercase">Start Date</p>
                                            </div>
                                            <p className="text-lg font-bold text-violet-800 dark:text-violet-300 font-body">
                                                {new Date(employmentProfile.startDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    {employmentProfile.employeeId && (
                                        <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-500/10 border border-orange-200 dark:border-orange-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CreditCard className="w-4 h-4 text-orange-500" />
                                                <p className="text-[10px] text-muted-foreground font-body uppercase">Employee ID</p>
                                            </div>
                                            <p className="text-lg font-bold text-orange-800 dark:text-orange-300 font-body font-mono">{employmentProfile.employeeId}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Organization Description */}
                        {organisation.description && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-medium text-muted-foreground font-body uppercase">About the Organization</h4>
                                <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-500/10 dark:to-slate-500/10 border">
                                    <p className="text-sm leading-relaxed text-foreground font-body">
                                        {organisation.description}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-foreground font-body mb-1">No Organization Data</h3>
                                <p className="text-sm text-muted-foreground font-body">Organization information is not available for this user</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    // Account Statistics Card
    const AccountStatsCard = () => (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    <CardTitle className="text-sm font-normal uppercase font-body">
                        Account Activity
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 border border-blue-200 dark:border-blue-500/20">
                        <CalendarDays className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 font-body">
                            {attendanceData?.totalShifts?.allTime || 0}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-body uppercase">Days Active</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-500/10 dark:to-violet-500/10 border border-purple-200 dark:border-purple-500/20">
                        <Timer className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400 font-body">
                            {attendanceData?.totalHours?.allTime || 0}h
                        </div>
                        <div className="text-[10px] text-muted-foreground font-body uppercase">Total Hours</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200 dark:border-green-500/20">
                        <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-green-600 dark:text-green-400 font-body">
                            {attendanceData?.timingPatterns?.punctualityScore || 0}%
                        </div>
                        <div className="text-[10px] text-muted-foreground font-body uppercase">Punctuality</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20">
                        <TrendingUp className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className="text-lg font-bold text-amber-600 dark:text-amber-400 font-body">
                            {attendanceData?.productivityInsights?.workEfficiencyScore || 0}%
                        </div>
                        <div className="text-[10px] text-muted-foreground font-body uppercase">Efficiency</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Account Statistics */}
            <AccountStatsCard />

            {/* Main Content */}
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="personal" className="text-xs font-body">
                        <User className="w-3 h-3 mr-1" />
                        Personal Info
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="text-xs font-body">
                        <Building2 className="w-3 h-3 mr-1" />
                        Organization
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="mt-6">
                    <PersonalInfoCard />
                </TabsContent>

                <TabsContent value="organization" className="mt-6">
                    <OrganizationInfoCard />
                </TabsContent>
            </Tabs>
        </div>
    );
};
