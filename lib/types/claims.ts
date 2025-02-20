export enum ClaimStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    IN_REVIEW = 'IN_REVIEW',
    VERIFIED = 'VERIFIED',
    PAID = 'PAID',
    DECLINED = 'DECLINED',
}

export enum ClaimCategory {
    MEDICAL = 'MEDICAL',
    TRAVEL = 'TRAVEL',
    EQUIPMENT = 'EQUIPMENT',
    SUPPLIES = 'SUPPLIES',
    MEALS = 'MEALS',
    TRANSPORTATION = 'TRANSPORTATION',
    ENTERTAINMENT = 'ENTERTAINMENT',
    OTHER_EXPENSES = 'OTHER_EXPENSES',
    ACCOMMODATION = 'ACCOMMODATION',
    GENERAL = 'GENERAL',
    PROMOTION = 'PROMOTION',
    EVENT = 'EVENT',
    ANNOUNCEMENT = 'ANNOUNCEMENT',
    HOTEL = 'HOTEL',
    TRANSPORT = 'TRANSPORT',
    OTHER = 'OTHER',
}

export enum MerchandiseStatus {
    PENDING = 'PENDING',
    REVIEW = 'REVIEW',
    DELETED = 'DELETED',
}

export interface ClaimStats {
    total: number;
    pending: number;
    approved: number;
    declined: number;
    paid: number;
}

export interface Claim {
    uid: number;
    amount: string;
    documentUrl: string | null;
    verifiedBy: string | null;
    verifiedAt: string | null;
    category: ClaimCategory;
    description: string;
    comments: string;
    status: ClaimStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isDeleted: boolean;
    owner: {
        uid: number;
        username: string;
        name: string;
        surname: string;
        email: string;
        phone: string;
        photoURL: string | null;
        accessLevel: string;
        status: string;
    };
    branch?: {
        uid: number;
        name: string;
        email: string;
        phone: string;
        contactPerson: string;
        address: string;
    };
}

export interface CreateClaimDTO {
    title: string;
    description: string;
    amount: number;
    documentUrl?: string;
    category: ClaimCategory;
    owner: { uid: number };
}

export type UpdateClaimDTO = Partial<{
    amount: number;
    category: ClaimCategory;
    status: ClaimStatus;
}>;

export interface ClaimResponse {
    data: Claim[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}

export interface RequestConfig {
    headers: {
        token: string;
    };
}
