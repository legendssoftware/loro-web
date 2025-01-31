import { memo, useState, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { TaskCard } from "./task-card"
import { ExistingTask, User } from "@/lib/types/tasks"
import { TaskStatus } from "@/lib/enums/task.enums"
import { PageLoader } from "@/components/page-loader"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { NewTaskModal } from "./new-task-modal"
import { CreateTaskDTO } from "@/helpers/tasks"
import { useSessionStore } from "@/store/use-session-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask } from "@/helpers/tasks"
import { RequestConfig } from "@/lib/types/tasks"
import toast from 'react-hot-toast'

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

interface TaskListProps {
    tasks: ExistingTask[]
    onTaskClick: (task: ExistingTask) => void
    isLoading: boolean
}

const statusOptions = [
    { value: "all", label: "All" },
    { value: TaskStatus.PENDING, label: "Pending" },
    { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
    { value: TaskStatus.COMPLETED, label: "Completed" },
    { value: TaskStatus.CANCELLED, label: "Cancelled" }
]

const TaskListComponent = ({ tasks, onTaskClick, isLoading }: TaskListProps) => {
    const { accessToken, profileData } = useSessionStore()
    const queryClient = useQueryClient()
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [searchQuery, setSearchQuery] = useState("")

    const handleStatusChange = useCallback((status: string) => {
        setStatusFilter(status)
    }, [])

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }, [])

    const config: RequestConfig = {
        headers: {
            token: `${accessToken}`,
        },
    }

    const createTaskMutation = useMutation({
        mutationFn: (data: CreateTaskDTO) => createTask(data, config),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
            toast.success('Task created successfully', {
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
            setIsNewTaskModalOpen(false)
        },
        onError: (error: Error) => {
            const errorMessage = error.message === "item(s) not found"
                ? "Unable to create task. Please try again."
                : `Failed to create task: ${error.message}`

            toast.error(errorMessage, {
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

    const filteredTasks = useMemo(() => {
        return tasks?.filter((task: ExistingTask) => {
            const matchesStatus = statusFilter === "all" || task?.status.toLowerCase() === statusFilter.toLowerCase()
            const matchesSearch = searchQuery === "" ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesStatus && matchesSearch
        }) || []
    }, [tasks, statusFilter, searchQuery])

    const handleCreateTask = useCallback(async (data: CreateTaskDTO) => {
        try {

            const newTask = {
                ...data,
                owner: {
                    uid: profileData?.uid || 0,
                    username: profileData?.username || '',
                    name: profileData?.name || '',
                    surname: profileData?.surname || '',
                    email: profileData?.email || '',
                    phone: profileData?.phone || '',
                    photoURL: profileData?.photoURL || '',
                    accessLevel: profileData?.accessLevel || '',
                    userref: profileData?.userref || '',
                    organisationRef: profileData?.organisationRef || 0,
                    status: 'active'
                } as User
            }

            console.log(newTask, 'new task data')

            await createTaskMutation.mutateAsync(newTask)
        } catch (error) {
            console.error('Error creating task:', error)
        }
    }, [createTaskMutation, profileData])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <PageLoader />
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-row items-center justify-end gap-2">
                <div className="flex flex-row items-center justify-center gap-2">
                    <Input
                        placeholder="search..."
                        className="w-[300px] shadow-none bg-card"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px] shadow-none bg-card outline-none">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value} className="font-body text-[10px] font-normal uppercase">
                                    {status.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <NewTaskModal
                    isOpen={isNewTaskModalOpen}
                    onOpenChange={setIsNewTaskModalOpen}
                    onSubmit={handleCreateTask}
                    isSubmitting={createTaskMutation.isPending}
                />
            </div>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                {filteredTasks?.map((task: ExistingTask) => (
                    <TaskCard
                        key={task?.uid}
                        task={task}
                        onClick={() => onTaskClick(task)}
                    />
                ))}
            </motion.div>
        </div>
    )
}

export const TaskList = memo(TaskListComponent) 
