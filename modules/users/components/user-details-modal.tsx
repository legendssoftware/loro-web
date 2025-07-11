'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Building,
    Mail,
    Phone,
    Calendar,
    UserSquare,
    UserCheck,
    Briefcase,
    Edit,
    X,
    UserX,
    UserMinus,
    UserCog,
    Shield,
    AtSign,
    Gauge,
    Send,
    Users,
} from 'lucide-react';
import { User, UserStatus, AccessLevel } from '@/lib/types/user';
import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';
import UserEditForm, { UserEditServerData } from './user-edit-form';
import { useUsersQuery } from '@/hooks/use-users-query';
import UserTargetForm, { UserTargetFormValues } from './user-target-form';
import { axiosInstance } from '@/lib/services/api-client';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { TargetsTab } from '@/modules/reports/components/user-reports/tabs/targets-tab';

interface UserDetailsModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus?: (userId: number, newStatus: UserStatus) => void;
    onDelete?: (userId: number) => void;
}

export function UserDetailsModal({
    user,
    isOpen,
    onClose,
    onUpdateStatus,
    onDelete,
}: UserDetailsModalProps) {
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);
    const [showStatusConfirmation, setShowStatusConfirmation] =
        useState<boolean>(false);
    const [pendingStatusChange, setPendingStatusChange] =
        useState<UserStatus | null>(null);
    const [activeTab, setActiveTab] = useState<string>('details');
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showTargetsModal, setShowTargetsModal] = useState<boolean>(false);
    const [isReInviting, setIsReInviting] = useState<boolean>(false);

    // Get the updateUser function from our hook
    const { updateUser } = useUsersQuery({});

    // Format dates
    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    // Handle status change with confirmation
    const initiateStatusChange = (status: UserStatus) => {
        // Don't show confirmation if already in that status
        if (user.status === status) {
            return;
        }

        setPendingStatusChange(status);
        setShowStatusConfirmation(true);
    };

    // Confirm and execute status change
    const confirmStatusChange = () => {
        if (pendingStatusChange && onUpdateStatus) {
            onUpdateStatus(user.uid, pendingStatusChange);
            setShowStatusConfirmation(false);
            setPendingStatusChange(null);
        }
    };

    // Cancel status change
    const cancelStatusChange = () => {
        setShowStatusConfirmation(false);
        setPendingStatusChange(null);
    };

    // Handle delete with confirmation
    const handleDelete = () => {
        if (onDelete) {
            onDelete(user.uid);
            setShowDeleteConfirmation(false);
            showSuccessToast('User deleted successfully', toast);
            onClose();
        }
    };

    // Handle individual user re-invite
    const handleReInviteUser = async () => {
        try {
            setIsReInviting(true);

            const response = await axiosInstance.post(`/user/admin/${user.uid}/re-invite`);

            if (response.data.success) {
                showSuccessToast(
                    `Re-invitation email sent to ${user.email} successfully!`,
                    toast
                );
            } else {
                showErrorToast('Failed to send re-invitation email', toast);
            }
        } catch (error) {
            console.error('Error re-inviting user:', error);
            showErrorToast('Failed to send re-invitation email', toast);
        } finally {
            setIsReInviting(false);
        }
    };

    // Handle form submission from the UserEditForm
    const handleUpdateUser = async (userData: UserEditServerData) => {
        try {
            // Use a type assertion to handle the type incompatibility
            await updateUser(user.uid, userData as any);
            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    // Handle form submission from the UserTargetForm
    const handleUpdateUserTargets = async (userData: UserTargetFormValues, hasExistingTargets: boolean) => {
        try {
            // Convert form values to API expected format
            const targetData = {
                ...userData,
                // Remove any undefined values
                ...(userData.targetSalesAmount !== undefined && { targetSalesAmount: userData.targetSalesAmount }),
                ...(userData.targetHoursWorked !== undefined && { targetHoursWorked: userData.targetHoursWorked }),
                ...(userData.targetNewClients !== undefined && { targetNewClients: userData.targetNewClients }),
                ...(userData.targetNewLeads !== undefined && { targetNewLeads: userData.targetNewLeads }),
                ...(userData.targetCheckIns !== undefined && { targetCheckIns: userData.targetCheckIns }),
                ...(userData.targetCalls !== undefined && { targetCalls: userData.targetCalls }),
            };

            // Choose the appropriate HTTP method based on whether user has existing targets
            if (hasExistingTargets) {
                // Update existing targets with PATCH
                await axiosInstance.patch(`/user/${user.uid}/target`, targetData);
                showSuccessToast('User targets updated successfully', toast);
            } else {
                // Create new targets with POST
                await axiosInstance.post(`/user/${user.uid}/target`, targetData);
                showSuccessToast('User targets created successfully', toast);
            }

            setShowTargetsModal(false);
        } catch (error) {
            console.error("Error managing user targets:", error);
            showErrorToast('Failed to save user targets', toast);
        }
    };

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
    };

    // Show the edit modal when Edit is clicked
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    // Close the edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    // Show the targets modal when Targets button is clicked
    const handleTargetsClick = () => {
        setShowTargetsModal(true);
    };

    // Close the targets modal
    const handleCloseTargetsModal = () => {
        setShowTargetsModal(false);
    };

    // Get status badge color
    const getStatusBadgeColor = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case UserStatus.INACTIVE:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            case UserStatus.SUSPENDED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case UserStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case UserStatus.DELETED:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get access level badge color
    const getAccessLevelBadgeColor = (accessLevel: AccessLevel) => {
        switch (accessLevel) {
            case AccessLevel.ADMIN:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case AccessLevel.MANAGER:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case AccessLevel.SUPPORT:
                return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
            case AccessLevel.DEVELOPER:
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case AccessLevel.USER:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status display name
    const getStatusDisplayName = (status: UserStatus | null): string => {
        if (!status) return '';

        switch (status) {
            case UserStatus.ACTIVE:
                return 'ACTIVE';
            case UserStatus.INACTIVE:
                return 'INACTIVE';
            case UserStatus.SUSPENDED:
                return 'SUSPENDED';
            default:
                return status.toUpperCase();
        }
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'access', label: 'Access' },
        { id: 'targets', label: 'Targets' },
        { id: 'clients', label: 'Assigned Clients' },
        { id: 'activity', label: 'Activity' },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        {/* User Profile Info */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Personal Information
                            </h3>
                            <div className="flex gap-4 items-start">
                                <Avatar className="w-20 h-20 border-2 border-primary">
                                    <AvatarImage
                                        src={user.photoURL}
                                        alt={user.name}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {`${user.name.charAt(0)}${user.surname.charAt(0)}`}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <div className="grid gap-2">
                                        <h2 className="text-xl font-normal font-body">
                                            {user.name} {user.surname}
                                        </h2>
                                        <div className="flex gap-2 items-center">
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-4 py-1 font-body border-0 ${getAccessLevelBadgeColor(
                                                    user.accessLevel,
                                                )}`}
                                            >
                                                {user.accessLevel.toUpperCase()}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] px-4 py-1 font-body border-0 ${getStatusBadgeColor(
                                                    user.status,
                                                )}`}
                                            >
                                                {user.status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        {user.userEmploymentProfile
                                            ?.position && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Briefcase className="mr-1 w-4 h-4" />
                                                <span className="text-xs font-thin uppercase font-body">
                                                    {
                                                        user
                                                            .userEmploymentProfile
                                                            .position
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Contact Information
                            </h3>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Mail className="mr-2 w-4 h-4 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        {user.email}
                                    </span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center">
                                        <Phone className="mr-2 w-4 h-4 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            {user.phone}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Organization Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Organization Information
                            </h3>
                            <div className="grid gap-3">
                                {user.branch && (
                                    <div className="flex items-center">
                                        <Building className="mr-2 w-4 h-4 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Branch: {user.branch.name}
                                        </span>
                                    </div>
                                )}
                                {user.organisation && (
                                    <div className="flex items-center">
                                        <Building className="mr-2 w-4 h-4 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Organization:{' '}
                                            {user.organisation.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'access':
                return (
                    <div className="space-y-6">
                        {/* Account Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Account Information
                            </h3>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <UserSquare className="mr-2 w-4 h-4 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Username: {user.username}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <AtSign className="mr-2 w-4 h-4 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Reference: {user.userref || 'Not set'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="mr-2 w-4 h-4 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Created: {formatDate(user.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="mr-2 w-4 h-4 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Last Updated:{' '}
                                        {formatDate(user.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Access Level Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="mb-2 text-xs font-normal uppercase font-body">
                                Access Level Details
                            </h3>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Shield className="mr-2 w-4 h-4 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Current Access Level: {user.accessLevel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'targets':
                // Convert UserTarget to match the expected type structure
                const convertedTargetData = user.userTarget ? {
                    id: user.userTarget.uid,
                    targetSalesAmount: parseFloat(user.userTarget.targetSalesAmount),
                    currentSalesAmount: parseFloat(user.userTarget.currentSalesAmount),
                    targetCurrency: user.userTarget.targetCurrency,
                    targetHoursWorked: user.userTarget.targetHoursWorked,
                    currentHoursWorked: user.userTarget.currentHoursWorked || undefined,
                    targetNewClients: user.userTarget.targetNewClients,
                    currentNewClients: user.userTarget.currentNewClients,
                    targetNewLeads: user.userTarget.targetNewLeads,
                    currentNewLeads: user.userTarget.currentNewLeads,
                    targetCheckIns: user.userTarget.targetCheckIns,
                    currentCheckIns: user.userTarget.currentCheckIns,
                    targetCalls: user.userTarget.targetCalls,
                    currentCalls: user.userTarget.currentCalls || undefined,
                    targetPeriod: user.userTarget.targetPeriod,
                    periodStartDate: user.userTarget.periodStartDate,
                    periodEndDate: user.userTarget.periodEndDate,
                    createdAt: user.userTarget.createdAt,
                    updatedAt: user.userTarget.updatedAt,
                } : null;

                return (
                    <div className="space-y-6">
                        <TargetsTab
                            profileData={user}
                            targetsData={convertedTargetData}
                            attendanceData={null}
                            rewardsData={null}
                            isTargetsLoading={false}
                            isAttendanceLoading={false}
                            isRewardsLoading={false}
                        />
                    </div>
                );
            case 'clients':
                return (
                    <div className="space-y-6">
                        {/* Assigned Clients Information */}
                        <div className="p-4 rounded-lg bg-card/50">
                            <h3 className="flex gap-2 items-center mb-4 text-xs font-normal uppercase font-body">
                                <Users className="w-4 h-4" />
                                Assigned Clients
                            </h3>
                            {user.assignedClients && user.assignedClients.length > 0 ? (
                                <div className="grid gap-3">
                                    {user.assignedClients?.map((client, index) => (
                                        <div key={client.uid || index} className="flex justify-between items-center p-3 rounded-lg border border-border/20 bg-background/50">
                                            <div className="flex gap-3 items-center">
                                                <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10">
                                                    <Building className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium font-body">
                                                        {client.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-body">
                                                        {client.contactPerson}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] px-2 py-1 font-body"
                                                >
                                                    {client.status || 'Active'}
                                                </Badge>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground font-body">
                                                        {client.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-body">
                                                        {client.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center p-8 text-center rounded-lg border border-dashed border-border/50">
                                    <Users className="mb-4 w-12 h-12 text-muted-foreground/50" />
                                    <p className="text-sm font-medium font-body text-muted-foreground">
                                        No Assigned Clients
                                    </p>
                                    <p className="text-xs font-body text-muted-foreground">
                                        This user has no clients assigned to them yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'activity':
                return (
                    <div className="p-4 rounded-lg bg-card/50">
                        <h3 className="mb-2 text-xs font-normal uppercase font-body">
                            Activity
                        </h3>
                        <p className="text-xs font-thin font-body">
                            User activity history will be displayed here in
                            future updates.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader className="flex flex-row justify-between items-start">
                        <div className="flex gap-3 items-center">
                            <div>
                                <DialogTitle className="text-xl font-semibold uppercase font-body">
                                    {`${user.name} ${user.surname}`}
                                </DialogTitle>
                                <div className="flex gap-2 items-center mt-2">
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-4 py-1 font-body border-0 ${getStatusBadgeColor(
                                            user.status,
                                        )}`}
                                    >
                                        {user.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            {/* Re-invite User Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-[10px] hover:text-green-500 font-normal uppercase border border-green-500 rounded h-8 font-body text-green-400"
                                onClick={handleReInviteUser}
                                disabled={isReInviting}
                                title="Re-invite user to platform"
                            >
                                <Send className="mr-1 w-3 h-3" strokeWidth={1.5} />
                                {isReInviting ? 'Sending...' : 'Re-invite'}
                            </Button>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="flex overflow-x-auto items-center mb-6 border-b border-border/10">
                            {tabs.map((tab) => (
                                <div
                                    key={tab?.id}
                                    className="flex relative gap-1 justify-center items-center mr-8 w-28 cursor-pointer"
                                >
                                    <div
                                        className={`mb-3 font-body px-0 font-normal ${
                                            activeTab === tab.id
                                                ? 'text-primary dark:text-primary'
                                                : 'text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200'
                                        }`}
                                        onClick={() => handleTabChange(tab?.id)}
                                    >
                                        <span className="text-xs font-thin uppercase font-body">
                                            {tab?.label}
                                        </span>
                                    </div>
                                    {activeTab === tab?.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary dark:bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                        {renderTabContent()}
                    </div>
                    <DialogFooter className="flex flex-col flex-wrap gap-4 pt-4 mt-6 border-t dark:border-gray-700">
                        <div className="flex flex-col justify-center items-center w-full">
                            <p className="text-xs font-thin uppercase font-body">
                                Quick Actions
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center w-full">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${user.status === UserStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(UserStatus.ACTIVE)
                                }
                                title="Activate User"
                            >
                                <UserCheck
                                    strokeWidth={1.2}
                                    className="w-7 h-7 text-green-600 dark:text-green-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${user.status === UserStatus.INACTIVE ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(UserStatus.INACTIVE)
                                }
                                title="Deactivate User"
                            >
                                <UserX
                                    strokeWidth={1.2}
                                    className="w-7 h-7 text-gray-600 dark:text-gray-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${user.status === UserStatus.SUSPENDED ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                                onClick={() =>
                                    initiateStatusChange(UserStatus.SUSPENDED)
                                }
                                title="Suspend User"
                            >
                                <UserMinus
                                    strokeWidth={1.2}
                                    className="w-7 h-7 text-red-600 dark:text-red-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-14 h-14 text-blue-800 rounded-full border-blue-200 hover:bg-blue-50 hover:border-blue-300 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:border-blue-900/30"
                                onClick={handleEditClick}
                                title="Edit User"
                            >
                                <Edit
                                    strokeWidth={1.2}
                                    className="w-7 h-7 text-blue-600 dark:text-blue-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="w-14 h-14 text-teal-800 rounded-full border-teal-200 hover:bg-teal-50 hover:border-teal-300 dark:text-teal-300 dark:hover:bg-teal-900/20 dark:border-teal-900/30"
                                onClick={handleTargetsClick}
                                title="Manage User Targets"
                            >
                                <Gauge
                                    strokeWidth={1.2}
                                    className="w-7 h-7 text-teal-600 dark:text-teal-400"
                                />
                            </Button>
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="w-14 h-14 text-purple-800 rounded-full border-purple-200 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30"
                                    onClick={() =>
                                        setShowDeleteConfirmation(true)
                                    }
                                    title="Delete User"
                                >
                                    <UserCog
                                        strokeWidth={1.2}
                                        className="w-7 h-7 text-purple-600 dark:text-purple-400"
                                    />
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Change Confirmation Dialog */}
            {showStatusConfirmation && (
                <Dialog
                    open={showStatusConfirmation}
                    onOpenChange={() => setShowStatusConfirmation(false)}
                >
                    <DialogContent className="p-6 max-w-md text-white border-0 bg-black/90">
                        <DialogTitle className="sr-only">
                            Confirm Status Change
                        </DialogTitle>
                        <div className="p-0">
                            <h2 className="mb-4 text-base font-semibold text-center uppercase font-body">
                                CONFIRM STATUS CHANGE
                            </h2>
                            <p className="mb-6 text-sm text-center font-body">
                                Are you sure you want to change the user status
                                to{' '}
                                <span className="font-semibold">
                                    {getStatusDisplayName(pendingStatusChange)}
                                </span>
                                ? This action cannot be undone.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    className="w-32 h-10 text-xs text-gray-300 uppercase border-gray-600 font-body hover:bg-gray-800"
                                    onClick={cancelStatusChange}
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="default"
                                    className="w-32 h-10 text-xs text-white uppercase bg-purple-600 font-body hover:bg-purple-700"
                                    onClick={confirmStatusChange}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirmation && (
                <Dialog
                    open={showDeleteConfirmation}
                    onOpenChange={() => setShowDeleteConfirmation(false)}
                >
                    <DialogContent className="p-6 max-w-md text-white border-0 bg-black/90">
                        <DialogTitle className="sr-only">
                            Confirm Delete User
                        </DialogTitle>
                        <div className="p-0">
                            <h2 className="mb-4 text-base font-semibold text-center uppercase font-body">
                                CONFIRM DELETE USER
                            </h2>
                            <p className="mb-6 text-sm text-center font-body">
                                Are you sure you want to delete this user? This
                                action cannot be undone.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button
                                    variant="outline"
                                    className="w-32 h-10 text-xs text-gray-300 uppercase border-gray-600 font-body hover:bg-gray-800"
                                    onClick={() =>
                                        setShowDeleteConfirmation(false)
                                    }
                                >
                                    CANCEL
                                </Button>
                                <Button
                                    variant="default"
                                    className="w-32 h-10 text-xs text-white uppercase bg-purple-600 font-body hover:bg-purple-700"
                                    onClick={handleDelete}
                                >
                                    CONFIRM
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Edit User Modal with UserEditForm */}
            <Dialog open={showEditModal} onOpenChange={handleCloseEditModal}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-thin uppercase font-body">
                            Edit User: {user.name} {user.surname}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-thin font-body">
                            Update user information and settings
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <UserEditForm
                            initialData={user}
                            onSubmit={handleUpdateUser}
                            isLoading={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* User Targets Modal */}
            <Dialog open={showTargetsModal} onOpenChange={handleCloseTargetsModal}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-thin uppercase font-body">
                            Manage Targets: {user.name} {user.surname}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-thin font-body">
                            Set performance targets for this user
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <UserTargetForm
                            userId={user?.uid}
                            onSubmit={handleUpdateUserTargets}
                            isLoading={false}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
