import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { useState, useCallback, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { CalendarIcon } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { UserSelect } from "@/modules/my-office/components/user-select"
import * as z from 'zod'
import toast from 'react-hot-toast'
import { taskFormSchema } from "@/lib/schemas/tasks"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask, deleteTask, fetchTasks, updateTask } from "@/helpers/tasks"
import type { CreateTaskDTO, UpdateTaskDTO } from "@/helpers/tasks"
import { PageLoader } from "@/components/page-loader"
import { SubTask, Task } from "@/lib/types/tasks"
import { useSessionStore } from "@/store/use-session-store"
import { RequestConfig } from "@/lib/types/tasks"
import { ClientSelect } from "@/modules/my-office/components/client-select"
import { motion } from "framer-motion"
import { TaskCard } from "@/modules/my-office/components/task-card"
import { TaskType, RepetitionType, Priority, TaskStatus, TargetCategory } from "@/lib/enums/task.enums"
import type { ExistingTask, TaskFormData } from "@/lib/types/tasks"

type TaskForm = z.infer<typeof taskFormSchema>

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

export const TasksModule = () => {
    const { accessToken, profileData } = useSessionStore()
    const queryClient = useQueryClient()
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [errors, setErrors] = useState<{ [K in keyof TaskForm]?: string }>({})
    const [searchQuery, setSearchQuery] = useState("")

    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        description: "",
        taskType: TaskType.OTHER,
        priority: Priority.MEDIUM,
        deadline: undefined,
        repetitionType: RepetitionType.NONE,
        repetitionEndDate: undefined,
        attachments: [],
        assignees: [],
        client: {
            uid: 0,
            name: "",
            email: "",
            address: "",
            phone: "",
            contactPerson: ""
        },
        targetCategory: TargetCategory.STANDARD,
        subtasks: [],
        status: TaskStatus.PENDING,
        comment: "",
        notes: "",
        progress: 0
    })

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
            resetForm()
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

    const statusOptions = [
        { value: "all", label: "All" },
        { value: TaskStatus.PENDING, label: "Pending" },
        { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
        { value: TaskStatus.COMPLETED, label: "Completed" },
        { value: TaskStatus.CANCELLED, label: "Cancelled" }
    ]

    const handleStatusChange = useCallback((status: string) => {
        setStatusFilter(status)
    }, [])

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }, [])

    const handleTaskClick = useCallback((task: ExistingTask) => {
        setSelectedTask(task as Task)
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
            await updateTaskMutation.mutateAsync({
                ref: Number(selectedTask?.uid),
                updatedTask: {
                    ...selectedTask,
                    status: selectedTask?.status,
                    priority: selectedTask?.priority,
                    deadline: selectedTask?.deadline,
                    client: Array.isArray(selectedTask?.client) ? selectedTask?.client : undefined
                }
            });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }, [selectedTask, updateTaskMutation]);

    const filteredTasks = useMemo(() => {
        return tasksData?.tasks?.filter((task: Task) => {
            const matchesStatus = statusFilter === "all" || task?.status.toLowerCase() === statusFilter.toLowerCase()
            const matchesSearch = searchQuery === "" ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase())
            return matchesStatus && matchesSearch
        }) || []
    }, [tasksData?.tasks, statusFilter, searchQuery])

    const TaskCards = useCallback(() => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-screen w-full">
                    <PageLoader />
                </div>
            )
        }

        return (
            <>
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                    {filteredTasks?.map((task: Task) => (
                        <TaskCard
                            key={task?.uid}
                            task={task as ExistingTask}
                            onClick={handleTaskClick}
                        />
                    ))}
                </motion.div>
                <Dialog open={isTaskDetailModalOpen} onOpenChange={setIsTaskDetailModalOpen}>
                    <DialogContent className="sm:max-w-[700px]">
                        <DialogHeader>
                            <DialogTitle>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={cn("font-body text-[10px] font-normal uppercase", selectedTask?.status === "COMPLETED" && "bg-green-100 text-green-600 border-green-200", selectedTask?.status !== "COMPLETED" && "bg-yellow-100 text-yellow-600 border-yellow-200")}>
                                        {selectedTask?.status}
                                    </Badge>
                                    <span className="text-xl font-body text-card-foreground uppercase font-normal">
                                        {selectedTask?.description && selectedTask?.description?.slice(0, 20)}
                                    </span>
                                </div>
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] pr-4">
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                                        Clients: {selectedTask?.clients?.length} total
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Name</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.clients?.[0]?.name}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Email</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.clients?.[0]?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">address</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.clients?.[0]?.address}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Phone</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.clients?.[0]?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Contact Person</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.clients?.[0]?.contactPerson}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                                        Task Details
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Repetition</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.repetitionType}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">repeats until</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.deadline ? format(new Date(selectedTask?.deadline), "MMM dd, yyyy") : "No deadline"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Progress</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.progress} %</p>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Last Updated</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.updatedAt ? format(new Date(selectedTask?.updatedAt), "MMM dd, yyyy") : "No deadline"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Created</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.createdAt ? format(new Date(selectedTask?.createdAt), "MMM dd, yyyy") : "No deadline"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                                        Task Milestones
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-full">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Notes</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.notes}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-full">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Description</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-full">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">comments</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.comment}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xs font-body font-normal text-muted-foreground uppercase">
                                        Related Sub Tasks
                                    </h3>
                                    {
                                        selectedTask?.subtasks?.map((subTask: SubTask) => (
                                            <div key={subTask?.uid} className="flex items-center justify-between border rounded px-3 py-4 cursor-pointer hover:bg-accent/40">
                                                <p className="text-xs font-body font-normal text-card-foreground">{subTask?.title}</p>
                                                <Badge variant="outline" className={cn("font-body text-[10px] uppercase", subTask?.status === "COMPLETED" && "bg-green-100 text-green-600 border-green-200", subTask?.status !== "COMPLETED" && "bg-yellow-100 text-yellow-600 border-yellow-200")}>
                                                    {subTask?.status}
                                                </Badge>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </ScrollArea>
                        <DialogFooter className="flex justify-between items-center border-t pt-4">
                            <div className="flex items-center gap-2 w-full">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handleUpdateTask}
                                    disabled={updateTaskMutation.isPending}
                                    className="w-full font-body text-sm uppercase bg-violet-500 hover:bg-violet-600 text-white"
                                >
                                    {updateTaskMutation.isPending ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                            <p className="text-white font-normal text-xs">Updating...</p>
                                        </div>
                                    ) : (
                                        <p className="text-white font-normal text-xs">Update Task</p>
                                    )}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    onClick={() => handleDeleteTask(Number(selectedTask?.uid))}
                                    disabled={deleteTaskMutation.isPending}
                                    className="w-full font-body text-sm uppercase"
                                >
                                    {deleteTaskMutation.isPending ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                            <p className="text-white font-normal text-xs">Deleting...</p>
                                        </div>
                                    ) : (
                                        <p className="text-white font-normal text-xs">Delete Task</p>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        )
    }, [isLoading, filteredTasks, handleTaskClick, handleUpdateTask, handleDeleteTask, isTaskDetailModalOpen, selectedTask, deleteTaskMutation.isPending, updateTaskMutation.isPending])

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            taskType: TaskType.OTHER,
            priority: Priority.MEDIUM,
            deadline: undefined,
            repetitionType: RepetitionType.NONE,
            repetitionEndDate: undefined,
            attachments: [],
            assignees: [],
            client: {
                uid: 0,
                name: "",
                email: "",
                address: "",
                phone: "",
                contactPerson: ""
            },
            targetCategory: TargetCategory.STANDARD,
            subtasks: [],
            status: TaskStatus.PENDING,
            comment: "",
            notes: "",
            progress: 0
        })
        setErrors({})
    }

    const handleAddSubtask = () => {
        setFormData(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, {
                title: "",
                description: "",
                status: TaskStatus.PENDING
            }]
        }))
    }

    const handleRemoveSubtask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }))
    }

    const handleAssigneesChange = (value: { uid: number }[]) => {
        setFormData(prev => ({ ...prev, assignees: value }))
    }

    const handleClientChange = (value: { uid: number } | null) => {
        if (!value) return
        setFormData(prev => ({
            ...prev,
            client: {
                ...prev.client,
                ...value
            }
        }))
    }

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            // Convert File objects to URLs or handle them according to your needs
            const fileUrls = Array.from(files).map(file => URL.createObjectURL(file))
            setFormData(prev => ({ ...prev, attachments: fileUrls }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const result = taskFormSchema.safeParse(formData)

        if (!result.success) {
            const formattedErrors = result.error.issues.reduce((acc, issue) => {
                if (typeof issue.path[0] === 'string') {
                    acc[issue.path[0] as keyof TaskFormData] = issue.message
                }
                return acc
            }, {} as { [K in keyof TaskFormData]?: string })

            setErrors(formattedErrors)
            return
        }

        setErrors({})

        try {
            const payload = {
                ...formData,
                deadline: formData.deadline?.toISOString(),
                repetitionEndDate: formData.repetitionEndDate?.toISOString(),
                owner: profileData?.uid,
                subtasks: formData.subtasks.map(({ title, description }) => ({
                    title,
                    description,
                    status: TaskStatus.PENDING
                }))
            }

            await createTaskMutation.mutateAsync(payload as unknown as CreateTaskDTO)
        } catch (err) {
            console.error('Failed to create task:', err)
            toast.error(`Failed to create task, please try again`)
        }
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <h2 className="text-md font-body font-normal uppercase">Tasks Overview</h2>
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
                    <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default" size="sm">
                                <Plus size={16} strokeWidth={1.5} className="text-white" />
                                <p className="text-xs font-normal font-body uppercase text-white">Add</p>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                            <DialogHeader>
                                <DialogTitle>
                                    <span className="text-xl font-body text-card-foreground uppercase">New Task</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs font-body text-card-foreground uppercase">
                                    Create a new task by filling out the form below.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit}>
                                <ScrollArea className="h-[60vh] pr-4">
                                    <div className="grid gap-4 py-2">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="title" className="text-xs font-body text-card-foreground uppercase font-normal">
                                                Title
                                            </Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                placeholder="Task title"
                                                className={cn("font-body text-xs", errors.title && "border-red-500 focus-visible:ring-red-500")}
                                            />
                                            {errors.title && (
                                                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="description" className="text-xs font-body text-card-foreground uppercase font-normal">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Task description"
                                                className={cn("font-body text-xs", errors.description && "border-red-500 focus-visible:ring-red-500")}
                                            />
                                            {errors.description && (
                                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="taskType" className="text-xs font-body text-card-foreground uppercase font-normal">
                                                    Task Type
                                                </Label>
                                                <Select
                                                    value={formData.taskType}
                                                    onValueChange={value => setFormData(prev => ({ ...prev, taskType: value as TaskType }))}>
                                                    <SelectTrigger className="font-body text-xs">
                                                        <SelectValue placeholder="Select task type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(TaskType).map((type) => (
                                                            <SelectItem key={type} value={type} className="font-body text-[10px] uppercase">
                                                                {type.replace('_', ' ')}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="priority" className="text-xs font-body text-card-foreground uppercase font-normal">
                                                    Priority
                                                </Label>
                                                <Select
                                                    value={formData.priority}
                                                    onValueChange={value => setFormData(prev => ({ ...prev, priority: value as Priority }))}>
                                                    <SelectTrigger className="font-body text-xs">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(Priority).map((priority) => (
                                                            <SelectItem key={priority} value={priority} className="font-body text-[10px] uppercase">
                                                                {priority}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label className="text-xs font-body text-card-foreground uppercase">Deadline</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn("w-full justify-start text-left font-normal text-xs font-body shadow-none", !formData?.deadline && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {formData.deadline ? (
                                                                format(formData.deadline, "LLL dd, y")
                                                            ) : (
                                                                <span className="text-card-foreground text-xs uppercase">Pick a date</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={formData?.deadline}
                                                            onSelect={date => setFormData(prev => ({ ...prev, deadline: date }))}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label className="text-xs font-body text-card-foreground uppercase">Repetition End Date</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn("w-full justify-start text-left font-normal text-xs font-body shadow-none", !formData?.repetitionEndDate && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {formData.repetitionEndDate ? (
                                                                format(formData.repetitionEndDate, "LLL dd, y")
                                                            ) : (
                                                                <span className="text-card-foreground text-xs uppercase">Pick a date</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={formData?.repetitionEndDate}
                                                            onSelect={date => setFormData(prev => ({ ...prev, repetitionEndDate: date }))}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="repetition" className="text-xs font-body text-card-foreground uppercase font-normal">
                                                    Repetition Type
                                                </Label>
                                                <Select
                                                    value={formData.repetitionType}
                                                    onValueChange={value => setFormData(prev => ({ ...prev, repetitionType: value as RepetitionType }))}>
                                                    <SelectTrigger className="font-body text-xs">
                                                        <SelectValue placeholder="Select repetition type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(RepetitionType).map((type) => (
                                                            <SelectItem key={type} value={type} className="font-body text-[10px] uppercase">
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="targetCategory" className="text-xs font-body text-card-foreground uppercase font-normal">
                                                    Target Category
                                                </Label>
                                                <Select
                                                    value={formData.targetCategory}
                                                    onValueChange={value => setFormData(prev => ({ ...prev, targetCategory: value as TargetCategory }))}>
                                                    <SelectTrigger className="font-body text-xs">
                                                        <SelectValue placeholder="Select target category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.values(TargetCategory).map((category) => (
                                                            <SelectItem key={category} value={category} className="font-body text-[10px] uppercase">
                                                                {category}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <UserSelect
                                                    value={formData.assignees}
                                                    onChange={handleAssigneesChange}
                                                />
                                            </div>

                                            <div className="grid gap-1.5">
                                                <ClientSelect
                                                    value={formData.client}
                                                    onChange={handleClientChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="subtasks" className="text-xs font-body text-card-foreground uppercase font-normal">Subtasks</Label>
                                            {formData.subtasks.map((subtask, index) => (
                                                <div key={index} className="flex flex-col gap-2 border rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-sm font-body font-normal text-card-foreground uppercase">
                                                            Sub-task {index + 1}
                                                        </h4>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveSubtask(index)}
                                                            className="h-8 w-8"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="flex-1 grid gap-2">
                                                        <Input
                                                            placeholder="Subtask title"
                                                            value={subtask.title}
                                                            onChange={e => {
                                                                const newSubtasks = [...formData.subtasks]
                                                                newSubtasks[index].title = e.target.value
                                                                setFormData(prev => ({ ...prev, subtasks: newSubtasks }))
                                                            }}
                                                            className="font-body text-xs"
                                                        />
                                                        <Textarea
                                                            placeholder="Subtask description"
                                                            value={subtask.description}
                                                            onChange={e => {
                                                                const newSubtasks = [...formData.subtasks]
                                                                newSubtasks[index].description = e.target.value
                                                                setFormData(prev => ({ ...prev, subtasks: newSubtasks }))
                                                            }}
                                                            className="font-body text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddSubtask}
                                                className="font-body text-xs font-normal uppercase text-card-foreground"
                                            >
                                                Add Subtask
                                            </Button>
                                        </div>

                                        <div className="grid gap-1.5">
                                            <Label htmlFor="attachments" className="text-xs font-body text-card-foreground uppercase font-normal">Attachments</Label>
                                            <Input
                                                id="attachments"
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                                onChange={handleAttachmentChange}
                                                className="font-body text-xs"
                                            />
                                        </div>
                                    </div>
                                </ScrollArea>
                                <DialogFooter className="mt-4 w-full border-t pt-4">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full font-body text-xs font-normal uppercase bg-violet-500 hover:bg-violet-600 text-white"
                                        disabled={createTaskMutation.isPending}
                                    >
                                        {createTaskMutation.isPending ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                                <p className="text-white">Creating Task...</p>
                                            </div>
                                        ) : (
                                            <p className="text-white">Create Task</p>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <TaskCards />
        </div>
    )
}