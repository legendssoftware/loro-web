import { axiosInstance } from './api-client';
import {
    Task,
    TaskFilterParams,
    PaginatedTasksResponse,
} from '@/lib/types/task';

// Simplified TaskApi class that relies on axios interceptors for token handling
export class TaskApi {
    static async getTasks(
        filters: TaskFilterParams = {},
    ): Promise<PaginatedTasksResponse> {
        try {
            const queryParams = new URLSearchParams();

            if (filters.status) queryParams.append('status', filters.status);
            if (filters.priority)
                queryParams.append('priority', filters.priority);
            if (filters.taskType)
                queryParams.append('taskType', filters.taskType);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.page) queryParams.append('page', String(filters.page));
            if (filters.limit)
                queryParams.append('limit', String(filters.limit));

            if (filters.startDate) {
                queryParams.append(
                    'startDate',
                    filters.startDate.toISOString(),
                );
            }

            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate.toISOString());
            }

            // The axios interceptor will add the token headers
            const response = await axiosInstance.get(
                `/tasks?${queryParams.toString()}`,
            );

            return {
                items: response.data.data || [],
                total: response.data.meta.total,
                page: response.data.meta.page,
                limit: response.data.meta.limit,
                totalPages: response.data.meta.totalPages,
            };
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    }

    static async getTask(taskId: number): Promise<Task> {
        try {
            // The axios interceptor will add the token headers
            const response = await axiosInstance.get(`/tasks/${taskId}`);
            return response.data.task;
        } catch (error) {
            console.error(`Error fetching task ${taskId}:`, error);
            throw error;
        }
    }

    static async updateTask(
        taskId: number,
        updates: Partial<Task>,
    ): Promise<void> {
        try {
            // The axios interceptor will add the token headers
            await axiosInstance.patch(`/tasks/${taskId}`, updates);
        } catch (error) {
            console.error(`Error updating task ${taskId}:`, error);
            throw error;
        }
    }

    static async deleteTask(taskId: number): Promise<void> {
        try {
            // The axios interceptor will add the token headers
            await axiosInstance.delete(`/tasks/${taskId}`);
        } catch (error) {
            console.error(`Error deleting task ${taskId}:`, error);
            throw error;
        }
    }
}
