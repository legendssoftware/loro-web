export enum AccessLevel {
    ADMIN = "admin",
    MANAGER = "manager",
    SUPERVISOR = "supervisor",
    USER = "user",
    OWNER = "owner",
    SUPPORT = "support",
    DEVELOPER = "developer"
}

export interface User {
    uid: number;
    username: string;
    name: string;
    surname: string;
    email: string;
    phone: string;
    photoURL: string;
    accessLevel: AccessLevel;
    userref: string;
    organisationRef: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    deletedAt?: string;
} 