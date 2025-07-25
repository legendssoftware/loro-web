import { Branch } from './branch';
import { Organisation } from './organisation';
import { Client } from './client';

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
    PENDING = 'pending',
    DELETED = 'deleted',
    REVIEW = 'review',
    BANNED = 'banned',
    DECLINED = 'declined',
}

export enum AccessLevel {
    ADMIN = 'admin',
    MANAGER = 'manager',
    SUPPORT = 'support',
    DEVELOPER = 'developer',
    OWNER = 'owner',
    USER = 'user',
}

export interface UserProfile {
    id: number;
    height?: string;
    weight?: string;
    gender?: string;
    dob?: Date;
}

export interface UserEmploymentProfile {
    id: number;
    position?: string;
    department?: string;
    startDate?: Date;
}

export interface UserAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

export interface UserTarget {
    uid: number;
    targetSalesAmount: string;
    currentSalesAmount: string;
    targetQuotationsAmount: string;
    currentQuotationsAmount: string;

    currentOrdersAmount: string;
    targetCurrency: string;
    targetHoursWorked: number;
    currentHoursWorked: number | null;
    targetNewClients: number;
    currentNewClients: number;
    targetNewLeads: number;
    currentNewLeads: number;
    targetCheckIns: number;
    currentCheckIns: number;
    targetCalls: number;
    currentCalls: number | null;
    targetPeriod: string;
    periodStartDate: string;
    periodEndDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    uid: number;
    username: string;
    name: string;
    surname: string;
    email: string;
    phone?: string;
    photoURL?: string;
    role?: string;
    status: UserStatus;
    departmentId?: number;
    createdAt: Date;
    updatedAt: Date;
    accessLevel: AccessLevel;
    userref?: string;
    organisation?: Organisation;
    organisationRef?: string;
    userProfile?: UserProfile;
    userEmploymentProfile?: UserEmploymentProfile;
    branch?: Branch;
    isDeleted: boolean;
    address?: UserAddress;
    avatarUrl?: string;
    photo?: string;
    userTarget?: UserTarget;
    assignedClients?: Client[];
    assignedClientIds?: number[];
}

export interface UsersByStatus {
    [UserStatus.ACTIVE]: User[];
    [UserStatus.INACTIVE]: User[];
    [UserStatus.SUSPENDED]: User[];
    [UserStatus.PENDING]: User[];
    [UserStatus.DELETED]: User[];
    [UserStatus.REVIEW]: User[];
    [UserStatus.BANNED]: User[];
    [UserStatus.DECLINED]: User[];
}

export interface UserFilterParams {
    page?: number;
    limit?: number;
    status?: UserStatus;
    accessLevel?: AccessLevel;
    search?: string;
    branchId?: number;
    organisationId?: number;
}

export interface PaginatedUsersResponse {
    items: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
