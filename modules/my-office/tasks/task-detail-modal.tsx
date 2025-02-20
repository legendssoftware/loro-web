import { memo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EditTaskForm } from './edit-task-form';
import type { ExistingTask, User, Client } from '@/lib/types/tasks';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { UserSelect } from '../../common/user-select';
import { ClientSelect } from '../../common/client-select';
import { updateTask } from '@/helpers/tasks';
import { useSessionStore } from '@/store/use-session-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { TaskType, Priority, TaskStatus, RepetitionType } from '@/lib/enums/task.enums';

interface TaskDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedTask: ExistingTask | null;
    onDelete: (uid: number) => Promise<void>;
    isUpdating: boolean;
    isDeleting: boolean;
}

const TaskDetailModalComponent = ({
    isOpen,
    onOpenChange,
    selectedTask,
    onDelete,
    isUpdating,
    isDeleting,
}: TaskDetailModalProps) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<ExistingTask | null>(selectedTask);
    const { accessToken } = useSessionStore();
    const queryClient = useQueryClient();

    const updateTaskMutation = useMutation({
        mutationFn: async () => {
            if (!formData || !selectedTask?.uid) return;

            // Only send the fields that need to be updated
            const updatedData = {
                title: formData.title || '',
                description: formData.description || '',
                taskType: formData.taskType,
                priority: formData.priority,
                deadline: formData.deadline ? formData.deadline : undefined,
                status: formData.status,
                assignees:
                    formData.assignees?.map(assignee => ({
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
                        status: assignee.status || 'active',
                    })) || [],
                clients:
                    formData.clients?.map(client => ({
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
                        ref: client.ref || '',
                    })) || [],
                notes: formData.notes || '',
                comment: formData.comment || '',
                repetitionType: formData.repetitionType,
                repetitionEndDate: formData.repetitionEndDate ? formData.repetitionEndDate : undefined,
                attachments: formData.attachments || [],
                targetCategory: formData.targetCategory,
                subtasks:
                    formData.subtasks?.map(subtask => ({
                        title: subtask.title || '',
                        description: subtask.description || '',
                        status: subtask.status,
                    })) || [],
            };

            return updateTask({
                ref: selectedTask.uid,
                updatedTask: updatedData,
                config: {
                    headers: {
                        token: accessToken || '',
                    },
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
            });
            setIsEditMode(false);
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
            });
        },
    });

    if (!selectedTask) return null;

    const handleEditClick = async (): Promise<void> => {
        setIsEditMode(true);
        setFormData(selectedTask);
        return Promise.resolve();
    };

    const handleUpdateClick = async () => {
        if (!formData) return;
        try {
            await updateTaskMutation.mutateAsync();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setFormData(selectedTask);
    };

    const handleFormChange = (field: keyof ExistingTask, value: unknown) => {
        setFormData(prev => (prev ? { ...prev, [field]: value } : null));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[700px]'>
                <DialogHeader>
                    <DialogTitle>
                        <div className='flex items-center gap-2'>
                            <Badge
                                variant='outline'
                                className={cn(
                                    'font-body text-[10px] font-normal uppercase',
                                    selectedTask?.status === 'COMPLETED' &&
                                        'bg-green-100 text-green-600 border-green-200',
                                    selectedTask?.status !== 'COMPLETED' &&
                                        'bg-yellow-100 text-yellow-600 border-yellow-200',
                                )}
                            >
                                {selectedTask?.status}
                            </Badge>
                            <span className='text-xl font-normal uppercase font-body text-card-foreground'>
                                {selectedTask?.title && selectedTask?.title?.slice(0, 20)}
                            </span>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {isEditMode ? (
                    <ScrollArea className='h-[60vh] pr-4'>
                        <div className='grid gap-4 py-2'>
                            <div className='grid gap-1.5'>
                                <Label
                                    htmlFor='title'
                                    className='text-xs font-normal uppercase font-body text-card-foreground'
                                >
                                    Title
                                </Label>
                                <Input
                                    id='title'
                                    value={formData?.title}
                                    onChange={e => handleFormChange('title', e.target.value)}
                                    placeholder='Task title'
                                    className='text-xs font-body'
                                />
                            </div>

                            <div className='grid gap-1.5'>
                                <Label
                                    htmlFor='description'
                                    className='text-xs font-normal uppercase font-body text-card-foreground'
                                >
                                    Description
                                </Label>
                                <Textarea
                                    id='description'
                                    value={formData?.description}
                                    onChange={e => handleFormChange('description', e.target.value)}
                                    placeholder='Task description'
                                    className='text-xs font-body'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='grid gap-1.5'>
                                    <Label
                                        htmlFor='taskType'
                                        className='text-xs font-normal uppercase font-body text-card-foreground'
                                    >
                                        Task Type
                                    </Label>
                                    <Select
                                        value={formData?.taskType}
                                        onValueChange={value => handleFormChange('taskType', value)}
                                    >
                                        <SelectTrigger className='text-xs font-body'>
                                            <SelectValue placeholder='Select task type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(TaskType).map(type => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                    className='font-body text-[10px] uppercase'
                                                >
                                                    {type.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='grid gap-1.5'>
                                    <Label
                                        htmlFor='priority'
                                        className='text-xs font-normal uppercase font-body text-card-foreground'
                                    >
                                        Priority
                                    </Label>
                                    <Select
                                        value={formData?.priority}
                                        onValueChange={value => handleFormChange('priority', value)}
                                    >
                                        <SelectTrigger className='text-xs font-body'>
                                            <SelectValue placeholder='Select priority' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(Priority).map(priority => (
                                                <SelectItem
                                                    key={priority}
                                                    value={priority}
                                                    className='font-body text-[10px] uppercase'
                                                >
                                                    {priority}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='grid gap-1.5'>
                                    <Label className='text-xs uppercase font-body text-card-foreground'>Deadline</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal text-xs font-body shadow-none',
                                                )}
                                            >
                                                <CalendarIcon className='w-4 h-4 mr-2' />
                                                {formData?.deadline ? (
                                                    format(new Date(formData.deadline), 'LLL dd, y')
                                                ) : (
                                                    <span className='text-xs uppercase text-card-foreground'>
                                                        Pick a date
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={formData?.deadline ? new Date(formData.deadline) : undefined}
                                                onSelect={date => handleFormChange('deadline', date?.toISOString())}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className='grid gap-1.5'>
                                    <Label className='text-xs uppercase font-body text-card-foreground'>
                                        Repetition End Date
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'w-full justify-start text-left font-normal text-xs font-body shadow-none',
                                                )}
                                            >
                                                <CalendarIcon className='w-4 h-4 mr-2' />
                                                {formData?.repetitionEndDate ? (
                                                    format(new Date(formData.repetitionEndDate), 'LLL dd, y')
                                                ) : (
                                                    <span className='text-xs uppercase text-card-foreground'>
                                                        Pick a date
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={
                                                    formData?.repetitionEndDate
                                                        ? new Date(formData.repetitionEndDate)
                                                        : undefined
                                                }
                                                onSelect={date =>
                                                    handleFormChange('repetitionEndDate', date?.toISOString())
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='grid gap-1.5'>
                                    <Label
                                        htmlFor='repetitionType'
                                        className='text-xs font-normal uppercase font-body text-card-foreground'
                                    >
                                        Repetition Type
                                    </Label>
                                    <Select
                                        value={formData?.repetitionType || RepetitionType.NONE}
                                        onValueChange={(value: RepetitionType) =>
                                            handleFormChange('repetitionType', value)
                                        }
                                    >
                                        <SelectTrigger className='text-xs font-body'>
                                            <SelectValue placeholder='Select repetition type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(RepetitionType).map(type => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                    className='font-body text-[10px] uppercase'
                                                >
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='grid gap-1.5'>
                                    <Label
                                        htmlFor='status'
                                        className='text-xs font-normal uppercase font-body text-card-foreground'
                                    >
                                        Status
                                    </Label>
                                    <Select
                                        value={formData?.status}
                                        onValueChange={value => handleFormChange('status', value)}
                                    >
                                        <SelectTrigger className='text-xs font-body'>
                                            <SelectValue placeholder='Select status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(TaskStatus).map(status => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                    className='font-body text-[10px] uppercase'
                                                >
                                                    {status.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className='grid gap-1.5'>
                                    <UserSelect
                                        value={formData?.assignees || []}
                                        onChange={value => {
                                            const updatedAssignees = value.map(newUser => {
                                                const existingUser = formData?.assignees?.find(
                                                    a => a.uid === newUser.uid,
                                                );
                                                if (existingUser) {
                                                    return existingUser;
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
                                                    status: 'active',
                                                } as User;
                                            });
                                            handleFormChange('assignees', updatedAssignees);
                                        }}
                                    />
                                </div>

                                <div className='grid gap-1.5'>
                                    <ClientSelect
                                        value={formData?.clients?.[0] || { uid: 0 }}
                                        onChange={value => {
                                            if (!value) return;
                                            const existingClient = formData?.clients?.find(c => c.uid === value.uid);
                                            if (existingClient) {
                                                handleFormChange('clients', [existingClient]);
                                                return;
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
                                                ref: '',
                                            };
                                            handleFormChange('clients', [newClient]);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className='grid gap-1.5'>
                                <Label
                                    htmlFor='notes'
                                    className='text-xs font-normal uppercase font-body text-card-foreground'
                                >
                                    Notes
                                </Label>
                                <Textarea
                                    id='notes'
                                    value={formData?.notes}
                                    onChange={e => handleFormChange('notes', e.target.value)}
                                    placeholder='Task notes'
                                    className='text-xs font-body'
                                />
                            </div>

                            <div className='grid gap-1.5'>
                                <Label
                                    htmlFor='comment'
                                    className='text-xs font-normal uppercase font-body text-card-foreground'
                                >
                                    Comment
                                </Label>
                                <Textarea
                                    id='comment'
                                    value={formData?.comment}
                                    onChange={e => handleFormChange('comment', e.target.value)}
                                    placeholder='Task comment'
                                    className='text-xs font-body'
                                />
                            </div>

                            <div className='grid gap-1.5'>
                                <Label
                                    htmlFor='subtasks'
                                    className='text-xs font-normal uppercase font-body text-card-foreground'
                                >
                                    Subtasks
                                </Label>
                                {formData?.subtasks?.map((subtask, index) => (
                                    <div key={index} className='flex flex-col gap-2 p-4 border rounded-lg'>
                                        <div className='flex items-center justify-between mb-2'>
                                            <h4 className='text-sm font-normal uppercase font-body text-card-foreground'>
                                                Sub-task {index + 1}
                                            </h4>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => {
                                                    const newSubtasks = formData.subtasks.filter((_, i) => i !== index);
                                                    handleFormChange('subtasks', newSubtasks);
                                                }}
                                                className='w-8 h-8'
                                            >
                                                <X className='w-4 h-4' />
                                            </Button>
                                        </div>
                                        <div className='grid flex-1 gap-2'>
                                            <Input
                                                placeholder='Subtask title'
                                                value={subtask.title}
                                                onChange={e => {
                                                    const newSubtasks = [...formData.subtasks];
                                                    newSubtasks[index].title = e.target.value;
                                                    handleFormChange('subtasks', newSubtasks);
                                                }}
                                                className='text-xs font-body'
                                            />
                                            <Textarea
                                                placeholder='Subtask description'
                                                value={subtask.description}
                                                onChange={e => {
                                                    const newSubtasks = [...formData.subtasks];
                                                    newSubtasks[index].description = e.target.value;
                                                    handleFormChange('subtasks', newSubtasks);
                                                }}
                                                className='text-xs font-body'
                                            />
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => {
                                        const newSubtasks = [
                                            ...(formData?.subtasks || []),
                                            {
                                                title: '',
                                                description: '',
                                                status: TaskStatus.PENDING,
                                            },
                                        ];
                                        handleFormChange('subtasks', newSubtasks);
                                    }}
                                    className='text-xs font-normal uppercase font-body text-card-foreground'
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
                    <div className='flex items-center justify-between pt-4 mt-4 border-t'>
                        <div className='flex items-center w-full gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleCancelEdit}
                                className='w-full text-sm uppercase font-body'
                            >
                                <p className='text-[10px] font-normal'>Cancel</p>
                            </Button>
                            <Button
                                variant='secondary'
                                size='sm'
                                onClick={handleUpdateClick}
                                disabled={updateTaskMutation.isPending}
                                className='w-full text-sm text-white uppercase font-body bg-violet-500 hover:bg-violet-600'
                            >
                                {updateTaskMutation.isPending ? (
                                    <div className='flex items-center gap-2'>
                                        <div className='w-4 h-4 border-b-2 border-white rounded-full animate-spin' />
                                        <p className='text-xs font-normal text-white'>Saving Changes...</p>
                                    </div>
                                ) : (
                                    <p className='text-white font-normal text-[10px]'>Save Changes</p>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export const TaskDetailModal = memo(TaskDetailModalComponent);
