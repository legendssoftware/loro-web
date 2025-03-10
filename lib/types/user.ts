export interface UserAddress {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

export interface User {
    uid: number;
    name: string;
    email: string;
    surname?: string;
    phone?: string;
    avatarUrl?: string;
    photoURL?: string;
    address?: UserAddress;
    accessLevel?: string;
    status?: string;
    userref?: string;
    createdAt?: Date;
    updatedAt?: Date;
    isDeleted?: boolean;
    role?: string;
    branch?: string;
    department?: string;
    position?: string;
    notes?: string;
    photo?: string;

}
