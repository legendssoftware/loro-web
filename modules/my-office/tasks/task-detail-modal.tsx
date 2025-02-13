import { memo, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EditTaskForm } from "./edit-task-form"
import type { ExistingTask, User, Client } from "@/lib/types/tasks"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"
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
import { UserSelect } from "../../common/user-select"
import { ClientSelect } from "../../common/client-select"
import { updateTask } from "@/helpers/tasks"
import { useSessionStore } from "@/store/use-session-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { TaskType, Priority, TaskStatus, RepetitionType } from "@/lib/enums/task.enums"

interface TaskDetailModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedTask: ExistingTask | null
    onDelete: (uid: number) => Promise<void>
    isUpdating: boolean
    isDeleting: boolean
}

const TaskDetailModalComponent = ({
    isOpen,
    onOpenChange,
    selectedTask,
    onDelete,
    isUpdating,
    isDeleting
}: TaskDetailModalProps) => {
    const [isEditMode, setIsEditMode] = useState(false)
    const [formData, setFormData] = useState<ExistingTask | null>(selectedTask)
    const { accessToken } = useSessionStore()
    const queryClient = useQueryClient()

    const updateTaskMutation = useMutation({
        mutationFn: async () => {
            if (!formData || !selectedTask?.uid) return

            // Only send the fields that need to be updated
            const updatedData = {
                title: formData.title || '',
                description: formData.description || '',
                taskType: formData.taskType,
                priority: formData.priority,
                deadline: formData.deadline ? formData.deadline : undefined,
                status: formData.status,
                assignees: formData.assignees?.map(assignee => ({
                    uid: assignee.uid,
                    username: assignee.username || '',
                    name: assignee.name || '',
                    surname: assignee.surname || '',
                    email: assignee.email || '',
                    phone: assignee.phone || '',
                    photoURL: assignee.photoURL || '',
                    accessLevel: assignee.accessLevel || '',
                    userref: assignee.userref || '',
                    organisationRef: assignee.organisationRef,
                    status: assignee.status || 'active'
                })) || [],
                clients: formData.clients?.map(client => ({
                    uid: client.uid,
                    name: client.name || '',
                    email: client.email || '',
                    address: client.address || '',
                    phone: client.phone || '',
                    alternativePhone: client.alternativePhone || '',
                    contactPerson: client.contactPerson || '',
                    website: client.website || '',
                    logo: client.logo || '',
                    description: client.description || '',
                    status: client.status || 'active',
                    type: client.type || 'business',
                    city: client.city || '',
                    country: client.country || '',
                    postalCode: client.postalCode || '',
                    ref: client.ref || ''
                })) || [],
                notes: formData.notes || '',
                comment: formData.comment || '',
                repetitionType: formData.repetitionType,
                repetitionEndDate: formData.repetitionEndDate ? formData.repetitionEndDate : undefined,
                attachments: formData.attachments || [],
                targetCategory: formData.targetCategory,
                subtasks: formData.subtasks?.map(subtask => ({
                    title: subtask.title || '',
                    description: subtask.description || '',
                    status: subtask.status
                })) || []
            }

            return updateTask({
                ref: selectedTask.uid,
                updatedTask: updatedData,
                config: {
                    headers: {
                        token: accessToken || ''
                    }
                }
            })
        },
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
            setIsEditMode(false)
        },
        onError: (error: Error) => {
            toast.error(`Failed to update task: ${error.message}`, {
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

    if (!selectedTask) return null

    const handleEditClick = async (): Promise<void> => {
        setIsEditMode(true)
        setFormData(selectedTask)
        return Promise.resolve()
    }

    const handleUpdateClick = async () => {
        if (!formData) return
        try {
            await updateTaskMutation.mutateAsync()
        } catch (error) {
            console.error('Error updating task:', error)
        }
    }

    const handleCancelEdit = () => {
        setIsEditMode(false)
        setFormData(selectedTask)
    }

    const handleFormChange = (field: keyof ExistingTask, value: unknown) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn("font-body text-[10px] font-normal uppercase",
                                    selectedTask?.status === "COMPLETED" && "bg-green-100 text-green-600 border-green-200",
                                    selectedTask?.status !== "COMPLETED" && "bg-yellow-100 text-yellow-600 border-yellow-200")}>
                                {selectedTask?.status}
                            </Badge>
                            <span className="text-xl font-body text-card-foreground uppercase font-normal">
                                {selectedTask?.title && selectedTask?.title?.slice(0, 20)}
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {isEditMode ? (
                    <ScrollArea className="h-[60vh] pr-4">
                        <div className="grid gap-4 py-2">
                            <div className="grid gap-1.5">
                                <Label htmlFor="title" className="text-xs font-body text-card-foreground uppercase font-normal">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    value={formData?.title}
                                    onChange={e => handleFormChange('title', e.target.value)}
                                    placeholder="Task title"
                                    className="font-body text-xs"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="description" className="text-xs font-body text-card-foreground uppercase font-normal">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData?.description}
                                    onChange={e => handleFormChange('description', e.target.value)}
                                    placeholder="Task description"
                                    className="font-body text-xs"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="taskType" className="text-xs font-body text-card-foreground uppercase font-normal">
                                        Task Type
                                    </Label>
                                    <Select
                                        value={formData?.taskType}
                                        onValueChange={value => handleFormChange('taskType', value)}>
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
                                        value={formData?.priority}
                                        onValueChange={value => handleFormChange('priority', value)}>
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
                                                className={cn("w-full justify-start text-left font-normal text-xs font-body shadow-none")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData?.deadline ? (
                                                    format(new Date(formData.deadline), "LLL dd, y")
                                                ) : (
                                                    <span className="text-card-foreground text-xs uppercase">Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData?.deadline ? new Date(formData.deadline) : undefined}
                                                onSelect={date => handleFormChange('deadline', date?.toISOString())}
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
                                                className={cn("w-full justify-start text-left font-normal text-xs font-body shadow-none")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData?.repetitionEndDate ? (
                                                    format(new Date(formData.repetitionEndDate), "LLL dd, y")
                                                ) : (
                                                    <span className="text-card-foreground text-xs uppercase">Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData?.repetitionEndDate ? new Date(formData.repetitionEndDate) : undefined}
                                                onSelect={date => handleFormChange('repetitionEndDate', date?.toISOString())}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="repetitionType" className="text-xs font-body text-card-foreground uppercase font-normal">
                                        Repetition Type
                                    </Label>
                                    <Select
                                        value={formData?.repetitionType || RepetitionType.NONE}
                                        onValueChange={(value: RepetitionType) => handleFormChange('repetitionType', value)}>
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
                                    <Label htmlFor="status" className="text-xs font-body text-card-foreground uppercase font-normal">
                                        Status
                                    </Label>
                                    <Select
                                        value={formData?.status}
                                        onValueChange={value => handleFormChange('status', value)}>
                                        <SelectTrigger className="font-body text-xs">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(TaskStatus).map((status) => (
                                                <SelectItem key={status} value={status} className="font-body text-[10px] uppercase">
                                                    {status.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <UserSelect
                                        value={formData?.assignees || []}
                                        onChange={(value) => {
                                            const updatedAssignees = value.map(newUser => {
                                                const existingUser = formData?.assignees?.find(a => a.uid === newUser.uid)
                                                if (existingUser) {
                                                    return existingUser
                                                }
                                                return {
                                                    uid: newUser.uid,
                                                    username: '',
                                                    name: '',
                                                    surname: '',
                                                    email: '',
                                                    phone: '',
                                                    photoURL: '',
                                                    accessLevel: '',
                                                    userref: '',
                                                    organisationRef: 0,
                                                    status: 'active'
                                                } as User
                                            })
                                            handleFormChange('assignees', updatedAssignees)
                                        }}
                                    />
                                </div>

                                <div className="grid gap-1.5">
                                    <ClientSelect
                                        value={formData?.clients?.[0] || { uid: 0 }}
                                        onChange={(value) => {
                                            if (!value) return
                                            const existingClient = formData?.clients?.find(c => c.uid === value.uid)
                                            if (existingClient) {
                                                handleFormChange('clients', [existingClient])
                                                return
                                            }
                                            const newClient: Client = {
                                                uid: value.uid,
                                                name: '',
                                                email: '',
                                                address: '',
                                                phone: '',
                                                alternativePhone: '',
                                                contactPerson: '',
                                                website: '',
                                                logo: '',
                                                description: '',
                                                status: 'active',
                                                type: 'business',
                                                city: '',
                                                country: '',
                                                postalCode: '',
                                                ref: ''
                                            }
                                            handleFormChange('clients', [newClient])
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="notes" className="text-xs font-body text-card-foreground uppercase font-normal">
                                    Notes
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={formData?.notes}
                                    onChange={e => handleFormChange('notes', e.target.value)}
                                    placeholder="Task notes"
                                    className="font-body text-xs"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="comment" className="text-xs font-body text-card-foreground uppercase font-normal">
                                    Comment
                                </Label>
                                <Textarea
                                    id="comment"
                                    value={formData?.comment}
                                    onChange={e => handleFormChange('comment', e.target.value)}
                                    placeholder="Task comment"
                                    className="font-body text-xs"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="subtasks" className="text-xs font-body text-card-foreground uppercase font-normal">Subtasks</Label>
                                {formData?.subtasks?.map((subtask, index) => (
                                    <div key={index} className="flex flex-col gap-2 border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-body font-normal text-card-foreground uppercase">
                                                Sub-task {index + 1}
                                            </h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newSubtasks = formData.subtasks.filter((_, i) => i !== index)
                                                    handleFormChange('subtasks', newSubtasks)
                                                }}
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
                                                    handleFormChange('subtasks', newSubtasks)
                                                }}
                                                className="font-body text-xs"
                                            />
                                            <Textarea
                                                placeholder="Subtask description"
                                                value={subtask.description}
                                                onChange={e => {
                                                    const newSubtasks = [...formData.subtasks]
                                                    newSubtasks[index].description = e.target.value
                                                    handleFormChange('subtasks', newSubtasks)
                                                }}
                                                className="font-body text-xs"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        const newSubtasks = [...(formData?.subtasks || []), {
                                            title: "",
                                            description: "",
                                            status: TaskStatus.PENDING
                                        }]
                                        handleFormChange('subtasks', newSubtasks)
                                    }}
                                    className="font-body text-xs font-normal uppercase text-card-foreground"
                                >
                                    Add Subtask
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                ) : (
                    <EditTaskForm
                        task={selectedTask}
                        onUpdate={handleEditClick}
                        onDelete={onDelete}
                        isUpdating={isUpdating}
                        isDeleting={isDeleting}
                    />
                )}

                {isEditMode && (
                    <div className="flex justify-between items-center border-t pt-4 mt-4">
                        <div className="flex items-center gap-2 w-full">
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={handleUpdateClick}
                                disabled={updateTaskMutation.isPending}
                                className="w-full font-body text-sm uppercase bg-violet-500 hover:bg-violet-600 text-white"
                            >
                                {updateTaskMutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                                        <p className="text-white font-normal text-xs">Saving Changes...</p>
                                    </div>
                                ) : (
                                    <p className="text-white font-normal text-xs">Save Changes</p>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleCancelEdit}
                                className="w-full font-body text-sm uppercase"
                            >
                                <p className="font-normal text-xs">Cancel</p>
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export const TaskDetailModal = memo(TaskDetailModalComponent) 