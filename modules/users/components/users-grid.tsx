'use client';

import { User, UserStatus } from '@/lib/types/user';
import { UserCard } from './user-card';
import { memo, useState, useEffect } from 'react';
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

function UsersGridComponent({
    users,
    onUpdateUserStatus,
    onDeleteUser,
    onAddUser,
    currentPage = 1,
    totalPages = 1,
    onPageChange,
}: UsersGridProps) {
    // Local pagination state if not provided by parent
    const [localCurrentPage, setLocalCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Set to 5 for testing as requested
    const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);

    // Handle parent-controlled or local pagination
    const isExternalPagination = !!onPageChange;
    const effectiveCurrentPage = isExternalPagination ? currentPage : localCurrentPage;
    const effectiveTotalPages = isExternalPagination ? totalPages : Math.max(1, Math.ceil(users.length / itemsPerPage));

    // Update paginated users when users array or page changes
    useEffect(() => {
        if (!isExternalPagination) {
            const startIndex = (localCurrentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            setPaginatedUsers(users.slice(startIndex, endIndex));
        } else {
            setPaginatedUsers(users);
        }
    }, [users, localCurrentPage, itemsPerPage, isExternalPagination]);

    // Handle page change
    const handlePageChange = (page: number) => {
        if (isExternalPagination && onPageChange) {
            onPageChange(page);
        } else {
            setLocalCurrentPage(page);
        }
    };
    
    // Only show users if we have some
    const displayedUsers = isExternalPagination ? users : paginatedUsers;

    return (
        <div className="flex-1 w-full overflow-hidden relative">
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
            
            {/* Always show pagination regardless of number of items */}
            <FloatingPagination 
                currentPage={effectiveCurrentPage}
                totalPages={effectiveTotalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}

export const UsersGrid = memo(UsersGridComponent);
