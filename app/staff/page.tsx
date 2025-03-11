'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { UserFilterParams, UserStatus } from '@/lib/types/user';
import { useUsersQuery } from '@/hooks/use-users-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import { UsersTabGroup } from '@/modules/users/components/users-tab-group';
import { UsersTabContent } from '@/modules/users/components/users-tab-content';
import { UsersHeader } from '@/modules/users/components/users-header';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Tab configuration
const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'reports', label: 'Reports' },
    { id: 'analytics', label: 'Analytics' },
];

// Create User Modal Component
function CreateUserModal({
    isOpen,
    onClose,
    onCreateUser,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateUser?: (userData: any) => void;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
    );
}

export default function StaffPage() {
    const router = useRouter();
    const { isAuthenticated, checkStatus } = useAuthStatus();

    // Check authentication on component mount
    useEffect(() => {
        const status = checkStatus();
        if (!status.isAuthenticated) {
            console.warn('User not authenticated. Redirecting to login page.');
            router.push('/sign-in');
        }
    }, [checkStatus, router]);

    // State
    const [activeTab, setActiveTab] = useState<string>('users');
    const [filterParams, setFilterParams] = useState<UserFilterParams>({
        page: 1,
        limit: 500,
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Memoize filter params to prevent unnecessary re-renders
    const currentFilters = useMemo(() => filterParams, [filterParams]);

    // Use the React Query hook only if authenticated
    const {
        users,
        isLoading,
        error,
        updateUserStatus,
        deleteUser,
        createUser,
        refetch,
        pagination,
    } = useUsersQuery(isAuthenticated ? currentFilters : {});

    // Refetch data when authentication changes
    useEffect(() => {
        if (isAuthenticated) {
            refetch();
        }
    }, [isAuthenticated, refetch]);

    // Handlers
    const handleUpdateUserStatus = useCallback(
        async (userId: number, newStatus: UserStatus) => {
            await updateUserStatus(userId, newStatus);
        },
        [updateUserStatus],
    );

    const handleDeleteUser = useCallback(
        async (userId: number) => {
            await deleteUser(userId);
        },
        [deleteUser],
    );

    const handleCreateUser = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleSubmitCreateUser = useCallback(
        async (userData: any) => {
            await createUser(userData);
        },
        [createUser],
    );

    // Apply filters handler
    const handleApplyFilters = useCallback((newFilters: UserFilterParams) => {
        setFilterParams((prev) => ({
            ...prev,
            ...newFilters,
            limit: 5, // Changed from 500 to 5 for testing pagination
        }));
    }, []);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
        setFilterParams({
            page: 1,
            limit: 5, // Changed from 500 to 5 for testing pagination
        });
    }, []);

    // Add pagination handler
    const handlePageChange = useCallback((page: number) => {
        setFilterParams((prev) => ({
            ...prev,
            page,
        }));
    }, []);

    return (
        <PageTransition>
            <div className="flex flex-col h-screen gap-2 overflow-hidden">
                <UsersTabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className="flex flex-col flex-1 overflow-hidden">
                    {activeTab === 'users' && (
                        <UsersHeader
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={handleClearFilters}
                            onAddUser={handleCreateUser}
                        />
                    )}
                    <div className="flex items-center justify-center flex-1 px-3 py-3 overflow-hidden xl:px-8 xl:px-4">
                        <UsersTabContent
                            activeTab={activeTab}
                            isLoading={isLoading}
                            error={error}
                            users={users}
                            onUpdateUserStatus={handleUpdateUserStatus}
                            onDeleteUser={handleDeleteUser}
                            onAddUser={handleCreateUser}
                            pagination={{
                                currentPage: Math.max(
                                    1,
                                    filterParams.page || 1,
                                ),
                                totalPages: Math.max(
                                    1,
                                    pagination?.totalPages || 1,
                                ),
                                onPageChange: handlePageChange,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Render the CreateUserModal */}
            <CreateUserModal
                isOpen={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                onCreateUser={handleSubmitCreateUser}
            />
        </PageTransition>
    );
}
