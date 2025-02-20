import { Task } from '@/lib/types/tasks';
import axios from 'axios';
import { RequestConfig } from '@/lib/types/tasks';
import { Priority, TaskType, TargetCategory } from '@/lib/enums/task.enums';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type CreateTaskDTO = Omit<Task, 'uid' | 'createdAt' | 'updatedAt' | 'isDeleted'> & {
    client?: { uid: number }[];
};
export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export interface PaginatedTasksResponse {
    data: Task[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

export interface TasksRequestConfig extends Omit<RequestConfig, 'headers'> {
    page?: number;
    limit?: number;
    headers?: {
        token?: string;
        Authorization?: string;
        'Content-Type'?: string;
    };
    filters?: {
        status?: string;
        clientId?: number;
        assigneeId?: number;
        search?: string;
        startDate?: Date;
        endDate?: Date;
        priority?: Priority;
        taskType?: TaskType;
        targetCategory?: TargetCategory;
        branchId?: number;
        isOverdue?: boolean;
        isDeleted?: boolean;
    };
}

// Fetch all tasks
export const fetchTasks = async (config: TasksRequestConfig): Promise<PaginatedTasksResponse> => {
    try {
        const { page = 1, limit = 20, headers, filters } = config;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters?.status && { status: filters.status }),
            ...(filters?.clientId && { clientId: filters.clientId.toString() }),
            ...(filters?.assigneeId && { assigneeId: filters.assigneeId.toString() }),
            ...(filters?.search && { search: filters.search }),
            ...(filters?.startDate && { startDate: filters.startDate.toISOString() }),
            ...(filters?.endDate && { endDate: filters.endDate.toISOString() }),
            ...(filters?.priority && { priority: filters.priority }),
            ...(filters?.taskType && { taskType: filters.taskType }),
            ...(filters?.targetCategory && { targetCategory: filters.targetCategory }),
            ...(filters?.branchId && { branchId: filters.branchId.toString() }),
            ...(filters?.isOverdue !== undefined && { isOverdue: filters.isOverdue.toString() }),
            ...(filters?.isDeleted !== undefined && { isDeleted: filters.isDeleted.toString() }),
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks?${queryParams.toString()}`, {
            headers: {
                Authorization: `Bearer ${headers?.token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to fetch tasks');
    }
};

// Fetch a single task by reference
export const fetchTaskByRef = async (ref: number) => {
    try {
        const { data } = await axios.get<{ task: Task; message: string }>(`${API_URL}/tasks/${ref}`);
        return data;
    } catch (error) {
        return error;
    }
};

// Fetch tasks by user reference
export const fetchTasksByUser = async (ref: number) => {
    try {
        const { data } = await axios.get<{ tasks: Task[]; message: string }>(`${API_URL}/tasks/for/${ref}`);
        return data;
    } catch (error) {
        return error;
    }
};

// Create a new task
export const createTask = async (task: CreateTaskDTO, config: RequestConfig) => {
    try {
        const response = await axios.post<{ message: string }>(`${API_URL}/tasks`, task, {
            headers: {
                Authorization: `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Update a task
export const updateTask = async ({
    ref,
    updatedTask,
    config,
}: {
    ref: number;
    updatedTask: UpdateTaskDTO;
    config: RequestConfig;
}) => {
    try {
        const { data } = await axios.patch<{ message: string }>(`${API_URL}/tasks/${ref}`, updatedTask, {
            headers: {
                Authorization: `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json',
            },
        });
        return data;
    } catch (error) {
        return error;
    }
};

// Delete a task
export const deleteTask = async (ref: number, config: RequestConfig) => {
    try {
        const response = await axios.delete<{ message: string }>(`${API_URL}/tasks/${ref}`, {
            headers: {
                Authorization: `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Complete a subtask
export const completeSubtask = async (ref: number) => {
    try {
        const { data } = await axios.patch<{ message: string }>(`${API_URL}/tasks/sub-task/complete/${ref}`, {});
        return data;
    } catch (error) {
        return error;
    }
};

// Update a subtask
export const updateSubtask = async ({ ref, updatedSubtask }: { ref: number; updatedSubtask: Task }) => {
    try {
        const { data } = await axios.patch<{ message: string }>(`${API_URL}/tasks/sub-task/${ref}`, updatedSubtask);
        return data;
    } catch (error) {
        return error;
    }
};

// Delete a subtask
export const deleteSubtask = async (ref: number) => {
    try {
        const { data } = await axios.delete<{ message: string }>(`${API_URL}/tasks/sub-task/${ref}`);
        return data;
    } catch (error) {
        return error;
    }
};
