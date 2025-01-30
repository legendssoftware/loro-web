import { Task } from '@/lib/types/tasks';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type RequestConfig = {
    headers: {
        token: string;
    };
};

export type CreateTaskDTO = Omit<Task, 'uid' | 'createdAt' | 'updatedAt' | 'isDeleted'> & {
    client?: { uid: number }[];
};
export type UpdateTaskDTO = Partial<CreateTaskDTO>;

// Fetch all tasks
export const fetchTasks = async (config: RequestConfig) => {
    try {
        const response = await axios.get<{ tasks: Task[], message: string }>(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return { tasks: [], message: 'Error fetching tasks' };
    }
};

// Fetch a single task by reference
export const fetchTaskByRef = async (ref: number) => {
    try {
        const { data } = await axios.get<{ task: Task, message: string }>(`${API_URL}/tasks/${ref}`);
        return data;
    } catch (error) {
        return error
    }
};

// Fetch tasks by user reference
export const fetchTasksByUser = async (ref: number) => {
    try {
        const { data } = await axios.get<{ tasks: Task[], message: string }>(`${API_URL}/tasks/for/${ref}`);
        return data;
    } catch (error) {
        return error
    }
};

// Create a new task
export const createTask = async (task: CreateTaskDTO, config: RequestConfig) => {
    try {
        const response = await axios.post<{ message: string }>(`${API_URL}/tasks`, task, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Update a task
export const updateTask = async ({ ref, updatedTask, config }: { ref: number; updatedTask: UpdateTaskDTO; config: RequestConfig }) => {
    try {
        console.log(ref, updatedTask)
        const { data } = await axios.patch<{ message: string }>(`${API_URL}/tasks/${ref}`, updatedTask, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return data;
    } catch (error) {
        return error
    }
};

// Delete a task
export const deleteTask = async (ref: number, config: RequestConfig) => {
    try {
        const response = await axios.delete<{ message: string }>(`${API_URL}/tasks/${ref}`, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
};

// Complete a subtask
export const completeSubtask = async (ref: number) => {
    try {
        const { data } = await axios.patch<{ message: string }>(`${API_URL}/tasks/sub-task/complete/${ref}`, {});
        return data;
    } catch (error) {
        return error
    }
};

// Update a subtask
export const updateSubtask = async ({ ref, updatedSubtask }: { ref: number; updatedSubtask: Task }) => {
    try {
        const { data } = await axios.patch<{ message: string }>(`${API_URL}/tasks/sub-task/${ref}`, updatedSubtask);
        return data;
    } catch (error) {
        return error
    }
};

// Delete a subtask
export const deleteSubtask = async (ref: number) => {
    try {
        const { data } = await axios.delete<{ message: string }>(`${API_URL}/tasks/sub-task/${ref}`);
        return data;
    } catch (error) {
        return error
    }
};