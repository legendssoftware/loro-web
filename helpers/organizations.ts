import { RequestConfig } from '@/lib/types/tasks';
import axios, { AxiosError } from 'axios';

export interface Organization {
    uid: number;
    name: string;
    description?: string;
    logo?: string;
    branches: Branch[];
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    ref: string;
}

export interface Branch {
    uid: number;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    organisation: Organization;
    createdAt: string;
    updatedAt: string;
    isDeleted: boolean;
    ref: string;
}

export interface OrganisationSettings {
    uid: number;
    contact?: {
        email: string;
        phone: {
            code: string;
            number: string;
        };
        website: string;
        address: string;
    };
    regional?: {
        language: string;
        timezone: string;
        currency: string;
        dateFormat: string;
        timeFormat: string;
    };
    business?: {
        name: string;
        registrationNumber?: string;
        taxId: string;
        industry?: string;
        size?: 'small' | 'medium' | 'large' | 'enterprise';
    };
    branding?: {
        logo?: string;
        logoAltText?: string;
        favicon?: string;
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    };
    notifications?: {
        email: boolean;
        sms: boolean;
        push: boolean;
        whatsapp: boolean;
    };
    preferences?: {
        defaultView: string;
        itemsPerPage: number;
        theme: 'light' | 'dark' | 'system';
        menuCollapsed: boolean;
    };
    organisationUid: number;
}

export interface OrganisationAppearance {
    uid: number;
    branding: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
        logo?: string;
        logoAltText?: string;
        favicon?: string;
    };
    customCss?: Record<string, any>;
    organisationUid: number;
}

export interface OrganisationHours {
    uid: number;
    openTime: string;
    closeTime: string;
    weeklySchedule: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
    };
    specialHours?: {
        date: string;
        openTime: string;
        closeTime: string;
    }[];
    organisationUid: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchOrganizations = async (config: RequestConfig): Promise<Organization[]> => {
    try {
        const response = await axios.get(`${API_URL}/org`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.headers.token}`,
            },
            timeout: 5000,
        });
        return response.data.organisations || [];
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timeout:', error);
                return [];
            }
            if (error.response) {
                console.error('Server error:', error.response.data);
                return [];
            } else if (error.request) {
                console.error('Network error:', error.message);
                return [];
            }
        }
        console.error('Error fetching organizations:', error);
        return [];
    }
};

export const fetchBranches = async (orgRef: string | undefined, config: RequestConfig): Promise<Branch[]> => {
    try {
        if (!orgRef) return [];

        const response = await axios.get(`${API_URL}/org/${orgRef}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.headers.token}`,
            },
            timeout: 5000,
        });
        return response.data.organisation?.branches || [];
    } catch (error) {
        if (error instanceof AxiosError) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timeout:', error);
                return [];
            }
            if (error.response) {
                console.error('Server error:', error.response.data);
                return [];
            } else if (error.request) {
                console.error('Network error:', error.message);
                return [];
            }
        }
        console.error('Error fetching branches:', error);
        return [];
    }
};

export async function getOrganisationSettings(orgRef: string) {
    const { data } = await axios.get(`/organisations/${orgRef}/settings`);
    return data;
}

export async function updateOrganisationSettings(orgRef: string, settings: Partial<OrganisationSettings>) {
    const { data } = await axios.put(`/organisations/${orgRef}/settings`, settings);
    return data;
}

export async function getOrganisationAppearance(orgRef: string) {
    const { data } = await axios.get(`/organisations/${orgRef}/appearance`);
    return data;
}

export async function updateOrganisationAppearance(orgRef: string, appearance: Partial<OrganisationAppearance>) {
    const { data } = await axios.put(`/organisations/${orgRef}/appearance`, appearance);
    return data;
}

export async function getOrganisationHours(orgRef: string) {
    const { data } = await axios.get(`/organisations/${orgRef}/hours`);
    return data;
}

export async function updateOrganisationHours(orgRef: string, hours: Partial<OrganisationHours>) {
    const { data } = await axios.put(`/organisations/${orgRef}/hours`, hours);
    return data;
}

export async function createOrganisationHours(orgRef: string, hours: Partial<OrganisationHours>) {
    const { data } = await axios.post(`/organisations/${orgRef}/hours`, hours);
    return data;
}

export async function deleteOrganisationHours(orgRef: string, hoursRef: string) {
    const { data } = await axios.delete(`/organisations/${orgRef}/hours/${hoursRef}`);
    return data;
}
