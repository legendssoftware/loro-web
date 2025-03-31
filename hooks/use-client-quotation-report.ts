import { useQuery } from '@tanstack/react-query';
import { useReportApi } from './use-report-api';
import { useState } from 'react';

export interface ClientQuotationReportFilters {
    startDate?: string;
    endDate?: string;
    status?: string;
}

/**
 * Hook for fetching and managing client quotation report data
 */
export function useClientQuotationReport(
    clientId: number,
    initialFilters: ClientQuotationReportFilters = {},
) {
    const [filters, setFilters] =
        useState<ClientQuotationReportFilters>(initialFilters);
    const reportApi = useReportApi();

    // Fetch report data with React Query
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['clientQuotationReport', clientId, filters],
        queryFn: async () => {
            console.log(
                'Fetching client quotation report with filters:',
                filters,
            );
            const result = await reportApi.fetchClientQuotationReport(
                clientId,
                {
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    additionalFilters: {
                        status: filters.status,
                    },
                },
            );
            console.log('Client quotation report fetch result:', result);
            return result;
        },
        enabled: !!clientId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Update filters and trigger a refetch
    const updateFilters = (
        newFilters: Partial<ClientQuotationReportFilters>,
    ) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
        }));
    };

    // Export report as PDF (placeholder for future implementation)
    const exportAsPdf = async () => {
        console.log('Export as PDF functionality will be implemented here');
        // Future implementation will handle PDF generation
    };

    return {
        report: data?.data,
        isLoading,
        error,
        refetch,
        filters,
        updateFilters,
        exportAsPdf,
    };
}
