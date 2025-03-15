export enum TaskStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    OVERDUE = 'OVERDUE',
    POSTPONED = 'POSTPONED',
    MISSED = 'MISSED',
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
}

export enum RepetitionType {
    NONE = 'NONE',
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
}

export enum TaskType {
    IN_PERSON_MEETING = 'IN_PERSON_MEETING',
    VIRTUAL_MEETING = 'VIRTUAL_MEETING',
    CALL = 'CALL',
    EMAIL = 'EMAIL',
    WHATSAPP = 'WHATSAPP',
    SMS = 'SMS',
    FOLLOW_UP = 'FOLLOW_UP',
    PROPOSAL = 'PROPOSAL',
    REPORT = 'REPORT',
    QUOTATION = 'QUOTATION',
    VISIT = 'VISIT',
    OTHER = 'OTHER',
}

export enum JobStatus {
    QUEUED = 'QUEUED',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
}

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<TaskStatus, StatusColorConfig> = {
    [TaskStatus.PENDING]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [TaskStatus.IN_PROGRESS]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [TaskStatus.COMPLETED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
    [TaskStatus.CANCELLED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
    [TaskStatus.OVERDUE]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
    [TaskStatus.POSTPONED]: {
        bg: 'bg-purple-100 dark:bg-purple-950/50',
        text: 'text-purple-800 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
    },
    [TaskStatus.MISSED]: {
        bg: 'bg-orange-100 dark:bg-orange-950/50',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
    },
};

export const JobStatusColors: Record<JobStatus, StatusColorConfig> = {
    [JobStatus.QUEUED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
    [JobStatus.RUNNING]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [JobStatus.COMPLETED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
};

export interface Task {
    uid: number;
    title: string;
    description: string;
    status: TaskStatus;
    taskType: TaskType;
    priority: TaskPriority;
    repetitionType: RepetitionType;
    progress: number;
    deadline?: Date;
    repetitionDeadline?: Date;
    completionDate?: Date;
    isOverdue: boolean;
    targetCategory?: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    jobStatus?: JobStatus;
    jobStartTime?: Date;
    jobEndTime?: Date;
    jobDuration?: number;
    creator?: {
        uid: number;
        name: string;
        email: string;
        avatarUrl?: string;
        surname?: string;
        phone?: string;
        accessLevel?: string;
        userref?: string;
        photoURL?: string;
    };
    assignees?: {
        uid: number;
        name: string;
        email: string;
        avatarUrl?: string;
        surname?: string;
        phone?: string;
        accessLevel?: string;
        userref?: string;
        photoURL?: string;
    }[];
    clients?: { uid: number }[];
    subtasks?: {
        uid: number;
        title: string;
        status: string;
        isDeleted: boolean;
    }[];
    organisation?: {
        uid: number;
        name: string;
        address: {
            city: string;
            state: string;
            street: string;
            country: string;
            postalCode: string;
        };
        email: string;
        phone: string;
        website: string;
        logo: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        isDeleted: boolean;
        ref: string;
    };
    branch?: {
        uid: number;
        name: string;
        email: string;
        phone: string;
        contactPerson: string;
        ref: string;
        address: {
            city: string;
            state: string;
            street: string;
            suburb: string;
            country: string;
            postalCode: string;
        };
        website: string;
        status: string;
        isDeleted: boolean;
        createdAt: Date;
        updatedAt: Date;
    };
}

export interface PaginatedTasksResponse {
    items: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface TaskFilterParams {
    status?: TaskStatus;
    priority?: TaskPriority;
    taskType?: TaskType;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    assigneeId?: number;
    clientId?: number;
    isOverdue?: boolean;
}

export interface TaskStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
}

export interface TasksByStatus {
    [TaskStatus.PENDING]: Task[];
    [TaskStatus.IN_PROGRESS]: Task[];
    [TaskStatus.COMPLETED]: Task[];
    [TaskStatus.CANCELLED]: Task[];
    [TaskStatus.OVERDUE]: Task[];
    [TaskStatus.POSTPONED]: Task[];
    [TaskStatus.MISSED]: Task[];
}
