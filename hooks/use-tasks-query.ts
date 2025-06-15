import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Task,
    TaskStatus,
    TaskFilterParams,
    TasksByStatus,
} from '@/lib/types/task';
import toast from 'react-hot-toast';
import { useTaskApi } from './use-task-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

const TASKS_QUERY_KEY = 'tasks';

export function useTasksQuery(filters: TaskFilterParams = {}) {
    const queryClient = useQueryClient();
    const taskApi = useTaskApi();

    // Ensure we always use a limit of 500
    const enhancedFilters = useMemo(
        () => ({
            ...filters,
            limit: 500,
        }),
        [filters],
    );

    // Fetch tasks with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [TASKS_QUERY_KEY, enhancedFilters],
        queryFn: () => taskApi.getTasks(enhancedFilters),
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60, // 1 minute
        // Add retry and error handling
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled:
            Object.keys(enhancedFilters)?.length > 0 ||
            !enhancedFilters?.hasOwnProperty('page'),
    });

    // Group tasks by status
    const tasksByStatus = useMemo<TasksByStatus>(() => {
        const statusGroups = {
            [TaskStatus.PENDING]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.COMPLETED]: [],
            [TaskStatus.CANCELLED]: [],
            [TaskStatus.OVERDUE]: [],
            [TaskStatus.POSTPONED]: [],
            [TaskStatus.MISSED]: [],
        } as TasksByStatus;

        if (data?.items) {
            // Group tasks by status
            data.items.forEach((task) => {
                if (!task.isDeleted) {
                    statusGroups[task.status].push(task);
                }
            });
        }

        return statusGroups;
    }, [data?.items]);

    // Create task mutation
    const createTaskMutation = useMutation({
        mutationFn: async (taskData: Partial<Task>) => {
            try {
                const result = await taskApi.createTask(taskData);
                return result;
            } catch (error: any) {
                console.error('Create task error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            // Only show success toast if server returned success message
            if (
                result?.message &&
                result.message.toLowerCase().includes('success')
            ) {
                showSuccessToast('Task created successfully', toast);
            }
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
        onError: (error: any) => {
            // Use server error message if available, otherwise use generic message
            const errorMessage =
                error?.message || 'Failed to create task. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Update task mutation
    const updateTaskMutation = useMutation({
        mutationFn: async ({
            taskId,
            updates,
        }: {
            taskId: number;
            updates: Partial<Task>;
        }) => {
            try {
                // Ensure taskId is a number
                const numericTaskId = Number(taskId);
                if (isNaN(numericTaskId)) {
                    throw new Error('Invalid task reference for update');
                }

                const result = await taskApi.updateTask(numericTaskId, updates);
                return result;
            } catch (error: any) {
                console.error('Update task error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            // Only show success toast if server returned success message
            if (
                result?.message &&
                result.message.toLowerCase().includes('success')
            ) {
                showSuccessToast('Task updated successfully', toast);
            }
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
        onError: (error: any) => {
            // Use server error message if available, otherwise use generic message
            const errorMessage =
                error?.message || 'Failed to update task. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: number) => {
            try {
                // Ensure taskId is a number
                const numericTaskId = Number(taskId);
                if (isNaN(numericTaskId)) {
                    throw new Error('Invalid task reference for deletion');
                }

                const result = await taskApi.deleteTask(numericTaskId);
                return result;
            } catch (error: any) {
                console.error('Delete task error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            // Only show success toast if server returned success message
            if (
                result?.message &&
                result.message.toLowerCase().includes('success')
            ) {
                showSuccessToast('Task deleted successfully', toast);
            }
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
        onError: (error: any) => {
            // Use server error message if available, otherwise use generic message
            const errorMessage =
                error?.message || 'Failed to delete task. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Create task wrapper function
    const createTask = useCallback(
        async (taskData: Partial<Task>) => {
            return createTaskMutation.mutateAsync(taskData);
        },
        [createTaskMutation],
    );

    // Update task wrapper function
    const updateTask = useCallback(
        async (taskId: number, updates: Partial<Task>) => {
            return updateTaskMutation.mutateAsync({ taskId, updates });
        },
        [updateTaskMutation],
    );

    // Delete task wrapper function
    const deleteTask = useCallback(
        async (taskId: number) => {
            return deleteTaskMutation.mutateAsync(taskId);
        },
        [deleteTaskMutation],
    );

    // Update subtask mutation
    const updateSubtaskMutation = useMutation({
        mutationFn: async ({
            subtaskId,
            updates,
        }: {
            subtaskId: number;
            updates: any;
        }) => {
            try {
                // Ensure subtaskId is a number
                const numericSubtaskId = Number(subtaskId);
                if (isNaN(numericSubtaskId)) {
                    throw new Error('Invalid subtask reference for update');
                }

                const result = await taskApi.updateSubtask(
                    numericSubtaskId,
                    updates,
                );
                return result;
            } catch (error: any) {
                console.error('Update subtask error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            // Only show success toast if server returned success message
            if (
                result?.message &&
                result.message.toLowerCase().includes('success')
            ) {
                showSuccessToast('Subtask updated successfully', toast);
            }
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
        onError: (error: any) => {
            // Use server error message if available, otherwise use generic message
            const errorMessage =
                error?.message || 'Failed to update subtask. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Complete subtask mutation
    const completeSubtaskMutation = useMutation({
        mutationFn: async (subtaskId: number) => {
            try {
                // Ensure subtaskId is a number
                const numericSubtaskId = Number(subtaskId);
                if (isNaN(numericSubtaskId)) {
                    throw new Error('Invalid subtask reference for completion');
                }

                const result = await taskApi.completeSubtask(numericSubtaskId);
                return result;
            } catch (error: any) {
                console.error('Complete subtask error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            // Only show success toast if server returned success message
            if (
                result?.message &&
                result.message.toLowerCase().includes('success')
            ) {
                showSuccessToast('Subtask completed successfully', toast);
            }
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
        onError: (error: any) => {
            // Use server error message if available, otherwise use generic message
            const errorMessage =
                error?.message ||
                'Failed to complete subtask. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Delete subtask mutation
    const deleteSubtaskMutation = useMutation({
        mutationFn: async (subtaskId: number) => {
            try {
                // Ensure subtaskId is a number
                const numericSubtaskId = Number(subtaskId);
                if (isNaN(numericSubtaskId)) {
                    throw new Error('Invalid subtask reference for deletion');
                }

                const result = await taskApi.deleteSubtask(numericSubtaskId);
                return result;
            } catch (error: any) {
                console.error('Delete subtask error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            // Only show success toast if server returned success message
            if (
                result?.message &&
                result.message.toLowerCase().includes('success')
            ) {
                showSuccessToast('Subtask deleted successfully', toast);
            }
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
        onError: (error: any) => {
            // Use server error message if available, otherwise use generic message
            const errorMessage =
                error?.message || 'Failed to delete subtask. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Update subtask wrapper function
    const updateSubtask = useCallback(
        async (subtaskId: number, updates: any) => {
            return updateSubtaskMutation.mutateAsync({ subtaskId, updates });
        },
        [updateSubtaskMutation],
    );

    // Complete subtask wrapper function
    const completeSubtask = useCallback(
        async (subtaskId: number) => {
            return completeSubtaskMutation.mutateAsync(subtaskId);
        },
        [completeSubtaskMutation],
    );

    // Delete subtask wrapper function
    const deleteSubtask = useCallback(
        async (subtaskId: number) => {
            return deleteSubtaskMutation.mutateAsync(subtaskId);
        },
        [deleteSubtaskMutation],
    );

    // Apply filters
    const applyFilters = useCallback((newFilters: TaskFilterParams) => {
        // This doesn't directly modify state as the hook will be called with new filters
        return newFilters;
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        // Returns empty object to clear filters
        return {};
    }, []);

    return {
        tasks: data?.items || [],
        tasksByStatus,
        isLoading,
        error: error as Error | null,
        createTask,
        updateTask,
        deleteTask,
        updateSubtask,
        completeSubtask,
        deleteSubtask,
        applyFilters,
        clearFilters,
        refetch,
    };
}
