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
    uid?: number;
    title: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
    status: string;
    isDeleted?: boolean;
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

export interface Task {
    uid: number;
    title: string;
    description: string;
    taskType: TaskType;
    priority: Priority;
    deadline: string | null;
    repetitionType: RepetitionType;
    repetitionEndDate: string | null;
    attachments: string[];
    assignees: User[];
    clients: Client[];
    targetCategory: TargetCategory | null;
    subtasks: SubTask[];
    status: TaskStatus;
    comment: string;
    notes: string;
    progress: number;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    lastCompletedAt: string | null;
    startDate: string | null;
    isOverdue: boolean;
    createdBy: User;
    owner: User | null;
    branch: Branch | null;
}

export interface ExistingTask extends Task {}

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
