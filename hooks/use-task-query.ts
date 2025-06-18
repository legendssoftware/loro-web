import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus } from '@/lib/types/task';
import toast from 'react-hot-toast';
import { useTaskApi } from './use-task-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';
import { invalidateTaskQueries } from './use-tasks-query';

const TASK_QUERY_KEY = 'task';

/**
 * Hook for fetching and managing a single task using React Query with enhanced cache invalidation
 * @param taskId The ID of the task to fetch
 * @returns Task data, loading state, error state, and enhanced mutation functions
 */
export function useTaskQuery(taskId: string | number) {
    const queryClient = useQueryClient();
    const taskApi = useTaskApi();

    // Convert taskId to number if it's a string
    const id = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;

    // Fetch task with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [TASK_QUERY_KEY, id],
        queryFn: () => taskApi.getTask(id),
        staleTime: 1000 * 30, // 30 seconds
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: !!id && !isNaN(id),
    });

    // Enhanced update task mutation with operation type support
    const updateTaskMutation = useMutation({
        mutationFn: async ({
            updates,
            updateType = 'update',
        }: {
            updates: Partial<Task>;
            updateType?: 'update' | 'approve' | 'postpone' | 'cancel' | 'complete';
        }) => {
            try {
                const result = await taskApi.updateTask(id, updates);
                return { ...result, updateType, taskId: id };
            } catch (error: any) {
                console.error('Update task error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            // Show appropriate success message
            const actionMessages: Record<string, string> = {
                approve: 'Task approved successfully',
                postpone: 'Task postponed successfully',
                cancel: 'Task cancelled successfully',
                complete: 'Task completed successfully',
                update: 'Task updated successfully',
            };

            if (result?.message && result.message.toLowerCase().includes('success')) {
                showSuccessToast(actionMessages[result.updateType] || 'Task updated successfully', toast);
            }

            // Enhanced cache invalidation with immediate refetch
            invalidateTaskQueries(queryClient, {
                taskId: result.taskId,
                updateType: result.updateType,
                refetchTask: true,
                includeStats: true,
                includeDashboard: true,
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.message || 'Failed to update task. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async () => {
            try {
                const result = await taskApi.deleteTask(id);
                return { ...result, taskId: id };
            } catch (error: any) {
                console.error('Delete task error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            if (result?.message && result.message.toLowerCase().includes('success')) {
                showSuccessToast('Task deleted successfully', toast);
            }

            // Enhanced cache invalidation for deletions
            invalidateTaskQueries(queryClient, {
                taskId: result.taskId,
                updateType: 'delete',
                includeStats: true,
                includeDashboard: true,
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.message || 'Failed to delete task. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Enhanced update task wrapper function
    const updateTask = useCallback(
        async (updates: Partial<Task>, updateType: 'update' | 'approve' | 'postpone' | 'cancel' | 'complete' = 'update') => {
            return updateTaskMutation.mutateAsync({ updates, updateType });
        },
        [updateTaskMutation],
    );

    // Specific action functions for better UX
    const approveTask = useCallback(
        async (updates: Partial<Task> = {}) => {
            return updateTask({ ...updates, status: TaskStatus.IN_PROGRESS }, 'approve');
        },
        [updateTask],
    );

    const postponeTask = useCallback(
        async (deadline: Date, updates: Partial<Task> = {}) => {
            return updateTask({ ...updates, status: TaskStatus.POSTPONED, deadline }, 'postpone');
        },
        [updateTask],
    );

    const cancelTask = useCallback(
        async (updates: Partial<Task> = {}) => {
            return updateTask({ ...updates, status: TaskStatus.CANCELLED }, 'cancel');
        },
        [updateTask],
    );

    const completeTask = useCallback(
        async (updates: Partial<Task> = {}) => {
            return updateTask({ ...updates, status: TaskStatus.COMPLETED, progress: 100 }, 'complete');
        },
        [updateTask],
    );

    const deleteTask = useCallback(
        async () => {
            return deleteTaskMutation.mutateAsync();
        },
        [deleteTaskMutation],
    );

    // Manual refetch with enhanced cache invalidation
    const refetchTask = useCallback(
        async () => {
            // Invalidate and refetch this specific task
            invalidateTaskQueries(queryClient, {
                taskId: id,
                updateType: 'update',
                refetchTask: true,
                includeStats: false,
                includeDashboard: false,
            });

            return refetch();
        },
        [queryClient, id, refetch],
    );

    return {
        task: data,
        loading: isLoading,
        error: error as Error | null,
        refetch: refetchTask,
        updateTask,
        deleteTask,
        // Specific action functions
        approveTask,
        postponeTask,
        cancelTask,
        completeTask,
        // Enhanced utilities
        invalidateTaskQueries: useCallback(
            (options = {}) => invalidateTaskQueries(queryClient, { taskId: id, ...options }),
            [queryClient, id],
        ),
    };
}
