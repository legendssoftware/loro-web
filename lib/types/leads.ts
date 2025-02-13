import { Client } from "./clients";
import { User } from "./users";

export enum LeadStatus {
    PENDING = "PENDING",
    CONTACTED = "CONTACTED",
    QUALIFIED = "QUALIFIED",
    PROPOSAL = "PROPOSAL",
    NEGOTIATION = "NEGOTIATION",
    WON = "WON",
    LOST = "LOST"
}

export interface Lead {
    uid: number;
    title: string;
    description?: string;
    status: LeadStatus;
    client: Client;
    owner: User;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

export interface CreateLeadDTO {
    title: string;
    description?: string;
    status: LeadStatus;
    clientId: number;
    ownerId: number;
}

export interface UpdateLeadDTO {
    title?: string;
    description?: string;
    status?: LeadStatus;
    clientId?: number;
    ownerId?: number;
} 