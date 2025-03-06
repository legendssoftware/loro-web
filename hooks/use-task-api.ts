import { useCallback } from 'react';
import { Task, TaskFilterParams, PaginatedTasksResponse } from '@/lib/types/task';
import { axiosInstance } from '@/lib/services/api-client';

/**
 * A hook that provides task API methods
 * Relies on axios interceptors for token handling
 */
export const useTaskApi = () => {
    // Get tasks with pagination and filtering
    const getTasks = useCallback(async (filters: TaskFilterParams = {}): Promise<PaginatedTasksResponse> => {
        try {
            const queryParams = new URLSearchParams();

            // Map frontend filter parameters to backend expectations
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.assigneeId) queryParams.append('assigneeId', String(filters.assigneeId));
            if (filters.clientId) queryParams.append('clientId', String(filters.clientId));

            // The backend expects these specific parameter names based on the controller
            if (filters.page) queryParams.append('page', String(filters.page));
            if (filters.limit) queryParams.append('limit', String(filters.limit));

            // Handle date parameters with proper formatting
            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate.toISOString());
            }

            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate.toISOString());
            }

            // Add isOverdue if specified
            if (filters.isOverdue !== undefined) {
                queryParams.append('isOverdue', String(filters.isOverdue));
            }

            // The axios interceptor will add the token headers
            console.log(`Fetching tasks with params: ${queryParams.toString()}`);
            const response = await axiosInstance.get(`/tasks?${queryParams.toString()}`);

            console.log('API Response:', response.data);

            // Process response based on server format from tasks.controller.ts
            // The server returns { data: Task[], meta: { total, page, limit, totalPages }, message: string }
            if (response.data) {
                return {
                    items: response.data.data || [],
                    total: response.data.meta?.total || 0,
                    page: response.data.meta?.page || 1,
                    limit: response.data.meta?.limit || 10,
                    totalPages: response.data.meta?.totalPages || 1,
                };
            } else {
                console.error('Unexpected API response format:', response.data);
                return {
                    items: [],
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0,
                };
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }, []);

    // Get a single task by ID
    const getTask = useCallback(async (taskId: number): Promise<Task> => {
        try {
            // The controller endpoint is /tasks/:ref
            const response = await axiosInstance.get(`/tasks/${taskId}`);

            // From tasks.controller.ts, the response should contain { message, task }
            if (response.data && response.data.task) {
                return response.data.task;
            } else {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error(`Error fetching task ${taskId}:`, error);
            throw error;
        }
    }, []);

    // Update a task
    const updateTask = useCallback(async (taskId: number, updates: Partial<Task>): Promise<void> => {
        try {
            // The controller endpoint is /tasks/:ref for PATCH
            const response = await axiosInstance.patch(`/tasks/${taskId}`, updates);

            if (!response.data) {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }

            console.log('Task updated successfully:', response.data);
        } catch (error) {
            console.error(`Error updating task ${taskId}:`, error);
            throw error;
        }
    }, []);

    // Delete a task
    const deleteTask = useCallback(async (taskId: number): Promise<void> => {
        try {
            // The controller endpoint is /tasks/:ref for DELETE
            const response = await axiosInstance.delete(`/tasks/${taskId}`);

            if (!response.data) {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }

            console.log('Task deleted successfully:', response.data);
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error);
            throw error;
        }
    }, []);

    // Add a task
    const createTask = useCallback(async (taskData: Partial<Task>): Promise<void> => {
        try {
            // The controller endpoint is /tasks for POST
            const response = await axiosInstance.post('/tasks', taskData);

            if (!response.data) {
                console.error('Unexpected API response format:', response.data);
                throw new Error('Invalid API response format');
            }

            console.log('Task created successfully:', response.data);
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }, []);

    return {
        getTasks,
        getTask,
        updateTask,
        deleteTask,
        createTask,
    };
};
