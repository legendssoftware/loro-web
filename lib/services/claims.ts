import { Claim, UpdateClaimDTO } from '@/lib/types/claims';

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
    private readonly baseUrl = '/api/claims';

    async getClaims(params: GetClaimsParams): Promise<GetClaimsResponse> {
        const searchParams = new URLSearchParams();
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);

        const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to fetch claims');
        }
        return response.json();
    }

    async updateClaim(ref: number, data: UpdateClaimDTO): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${ref}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update claim');
        }
    }

    async deleteClaim(ref: number): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${ref}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete claim');
        }
    }
}

export const claimsService = new ClaimsService();
