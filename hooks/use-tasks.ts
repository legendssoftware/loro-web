import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskStatus, TaskFilterParams, TasksByStatus } from '@/lib/types/task';
import { useToast } from '@/components/ui/use-toast';

// Temporary mock data for testing
const mockTasks: Task[] = [
    {
        uid: 1,
        title: 'Client Meeting',
        description: 'Discuss project requirements',
        status: TaskStatus.PENDING,
        taskType: 'VIRTUAL_MEETING' as any,
        priority: 'HIGH' as any,
        repetitionType: 'NONE' as any,
        progress: 0,
        isOverdue: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        creator: {
            uid: 1,
            name: 'John Doe',
            email: 'john@example.com',
        },
        assignees: [{ uid: 1 }],
        clients: [{ uid: 101 }],
    },
    {
        uid: 2,
        title: 'Prepare Proposal',
        description: 'Create a detailed proposal for the new project',
        status: TaskStatus.IN_PROGRESS,
        taskType: 'PROPOSAL' as any,
        priority: 'MEDIUM' as any,
        repetitionType: 'NONE' as any,
        progress: 50,
        deadline: new Date(new Date().getTime() + 86400000), // Tomorrow
        isOverdue: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        creator: {
            uid: 1,
            name: 'John Doe',
            email: 'john@example.com',
        },
        assignees: [{ uid: 1 }],
    },
    {
        uid: 3,
        title: 'Follow-up Call',
        description: 'Call client about the proposal',
        status: TaskStatus.COMPLETED,
        taskType: 'CALL' as any,
        priority: 'MEDIUM' as any,
        repetitionType: 'NONE' as any,
        progress: 100,
        completionDate: new Date(),
        isOverdue: false,
        createdAt: new Date(new Date().getTime() - 172800000), // 2 days ago
        updatedAt: new Date(),
        isDeleted: false,
        creator: {
            uid: 1,
            name: 'John Doe',
            email: 'john@example.com',
        },
        assignees: [{ uid: 1 }],
    },
    {
        uid: 4,
        title: 'Submit Report',
        description: 'Submit monthly progress report',
        status: TaskStatus.OVERDUE,
        taskType: 'REPORT' as any,
        priority: 'URGENT' as any,
        repetitionType: 'MONTHLY' as any,
        progress: 70,
        deadline: new Date(new Date().getTime() - 86400000), // Yesterday
        isOverdue: true,
        createdAt: new Date(new Date().getTime() - 604800000), // 1 week ago
        updatedAt: new Date(),
        isDeleted: false,
        creator: {
            uid: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
        },
        assignees: [{ uid: 1 }, { uid: 2 }],
    },
    {
        uid: 5,
        title: 'Team Meeting',
        description: 'Weekly team progress meeting',
        status: TaskStatus.POSTPONED,
        taskType: 'VIRTUAL_MEETING' as any,
        priority: 'MEDIUM' as any,
        repetitionType: 'WEEKLY' as any,
        progress: 0,
        deadline: new Date(new Date().getTime() + 172800000), // 2 days from now
        isOverdue: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        creator: {
            uid: 1,
            name: 'John Doe',
            email: 'john@example.com',
        },
        assignees: [{ uid: 1 }, { uid: 2 }, { uid: 3 }],
    }
];

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [filters, setFilters] = useState<TaskFilterParams>({});
    const { toast } = useToast();

    // Fetch tasks (simulated)
    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // In a real app, this would be an API call
            // const response = await fetch('/api/tasks');
            // const data = await response.json();

            // For now, use mock data
            setTasks(mockTasks);
            setError(null);
        } catch (err) {
            setError(err as Error);
            toast({
                title: 'Error',
                description: 'Failed to fetch tasks. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

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

        // Filter tasks based on the current filters
        const filteredTasks = tasks.filter(task => {
            if (filters.status && task.status !== filters.status) {
                return false;
            }

            if (filters.priority && task.priority !== filters.priority) {
                return false;
            }

            if (filters.taskType && task.taskType !== filters.taskType) {
                return false;
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                return (
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm)
                );
            }

            return true;
        });

        // Group filtered tasks by status
        filteredTasks.forEach(task => {
            if (!task.isDeleted) {
                statusGroups[task.status].push(task);
            }
        });

        return statusGroups;
    }, [tasks, filters]);

    // Update task
    const updateTask = useCallback(async (taskId: number, updates: Partial<Task>) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));

            // In a real app, this would be an API call
            // const response = await fetch(`/api/tasks/${taskId}`, {
            //     method: 'PATCH',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(updates),
            // });
            // const updatedTask = await response.json();

            // For now, update locally
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.uid === taskId ? { ...task, ...updates } : task
                )
            );

            toast({
                title: 'Success',
                description: 'Task updated successfully.',
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update task. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Delete task
    const deleteTask = useCallback(async (taskId: number) => {
        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300));

            // In a real app, this would be an API call
            // await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });

            // For now, mark as deleted locally
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.uid === taskId ? { ...task, isDeleted: true } : task
                )
            );

            toast({
                title: 'Success',
                description: 'Task deleted successfully.',
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete task. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    // Apply filters
    const applyFilters = useCallback((newFilters: TaskFilterParams) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    // Fetch tasks on initial load
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        tasksByStatus,
        isLoading,
        error,
        updateTask,
        deleteTask,
        applyFilters,
        clearFilters,
        refetch: fetchTasks
    };
}
