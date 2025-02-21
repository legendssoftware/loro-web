export interface User {
    uid: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user' | 'manager';
    organisationRef: string;
    branchRef: string;
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
}
