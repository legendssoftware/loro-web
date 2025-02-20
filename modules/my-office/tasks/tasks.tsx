import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteTask, fetchTasks, updateTask } from "@/helpers/tasks"
import type { UpdateTaskDTO } from "@/helpers/tasks"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { ExistingTask } from "@/lib/types/tasks"
import { TaskList } from "@/modules/my-office/tasks/task-list"
import { TaskDetailModal } from "@/modules/my-office/tasks/task-detail-modal"
import toast from 'react-hot-toast'

export const TasksModule = () => {
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<ExistingTask | null>(null)

    const config: RequestConfig = {
        headers: {
            token: accessToken || ''
        }
    }

    const { data: tasksData, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks(config),
        enabled: !!accessToken,
    })

    const updateTaskMutation = useMutation({
        mutationFn: ({ ref, updatedTask }: { ref: number; updatedTask: UpdateTaskDTO }) =>
            updateTask({ ref, updatedTask, config }),
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
        },
        onError: (error: Error) => {
            toast.error('Failed to update task: ' + error.message, {
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
            })
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error('Failed to delete task', {
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
    }, [deleteTaskMutation])

    return (
        <div className="flex flex-col w-full h-full gap-4">
            <TaskList
                tasks={(tasksData?.data || []).map(task => ({
                    ...task,
                    startDate: task.createdAt || null,
                    isOverdue: new Date(task.deadline || '') > new Date(),
                    createdBy: task.owner || null,
                    deadline: task.deadline || null,
                    repetitionEndDate: task.repetitionEndDate || null,
                    lastCompletedAt: task.lastCompletedAt || null,
                    isDeleted: task.isDeleted || false,
                    assignees: task.assignees || [],
                    clients: task.clients || [],
                    subtasks: task.subtasks.map(subtask => ({
                        ...subtask,
                        uid: subtask.uid || '',
                        description: subtask.description || '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        isDeleted: false
                    }))
                } as ExistingTask))}
                onTaskClick={handleTaskClick}
                isLoading={isLoading}
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
    )
}