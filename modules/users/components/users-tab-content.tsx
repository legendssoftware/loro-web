'use client';

import { memo } from 'react';
import { AppLoader } from '@/components/loaders/page-loader';
import { UsersGrid } from './users-grid';
import { User, UserStatus } from '@/lib/types/user';

interface UsersTabContentProps {
    activeTab: string;
    isLoading: boolean;
    error: Error | null;
    users: User[];
    onUpdateUserStatus: (userId: number, newStatus: UserStatus) => void;
    onDeleteUser: (userId: number) => void;
    onAddUser: () => void;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
}

// Main Users tab content component
const UsersContent = memo(
    ({
        users,
        onUpdateUserStatus,
        onDeleteUser,
        onAddUser,
        pagination,
    }: Omit<UsersTabContentProps, 'activeTab' | 'isLoading' | 'error'>) => {
        return (
            <div className="flex flex-col w-full h-full overflow-hidden">
                <div className="flex-1 w-full overflow-hidden">
                    <UsersGrid
                        users={users}
                        onUpdateUserStatus={onUpdateUserStatus}
                        onDeleteUser={onDeleteUser}
                        onAddUser={onAddUser}
                        currentPage={pagination?.currentPage}
                        totalPages={pagination?.totalPages}
                        onPageChange={pagination?.onPageChange}
                    />
                </div>
            </div>
        );
    },
);

UsersContent.displayName = 'UsersContent';

// Reports tab content
const ReportsContent = memo(() => {
    return (
        <div className="h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-lg font-thin uppercase font-body">
                    User Reports
                </p>
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    User reports functionality activating soon
                </p>
            </div>
        </div>
    );
});

ReportsContent.displayName = 'ReportsContent';

// Analytics tab content
const AnalyticsContent = memo(() => {
    return (
        <div className="w-full h-full overflow-hidden">
            <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="text-lg font-thin uppercase font-body">
                    User Analytics
                </p>
                <p className="text-xs font-thin uppercase text-muted-foreground font-body">
                    User analytics functionality activating soon
                </p>
            </div>
        </div>
    );
});

AnalyticsContent.displayName = 'AnalyticsContent';

// Loading component
const LoadingContent = memo(() => {
    return (
        <div className="flex items-center justify-center flex-1 w-full h-full">
            <AppLoader />
        </div>
    );
});

LoadingContent.displayName = 'LoadingContent';

// Error component
const ErrorContent = memo(() => {
    return (
        <div className="py-12 text-center">
            <p className="text-xs font-normal uppercase text-destructive font-body">
                Failed to load users. Please try again.
            </p>
        </div>
    );
});

ErrorContent.displayName = 'ErrorContent';

// Main component that switches between tab contents
function UsersTabContentComponent({
    activeTab,
    isLoading,
    error,
    users,
    onUpdateUserStatus,
    onDeleteUser,
    onAddUser,
    pagination,
}: UsersTabContentProps) {
    if (isLoading) {
        return <LoadingContent />;
    }

    if (error) {
        return <ErrorContent />;
    }

    switch (activeTab) {
        case 'users':
            return (
                <UsersContent
                    users={users}
                    onUpdateUserStatus={onUpdateUserStatus}
                    onDeleteUser={onDeleteUser}
                    onAddUser={onAddUser}
                    pagination={pagination}
                />
            );
        case 'reports':
            return <ReportsContent />;
        case 'analytics':
            return <AnalyticsContent />;
        default:
            return null;
    }
}

export const UsersTabContent = memo(UsersTabContentComponent);
