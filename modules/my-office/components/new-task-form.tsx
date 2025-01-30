import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, CalendarIcon } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { UserSelect } from "./user-select"
import { ClientSelect } from "./client-select"
import { TaskFormData } from "@/lib/types/tasks"
import { TaskType, RepetitionType, Priority, TaskStatus, TargetCategory } from "@/lib/enums/task.enums"
import { taskFormSchema } from "@/lib/schemas/tasks"
import type { CreateTaskDTO } from "@/helpers/tasks"
import type { z } from 'zod'

type TaskForm = z.infer<typeof taskFormSchema>

interface NewTaskFormProps {
    onSubmit: (data: CreateTaskDTO) => Promise<void>
    isSubmitting: boolean
}

const initialFormData: TaskFormData = {
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
}

export const NewTaskForm = ({ onSubmit, isSubmitting }: NewTaskFormProps) => {
    const [formData, setFormData] = useState<TaskFormData>(initialFormData)
    const [errors, setErrors] = useState<{ [K in keyof TaskForm]?: string }>({})

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
                subtasks: formData.subtasks.map(({ title, description }) => ({
                    title,
                    description,
                    status: TaskStatus.PENDING
                }))
            }

            await onSubmit(payload as unknown as CreateTaskDTO)
            setFormData(initialFormData)
        } catch (err) {
            console.error('Failed to create task:', err)
        }
    }

    return (
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
            <div className="mt-4 w-full border-t pt-4">
                <Button
                    type="submit"
                    size="lg"
                    className="w-full font-body text-xs font-normal uppercase bg-violet-500 hover:bg-violet-600 text-white"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                            <p className="text-white">Creating Task...</p>
                        </div>
                    ) : (
                        <p className="text-white">Create Task</p>
                    )}
                </Button>
            </div>
        </form>
    )
} 