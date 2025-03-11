'use client';

import { User, UserStatus } from '@/lib/types/user';
import { UserCard } from './user-card';
import { memo, useState, useEffect, useMemo } from 'react';
import { FloatingPagination } from '@/components/ui/floating-pagination';

interface UsersGridProps {
    users: User[];
    onUpdateUserStatus: (userId: number, newStatus: UserStatus) => void;
    onDeleteUser: (userId: number) => void;
    onAddUser: () => void;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

export function UsersGridComponent({
    users,
    onUpdateUserStatus,
    onDeleteUser,
    onAddUser,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
}: UsersGridProps) {
    // Use received pagination props or handle pagination locally
    const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
    const [displayedUsers, setDisplayedUsers] = useState<User[]>(users);

    // Update local state when props change
    useEffect(() => {
        setLocalCurrentPage(currentPage);
    }, [currentPage]);

    // Define a consistent page size
    const PAGE_SIZE = 20;

    // Update displayed users when users or pagination changes
    useEffect(() => {
        // Use external pagination if onPageChange is provided (server-side pagination)
        // Otherwise, handle pagination locally (client-side pagination)
        if (onPageChange) {
            // For server-side pagination, just use the provided users
            setDisplayedUsers(users);
        } else {
            // For client-side pagination, slice the users array based on current page
            const startIndex = (localCurrentPage - 1) * PAGE_SIZE;
            const endIndex = startIndex + PAGE_SIZE;
            setDisplayedUsers(users.slice(startIndex, endIndex));
        }
    }, [users, localCurrentPage, onPageChange]);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (onPageChange) {
            // Call the provided onPageChange handler (server-side pagination)
            onPageChange(page);
        } else {
            // Update local state for client-side pagination
            setLocalCurrentPage(page);
        }
    };

    // Determine total pages for local pagination
    const localTotalPages = useMemo(() => {
        if (onPageChange) {
            // Use the provided totalPages for server-side pagination
            return totalPages;
        } else {
            // Calculate total pages for client-side pagination
            return Math.max(1, Math.ceil(users.length / PAGE_SIZE));
        }
    }, [users, totalPages, onPageChange]);

    return (
        <div className="relative w-full h-full">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {displayedUsers.map((user, index) => (
                    <UserCard
                        key={user.uid}
                        user={user}
                        onUpdateStatus={onUpdateUserStatus}
                        onDelete={onDeleteUser}
                        index={index}
                    />
                ))}
                {displayedUsers.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-sm font-normal uppercase border border-dashed rounded-md col-span-full border-border text-muted-foreground font-body animate-fade-in">
                        No users found
                    </div>
                )}
            </div>

            {/* Pagination - always render the component, it will hide itself if only 1 page */}
            <FloatingPagination
                currentPage={localCurrentPage}
                totalPages={localTotalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export const UsersGrid = memo(UsersGridComponent);
