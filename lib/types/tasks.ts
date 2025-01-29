import { Branch } from "./branch";
import { TaskType, RepetitionType, Priority, TaskStatus, TargetCategory } from "../enums/task.enums";

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
    LOW = 'low'
}

export enum TaskRepetition {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
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

export interface ExistingTask extends Omit<TaskFormData, 'deadline' | 'repetitionEndDate'> {
    uid: number;
    deadline: string | null;
    repetitionEndDate: string | null;
    startDate: string | null;
    lastCompletedAt: string | null;
    isDeleted: boolean;
    isOverdue: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: User | null;
    assignees: User[];
    clients: Client[];
    subtasks: {
        uid: string;
        title: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        status: TaskStatus;
        isDeleted: boolean;
    }[];
}

export type RequestConfig = {
    headers: {
        token: string;
    };
};
