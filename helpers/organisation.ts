export interface Organisation {
    uid: number;
    name: string;
    code: string;
    description?: string;
    logo?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
