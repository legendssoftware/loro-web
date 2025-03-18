'use client';

import { PageTransition } from '@/components/animations/page-transition';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { UserFilterParams, UserStatus, User } from '@/lib/types/user';
import { useUsersQuery } from '@/hooks/use-users-query';
import { useAuthStatus } from '@/hooks/use-auth-status';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { UsersTabGroup } from '@/modules/users/components/users-tab-group';
import { UsersHeader } from '@/modules/users/components/users-header';
import { UserFormValues } from '@/modules/users/components/user-form';

// Dynamic imports for components that don't need to be loaded immediately
const UsersTabContent = dynamic(
    () =>
        import('@/modules/users/components/users-tab-content').then((mod) => ({
            default: mod.UsersTabContent,
        })),
    {
        loading: () => (
            <div className="flex items-center justify-center w-full h-full">
                Loading...
            </div>
        ),
    },
);

// Dynamically import UI components
const Dialog = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({ default: mod.Dialog })),
);
const DialogContent = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogContent,
    })),
);
const DialogHeader = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogHeader,
    })),
);
const DialogTitle = dynamic(() =>
    import('@/components/ui/dialog').then((mod) => ({
        default: mod.DialogTitle,
    })),
);

// Dynamically import UserForm
const UserForm = dynamic(
    () =>
        import('@/modules/users/components/user-form').then((mod) => ({
            default: mod.default,
        })),
    { ssr: false },
);

// Tab configuration
const tabs = [{ id: 'users', label: 'Users' }];

// Create User Modal Component
function CreateUserModal({
    isOpen,
    onClose,
    onCreateUser,
    isLoading,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateUser?: (userData: UserFormValues) => void;
    isLoading?: boolean;
}) {
    const handleSubmit = useCallback(
        async (data: UserFormValues) => {
            try {
                await onCreateUser?.(data);
                onClose();
            } catch (error) {}
        },
        [onCreateUser, onClose],
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
                <DialogHeader>
                    <DialogTitle className="text-lg font-thin uppercase font-body">
                        Add New User
                    </DialogTitle>
                </DialogHeader>
                <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
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
        limit: 20, // Updated from 10 to 20 to fetch more users per page
    });
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        async (userData: UserFormValues) => {
            try {
                setIsSubmitting(true);
                await createUser(userData as unknown as Partial<User>);
                return true;
            } catch (error) {
                console.error('Error creating user:', error);
                throw error;
            } finally {
                setIsSubmitting(false);
            }
        },
        [createUser],
    );

    // Apply filters handler
    const handleApplyFilters = useCallback((newFilters: UserFilterParams) => {
        setFilterParams((prev) => ({
            ...prev,
            ...newFilters,
            page: 1, // Reset to page 1 when filters change
            limit: 20, // Updated from 10 to 20 to fetch more users per page
        }));
    }, []);

    // Clear filters handler
    const handleClearFilters = useCallback(() => {
        setFilterParams({
            page: 1,
            limit: 20, // Updated from 10 to 20 to fetch more users per page
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
                isLoading={isSubmitting}
            />
        </PageTransition>
    );
}
