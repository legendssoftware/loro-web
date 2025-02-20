import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTask, fetchTasks, updateTask } from '@/helpers/tasks';
import type { UpdateTaskDTO } from '@/helpers/tasks';
import { useSessionStore } from '@/store/use-session-store';
import { RequestConfig } from '@/lib/types/tasks';
import { ExistingTask, Task } from '@/lib/types/tasks';
import { TaskList } from '@/modules/my-office/tasks/task-list';
import { TaskDetailModal } from '@/modules/my-office/tasks/task-detail-modal';
import toast from 'react-hot-toast';

const toastStyle = {
    style: {
        borderRadius: '5px',
        background: '#333',
        color: '#fff',
        fontFamily: 'var(--font-unbounded)',
        fontSize: '12px',
        textTransform: 'uppercase',
        fontWeight: '300',
        padding: '16px',
    },
    duration: 2000,
    position: 'bottom-center',
} as const;

export const TasksModule = () => {
    const { accessToken } = useSessionStore();
    const queryClient = useQueryClient();
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<ExistingTask | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const config: RequestConfig = {
        headers: {
            token: accessToken || '',
        },
    };

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['tasks', currentPage],
        queryFn: async () => {
            const response = await fetchTasks({
                ...config,
                page: currentPage,
                limit: itemsPerPage,
            });
            return response;
        },
        enabled: !!accessToken,
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ ref, updatedTask }: { ref: number; updatedTask: UpdateTaskDTO }) =>
            updateTask({ ref, updatedTask, config }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task updated successfully', {
                style: toastStyle.style,
                duration: toastStyle.duration,
                position: toastStyle.position,
                icon: '✅',
            });
            setIsTaskDetailModalOpen(false);
        },
        onError: (error: Error) => {
            toast.error(`Failed to update task: ${error.message}`, {
                style: toastStyle.style,
                duration: 5000,
                position: toastStyle.position,
                icon: '❌',
            });
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (ref: number) => deleteTask(ref, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('Task deleted successfully', {
                style: toastStyle.style,
                duration: toastStyle.duration,
                position: toastStyle.position,
                icon: '✅',
            });
            setIsTaskDetailModalOpen(false);
        },
        onError: (error: Error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
            toast.error(errorMessage, {
                style: toastStyle.style,
                duration: 5000,
                position: toastStyle.position,
                icon: '❌',
            });
        },
    });

    const handleTaskClick = useCallback((task: ExistingTask) => {
        setSelectedTask(task);
        setIsTaskDetailModalOpen(true);
    }, []);

    const handleDeleteTask = useCallback(
        async (uid: number) => {
            try {
                await deleteTaskMutation.mutateAsync(uid);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
                toast.error(errorMessage, {
                    style: toastStyle.style,
                    duration: 5000,
                    position: toastStyle.position,
                    icon: '❌',
                });
            }
        },
        [deleteTaskMutation],
    );

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const totalPages = Math.ceil((tasksData?.meta?.total || 0) / itemsPerPage);

    return (
        <div className='flex flex-col w-full h-full gap-4'>
            <TaskList
                tasks={tasksData?.data || []}
                onTaskClick={handleTaskClick}
                isLoading={isLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <TaskDetailModal
                isOpen={isTaskDetailModalOpen}
                onOpenChange={setIsTaskDetailModalOpen}
                selectedTask={selectedTask}
                onDelete={handleDeleteTask}
                isUpdating={updateTaskMutation.isPending}
                isDeleting={deleteTaskMutation.isPending}
            />
        </div>
    );
};
