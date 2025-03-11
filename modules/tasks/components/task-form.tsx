import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { TaskPriority, TaskType, RepetitionType } from '@/lib/types/task';
import { useUsersQuery } from '@/hooks/use-users-query';
import { useClientsQuery } from '@/hooks/use-clients-query';
import { format } from 'date-fns';
import { useAuthStore, selectProfileData } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { ClientType } from '@/lib/types/client-enums';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    CalendarIcon,
    Plus as PlusIcon,
    Trash as TrashIcon,
    ChevronDown,
    Clock,
    Users,
    Building2,
    BriefcaseBusiness,
    CheckCircle2,
    Flag,
    AlertTriangle,
    AlertCircle,
    AlarmClock,
    Mail,
    Phone,
    Video,
    FileText,
    FileSpreadsheet,
    MessageSquare,
    MessageCircle,
    Send,
    MapPin,
    Target,
    Tag,
    Repeat,
    BarChart4,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const taskFormSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    taskType: z.nativeEnum(TaskType),
    priority: z.nativeEnum(TaskPriority),
    deadline: z.date().optional(),
    repetitionType: z.nativeEnum(RepetitionType).optional(),
    repetitionDeadline: z.date().optional(),
    assignees: z
        .array(
            z.object({
                uid: z.number(),
            }),
        )
        .optional(),
    client: z
        .array(
            z.object({
                uid: z.number(),
                name: z.string().optional(),
                email: z.string().optional(),
                address: z.string().optional(),
                phone: z.string().optional(),
                contactPerson: z.string().optional(),
            }),
        )
        .optional(),
    targetCategory: z.nativeEnum(ClientType).optional(),
    subtasks: z
        .array(
            z.object({
                title: z
                    .string()
                    .min(1, { message: 'Subtask title is required' }),
                description: z
                    .string()
                    .min(1, { message: 'Subtask description is required' }),
            }),
        )
        .optional(),
    creators: z
        .array(
            z.object({
                uid: z.number(),
            }),
        )
        .min(1),
    organisationId: z.number().optional(),
    branchId: z.number().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
    onSubmit: (data: TaskFormValues) => void;
    initialData?: Partial<TaskFormValues>;
    isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
    onSubmit,
    initialData,
    isLoading = false,
}) => {
    const profileData = useAuthStore(selectProfileData);
    const currentUserId = profileData?.uid ? parseInt(profileData.uid, 10) : 0;

    const defaultValues: Partial<TaskFormValues> = {
        title: '',
        description: '',
        taskType: TaskType.OTHER,
        priority: TaskPriority.MEDIUM,
        assignees: [],
        client: [],
        subtasks: [],
        creators: [{ uid: currentUserId }],
        ...initialData,
    };

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskFormSchema),
        defaultValues,
    });

    const {
        fields: subtaskFields,
        append: appendSubtask,
        remove: removeSubtask,
    } = useFieldArray({ control, name: 'subtasks' });

    const { clients } = useClientsQuery();
    const { users } = useUsersQuery();

    const repetitionType = watch('repetitionType');
    const assigneesWatch = watch('assignees');
    const clientWatch = watch('client');
    const hasAssignees =
        Array.isArray(assigneesWatch) && assigneesWatch.length > 0;
    const hasClients = Array.isArray(clientWatch) && clientWatch.length > 0;

    const taskTypeIcons = {
        [TaskType.IN_PERSON_MEETING]: Users,
        [TaskType.VIRTUAL_MEETING]: Video,
        [TaskType.CALL]: Phone,
        [TaskType.EMAIL]: Mail,
        [TaskType.WHATSAPP]: MessageCircle,
        [TaskType.SMS]: MessageSquare,
        [TaskType.FOLLOW_UP]: CheckCircle2,
        [TaskType.PROPOSAL]: FileText,
        [TaskType.REPORT]: BarChart4,
        [TaskType.QUOTATION]: FileSpreadsheet,
        [TaskType.VISIT]: MapPin,
        [TaskType.OTHER]: Tag,
    };

    const priorityIcons = {
        [TaskPriority.LOW]: Flag,
        [TaskPriority.MEDIUM]: AlertCircle,
        [TaskPriority.HIGH]: AlertTriangle,
        [TaskPriority.URGENT]: AlarmClock,
    };

    const priorityColors = {
        [TaskPriority.LOW]: 'text-blue-500',
        [TaskPriority.MEDIUM]: 'text-yellow-500',
        [TaskPriority.HIGH]: 'text-orange-500',
        [TaskPriority.URGENT]: 'text-red-500',
    };

    const onFormSubmit = (data: TaskFormValues) => {
        try {
            if (!data.creators || data.creators.length === 0) {
                data.creators = [{ uid: currentUserId }];
            }
            onSubmit(data);
        } catch (error) {
            console.error('Error submitting task form:', error);
            toast.error('Failed to create task. Please try again.');
        }
    };

    const renderTaskTypeIcon = (type: TaskType) => {
        const TypeIcon = taskTypeIcons[type] || BriefcaseBusiness;
        return React.createElement(TypeIcon, {
            className: 'w-4 h-4',
            strokeWidth: 1.5,
        });
    };

    const getPriorityColor = (priority: TaskPriority) => {
        return priorityColors[priority] || '';
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <fieldset disabled={isLoading} className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label
                            htmlFor="title"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="task title"
                            className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="taskType"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Task Type <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="taskType"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            {field.value ? (
                                                <>
                                                    {renderTaskTypeIcon(
                                                        field.value,
                                                    )}
                                                    <span className="text-[10px] font-thin font-body">
                                                        {field.value.replace(
                                                            /_/g,
                                                            ' ',
                                                        )}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <BriefcaseBusiness
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="text-[10px] font-thin font-body">
                                                        TASK TYPE
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <SelectContent>
                                            {Object.values(TaskType).map(
                                                (type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {renderTaskTypeIcon(
                                                                type,
                                                            )}
                                                            <span className="text-[10px] font-normal font-body">
                                                                {type.replace(
                                                                    /_/g,
                                                                    ' ',
                                                                )}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                        {errors.taskType && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.taskType.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <Label
                        htmlFor="description"
                        className="block text-xs font-light uppercase font-body"
                    >
                        Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="task description"
                        rows={4}
                        className="font-light resize-none bg-card border-border placeholder:text-xs placeholder:font-body"
                    />
                    {errors.description && (
                        <p className="mt-1 text-xs text-red-500">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label
                            htmlFor="priority"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Priority <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="priority"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            {field.value ? (
                                                <>
                                                    {React.createElement(
                                                        priorityIcons[
                                                            field.value
                                                        ],
                                                        {
                                                            className: `w-4 h-4 ${getPriorityColor(field.value)}`,
                                                            strokeWidth: 1.5,
                                                        },
                                                    )}
                                                    <span
                                                        className={`text-[10px] font-thin font-body ${getPriorityColor(field.value)}`}
                                                    >
                                                        {field.value}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Flag
                                                        className="w-4 h-4 text-muted-foreground"
                                                        strokeWidth={1.5}
                                                    />
                                                    <span className="text-[10px] font-thin font-body">
                                                        PRIORITY
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <SelectContent>
                                            {Object.values(TaskPriority).map(
                                                (priority) => (
                                                    <SelectItem
                                                        key={priority}
                                                        value={priority}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {React.createElement(
                                                                priorityIcons[
                                                                    priority
                                                                ],
                                                                {
                                                                    className: `w-4 h-4 ${getPriorityColor(priority)}`,
                                                                    strokeWidth: 1.5,
                                                                },
                                                            )}
                                                            <span
                                                                className={`text-[10px] font-normal font-body ${getPriorityColor(priority)}`}
                                                            >
                                                                {priority}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                        {errors.priority && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.priority.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="deadline"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Deadline
                        </Label>
                        <Controller
                            control={control}
                            name="deadline"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Clock
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {field.value
                                                    ? format(
                                                          field.value,
                                                          'MMM d, yyyy',
                                                      )
                                                    : 'SELECT DEADLINE'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Popover>
                                        <PopoverTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label
                            htmlFor="repetitionType"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Repetition Type
                        </Label>
                        <Controller
                            control={control}
                            name="repetitionType"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Repeat
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {field.value || 'NONE'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={
                                            field.value || RepetitionType.NONE
                                        }
                                        value={
                                            field.value || RepetitionType.NONE
                                        }
                                    >
                                        <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <SelectContent>
                                            {Object.values(RepetitionType).map(
                                                (type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                    >
                                                        <span className="text-[10px] font-normal font-body">
                                                            {type}
                                                        </span>
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="targetCategory"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Target Category
                        </Label>
                        <Controller
                            control={control}
                            name="targetCategory"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Target
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {field.value ||
                                                    'SELECT CATEGORY'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <SelectContent>
                                            {Object.values(ClientType).map(
                                                (type) => (
                                                    <SelectItem
                                                        key={type}
                                                        value={type}
                                                    >
                                                        <span className="text-[10px] font-normal font-body">
                                                            {type.replace(
                                                                /_/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                    </div>
                </div>

                {repetitionType && repetitionType !== RepetitionType.NONE && (
                    <div className="space-y-1">
                        <Label
                            htmlFor="repetitionDeadline"
                            className="block text-xs font-light uppercase font-body"
                        >
                            Repetition End Date
                        </Label>
                        <Controller
                            control={control}
                            name="repetitionDeadline"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Clock
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {field.value
                                                    ? format(
                                                          field.value,
                                                          'MMM d, yyyy',
                                                      )
                                                    : 'select end date'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Popover>
                                        <PopoverTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label className="block text-xs font-light uppercase font-body">
                            Assignees
                        </Label>
                        <Controller
                            control={control}
                            name="assignees"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Users
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {hasAssignees
                                                    ? `${watch('assignees')?.length} ${watch('assignees')?.length === 1 ? 'USER' : 'USERS'} ASSIGNED`
                                                    : 'SELECT ASSIGNEES'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Select
                                        onValueChange={(value: string) => {
                                            const uid = parseInt(value, 10);
                                            const existingAssignees =
                                                field.value || [];
                                            if (
                                                !existingAssignees.some(
                                                    (a: { uid: number }) =>
                                                        a.uid === uid,
                                                )
                                            ) {
                                                field.onChange([
                                                    ...existingAssignees,
                                                    { uid },
                                                ]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <SelectContent className="overflow-y-auto max-h-60">
                                            {users?.map((user) => (
                                                <SelectItem
                                                    key={user.uid}
                                                    value={user.uid.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarImage
                                                                src={
                                                                    user.photoURL
                                                                }
                                                                alt={user.name}
                                                            />
                                                            <AvatarFallback className="text-[10px]">
                                                                {`${user.name.charAt(0)}${user.surname ? user.surname.charAt(0) : ''}`}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-normal font-body">
                                                            {user.name}
                                                            {user.surname
                                                                ? ` ${user.surname}`
                                                                : ''}{' '}
                                                            ({user.email})
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="block text-xs font-light uppercase font-body">
                            Clients
                        </Label>
                        <Controller
                            control={control}
                            name="client"
                            render={({ field }) => (
                                <div className="relative">
                                    <div className="flex items-center justify-between w-full h-10 gap-2 px-3 border rounded cursor-pointer bg-card border-border">
                                        <div className="flex items-center gap-2">
                                            <Building2
                                                className="w-4 h-4 text-muted-foreground"
                                                strokeWidth={1.5}
                                            />
                                            <span className="text-[10px] font-thin font-body">
                                                {hasClients
                                                    ? `${watch('client')?.length} ${watch('client')?.length === 1 ? 'CLIENT' : 'CLIENTS'} SELECTED`
                                                    : 'SELECT CLIENTS'}
                                            </span>
                                        </div>
                                        <ChevronDown
                                            className="w-4 h-4 ml-2 opacity-50"
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <Select
                                        onValueChange={(value: string) => {
                                            const uid = parseInt(value, 10);
                                            const existingClients =
                                                field.value || [];
                                            if (
                                                !existingClients.some(
                                                    (c) => c.uid === uid,
                                                )
                                            ) {
                                                const client = clients.find(
                                                    (c) => c.uid === uid,
                                                );
                                                field.onChange([
                                                    ...existingClients,
                                                    {
                                                        uid,
                                                        name: client?.name,
                                                        email: client?.email,
                                                        address:
                                                            client?.address
                                                                ?.street,
                                                        phone: client?.phone,
                                                        contactPerson:
                                                            client?.contactPerson,
                                                    },
                                                ]);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                                        <SelectContent className="overflow-y-auto max-h-60">
                                            {clients?.map((client) => (
                                                <SelectItem
                                                    key={client.uid}
                                                    value={client.uid.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarImage
                                                                src={
                                                                    client.logo ||
                                                                    client.photo
                                                                }
                                                                alt={
                                                                    client.name
                                                                }
                                                            />
                                                            <AvatarFallback className="text-[10px]">
                                                                {client.name.charAt(
                                                                    0,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-[10px] font-normal font-body">
                                                            {client.name}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="block text-xs font-light uppercase font-body">
                            Subtasks
                        </Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                appendSubtask({ title: '', description: '' })
                            }
                            className="text-[10px] font-light uppercase font-body h-8"
                        >
                            <PlusIcon className="w-3 h-3 mr-1" />
                            Add Subtask
                        </Button>
                    </div>

                    {subtaskFields.map((field, index) => (
                        <Card
                            key={field.id}
                            className="bg-card/50 border-border"
                        >
                            <CardHeader className="flex flex-row items-center justify-between py-2 space-y-0">
                                <CardTitle className="text-xs font-normal uppercase font-body">
                                    Subtask #{index + 1}
                                </CardTitle>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSubtask(index)}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2">
                                <div className="space-y-1">
                                    <Label
                                        htmlFor={`subtasks.${index}.title`}
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        Title
                                    </Label>
                                    <Input
                                        id={`subtasks.${index}.title`}
                                        {...register(`subtasks.${index}.title`)}
                                        placeholder="subtask title"
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.subtasks?.[index]?.title && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {
                                                errors.subtasks[index]?.title
                                                    ?.message
                                            }
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label
                                        htmlFor={`subtasks.${index}.description`}
                                        className="block text-xs font-light uppercase font-body"
                                    >
                                        Description
                                    </Label>
                                    <Textarea
                                        id={`subtasks.${index}.description`}
                                        {...register(
                                            `subtasks.${index}.description`,
                                        )}
                                        placeholder="subtask description"
                                        rows={4}
                                        className="font-light bg-card border-border placeholder:text-xs placeholder:font-body"
                                    />
                                    {errors.subtasks?.[index]?.description && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {
                                                errors.subtasks[index]
                                                    ?.description?.message
                                            }
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </fieldset>

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full text-xs font-light text-white uppercase font-body"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin">
                            <svg
                                className="w-4 h-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        </span>
                        <span>Creating Task...</span>
                    </div>
                ) : (
                    'Create Task'
                )}
            </Button>
        </form>
    );
};

export default TaskForm;
