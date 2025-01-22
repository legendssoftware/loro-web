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
import { useState } from "react"
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
import { Card, CardContent } from "@/components/ui/card"

type TaskForm = z.infer<typeof taskFormSchema>

type Task = {
    uid: string
    title: string
    description: string
    notes?: string
    comments?: string
    status: string
    priority: string
    deadline?: Date
    assignees: string[]
    taskType: string
    repetitionType?: string
    client?: string
}

export const TasksModule = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
    const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [errors, setErrors] = useState<{ [K in keyof TaskForm]?: string }>({})

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
        assignees: []
    })

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
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
                comment: formData.comment,
                notes: formData.notes,
                description: formData.description,
                taskType: formData.taskType,
                deadline: formData.deadline?.toISOString(),
                priority: formData.priority,
                assignees: formData?.assignees?.map(uid => ({ uid })),
                repetitionType: formData.repetitionType,
                attachments: formData.attachments?.name || "",
                subtasks: formData.subtasks.map(({ title, description }) => ({
                    title,
                    description
                }))
            }

            console.log(payload)

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
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message, {
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

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task)
        setIsTaskDetailModalOpen(true)
    }

    const tasks: Task[] = [
        {
            uid: "1",
            title: "Landing page Faktory",
            description: "Redesign website faktory with elementor, focusing on modern UI principles and responsive design",
            notes: "Client prefers a minimalist design approach. Use their brand colors: #FF4545, #2D2D2D",
            comments: "Initial mockups approved. Starting development phase next week.",
            status: "active",
            priority: "medium",
            deadline: new Date("2024-04-15"),
            assignees: ["MarkyMay"],
            taskType: "Website",
            client: "Faktory Inc.",
            repetitionType: "none"
        },
        {
            uid: "2",
            title: "Social Media Apps",
            description: "Develop a cross-platform social media application focused on community engagement",
            notes: "Using React Native for mobile and Next.js for web platform. API documentation in Notion.",
            comments: "Backend team has completed user authentication system. Frontend development starting this sprint.",
            status: "active",
            priority: "high",
            deadline: new Date("2024-05-01"),
            assignees: ["MarkyMay", "JohnDoe"],
            taskType: "Apps",
            client: "SocialTech Solutions",
            repetitionType: "weekly"
        },
        {
            uid: "3",
            title: "Research Project Timeline",
            description: "Strategy for research is a crucial step in ensuring a successful and organized research project",
            notes: "Key areas to focus: market analysis, user behavior patterns, competitor analysis",
            comments: "First phase of research completed. Team meeting scheduled for findings review.",
            status: "pending",
            priority: "medium",
            deadline: new Date("2024-03-30"),
            assignees: ["LuckyMay", "AliceSmith"],
            taskType: "Research",
            client: "Research Labs Co.",
            repetitionType: "monthly"
        }
    ]

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-row items-center justify-between gap-2">
                <h2 className="text-md font-body font-normal uppercase">Tasks Overview</h2>
                <div className="flex flex-row items-center justify-center gap-2">
                    <Input placeholder="search..." className="w-[300px]" />
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {generalStatuses?.map((status) => (
                                <SelectItem key={status?.value} value={status?.value}>
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
                                                onChange={(value) => setFormData(prev => ({
                                                    ...prev,
                                                    assignees: value
                                                }))}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs font-body text-card-foreground uppercase font-normal">Subtasks</Label>
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
                                    <Button type="submit" size="sm" className="w-full font-body text-xs font-normal uppercase text-card-foreground">
                                        <p className="text-white">Create Task</p>
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks
                    .filter(task => statusFilter === "all" || task.status === statusFilter)
                    .map(task => (
                        <Card
                            key={task?.uid}
                            className="bg-card hover:border-primary/40 border-border shadow-none transition-colors cursor-pointer"
                            onClick={() => handleTaskClick(task)}>
                            <CardContent className="p-2 flex flex-col h-full justify-between gap-2">
                                <div className="space-y-4">
                                    <div>
                                        <Badge
                                            variant="secondary"
                                            className="bg-red-100 text-red-600 hover:bg-red-100 font-body text-[10px] uppercase">
                                            {task?.taskType}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-body text-sm font-normal uppercase leading-tight text-card-foreground">
                                            {task?.title}
                                        </h3>
                                        <p className="text-[10px] font-body uppercase text-card-foreground">
                                            {task?.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Badge
                                            variant="outline"
                                            className="bg-background border-border text-card-foreground font-body text-[10px] uppercase"
                                        >
                                            Docs
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="bg-background border-border text-card-foreground font-body text-[10px] uppercase"
                                        >
                                            Coding
                                        </Badge>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                            <span className="text-[10px] font-body text-secondary-foreground">
                                                {task?.assignees[0]?.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
            <Dialog open={isTaskDetailModalOpen} onOpenChange={setIsTaskDetailModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-4">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "font-body text-xs uppercase",
                                        selectedTask?.status === "active" && "bg-green-100 text-green-600 border-green-200",
                                        selectedTask?.status === "pending" && "bg-yellow-100 text-yellow-600 border-yellow-200",
                                        selectedTask?.status === "completed" && "bg-blue-100 text-blue-600 border-blue-200"
                                    )}
                                >
                                    {selectedTask?.status}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-600 hover:bg-red-100 font-body text-[10px] uppercase"
                                    >
                                        {selectedTask?.taskType}
                                    </Badge>
                                    <span className="text-xl font-body text-card-foreground uppercase">
                                        {selectedTask?.title}
                                    </span>
                                </div>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Label className="text-xs font-body text-muted-foreground uppercase">
                                        Description
                                    </Label>
                                    <div className="h-[1px] flex-1 bg-border" />
                                </div>
                                <p className="text-sm font-body text-card-foreground leading-relaxed">
                                    {selectedTask?.description || "No description provided"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Label className="text-xs font-body text-muted-foreground uppercase">
                                        Notes
                                    </Label>
                                    <div className="h-[1px] flex-1 bg-border" />
                                </div>
                                <p className="text-sm font-body text-card-foreground leading-relaxed">
                                    {selectedTask?.notes || "No notes added"}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Label className="text-xs font-body text-muted-foreground uppercase">
                                        Comments
                                    </Label>
                                    <div className="h-[1px] flex-1 bg-border" />
                                </div>
                                <p className="text-sm font-body text-card-foreground leading-relaxed">
                                    {selectedTask?.comments || "No comments added"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Label className="text-xs font-body text-muted-foreground uppercase">
                                                Task Details
                                            </Label>
                                            <div className="h-[1px] flex-1 bg-border" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-body text-muted-foreground uppercase">Priority:</span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "font-body text-xs uppercase",
                                                        selectedTask?.priority === "high" && "bg-red-100 text-red-600 border-red-200",
                                                        selectedTask?.priority === "medium" && "bg-yellow-100 text-yellow-600 border-yellow-200",
                                                        selectedTask?.priority === "low" && "bg-green-100 text-green-600 border-green-200"
                                                    )}
                                                >
                                                    {selectedTask?.priority}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-body text-muted-foreground uppercase">Status:</span>
                                                <Badge variant="outline" className="font-body text-xs uppercase">
                                                    {selectedTask?.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-body text-muted-foreground uppercase">Client:</span>
                                                <span className="text-sm font-body">
                                                    {selectedTask?.client || "No client assigned"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Label className="text-xs font-body text-muted-foreground uppercase">
                                                Time & Repetition
                                            </Label>
                                            <div className="h-[1px] flex-1 bg-border" />
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-body">
                                                    {selectedTask?.deadline ? format(selectedTask.deadline, "LLL dd, y") : "No deadline set"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-body text-muted-foreground uppercase">Repetition:</span>
                                                <Badge variant="outline" className="font-body text-xs uppercase">
                                                    {selectedTask?.repetitionType || "None"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Label className="text-xs font-body text-muted-foreground uppercase">
                                                Assignees
                                            </Label>
                                            <div className="h-[1px] flex-1 bg-border" />
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTask?.assignees.map((assignee, index) => (
                                                <div key={index} className="flex items-center gap-2 bg-secondary/20 rounded-full px-3 py-1">
                                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                                        <span className="text-[10px] font-body text-secondary-foreground">
                                                            {assignee.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-body">{assignee}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <DialogFooter className="flex justify-between items-center border-t pt-4">
                        <div className="flex items-center gap-2 w-full">
                            <Button
                                variant="default"
                                size="sm"
                                className="font-body text-xs uppercase w-full">
                                <p className="text-white">Edit Task</p>
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="font-body text-xs uppercase w-full">
                                <p className="text-white">Delete Task</p>
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}