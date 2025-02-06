import axios from 'axios';
import { Quotation, CreateQuotationDTO, UpdateQuotationDTO } from '@/lib/types/quotations';
import { RequestConfig } from '@/lib/types/tasks';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch all quotations
export const fetchQuotations = async (config: RequestConfig) => {
    if (!config?.headers?.token) {
        return { quotations: [], message: 'Authentication token is missing' };
    }
    try {
        const response = await axios.get<{ quotations: Quotation[], message: string }>(
            `${API_URL}/shop/quotations`,
            {
                headers: {
                    'Authorization': `Bearer ${config.headers.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return { quotations: [], message: 'Authentication failed. Please sign in again.' };
        }
        console.error('Error fetching quotations:', error);
        return { quotations: [], message: 'Error fetching quotations' };
    }
};

// Create quotation
export const createQuotation = async (quotationData: CreateQuotationDTO, config: RequestConfig) => {
    const response = await axios.post<{ message: string }>(
        `${API_URL}/shop/quotations`,
        quotationData,
        {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

// Update quotation
export const updateQuotation = async ({ ref, updatedQuotation, config }: {
    ref: number;
    updatedQuotation: UpdateQuotationDTO;
    config: RequestConfig;
}) => {
    const response = await axios.patch<{ message: string }>(
        `${API_URL}/shop/quotations/${ref}`,
        updatedQuotation,
        {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

// Delete quotation
export const deleteQuotation = async (ref: number, config: RequestConfig) => {
    const response = await axios.delete<{ message: string }>(
        `${API_URL}/shop/quotations/${ref}`,
        {
            headers: {
                'Authorization': `Bearer ${config?.headers?.token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
}; 