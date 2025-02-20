import { Claim, UpdateClaimDTO, ClaimResponse } from '@/lib/types/claims';
import { RequestConfig } from '@/lib/types/tasks';
import { API_URL } from '@/lib/utils/endpoints';

interface GetClaimsParams {
    search?: string;
    status?: string;
}

interface GetClaimsResponse {
    data: Claim[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}

class ClaimsService {
    private readonly baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/claims`;

    async getClaims(params: GetClaimsParams, config: RequestConfig): Promise<GetClaimsResponse> {
        if (!config?.headers?.token) {
            throw new Error('Authentication token is missing');
        }

        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);

        const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch claims');
        }
        return response.json();
    }

    async updateClaim(ref: number, data: UpdateClaimDTO, config: RequestConfig): Promise<void> {
        if (!config?.headers?.token) {
            throw new Error('Authentication token is missing');
        }

        const response = await fetch(`${this.baseUrl}/${ref}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update claim');
        }
    }

    async deleteClaim(ref: number, config: RequestConfig): Promise<void> {
        if (!config?.headers?.token) {
            throw new Error('Authentication token is missing');
        }

        const response = await fetch(`${this.baseUrl}/${ref}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete claim');
        }
    }

    async restoreClaim(ref: number, config: RequestConfig): Promise<void> {
        if (!config?.headers?.token) {
            throw new Error('Authentication token is missing');
        }

        const response = await fetch(`${this.baseUrl}/restore/${ref}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.headers.token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to restore claim');
        }
    }
}

export const claimsService = new ClaimsService();
