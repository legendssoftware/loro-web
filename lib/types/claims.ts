
import { User } from "@/helpers/users";
import { ClaimStatus, ClaimCategory } from "../enums/finance.enums";
import { Branch } from "./branch";

export interface Claim {
    uid?: number;
    title: string;
    description: string;
    amount: number;
    category: ClaimCategory; 
    status: ClaimStatus;
    attachments?: string[];
    owner?: User; 
    branch?: Branch;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
}

export interface CreateClaimDTO {
    title: string;
    description: string;
    amount: number;
    category: ClaimCategory;
    attachments?: string[];
    owner: {
        uid: number;
    };
    branch: {
        uid: number;
    };
}

export interface UpdateClaimDTO extends Partial<CreateClaimDTO> {
    status?: ClaimStatus; 
}

export interface ClaimStats {
    total: number;
    pending: number;
    approved: number;
    declined: number;
    paid: number;
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