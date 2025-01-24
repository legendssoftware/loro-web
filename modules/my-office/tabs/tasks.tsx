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
import { generalStatuses, taskTypes } from "@/data/app-data"
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
import { UserSelect } from "@/modules/my-office/components/UserSelect"
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
import { ClientSelect } from "@/modules/my-office/components/ClientSelect"
import { motion } from "framer-motion"
import { TaskCard } from "@/modules/my-office/components/TaskCard"

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

    const [formData, setFormData] = useState<TaskForm>({
        description: "",
        comment: "",
        notes: "",
        status: "Active",
        taskType: "other",
        deadline: undefined,
        priority: "medium",
        progress: 0,
        repetitionType: "none",
        repetitionEndDate: undefined,
        attachments: null,
        subtasks: [],
        assignees: [],
        client: null
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

    const handleStatusChange = useCallback((value: string) => {
        setStatusFilter(value)
    }, [])

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }, [])

    const handleTaskClick = useCallback((task: Task) => {
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
            await updateTaskMutation.mutateAsync({
                ref: Number(selectedTask.uid),
                updatedTask: {
                    ...selectedTask,
                    status: selectedTask.status,
                    priority: selectedTask.priority,
                    deadline: selectedTask.deadline,
                    client: Array.isArray(selectedTask.client) ? selectedTask.client : undefined
                }
            });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }, [selectedTask, updateTaskMutation]);

    const filteredTasks = useMemo(() => {
        return tasksData?.tasks?.filter((task: Task) => {
            const matchesStatus = statusFilter === "all" || task.status.toLowerCase() === statusFilter.toLowerCase()
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
                            task={task}
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
                                        Client Details
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Name</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.client?.name}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Email</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.client?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">address</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.client?.address}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Phone</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.client?.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1 w-1/2">
                                            <p className="text-[10px] font-body font-normal text-muted-foreground uppercase">Contact Person</p>
                                            <p className="text-xs font-body font-normal text-card-foreground">{selectedTask?.client?.contactPerson}</p>
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
                                                <Badge variant="outline" className={cn(
                                                    "font-body text-[10px] uppercase",
                                                    subTask?.status === "COMPLETED" && "bg-green-100 text-green-600 border-green-200",
                                                    subTask?.status !== "COMPLETED" && "bg-yellow-100 text-yellow-600 border-yellow-200"
                                                )}>
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
                                    className="w-full font-body text-sm uppercase bg-violet-500 hover:bg-violet-600 text-white">
                                    <p className="text-white font-normal text-xs">Update Task</p>
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    onClick={() => handleDeleteTask(Number(selectedTask?.uid))}
                                    className="w-full font-body text-sm uppercase">
                                    <p className="text-white font-normal text-xs">Delete Task</p>
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        )
    }, [isLoading, filteredTasks, handleTaskClick, handleUpdateTask, handleDeleteTask, isTaskDetailModalOpen, selectedTask])

    const resetForm = () => {
        setFormData({
            description: "",
            comment: "",
            notes: "",
            status: "Active",
            taskType: "other",
            deadline: undefined,
            priority: "medium",
            progress: 0,
            repetitionType: "none",
            repetitionEndDate: undefined,
            attachments: null,
            subtasks: [],
            assignees: [],
            client: null
        })
        setErrors({})
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const result = taskFormSchema.safeParse(formData)

        if (!result.success) {
            const formattedErrors = result.error.issues.reduce((acc, issue) => {
                const path = issue.path[0] as keyof TaskForm
                acc[path] = issue.message
                return acc
            }, {} as { [K in keyof TaskForm]?: string })

            setErrors(formattedErrors)

            toast.error('Please fix the form errors', {
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
            return
        }

        setErrors({})

        try {
            const payload = {
                comment: formData?.comment,
                notes: formData?.notes,
                description: formData?.description,
                taskType: formData?.taskType,
                deadline: formData?.deadline?.toISOString(),
                priority: formData?.priority,
                owner: profileData?.uid,
                repetitionType: formData?.repetitionType,
                attachments: formData?.attachments?.name || "",
                subtasks: formData?.subtasks?.map(({ title, description }) => ({
                    title,
                    description
                })),
                client: formData?.client
            }

            console.log(payload, 'payload')

            await createTaskMutation.mutateAsync(payload as unknown as CreateTaskDTO)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error(`Failed to create task, please try again`, {
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
    }

    const handleAddSubtask = () => {
        setFormData(prev => ({
            ...prev,
            subtasks: [...prev.subtasks, { title: "", description: "" }]
        }))
    }

    const handleRemoveSubtask = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index)
        }))
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
                            {generalStatuses?.map((status) => (
                                <SelectItem key={status?.value} value={status?.value} className="font-body text-[10px] font-normal uppercase">
                                    {status?.label}
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
                                            <Label htmlFor="notes" className="text-xs font-body text-card-foreground uppercase font-normal">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="notes"
                                                className={cn(
                                                    "font-body text-xs",
                                                    errors.notes && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                            />
                                            {errors.notes && (
                                                <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="comment" className="text-xs font-body text-card-foreground uppercase font-normal">Comment</Label>
                                            <Textarea
                                                id="comment"
                                                value={formData.comment}
                                                onChange={e => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                                                placeholder="additional comments"
                                                className={cn(
                                                    "font-body text-xs",
                                                    errors.comment && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                            />
                                            {errors.comment && (
                                                <p className="text-red-500 text-xs mt-1">{errors.comment}</p>
                                            )}
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="description" className="text-xs font-body text-card-foreground uppercase font-normal">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="extra descriptions"
                                                className={cn(
                                                    "font-body text-xs",
                                                    errors.description && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                            />
                                            {errors.description && (
                                                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label className="text-xs font-body text-card-foreground uppercase">Deadline</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal text-xs font-body shadow-none",
                                                                !formData?.deadline && "text-muted-foreground"
                                                            )}
                                                        >
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
                                                <Label htmlFor="repetition" className="text-xs font-body text-card-foreground uppercase font-normal">Repetition</Label>
                                                <Select
                                                    value={formData.repetitionType}
                                                    onValueChange={value => setFormData(prev => ({ ...prev, repetitionType: value }))}>
                                                    <SelectTrigger className="font-body text-xs">
                                                        <SelectValue placeholder="Select repetition" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none" className="font-body text-[10px] uppercase">None</SelectItem>
                                                        <SelectItem value="daily" className="font-body text-[10px] uppercase">Daily</SelectItem>
                                                        <SelectItem value="weekly" className="font-body text-[10px] uppercase">Weekly</SelectItem>
                                                        <SelectItem value="monthly" className="font-body text-[10px] uppercase">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="priority" className="text-xs font-body text-card-foreground uppercase font-normal">Priority</Label>
                                                <Select
                                                    value={formData.priority}
                                                    onValueChange={value => setFormData(prev => ({ ...prev, priority: value }))}>
                                                    <SelectTrigger className="font-body text-xs">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="low" className="font-body text-[10px] uppercase">Low</SelectItem>
                                                        <SelectItem value="medium" className="font-body text-[10px] uppercase">Medium</SelectItem>
                                                        <SelectItem value="high" className="font-body text-[10px] uppercase">High</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label htmlFor="taskType" className="text-xs font-body text-card-foreground uppercase font-normal">
                                                    Task Type
                                                </Label>
                                                <Select
                                                    value={formData.taskType}
                                                    onValueChange={value => setFormData(prev => ({ ...prev, taskType: value }))}>
                                                    <SelectTrigger className="font-body text-xs">
                                                        <SelectValue placeholder="Select task type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {taskTypes?.map((type) => (
                                                            <SelectItem key={type?.value} value={type?.value} className="font-body text-[10px] uppercase">
                                                                {type?.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <UserSelect
                                                value={formData.assignees}
                                                onChange={value => setFormData(prev => ({ ...prev, assignees: value }))}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <ClientSelect
                                                value={formData.client}
                                                onChange={value => setFormData(prev => ({ ...prev, client: value }))}
                                            />
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
                                                onChange={e => setFormData(prev => ({ ...prev, attachments: e.target.files?.[0] || null }))}
                                            />
                                        </div>
                                    </div>
                                </ScrollArea>
                                <DialogFooter className="mt-4 w-full border">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className="w-full font-body text-xs font-normal uppercase text-card-foreground"
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