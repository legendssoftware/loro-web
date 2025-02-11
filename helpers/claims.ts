import axios from 'axios';
import { Claim, CreateClaimDTO, UpdateClaimDTO, ClaimStats } from '@/lib/types/claims';
import { RequestConfig } from '@/lib/types/tasks';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch all claims
export const fetchClaims = async (config: RequestConfig) => {
    try {
        const response = await axios.get<{ claims: Claim[], message: string, stats: ClaimStats }>(`${API_URL}/claims`, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return { claims: [], message: 'Error fetching claims', stats: null };
    }
};

// Fetch a single claim by reference
export const fetchClaimByRef = async (ref: number, config: RequestConfig) => {
    try {
        const response = await axios.get<{ claim: Claim, message: string }>(`${API_URL}/claims/${ref}`, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Fetch claims by user reference
export const fetchClaimsByUser = async (ref: number, config: RequestConfig) => {
    try {
        const response = await axios.get<{ claims: Claim[], message: string }>(`${API_URL}/claims/for/${ref}`, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Create a new claim
export const createClaim = async (claim: CreateClaimDTO, config: RequestConfig) => {
    try {
        const response = await axios.post<{ message: string }>(`${API_URL}/claims`, claim, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Update a claim
export const updateClaim = async ({ ref, updatedClaim, config }: { ref: number; updatedClaim: UpdateClaimDTO; config: RequestConfig }) => {
    try {
        const response = await axios.patch<{ message: string }>(`${API_URL}/claims/${ref}`, updatedClaim, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Delete a claim
export const deleteClaim = async (ref: number, config: RequestConfig) => {
    try {
        const response = await axios.delete<{ message: string }>(`${API_URL}/claims/${ref}`, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
};

// Restore a deleted claim
export const restoreClaim = async (ref: number, config: RequestConfig) => {
    try {
        const response = await axios.patch<{ message: string }>(`${API_URL}/claims/restore/${ref}`, {}, {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        return error;
    }
}; 