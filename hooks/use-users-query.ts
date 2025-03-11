import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User,
    UserStatus,
    UserFilterParams,
    UsersByStatus,
} from '@/lib/types/user';
import toast from 'react-hot-toast';
import { useUserApi } from './use-user-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

const USERS_QUERY_KEY = 'users';

export function useUsersQuery(filters: UserFilterParams = {}) {
    const queryClient = useQueryClient();
    const userApi = useUserApi();

    // Use the provided limit from filters or default to 20 if not specified
    const enhancedFilters = useMemo(
        () => ({
            ...filters,
            limit: filters.limit || 20,
        }),
        [filters],
    );

    // Fetch users with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [USERS_QUERY_KEY, enhancedFilters],
        queryFn: () => userApi.getUsers(enhancedFilters),
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60, // 1 minute
        // Add retry and error handling
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled:
            Object.keys(enhancedFilters)?.length > 0 ||
            !enhancedFilters?.hasOwnProperty('page'),
    });

    // Group users by status
    const usersByStatus = useMemo<UsersByStatus>(() => {
        const statusGroups = {
            [UserStatus.ACTIVE]: [],
            [UserStatus.INACTIVE]: [],
            [UserStatus.SUSPENDED]: [],
            [UserStatus.PENDING]: [],
            [UserStatus.DELETED]: [],
        } as UsersByStatus;

        if (data?.items) {
            // Group users by status
            data.items.forEach((user) => {
                if (!user.isDeleted || user.status === UserStatus.DELETED) {
                    statusGroups[user.status].push(user);
                }
            });
        }

        return statusGroups;
    }, [data?.items]);

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: async (userData: Partial<User>) => {
            try {
                const result = await userApi.createUser(userData);
                showSuccessToast('User created successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast(
                    'Failed to create user. Please try again.',
                    toast,
                );
                console.error('Create user error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate users query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: async ({
            userId,
            updates,
        }: {
            userId: number;
            updates: Partial<User>;
        }) => {
            try {
                await userApi.updateUser(userId, updates);
                showSuccessToast('User updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to update user. Please try again.',
                    toast,
                );
                console.error('Update user error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate users query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: number) => {
            try {
                await userApi.deleteUser(userId);
                showSuccessToast('User deleted successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to delete user. Please try again.',
                    toast,
                );
                console.error('Delete user error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate users query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
        },
    });

    // Create user wrapper function
    const createUser = useCallback(
        async (userData: Partial<User>) => {
            return createUserMutation.mutate(userData);
        },
        [createUserMutation],
    );

    // Update user wrapper function
    const updateUser = useCallback(
        async (userId: number, updates: Partial<User>) => {
            return updateUserMutation.mutate({ userId, updates });
        },
        [updateUserMutation],
    );

    // Delete user wrapper function
    const deleteUser = useCallback(
        async (userId: number) => {
            return deleteUserMutation.mutate(userId);
        },
        [deleteUserMutation],
    );

    // Update user status wrapper function
    const updateUserStatus = useCallback(
        async (userId: number, newStatus: UserStatus) => {
            return updateUserMutation.mutate({
                userId,
                updates: { status: newStatus },
            });
        },
        [updateUserMutation],
    );

    // Apply filters
    const applyFilters = useCallback((newFilters: UserFilterParams) => {
        // This doesn't directly modify state as the hook will be called with new filters
        return newFilters;
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        // Returns empty object to clear filters
        return {};
    }, []);

    // Return pagination data along with users
    return {
        users: data?.items || [],
        usersByStatus,
        isLoading,
        error: error as Error | null,
        createUser,
        updateUser,
        deleteUser,
        updateUserStatus,
        applyFilters,
        clearFilters,
        refetch,
        // Include pagination data - ensure minimum values
        pagination: {
            currentPage: data?.page || 1,
            totalPages: Math.max(1, data?.totalPages || 1),
            total: data?.total || 0,
            limit: data?.limit || 20,
        },
    };
}
