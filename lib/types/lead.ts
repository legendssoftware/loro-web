export enum LeadStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REVIEW = 'REVIEW',
    DECLINED = 'DECLINED',
    CONVERTED = 'CONVERTED',
    CANCELLED = 'CANCELLED',
}

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<LeadStatus, StatusColorConfig> = {
    [LeadStatus.PENDING]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [LeadStatus.APPROVED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
    [LeadStatus.REVIEW]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [LeadStatus.DECLINED]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
    [LeadStatus.CONVERTED]: {
        bg: 'bg-purple-100 dark:bg-purple-950/50',
        text: 'text-purple-800 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
    },
    [LeadStatus.CANCELLED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
};

export interface LeadStatusHistoryEntry {
    timestamp: Date;
    oldStatus?: LeadStatus;
    newStatus: LeadStatus;
    reason?: string;
    description?: string;
    userId?: number;
    user?: {
        uid: number;
        username?: string;
        name?: string;
        surname?: string;
        email?: string;
        phone?: string;
        photoURL?: string;
        accessLevel?: string;
        status?: string;
    };
}

export interface Lead {
    uid: number;
    name: string;
    email: string;
    phone: string;
    notes?: string;
    companyName?: string;
    image?: string;
    status: LeadStatus;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner?: {
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
    client?: {
        uid: number;
        name: string;
        email: string;
        phone: string;
    };
    assignees?: { uid: number }[];
    assignTo?: { uid: number }[];
    statusChangeReason?: string;
    statusChangeDescription?: string;
    changeHistory?: LeadStatusHistoryEntry[];
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
    ownerUid?: number;
    branchUid?: number;
    clientUid?: number;
}

export interface LeadStats {
    total: number;
    pending: number;
    approved: number;
    review: number;
    declined: number;
    converted: number;
    cancelled: number;
}

export interface LeadsByStatus {
    [LeadStatus.PENDING]: Lead[];
    [LeadStatus.APPROVED]: Lead[];
    [LeadStatus.REVIEW]: Lead[];
    [LeadStatus.DECLINED]: Lead[];
    [LeadStatus.CONVERTED]: Lead[];
    [LeadStatus.CANCELLED]: Lead[];
}
