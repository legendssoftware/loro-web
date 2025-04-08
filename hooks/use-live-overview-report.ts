'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { axiosInstance } from '@/lib/services/api-client';

interface UseLiveOverviewReportProps {
    organizationId?: number;
    branchId?: number;
}

interface UseLiveOverviewReportReturn {
    report: any;
    isLoading: boolean;
    error: Error | null;
    filters: {
        organizationId: number | undefined;
        branchId: number | undefined;
    };
    updateFilters: (
        newFilters: Partial<{ organizationId: number; branchId: number }>,
    ) => void;
    refreshData: () => void;
}

export function useLiveOverviewReport({
    organizationId,
    branchId,
}: UseLiveOverviewReportProps = {}): UseLiveOverviewReportReturn {
    const [filters, setFilters] = useState({
        organizationId,
        branchId,
    });

    const fetchLiveReport = async () => {
        const response = await axiosInstance.get('/reports/live-overview', {
            params: {
                organisationId: filters.organizationId,
                branchId: filters.branchId,
            },
        });
        return response.data;
    };

    const {
        data: report,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: [
            'live-overview-report',
            filters.organizationId,
            filters.branchId,
        ],
        queryFn: fetchLiveReport,
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        staleTime: 60 * 1000, // Consider data stale after 1 minute
    });

    // Function to update filters
    const updateFilters = (
        newFilters: Partial<{ organizationId: number; branchId: number }>,
    ) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // Function to manually refresh data
    const refreshData = () => {
        refetch();
    };

    return {
        report,
        isLoading,
        error: error as Error | null,
        filters,
        updateFilters,
        refreshData,
    };
}
