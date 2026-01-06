export enum ClaimStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    PAID = 'paid',
    CANCELLED = 'cancelled',
    DECLINED = 'declined',
    DELETED = 'deleted',
}

export enum ClaimCategory {
    GENERAL = 'general',
    TRAVEL = 'travel',
    TRANSPORT = 'transport',
    ACCOMMODATION = 'accommodation',
    MEALS = 'meals',
    ENTERTAINMENT = 'entertainment',
    HOTEL = 'hotel',
    OTHER = 'other',
    PROMOTION = 'promotion',
    EVENT = 'event',
    ANNOUNCEMENT = 'announcement',
    TRANSPORTATION = 'transportation',
    OTHER_EXPENSES = 'other expenses',
}

export interface StatusColorConfig {
    bg: string;
    text: string;
    border: string;
}

export const StatusColors: Record<ClaimStatus, StatusColorConfig> = {
    [ClaimStatus.PENDING]: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/50',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [ClaimStatus.APPROVED]: {
        bg: 'bg-green-100 dark:bg-green-950/50',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
    },
    [ClaimStatus.REJECTED]: {
        bg: 'bg-red-100 dark:bg-red-950/50',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
    },
    [ClaimStatus.PAID]: {
        bg: 'bg-blue-100 dark:bg-blue-950/50',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [ClaimStatus.CANCELLED]: {
        bg: 'bg-gray-100 dark:bg-gray-950/50',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-800',
    },
    [ClaimStatus.DECLINED]: {
        bg: 'bg-purple-100 dark:bg-purple-950/50',
        text: 'text-purple-800 dark:text-purple-300',
        border: 'border-purple-200 dark:border-purple-800',
    },
    [ClaimStatus.DELETED]: {
        bg: 'bg-orange-100 dark:bg-orange-950/50',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
    },
};

export interface Claim {
    uid: number;
    amount: string;
    currency?: string;
    documentUrl?: string;
    comments?: string;
    status: ClaimStatus;
    category: ClaimCategory;
    verifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    isDeleted: boolean;
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
    verifiedBy?: {
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

export interface PaginatedClaimsResponse {
    items: Claim[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ClaimFilterParams {
    status?: ClaimStatus;
    category?: ClaimCategory;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    ownerId?: number;
    verifiedById?: number;
}

export interface ClaimStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    paid: number;
}

export interface ClaimsByStatus {
    [ClaimStatus.PENDING]: Claim[];
    [ClaimStatus.APPROVED]: Claim[];
    [ClaimStatus.REJECTED]: Claim[];
    [ClaimStatus.PAID]: Claim[];
    [ClaimStatus.CANCELLED]: Claim[];
    [ClaimStatus.DECLINED]: Claim[];
    [ClaimStatus.DELETED]: Claim[];
}
