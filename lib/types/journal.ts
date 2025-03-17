import { User } from './user';
import { Branch } from './branch';
import { Organisation } from './organisation';

export enum JournalStatus {
    PENDING_REVIEW = 'PENDING_REVIEW',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
    REJECTED = 'REJECTED',
    DRAFT = 'DRAFT',
}

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<JournalStatus, StatusColorConfig> = {
    [JournalStatus.PENDING_REVIEW]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [JournalStatus.PUBLISHED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
    [JournalStatus.DRAFT]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [JournalStatus.REJECTED]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
    [JournalStatus.ARCHIVED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
};

export interface Journal {
    uid: number;
    clientRef: string;
    fileURL: string;
    comments: string;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    status: JournalStatus;
    owner: User;
    branch: Branch;
    organisation: Organisation;
}

export interface JournalFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
    status?: JournalStatus;
    branchId?: number;
    ownerId?: number;
}

export interface JournalResponse {
    data: Journal[];
    message: string;
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface SingleJournalResponse {
    data: Journal | null;
    message: string;
    meta: {
        total: number;
    };
}

export interface CreateJournalDto {
    clientRef: string;
    fileURL: string;
    comments: string;
    owner: { uid: number };
    branch: { uid: number };
    status?: JournalStatus;
}

export interface UpdateJournalDto {
    clientRef?: string;
    fileURL?: string;
    comments?: string;
    status?: JournalStatus;
}

export interface JournalStats {
    total: number;
    pending_review: number;
    published: number;
    draft: number;
    rejected: number;
    archived: number;
}
