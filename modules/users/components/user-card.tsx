'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, UserStatus, AccessLevel } from '@/lib/types/user';
import { Building, Mail, Phone, Briefcase } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { UserDetailsModal } from './user-details-modal';

interface UserCardProps {
    user: User;
    onUpdateStatus?: (userId: number, newStatus: UserStatus) => void;
    onDelete?: (userId: number) => void;
    index?: number;
}

// Create the UserCard as a standard component
function UserCardComponent({
    user,
    onUpdateStatus,
    onDelete,
    index = 0,
}: UserCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use CSS variables for animation delay - match tasks component's variable name
    const cardStyle = {
        '--task-delay': `${Math.min(index * 50, 500)}ms`,
    } as React.CSSProperties;

    const handleStatusChange = useCallback(
        (userId: number, newStatus: UserStatus) => {
            if (onUpdateStatus) {
                onUpdateStatus(userId, newStatus);
            }
        },
        [onUpdateStatus],
    );

    const handleDelete = useCallback(
        (userId: number) => {
            if (onDelete) {
                onDelete(userId);
            }
        },
        [onDelete],
    );

    const formatDate = (date?: Date) => {
        if (!date) return null;
        return format(new Date(date), 'MMM d, yyyy');
    };

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
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAccessLevelBadgeColor = (accessLevel: AccessLevel) => {
        switch (accessLevel) {
            case AccessLevel.ADMIN:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case AccessLevel.MANAGER:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case AccessLevel.SUPPORT:
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            case AccessLevel.DEVELOPER:
                return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
            case AccessLevel.USER:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const openModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    return (
        <>
            <div
                className="p-3 overflow-hidden border rounded-md shadow-sm cursor-pointer bg-card border-border/50 hover:shadow-md animate-task-appear"
                style={cardStyle}
                onClick={openModal}
            >
                <div className="flex items-center justify-between mb-2">
                    {/* User Avatar */}
                    <Avatar className="w-10 h-10 mr-3 border border-primary">
                        <AvatarImage src={user?.photoURL} alt={user?.name} />
                        <AvatarFallback className="text-xs font-normal uppercase font-body">
                            {`${user?.name?.charAt(0)} ${user?.surname?.charAt(0) || ''}`}
                        </AvatarFallback>
                    </Avatar>

                    {/* User Name & Status Badge */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium uppercase truncate text-card-foreground font-body">
                            {user.name} {user.surname}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={`text-[9px] font-normal uppercase font-body px-2 py-1 border-0 ${getStatusBadgeColor(
                                    user?.status,
                                )}`}
                            >
                                {user?.status?.replace('_', ' ')}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`text-[9px] font-normal uppercase font-body px-2 py-1 border-0 ${getAccessLevelBadgeColor(
                                    user?.accessLevel,
                                )}`}
                            >
                                {user?.accessLevel?.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* User Details */}
                <div className="mt-2 space-y-4 text-xs text-muted-foreground">
                    {/* User Meta Information */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Email */}
                        <div className="flex items-center col-span-2">
                            <Mail className="w-4 h-4 mr-1" />
                            <span className="text-[10px] font-normal font-body">
                                {user?.email}
                            </span>
                        </div>

                        {/* Phone */}
                        {user?.phone && (
                            <div className="flex items-center col-span-2">
                                <Phone className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {user?.phone}
                                </span>
                            </div>
                        )}

                        {/* Branch */}
                        {user.branch && (
                            <div className="flex items-center col-span-2">
                                <Building className="w-4 h-4 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {user.branch.name}
                                </span>
                            </div>
                        )}

                        {/* Position */}
                        {user.userEmploymentProfile?.position && (
                            <div className="flex items-center col-span-2">
                                <Briefcase className="w-3 h-3 mr-1" />
                                <span className="text-[10px] font-normal uppercase font-body">
                                    {user.userEmploymentProfile.position}
                                </span>
                            </div>
                        )}

                        {/* Created Date */}
                        <div className="flex items-center col-span-2 mt-2">
                            <span className="text-[10px] font-normal uppercase font-body">
                                User since: {formatDate(user?.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {isModalOpen && (
                <UserDetailsModal
                    user={user}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onUpdateStatus={handleStatusChange}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}

// Export a memoized version to prevent unnecessary re-renders
export const UserCard = memo(UserCardComponent);
