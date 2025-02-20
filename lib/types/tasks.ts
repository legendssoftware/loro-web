import { Branch } from './branch';
import { TaskType, RepetitionType, Priority, TaskStatus, TargetCategory } from '../enums/task.enums';

export type User = {
    uid: number;
    username: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    photoURL: string;
    accessLevel: string;
    userref: string;
    organisationRef: number;
    status: string;
};

export type Client = {
    uid: number;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    alternativePhone: string;
    website: string;
    logo: string;
    description: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    status: string;
    ref: string;
    type: string;
};

export enum TaskPriority {
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export enum TaskRepetition {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
}

export interface SubTask {
    uid?: string;
    title: string;
    description?: string;
    status: TaskStatus;
}

export interface TaskFormData {
    title: string;
    description: string;
    taskType: TaskType;
    priority: Priority;
    deadline?: Date;
    repetitionType: RepetitionType;
    repetitionEndDate?: Date;
    attachments?: string[];
    assignees: { uid: number }[];
    client: {
        uid: number;
        name?: string;
        email?: string;
        address?: string;
        phone?: string;
        contactPerson?: string;
    };
    targetCategory: TargetCategory;
    subtasks: SubTask[];
    status: TaskStatus;
    comment?: string;
    notes?: string;
    progress: number;
}

export interface Task extends Omit<TaskFormData, 'deadline' | 'repetitionEndDate'> {
    uid?: number;
    deadline?: string;
    repetitionEndDate?: string;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
    lastCompletedAt?: string;
    owner?: User;
    branch?: Branch;
    clients?: Client[];
}

export interface ExistingTask {
    uid: number;
    title: string;
    description: string;
    status: TaskStatus;
    taskType: TaskType;
    priority: Priority;
    progress: number;
    deadline: string | null;
    repetitionType: RepetitionType;
    repetitionEndDate: string | null;
    lastCompletedAt: string | null;
    startDate: string | null;
    attachments: string[];
    isDeleted: boolean;
    isOverdue: boolean;
    targetCategory: TargetCategory | null;
    createdAt: string;
    updatedAt: string;
    createdBy: User;
    assignees: User[];
    clients: Client[];
    subtasks: {
        uid: number;
        title: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        status: string;
        isDeleted: boolean;
    }[];
}

export type TaskFilterValue = string | number | boolean | Date | null | undefined;

export interface RequestConfig {
    headers: {
        token?: string;
        Authorization?: string;
        'Content-Type'?: string;
    };
    page?: number;
    limit?: number;
    filters?: {
        status?: string;
        search?: string;
        startDate?: Date;
        endDate?: Date;
        priority?: Priority;
        taskType?: TaskType;
        targetCategory?: TargetCategory;
        assigneeId?: number;
        clientId?: number;
        branchId?: number;
        isOverdue?: boolean;
        isDeleted?: boolean;
        [key: string]: TaskFilterValue;
    };
}
