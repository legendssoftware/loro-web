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
                showSuccessToast('Task created successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast(
                    'Failed to create task. Please try again.',
                    toast,
                );
                console.error('Create task error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
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
                await taskApi.updateTask(taskId, updates);
                showSuccessToast('Task updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to update task. Please try again.',
                    toast,
                );
                console.error('Update task error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: number) => {
            try {
                await taskApi.deleteTask(taskId);
                showSuccessToast('Task deleted successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to delete task. Please try again.',
                    toast,
                );
                console.error('Delete task error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
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
                await taskApi.updateSubtask(subtaskId, updates);
                showSuccessToast('Subtask updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to update subtask. Please try again.',
                    toast,
                );
                console.error('Update subtask error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
    });

    // Complete subtask mutation
    const completeSubtaskMutation = useMutation({
        mutationFn: async (subtaskId: number) => {
            try {
                await taskApi.completeSubtask(subtaskId);
                showSuccessToast('Subtask completed successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to complete subtask. Please try again.',
                    toast,
                );
                console.error('Complete subtask error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
    });

    // Delete subtask mutation
    const deleteSubtaskMutation = useMutation({
        mutationFn: async (subtaskId: number) => {
            try {
                await taskApi.deleteSubtask(subtaskId);
                showSuccessToast('Subtask deleted successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast(
                    'Failed to delete subtask. Please try again.',
                    toast,
                );
                console.error('Delete subtask error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate all task-related queries to ensure fresh data
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
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
