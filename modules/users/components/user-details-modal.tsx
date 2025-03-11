'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
} from 'lucide-react';
import { User, UserStatus, AccessLevel } from '@/lib/types/user';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { showErrorToast } from '@/lib/utils/toast-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

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
    const [editedUser, setEditedUser] = useState<User>({ ...user });
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('details');
    const [showEditModal, setShowEditModal] = useState<boolean>(false);

    // Format dates
    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return format(new Date(date), 'MMM d, yyyy');
    };

    // Handle status change
    const handleStatusChange = (status: UserStatus) => {
        if (onUpdateStatus) {
            onUpdateStatus(user.uid, status);
        }
    };

    // Handle tab change
    const handleTabChange = (tabId: string) => {
        if (activeTab !== tabId) {
            setActiveTab(tabId);
        }
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

    // Handle delete user
    const handleDelete = useCallback(async () => {
        if (onDelete) {
            try {
                await onDelete(user.uid);
                onClose();
            } catch (error) {
                showErrorToast('Failed to delete user', toast);
            }
        }
    }, [user.uid, onDelete, onClose]);

    // Show the "Activating Soon" modal when Edit is clicked
    const handleEditClick = () => {
        setShowEditModal(true);
    };

    // Close the edit modal
    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const tabs = [
        { id: 'details', label: 'Details' },
        { id: 'access', label: 'Access' },
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
                            <div className="flex items-start gap-4">
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
                                        <h2 className="text-xl font-bold">
                                            {user.name} {user.surname}
                                        </h2>
                                        <div className="flex items-center gap-2">
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
                                                <Briefcase className="w-4 h-4 mr-1" />
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
                                    <Mail className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        {user.email}
                                    </span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-card-foreground/60" />
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
                                        <Building className="w-4 h-4 mr-2 text-card-foreground/60" />
                                        <span className="text-xs font-thin font-body">
                                            Branch: {user.branch.name}
                                        </span>
                                    </div>
                                )}
                                {user.organisation && (
                                    <div className="flex items-center">
                                        <Building className="w-4 h-4 mr-2 text-card-foreground/60" />
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
                                    <UserSquare className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Username: {user.username}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <AtSign className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Reference: {user.userref || 'Not set'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Created: {formatDate(user.createdAt)}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-card-foreground/60" />
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
                                    <Shield className="w-4 h-4 mr-2 text-card-foreground/60" />
                                    <span className="text-xs font-thin font-body">
                                        Current Access Level: {user.accessLevel}
                                    </span>
                                </div>
                            </div>
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
                    <DialogHeader className="flex flex-row items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-semibold uppercase font-body">
                                {`${user.name} ${user.surname}`}
                            </DialogTitle>
                            <div className="flex items-center gap-2 mt-2">
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
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={onClose}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-9 h-9"
                                onClick={handleEditClick}
                            >
                                <Edit className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="flex items-center mb-6 overflow-x-auto border-b border-border/10">
                            {tabs.map((tab) => (
                                <div
                                    key={tab?.id}
                                    className="relative flex items-center justify-center gap-1 mr-8 cursor-pointer w-28"
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
                        <div className="flex flex-col items-center justify-center w-full">
                            <p className="text-xs font-thin uppercase font-body">
                                Manage this user
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center w-full gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 dark:text-green-300 dark:hover:bg-green-900/20 dark:border-green-900/30 ${user.status === UserStatus.ACTIVE ? 'bg-green-100 dark:bg-green-900/30' : ''}`}
                                onClick={() =>
                                    handleStatusChange(UserStatus.ACTIVE)
                                }
                                title="Activate User"
                            >
                                <UserCheck
                                    strokeWidth={1.2}
                                    className="text-green-600 w-7 h-7 dark:text-green-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-800/20 dark:border-gray-700 ${user.status === UserStatus.INACTIVE ? 'bg-gray-100 dark:bg-gray-800/50' : ''}`}
                                onClick={() =>
                                    handleStatusChange(UserStatus.INACTIVE)
                                }
                                title="Deactivate User"
                            >
                                <UserX
                                    strokeWidth={1.2}
                                    className="text-gray-600 w-7 h-7 dark:text-gray-400"
                                />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className={`w-14 h-14 rounded-full text-red-800 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-300 dark:hover:bg-red-900/20 dark:border-red-900/30 ${user.status === UserStatus.SUSPENDED ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
                                onClick={() =>
                                    handleStatusChange(UserStatus.SUSPENDED)
                                }
                                title="Suspend User"
                            >
                                <UserMinus
                                    strokeWidth={1.2}
                                    className="text-red-600 w-7 h-7 dark:text-red-400"
                                />
                            </Button>
                            {onDelete && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-purple-800 border-purple-200 rounded-full w-14 h-14 hover:bg-purple-50 hover:border-purple-300 dark:text-purple-300 dark:hover:bg-purple-900/20 dark:border-purple-900/30"
                                    onClick={() =>
                                        setShowDeleteConfirmation(true)
                                    }
                                    title="Delete User"
                                >
                                    <UserCog
                                        strokeWidth={1.2}
                                        className="text-purple-600 w-7 h-7 dark:text-purple-400"
                                    />
                                </Button>
                            )}
                        </div>
                    </DialogFooter>

                    {/* Delete Confirmation */}
                    {showDeleteConfirmation && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTriangle className="w-4 h-4" />
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                Are you sure you want to delete this user? This
                                action cannot be undone.
                                <div className="flex justify-end gap-2 mt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowDeleteConfirmation(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Modal - "Activating Soon" */}
            <Dialog open={showEditModal} onOpenChange={handleCloseEditModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-thin uppercase font-body"></DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center h-64">
                        <h2 className="text-xs font-thin uppercase font-body">
                            Activating Soon
                        </h2>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
