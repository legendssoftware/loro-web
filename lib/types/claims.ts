import { Branch } from './branch';
import { User } from './users';

export enum ClaimStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    IN_REVIEW = 'IN_REVIEW',
}

export enum ClaimCategory {
    MEDICAL = 'MEDICAL',
    TRAVEL = 'TRAVEL',
    EQUIPMENT = 'EQUIPMENT',
    SUPPLIES = 'SUPPLIES',
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
    amount: number;
    category: ClaimCategory;
    description: string;
    notes: string | null;
    status: ClaimStatus;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    owner: User;
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
