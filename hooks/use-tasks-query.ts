import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskStatus, TaskFilterParams, TasksByStatus } from '@/lib/types/task';
import toast from 'react-hot-toast';
import { useTaskApi } from './use-task-api';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast-config';

const TASKS_QUERY_KEY = 'tasks';

export function useTasksQuery(filters: TaskFilterParams = {}) {
    const queryClient = useQueryClient();
    const taskApi = useTaskApi();

    // Fetch tasks with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [TASKS_QUERY_KEY, filters],
        queryFn: () => taskApi.getTasks(filters),
        placeholderData: previousData => previousData,
        staleTime: 1000 * 60, // 1 minute
        // Add retry and error handling
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        enabled: Object.keys(filters)?.length > 0 || !filters?.hasOwnProperty('page'),
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
            data.items.forEach(task => {
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
                showErrorToast('Failed to create task. Please try again.', toast);
                console.error('Create task error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate tasks query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
    });

    // Update task mutation
    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, updates }: { taskId: number; updates: Partial<Task> }) => {
            try {
                await taskApi.updateTask(taskId, updates);
                showSuccessToast('Task updated successfully.', toast);
                return { success: true };
            } catch (error) {
                showErrorToast('Failed to update task. Please try again.', toast);
                console.error('Update task error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate tasks query to trigger a refetch, but don't show another toast
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
                showErrorToast('Failed to delete task. Please try again.', toast);
                console.error('Delete task error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate tasks query to trigger a refetch, but don't show another toast
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
        },
    });

    // Create task wrapper function
    const createTask = useCallback(
        async (taskData: Partial<Task>) => {
            return createTaskMutation.mutate(taskData);
        },
        [createTaskMutation],
    );

    // Update task wrapper function
    const updateTask = useCallback(
        async (taskId: number, updates: Partial<Task>) => {
            return updateTaskMutation.mutate({ taskId, updates });
        },
        [updateTaskMutation],
    );

    // Delete task wrapper function
    const deleteTask = useCallback(
        async (taskId: number) => {
            return deleteTaskMutation.mutate(taskId);
        },
        [deleteTaskMutation],
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
        pagination: {
            page: data?.page || 1,
            limit: data?.limit || 10,
            total: data?.total || 0,
            totalPages: data?.totalPages || 1,
        },
        createTask,
        updateTask,
        deleteTask,
        applyFilters,
        clearFilters,
        refetch,
    };
}
