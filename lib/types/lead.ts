export enum LeadStatus {
    NEW = 'New',
    CONTACTED = 'Contacted',
    CLOSED_WON = 'Closed-Won',
    CLOSED_LOST = 'Closed-Lost',
    ARCHIVED = 'Archived',
    PENDING = 'Pending',
    IN_REVIEW = 'In Review',
    DECLINED = 'Declined',
}

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<LeadStatus, StatusColorConfig> = {
    [LeadStatus.NEW]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [LeadStatus.CONTACTED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
    [LeadStatus.CLOSED_WON]: {
        bg: 'bg-purple-100 dark:bg-purple-950/50',
        text: 'text-purple-800 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
    },
    [LeadStatus.CLOSED_LOST]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
    [LeadStatus.ARCHIVED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
    [LeadStatus.PENDING]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [LeadStatus.IN_REVIEW]: {
        bg: 'bg-orange-100 dark:bg-orange-950/50',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
    },
    [LeadStatus.DECLINED]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
};

export interface Lead {
    uid: number;
    name: string;
    email: string;
    phone: string;
    companyName: string; // Company name shown in the UI
    notes?: string;
    status: LeadStatus;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    ownerUid?: number;
    branchUid?: number;
    initials?: string; // First and last name initials
    owner?: {
        uid: number;
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

export interface PaginatedLeadsResponse {
    items: Lead[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface LeadFilterParams {
    status?: LeadStatus;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

export interface LeadStats {
    total: number;
    pending: number;
    approved: number;
    inReview: number;
    declined: number;
}

export interface LeadsByStatus {
    [LeadStatus.NEW]: Lead[];
    [LeadStatus.CONTACTED]: Lead[];
    [LeadStatus.CLOSED_WON]: Lead[];
    [LeadStatus.CLOSED_LOST]: Lead[];
}
