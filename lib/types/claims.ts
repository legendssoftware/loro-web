import { Branch } from "./branch";
import { User } from "./users";

export enum ClaimStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    DECLINED = "DECLINED",
    PAID = "PAID",
    DELETED = "DELETED"
}

export enum ClaimCategory {
    GENERAL = "GENERAL",
    PROMOTION = "PROMOTION",
    EVENT = "EVENT",
    ANNOUNCEMENT = "ANNOUNCEMENT",
    OTHER = "OTHER",
    HOTEL = "HOTEL",
    TRAVEL = "TRAVEL",
    TRANSPORT = "TRANSPORT",
    OTHER_EXPENSES = "OTHER_EXPENSES",
    ACCOMMODATION = "ACCOMMODATION",
    MEALS = "MEALS",
    TRANSPORTATION = "TRANSPORTATION",
    ENTERTAINMENT = "ENTERTAINMENT"
}

export enum MerchandiseStatus {
    PENDING = "PENDING",
    REVIEW = "REVIEW",
    DELETED = "DELETED"
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
    owner: User;
    branch?: Branch;
    amount: string;
    category: ClaimCategory;
    status: ClaimStatus;
    description?: string;
    notes?: string;
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt?: string;
}

export interface CreateClaimDTO {
    title: string;
    description: string;
    amount: number;
    documentUrl?: string;
    category: ClaimCategory;
    owner: { uid: number };
}

export interface UpdateClaimDTO {
    title?: string;
    description?: string;
    amount?: number;
    documentUrl?: string;
    category?: ClaimCategory;
    status?: ClaimStatus;
}

export interface ClaimResponse {
    message: string;
    claims?: Claim[];
    claim?: Claim;
    stats?: {
        total: number;
        pending: number;
        approved: number;
        declined: number;
        paid: number;
    };
} 