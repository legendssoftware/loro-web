import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { showErrorToast } from '@/lib/utils/toast-config';

// Define interfaces for report data
export interface SalesOverview {
    summary: {
        totalRevenue: number;
        revenueGrowth: number;
        totalQuotations: number;
        conversionRate: number;
        averageOrderValue: number;
        topPerformingProduct: string;
    };
    trends: {
        revenue: Array<{
            date: string;
            amount: number;
            quotations: number;
        }>;
        quotationsByStatus: Array<{
            status: string;
            count: number;
            value: number;
        }>;
        topProducts: Array<{
            name: string;
            revenue: number;
            units: number;
        }>;
    };
    chartData: {
        revenueTimeSeries: Array<{
            date: string;
            amount: number;
            quotations: number;
        }>;
        quotationDistribution: Array<{
            status: string;
            count: number;
            value: number;
        }>;
        performanceComparison: Array<{
            name: string;
            revenue: number;
            units: number;
        }>;
        cumulativeGrowth: Array<{
            date: string;
            amount: number;
            quotations: number;
        }>;
        correlationData: Array<{
            x: number;
            y: number;
            quotationId: string;
        }>;
    };
}

export interface QuotationAnalytics {
    summary: {
        totalQuotations: number;
        blankQuotations: number;
        conversionRate: number;
        averageValue: number;
        averageTimeToConvert: number;
        pipelineValue: number;
    };
    statusBreakdown: Array<{
        status: string;
        count: number;
        value: number;
        percentage: number;
    }>;
    priceListPerformance: Array<{
        priceList: string;
        quotations: number;
        conversions: number;
        conversionRate: number;
        revenue: number;
    }>;
    chartData: {
        statusDistribution: Array<{
            name: string;
            value: number;
        }>;
        monthlyTrends: Array<{
            month: string;
            count: number;
        }>;
    };
}

export interface RevenueAnalytics {
    summary: {
        totalRevenue: number;
        revenueGrowth: number;
        monthlyRevenue: number;
        topProduct: string;
        averageOrderValue: number;
        revenuePerCustomer: number;
        grossMargin: number;
        profitMargin: number;
    };
    timeSeries: Array<{
        date: string;
        revenue: number;
        transactions: number;
        averageValue: number;
    }>;
    productBreakdown: Array<{
        product: string;
        revenue: number;
        percentage: number;
        growth: number;
    }>;
    chartData: {
        monthlyRevenue: Array<{
            month: string;
            revenue: number;
        }>;
    };
    forecast: {
        nextMonth: number;
        nextQuarter: number;
        confidence: number;
    };
}

export interface SalesPerformance {
    summary: {
        topPerformer: string;
        topPerformerRevenue: number;
        teamPerformance: number;
        targetAchievement: number;
    };
    teamSummary: {
        totalSalesReps: number;
        averagePerformance: number;
        topPerformer: string;
        teamQuotaAttainment: number;
    };
    individualPerformance: Array<{
        name: string;
        revenue: number;
        quotations: number;
        conversions: number;
        conversionRate: number;
        quotaAttainment: number;
    }>;
    chartData: {
        teamPerformance: Array<{
            name: string;
            revenue: number;
        }>;
        targetVsAchievement: Array<{
            month: string;
            target: number;
            achievement: number;
        }>;
    };
    metrics: {
        averageDealSize: number;
        salesVelocity: number;
        winRate: number;
        pipelineValue: number;
    };
}

export interface CustomerAnalytics {
    summary: {
        totalCustomers: number;
        newCustomers: number;
        retentionRate: number;
        averageLifetimeValue: number;
        averagePurchaseFrequency: number;
    };
    topCustomers: Array<{
        name: string;
        revenue: number;
        orders: number;
        lastOrder: Date;
        firstOrder: Date;
    }>;
    segments: Array<{
        name: string;
        segment: string;
        customers: number;
        revenue: number;
        percentage: number;
        value: number;
    }>;
    chartData: {
        acquisitionTrend: Array<{
            month: string;
            newCustomers: number;
        }>;
    };
}

export interface BlankQuotationAnalytics {
    summary: {
        totalBlankQuotations: number;
        completionRate: number;
        averageCompletionTime: number;
        conversionRate: number;
        averageResponseTime: number;
        totalRevenue: number;
        averageQuotationValue: number;
        mostEffectivePriceList: string;
    };
    priceListComparison: Array<{
        priceList: string;
        quotations: number;
        conversions: number;
        conversionRate: number;
        averageValue: number;
        totalRevenue: number;
        totalValue: number;
    }>;
    conversionFunnel: {
        created: number;
        viewed: number;
        responded: number;
        converted: number;
        abandoned: number;
    };
    trends: Array<{
        date: string;
        quotations: number;
        conversions: number;
        revenue: number;
    }>;
    chartData: {
        creationTrend: Array<{
            month: string;
            count: number;
        }>;
        statusDistribution: Array<{
            name: string;
            value: number;
        }>;
    };
}

// Reports API client
const reportsApi = {
    // Fetch sales overview
    fetchSalesOverview: async (): Promise<SalesOverview> => {
        const response = await axiosInstance.get('/reports/sales/overview');
        return response.data;
    },

    // Fetch quotation analytics
    fetchQuotationAnalytics: async (): Promise<QuotationAnalytics> => {
        const response = await axiosInstance.get('/reports/sales/quotations');
        return response.data;
    },

    // Fetch revenue analytics
    fetchRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
        const response = await axiosInstance.get('/reports/sales/revenue');
        return response.data;
    },

    // Fetch sales performance
    fetchSalesPerformance: async (): Promise<SalesPerformance> => {
        const response = await axiosInstance.get('/reports/sales/performance');
        return response.data;
    },

    // Fetch customer analytics
    fetchCustomerAnalytics: async (): Promise<CustomerAnalytics> => {
        const response = await axiosInstance.get('/reports/sales/customers');
        return response.data;
    },

    // Fetch blank quotation analytics
    fetchBlankQuotationAnalytics: async (): Promise<BlankQuotationAnalytics> => {
        const response = await axiosInstance.get('/reports/sales/blank-quotations');
        return response.data;
    },
};

// Hook for fetching sales overview
export function useSalesOverviewQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['salesOverview', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return reportsApi.fetchSalesOverview();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching quotation analytics
export function useQuotationAnalyticsQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['quotationAnalytics', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return reportsApi.fetchQuotationAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching revenue analytics
export function useRevenueAnalyticsQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['revenueAnalytics', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return reportsApi.fetchRevenueAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching sales performance
export function useSalesPerformanceQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['salesPerformance', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return reportsApi.fetchSalesPerformance();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching customer analytics
export function useCustomerAnalyticsQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['customerAnalytics', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return reportsApi.fetchCustomerAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching blank quotation analytics
export function useBlankQuotationAnalyticsQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['blankQuotationAnalytics', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return reportsApi.fetchBlankQuotationAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Combined hook for all reports data
export function useReportsQuery(branchId?: number) {
    const salesOverview = useSalesOverviewQuery(branchId);
    const quotationAnalytics = useQuotationAnalyticsQuery(branchId);
    const revenueAnalytics = useRevenueAnalyticsQuery(branchId);
    const salesPerformance = useSalesPerformanceQuery(branchId);
    const customerAnalytics = useCustomerAnalyticsQuery(branchId);
    const blankQuotationAnalytics = useBlankQuotationAnalyticsQuery(branchId);

    return {
        salesOverview: {
            data: salesOverview.data,
            isLoading: salesOverview.isLoading,
            error: salesOverview.error,
            refetch: salesOverview.refetch,
        },
        quotationAnalytics: {
            data: quotationAnalytics.data,
            isLoading: quotationAnalytics.isLoading,
            error: quotationAnalytics.error,
            refetch: quotationAnalytics.refetch,
        },
        revenueAnalytics: {
            data: revenueAnalytics.data,
            isLoading: revenueAnalytics.isLoading,
            error: revenueAnalytics.error,
            refetch: revenueAnalytics.refetch,
        },
        salesPerformance: {
            data: salesPerformance.data,
            isLoading: salesPerformance.isLoading,
            error: salesPerformance.error,
            refetch: salesPerformance.refetch,
        },
        customerAnalytics: {
            data: customerAnalytics.data,
            isLoading: customerAnalytics.isLoading,
            error: customerAnalytics.error,
            refetch: customerAnalytics.refetch,
        },
        blankQuotationAnalytics: {
            data: blankQuotationAnalytics.data,
            isLoading: blankQuotationAnalytics.isLoading,
            error: blankQuotationAnalytics.error,
            refetch: blankQuotationAnalytics.refetch,
        },
        isLoading: salesOverview.isLoading || quotationAnalytics.isLoading || revenueAnalytics.isLoading ||
                   salesPerformance.isLoading || customerAnalytics.isLoading || blankQuotationAnalytics.isLoading,
        refetchAll: () => {
            salesOverview.refetch();
            quotationAnalytics.refetch();
            revenueAnalytics.refetch();
            salesPerformance.refetch();
            customerAnalytics.refetch();
            blankQuotationAnalytics.refetch();
        },
    };
}
