import { useCallback } from 'react';
import { axiosInstance } from '@/lib/services/api-client';
import { toast } from 'react-hot-toast';
import { showErrorToast } from '@/lib/utils/toast-config';

interface ReportResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

/**
 * Hook for interacting with the reports API
 */
export const useReportApi = () => {
    /**
     * Fetch a client quotation report
     */
    const fetchClientQuotationReport = useCallback(
        async (
            clientId: number,
            params: {
                startDate?: string;
                endDate?: string;
                name?: string;
                additionalFilters?: Record<string, any>;
            } = {},
        ): Promise<ReportResponse<any>> => {
            console.log(
                `API Call: Fetching quotation report for client ${clientId}`,
                params,
            );
            try {
                const response = await axiosInstance.get(
                    `/reports/client/${clientId}`,
                    {
                        params: {
                            name: params.name,
                            startDate: params.startDate,
                            endDate: params.endDate,
                            additionalFilters: params.additionalFilters,
                        },
                    },
                );

                console.log(
                    `API Success: Received report data for client ${clientId}`,
                    {
                        reportName: response.data?.name,
                        quotationCount: response.data?.summary?.quotationCount,
                        timestamp: new Date().toISOString(),
                    },
                );

                return {
                    data: response.data,
                    message: 'Report fetched successfully',
                    success: true,
                };
            } catch (error: any) {
                console.error(
                    `API Error: Failed to fetch report for client ${clientId}:`,
                    error,
                );

                const errorMessage = error?.response?.data?.message || 'Failed to fetch report';

                // Show toast notification for user feedback
                showErrorToast(errorMessage, toast);

                return {
                    data: null,
                    message: errorMessage,
                    success: false,
                };
            }
        },
        [],
    );

    /**
     * Generate a generic report
     */
    const generateReport = useCallback(
        async (
            type: string,
            params: {
                organisationId?: number;
                branchId?: number;
                name?: string;
                startDate?: string;
                endDate?: string;
                filters?: Record<string, any>;
            },
        ): Promise<ReportResponse<any>> => {
            try {
                const response = await axiosInstance.post(
                    `/reports/${type}/generate`,
                    params,
                );

                return {
                    data: response.data,
                    message: 'Report generated successfully',
                    success: true,
                };
            } catch (error: any) {
                console.error(`Error generating ${type} report:`, error);

                const errorMessage = error?.response?.data?.message || 'Failed to generate report';

                // Show toast notification for user feedback
                showErrorToast(errorMessage, toast);

                return {
                    data: null,
                    message: errorMessage,
                    success: false,
                };
            }
        },
        [],
    );

    return {
        fetchClientQuotationReport,
        generateReport,
    };
};
