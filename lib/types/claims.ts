import { User } from "./users";
import { Branch } from "./branch";

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
    description: string;
    attachments?: string[];
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface CreateClaimDTO {
    owner: { uid: number };
    branch?: { uid: number };
    amount: number;
    category: ClaimCategory;
    description: string;
    attachments?: string[];
}

export interface UpdateClaimDTO {
    owner?: { uid: number };
    branch?: { uid: number };
    amount?: number;
    category?: ClaimCategory;
    status?: ClaimStatus;
    description?: string;
    attachments?: string[];
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