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
import { UserSelect } from "../../common/user-select"
import { ClientSelect } from "../../common/client-select"
import { TaskFormData } from "@/lib/types/tasks"
import { TaskType, RepetitionType, Priority, TaskStatus, TargetCategory } from "@/lib/enums/task.enums"
import { taskFormSchema } from "@/lib/schemas/tasks"
import type { CreateTaskDTO } from "@/helpers/tasks"
import type { z } from 'zod'
import { useSessionStore } from "@/store/use-session-store"

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
    const { profileData } = useSessionStore()
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
                })),
                createdBy: profileData?.uid
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
                        <Label htmlFor="title" className="text-xs font-normal uppercase font-body text-card-foreground">
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
                            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                        )}
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="description" className="text-xs font-normal uppercase font-body text-card-foreground">
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
                            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="taskType" className="text-xs font-normal uppercase font-body text-card-foreground">
                                Task Type
                            </Label>
                            <Select
                                value={formData.taskType}
                                onValueChange={value => setFormData(prev => ({ ...prev, taskType: value as TaskType }))}>
                                <SelectTrigger className="text-xs font-body">
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
                            <Label htmlFor="priority" className="text-xs font-normal uppercase font-body text-card-foreground">
                                Priority
                            </Label>
                            <Select
                                value={formData.priority}
                                onValueChange={value => setFormData(prev => ({ ...prev, priority: value as Priority }))}>
                                <SelectTrigger className="text-xs font-body">
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
                            <Label className="text-xs uppercase font-body text-card-foreground">Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal text-xs font-body shadow-none", !formData?.deadline && "text-muted-foreground")}>
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {formData.deadline ? (
                                            format(formData.deadline, "LLL dd, y")
                                        ) : (
                                            <span className="text-xs uppercase text-card-foreground">Pick a date</span>
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
                            <Label className="text-xs uppercase font-body text-card-foreground">Repetition End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn("w-full justify-start text-left font-normal text-xs font-body shadow-none", !formData?.repetitionEndDate && "text-muted-foreground")}>
                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                        {formData.repetitionEndDate ? (
                                            format(formData.repetitionEndDate, "LLL dd, y")
                                        ) : (
                                            <span className="text-xs uppercase text-card-foreground">Pick a date</span>
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
                            <Label htmlFor="repetition" className="text-xs font-normal uppercase font-body text-card-foreground">
                                Repetition Type
                            </Label>
                            <Select
                                value={formData.repetitionType}
                                onValueChange={value => setFormData(prev => ({ ...prev, repetitionType: value as RepetitionType }))}>
                                <SelectTrigger className="text-xs font-body">
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
                            <Label htmlFor="targetCategory" className="text-xs font-normal uppercase font-body text-card-foreground">
                                Target Category
                            </Label>
                            <Select
                                value={formData.targetCategory}
                                onValueChange={value => setFormData(prev => ({ ...prev, targetCategory: value as TargetCategory }))}>
                                <SelectTrigger className="text-xs font-body">
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
                        <Label htmlFor="subtasks" className="text-xs font-normal uppercase font-body text-card-foreground">Subtasks</Label>
                        {formData.subtasks.map((subtask, index) => (
                            <div key={index} className="flex flex-col gap-2 p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-sm font-normal uppercase font-body text-card-foreground">
                                        Sub-task {index + 1}
                                    </h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveSubtask(index)}
                                        className="w-8 h-8"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="grid flex-1 gap-2">
                                    <Input
                                        placeholder="Subtask title"
                                        value={subtask.title}
                                        onChange={e => {
                                            const newSubtasks = [...formData.subtasks]
                                            newSubtasks[index].title = e.target.value
                                            setFormData(prev => ({ ...prev, subtasks: newSubtasks }))
                                        }}
                                        className="text-xs font-body"
                                    />
                                    <Textarea
                                        placeholder="Subtask description"
                                        value={subtask.description}
                                        onChange={e => {
                                            const newSubtasks = [...formData.subtasks]
                                            newSubtasks[index].description = e.target.value
                                            setFormData(prev => ({ ...prev, subtasks: newSubtasks }))
                                        }}
                                        className="text-xs font-body"
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddSubtask}
                            className="text-xs font-normal uppercase font-body text-card-foreground"
                        >
                            Add Subtask
                        </Button>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="attachments" className="text-xs font-normal uppercase font-body text-card-foreground">Attachments</Label>
                        <Input
                            id="attachments"
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                            onChange={handleAttachmentChange}
                            className="text-xs font-body"
                        />
                    </div>
                </div>
            </ScrollArea>
            <div className="w-full pt-4 mt-4 border-t">
                <Button
                    type="submit"
                    size="sm"
                    className="w-full text-[10px] font-normal text-white uppercase font-body bg-violet-500 hover:bg-violet-600"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin" />
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