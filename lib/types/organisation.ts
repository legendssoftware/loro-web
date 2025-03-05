export interface Organisation {
    uid: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    website?: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
}
