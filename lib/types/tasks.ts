import { GeneralStatus } from "../enums/status.enums";

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

export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum TaskRepetition {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

export interface SubTask {
    uid: string;
    title: string;
    description?: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    uid: string;
    title: string;
    type: string;
    deadline: string;
    priority: TaskPriority;
    status: TaskStatus;
    repetitionType: TaskRepetition;
    owner: {
        uid: string;
        name: string;
        photoURL?: string;
    };
    client: {
        uid: string;
        name: string;
        email: string;
        phone: string;
        address: string;
        contactPerson: string;
    };
    description?: string;
    notes?: string;
    comment?: string;
    subtasks?: SubTask[];
    branchId: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    progress: number;
}

export type RequestConfig = {
    headers: {
        token: string;
    };
};

export interface Branch {
    uid: number;
    name: string;
    email: string;
    phone: string;
    contactPerson: string;
    ref: string;
    address: string;
    website: string;
    status: GeneralStatus;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;

    // Optional relationship fields that might be needed on client side
    organisationId?: string;
    usersCount?: number;
    tasksCount?: number;
    claimsCount?: number;
    assetsCount?: number;
}

