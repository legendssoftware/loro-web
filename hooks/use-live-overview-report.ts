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
    refreshData: () => Promise<void>;
}

export function useLiveOverviewReport({
    organizationId,
    branchId,
}: UseLiveOverviewReportProps = {}): UseLiveOverviewReportReturn {
    const [filters, setFilters] = useState({
        organizationId,
        branchId,
    });

    const fetchLiveReport = async ({ forceFresh = false } = {}) => {
        const response = await axiosInstance.get('/reports/live-overview', {
            params: {
                organisationId: filters.organizationId,
                branchId: filters.branchId,
                forceFresh,
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
        queryFn: () => fetchLiveReport(),
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
        staleTime: 60 * 1000, // Consider data stale after 1 minute
    });

    // Function to update filters
    const updateFilters = (
        newFilters: Partial<{ organizationId: number; branchId: number }>,
    ) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    // Function to manually refresh data with forceFresh parameter
    const refreshData = async () => {
        const result = await refetch({
            queryFn: () => fetchLiveReport({ forceFresh: true }),
        });
        return result;
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
