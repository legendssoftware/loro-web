export interface Organisation {
    id: number;
    name: string;
    code?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    isDeleted: boolean;
}
