import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTask, fetchTasks, updateTask } from "@/helpers/tasks"
import type { UpdateTaskDTO } from "@/helpers/tasks"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { ExistingTask } from "@/lib/types/tasks"
import { TaskList } from "../components/task-list"
import { TaskDetailModal } from "../components/task-detail-modal"
import toast from 'react-hot-toast'

export const TasksModule = () => {
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<ExistingTask | null>(null)

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks(config),
        enabled: !!accessToken,
    })

    const updateTaskMutation = useMutation({
        mutationFn: ({ ref, updatedTask }: { ref: number; updatedTask: UpdateTaskDTO }) =>
            updateTask({ ref, updatedTask }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Task updated successfully', {
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
                icon: '✅',
            })
            setIsTaskDetailModalOpen(false)
        }
    })

    const deleteTaskMutation = useMutation({
        mutationFn: (ref: number) => deleteTask(ref, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Task deleted successfully', {
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
                icon: '✅',
            })
            setIsTaskDetailModalOpen(false)
        },
        onError: (error: Error) => {
            toast.error('Failed to delete task: ' + error.message, {
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
                duration: 5000,
                position: 'bottom-center',
                icon: '❌',
            })
        }
    })

    const handleTaskClick = useCallback((task: ExistingTask) => {
        setSelectedTask(task)
        setIsTaskDetailModalOpen(true)
    }, [])

    const handleDeleteTask = useCallback(async (uid: number) => {
        try {
            await deleteTaskMutation.mutateAsync(uid)
        } catch (error) {
            console.error('Error deleting task:', error)
        }
    }, [deleteTaskMutation])

    const handleUpdateTask = useCallback(async () => {
        if (!selectedTask) return;

        try {
            const clientData = selectedTask?.clients?.[0]

            const clientArray = clientData ? [{
                uid: clientData.uid,
                name: clientData.name || undefined,
                email: clientData.email || undefined,
                address: clientData.address || undefined,
                phone: clientData.phone || undefined,
                contactPerson: clientData.contactPerson || undefined
            }] : []

            await updateTaskMutation.mutateAsync({
                ref: Number(selectedTask?.uid),
                updatedTask: {
                    ...selectedTask,
                    status: selectedTask?.status || 'PENDING',
                    priority: selectedTask?.priority,
                    deadline: selectedTask?.deadline || undefined,
                    repetitionEndDate: selectedTask?.repetitionEndDate || undefined,
                    client: clientArray
                }
            });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }, [selectedTask, updateTaskMutation]);

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <TaskList
                tasks={tasksData?.tasks as ExistingTask[] || []}
                onTaskClick={handleTaskClick}
                isLoading={isLoading}
            />

            <TaskDetailModal
                isOpen={isTaskDetailModalOpen}
                onOpenChange={setIsTaskDetailModalOpen}
                selectedTask={selectedTask}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
                isUpdating={updateTaskMutation.isPending}
                isDeleting={deleteTaskMutation.isPending}
            />
        </div>
    )
}