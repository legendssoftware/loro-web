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

/**
 * Enhanced standardized query invalidation utility for dashboard task operations
 * Ensures consistent data updates across all task-related operations with comprehensive coverage
 */
export const invalidateTaskQueries = (
    queryClient: any,
    options: {
        taskId?: string | number;
        subtaskId?: string | number;
        exact?: boolean;
        includeSubtasks?: boolean;
        refetchTask?: boolean;
        includeUserTasks?: boolean;
        includeStats?: boolean;
        includeDashboard?: boolean;
        updateType?:
            | 'create'
            | 'update'
            | 'delete'
            | 'complete'
            | 'approve'
            | 'postpone'
            | 'cancel'
            | 'subtask_update'
            | 'subtask_delete'
            | 'subtask_complete';
    } = {},
) => {
    console.log(
        `🔄 Dashboard: Invalidating task queries for: ${options.updateType || 'update'}${
            options.taskId ? ` (ID: ${options.taskId})` : ''
        }`,
    );

    const {
        taskId,
        subtaskId,
        exact = true,
        includeSubtasks = true,
        refetchTask = false,
        includeUserTasks = true,
        includeStats = true,
        includeDashboard = true,
        updateType,
    } = options;

    // === CORE TASK QUERIES ===
    if (taskId) {
        if (refetchTask) {
            // Actively refetch the specific task for immediate UI updates
            queryClient.refetchQueries({
                queryKey: ['task', String(taskId)],
                exact: true,
                type: 'active',
            });
        } else {
            // Just invalidate the specific task
            queryClient.invalidateQueries({
                queryKey: ['task', String(taskId)],
                exact: true,
            });
        }
    }

    // === TASK LISTS ===
    // Always invalidate task lists
    queryClient.invalidateQueries({
        queryKey: [TASKS_QUERY_KEY],
        exact: false,
    });

    // === USER TASK LISTS ===
    if (includeUserTasks) {
        queryClient.invalidateQueries({
            queryKey: ['user-tasks'],
            exact: false,
        });
    }

    // === STATISTICS & ANALYTICS ===
    if (includeStats) {
        // Task statistics
        queryClient.invalidateQueries({
            queryKey: ['task-stats'],
            exact: false,
        });

        // Dashboard metrics
        queryClient.invalidateQueries({
            queryKey: ['dashboard-metrics'],
            exact: false,
        });
    }

    // === DASHBOARD DATA ===
    if (includeDashboard) {
        queryClient.invalidateQueries({
            queryKey: ['dashboard'],
            exact: false,
        });

        // Recent activities
        queryClient.invalidateQueries({
            queryKey: ['recent-activities'],
            exact: false,
        });
    }

    // === SPECIFIC UPDATE TYPE HANDLING ===
    switch (updateType) {
        case 'complete':
            // For completed tasks, ensure we update completion-related queries
            queryClient.invalidateQueries({
                queryKey: ['completed-tasks'],
                exact: false,
            });

            // Update user performance metrics
            queryClient.invalidateQueries({
                queryKey: ['user-performance'],
                exact: false,
            });

            // Force immediate refetch to show completion status
            if (taskId) {
                setTimeout(() => {
                    queryClient.refetchQueries({
                        queryKey: [TASKS_QUERY_KEY],
                        exact: false,
                        type: 'active',
                    });
                }, 100);
            }
            break;

        case 'approve':
            // For approved tasks, force immediate refetch to show status change
            if (taskId) {
                queryClient.invalidateQueries({
                    queryKey: ['task', String(taskId)],
                    exact: true,
                    refetchType: 'all',
                });

                setTimeout(() => {
                    queryClient.refetchQueries({
                        queryKey: ['task', String(taskId)],
                        exact: true,
                        type: 'active',
                    });

                    queryClient.refetchQueries({
                        queryKey: [TASKS_QUERY_KEY],
                        exact: false,
                        type: 'active',
                    });
                }, 50);
            }
            break;

        case 'postpone':
            // For postponed tasks, ensure modified data is fresh
            if (taskId) {
                queryClient.invalidateQueries({
                    queryKey: ['task', String(taskId)],
                    exact: true,
                    refetchType: 'all',
                });

                // Force refetch for postponements to ensure UI reflects changes
                setTimeout(() => {
                    queryClient.refetchQueries({
                        queryKey: ['task', String(taskId)],
                        exact: true,
                        type: 'active',
                    });

                    queryClient.refetchQueries({
                        queryKey: [TASKS_QUERY_KEY],
                        exact: false,
                        type: 'active',
                    });
                }, 50);
            }
            break;

        case 'delete':
            // For deleted tasks, ensure counts are updated and remove from specific caches
            queryClient.invalidateQueries({
                queryKey: ['task-counts'],
                exact: false,
            });

            // Remove from specific caches
            if (taskId) {
                queryClient.removeQueries({
                    queryKey: ['task', String(taskId)],
                    exact: true,
                });
            }

            // Force immediate refetch of task lists
            setTimeout(() => {
                queryClient.refetchQueries({
                    queryKey: [TASKS_QUERY_KEY],
                    exact: false,
                    type: 'active',
                });
            }, 100);
            break;

        case 'create':
            // For new tasks, invalidate creation-related queries
            queryClient.invalidateQueries({
                queryKey: ['task-counts'],
                exact: false,
            });

            // Force immediate refetch to show new task
            setTimeout(() => {
                queryClient.refetchQueries({
                    queryKey: [TASKS_QUERY_KEY],
                    exact: false,
                    type: 'active',
                });
            }, 100);
            break;

        case 'update':
        case 'cancel':
        default:
            // For general updates and cancellations, ensure modified data is fresh
            if (taskId) {
                // Force refetch for updates to ensure UI reflects changes
                setTimeout(() => {
                    queryClient.refetchQueries({
                        queryKey: ['task', String(taskId)],
                        exact: true,
                        type: 'active',
                    });

                    queryClient.refetchQueries({
                        queryKey: [TASKS_QUERY_KEY],
                        exact: false,
                        type: 'active',
                    });
                }, 50);
            }
            break;
    }

    console.log(
        `✅ Dashboard: Task query invalidation completed for ${updateType || 'update'}`,
    );
};

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

    // Update task mutation with enhanced cache invalidation
    const updateTaskMutation = useMutation({
        mutationFn: async ({
            taskId,
            updates,
            updateType = 'update',
        }: {
            taskId: number;
            updates: Partial<Task>;
            updateType?:
                | 'update'
                | 'approve'
                | 'postpone'
                | 'cancel'
                | 'complete';
        }) => {
            try {
                const numericTaskId = Number(taskId);
                if (isNaN(numericTaskId)) {
                    throw new Error('Invalid task reference for update');
                }

                const result = await taskApi.updateTask(numericTaskId, updates);
                return { ...result, updateType, taskId: numericTaskId };
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
                const actionMessages: Record<string, string> = {
                    approve: 'Task approved successfully',
                    postpone: 'Task postponed successfully',
                    cancel: 'Task cancelled successfully',
                    complete: 'Task completed successfully',
                    update: 'Task updated successfully',
                };
                showSuccessToast(
                    actionMessages[result.updateType] ||
                        'Task updated successfully',
                    toast,
                );
            }

            // Use enhanced cache invalidation with specific update type
            invalidateTaskQueries(queryClient, {
                taskId: result.taskId,
                updateType: result.updateType,
                refetchTask: true,
                includeStats: true,
                includeDashboard: true,
            });
        },
        onError: (error: any) => {
            const errorMessage =
                error?.message || 'Failed to update task. Please try again.';
            showErrorToast(errorMessage, toast);
        },
    });

    // Delete task mutation with enhanced cache invalidation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: number) => {
            try {
                const numericTaskId = Number(taskId);
                if (isNaN(numericTaskId)) {
                    throw new Error('Invalid task reference for deletion');
                }

                const result = await taskApi.deleteTask(numericTaskId);
                return { ...result, taskId: numericTaskId };
            } catch (error: any) {
                console.error('Delete task error:', error);
                throw error;
            }
        },
        onSuccess: (result) => {
            if (
                result?.message &&
                result.message.toLowerCase().includes('success')
            ) {
                showSuccessToast('Task deleted successfully', toast);
            }

            // Use enhanced cache invalidation for deletions
            invalidateTaskQueries(queryClient, {
                taskId: result.taskId,
                updateType: 'delete',
                includeStats: true,
                includeDashboard: true,
            });
        },
        onError: (error: any) => {
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

    // Enhanced update task wrapper function with operation type support
    const updateTask = useCallback(
        async (
            taskId: number,
            updates: Partial<Task>,
            updateType:
                | 'update'
                | 'approve'
                | 'postpone'
                | 'cancel'
                | 'complete' = 'update',
        ) => {
            return updateTaskMutation.mutateAsync({
                taskId,
                updates,
                updateType,
            });
        },
        [updateTaskMutation],
    );

    // Specific action functions for better UX
    const approveTask = useCallback(
        async (taskId: number, updates: Partial<Task> = {}) => {
            return updateTask(
                taskId,
                { ...updates, status: TaskStatus.IN_PROGRESS },
                'approve',
            );
        },
        [updateTask],
    );

    const postponeTask = useCallback(
        async (taskId: number, deadline: Date, updates: Partial<Task> = {}) => {
            return updateTask(
                taskId,
                { ...updates, status: TaskStatus.POSTPONED, deadline },
                'postpone',
            );
        },
        [updateTask],
    );

    const cancelTask = useCallback(
        async (taskId: number, updates: Partial<Task> = {}) => {
            return updateTask(
                taskId,
                { ...updates, status: TaskStatus.CANCELLED },
                'cancel',
            );
        },
        [updateTask],
    );

    const completeTask = useCallback(
        async (taskId: number, updates: Partial<Task> = {}) => {
            return updateTask(
                taskId,
                { ...updates, status: TaskStatus.COMPLETED, progress: 100 },
                'complete',
            );
        },
        [updateTask],
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
        totalTasks: data?.total || 0,
        totalPages: data?.totalPages || 0,
        currentPage: data?.page || 1,
        loading: isLoading,
        error: error as Error | null,
        refetch,
        createTask,
        updateTask,
        deleteTask,
        updateSubtask,
        completeSubtask,
        deleteSubtask,
        applyFilters,
        clearFilters,
        approveTask,
        postponeTask,
        cancelTask,
        completeTask,
        invalidateTaskQueries: useCallback(
            (options = {}) => invalidateTaskQueries(queryClient, options),
            [queryClient],
        ),
    };
}
