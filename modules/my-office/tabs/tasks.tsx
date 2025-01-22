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

type TaskForm = z.infer<typeof taskFormSchema>

export const TasksModule = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [isModalOpen, setIsModalOpen] = useState(false)
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
            setIsModalOpen(false)
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

    return (
        <div className="w-full h-full flex flex-col gap-2">
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
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                                <DialogFooter className="mt-4">
                                    <Button type="submit" size="sm" className="font-body text-xs font-normal uppercase text-card-foreground">
                                        <p className="text-white">Create Task</p>
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}