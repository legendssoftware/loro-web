import { GeneralStatus } from "../enums/status.enums";

export interface Branch {
    uid: number;
    name: string;
    email: string;
    phone: string;
    contactPerson: string;
    ref: string;
    address: string;
    website: string;
    status: GeneralStatus;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;

    // Optional relationship fields that might be needed on client side
    organisationId?: string;
    usersCount?: number;
    tasksCount?: number;
    claimsCount?: number;
    assetsCount?: number;
}
