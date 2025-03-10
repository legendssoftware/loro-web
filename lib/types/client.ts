export interface ClientAddress {
    city: string;
    state: string;
    street: string;
    suburb: string;
    country: string;
    postalCode: string;
}

export interface Client {
    uid: number;
    name: string;
    email: string;
    phone?: string;
    address?: ClientAddress;
    contactPerson?: string;
    industry?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted?: boolean;
    photo?: string;
    ref?: string;
    type?: string;
    website?: string;
    notes?: string;
    logo?: string;
    description?: string;
    category?: string;
}
