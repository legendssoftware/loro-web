export interface Client {
    uid: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
    industry?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}

export interface CreateClientDTO {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
    industry?: string;
    description?: string;
}

export interface UpdateClientDTO {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    industry?: string;
    description?: string;
} 