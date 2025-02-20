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
