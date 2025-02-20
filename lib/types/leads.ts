import { User } from './users';
import { Client } from './clients';
import { Branch } from './branch';

export enum LeadStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REVIEW = 'REVIEW',
    DECLINED = 'DECLINED',
}

export interface Lead {
    uid: number;
    name: string;
    email: string;
    phone: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    status: LeadStatus;
    isDeleted: boolean;
    owner: User;
    branch?: Branch;
    client?: Client;
}

export interface CreateLeadDTO {
    name: string;
    email: string;
    phone: string;
    notes?: string;
    status?: LeadStatus;
    isDeleted?: boolean;
    owner: { uid: number };
    branch: { uid: number };
    client?: { uid: number };
}

export interface UpdateLeadDTO {
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
    status?: LeadStatus;
    isDeleted?: boolean;
}

export interface LeadStats {
    total: number;
    pending: number;
    approved: number;
    inReview: number;
    declined: number;
}

export interface LeadResponse {
    data: Lead[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    message: string;
}
