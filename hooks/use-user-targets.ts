import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';

interface TargetDetails {
    name: string;
    target: number;
    current: number;
    remaining: number;
    progress: number;
    currency?: string;
    unit?: string;
}

export interface UserTarget {
    uid?: number;
    // Enhanced format - personal targets (from server aggregation)
    hasPersonalTargets?: boolean;
    personalTargets?: {
        uid: number;
        sales?: TargetDetails;
        quotations?: TargetDetails;
        hours?: TargetDetails;
        newClients?: TargetDetails;
        newLeads?: TargetDetails;
        checkIns?: TargetDetails;
        calls?: TargetDetails;
        targetPeriod?: string;
        periodStartDate?: Date | string;
        periodEndDate?: Date | string;
        workingDaysRemaining?: number; // Number of working days remaining (positive) or overdue (negative)
        salesRateAnalysis?: {
            actualSalesRate: number;
            requiredSalesRate: number;
            dailyRateNeeded: number;
            totalWorkingDays: number;
            workingDaysElapsed: number;
            remainingSalesAmount: number;
            achievabilityStatus: 'on-track' | 'achievable' | 'challenging' | 'at-risk' | 'missed' | 'achieved';
            performanceGap: number;
            projectedFinalAmount?: number | null;
            isOverdue: boolean;
        };
        targetCurrency?: string;
        createdAt?: Date | string;
        updatedAt?: Date | string;
        // Cost breakdown fields
        baseSalary?: number;
        carInstalment?: number;
        carInsurance?: number;
        fuel?: number;
        cellPhoneAllowance?: number;
        carMaintenance?: number;
        cgicCosts?: number;
        // History tracking
        history?: {
            date: string; // YYYY-MM format
            targetSalesAmount?: number;
            achievedSalesAmount?: number;
            targetQuotationsAmount?: number;
            achievedQuotationsAmount?: number;
            targetOrdersAmount?: number;
            achievedOrdersAmount?: number;
            targetNewClients?: number;
            achievedNewClients?: number;
            targetNewLeads?: number;
            achievedNewLeads?: number;
            targetCheckIns?: number;
            achievedCheckIns?: number;
            targetCalls?: number;
            achievedCalls?: number;
            targetHoursWorked?: number;
            achievedHoursWorked?: number;
            missingAmount?: number;
            completionPercentage?: number;
            status: 'achieved' | 'partial' | 'missed';
            lastUpdated: string;
        }[];
        currentOrdersAmount?: number;
    };
    // Managed branches and staff
    managedBranches?: any[];
    managedStaff?: any[];
    // Legacy format for backward compatibility
    id?: number;
    targetSalesAmount?: number;
    currentSalesAmount?: number;
    targetQuotationsAmount?: number;
    currentQuotationsAmount?: number;
    currentOrdersAmount?: number;
    targetCurrency?: string;
    targetHoursWorked?: number;
    currentHoursWorked?: number;
    targetNewClients?: number;
    currentNewClients?: number;
    targetNewLeads?: number;
    currentNewLeads?: number;
    targetCheckIns?: number;
    currentCheckIns?: number;
    targetCalls?: number;
    currentCalls?: number;
    targetPeriod?: string;
    periodStartDate?: string;
    periodEndDate?: string;
    workingDaysRemaining?: number; // Number of working days remaining based on organization schedule
    createdAt?: string;
    updatedAt?: string;
}

interface UserTargetResponse {
    message: string;
    userTarget: UserTarget;
}

/**
 * Hook for fetching user targets data from the web dashboard
 * Mirrors the mobile useUserTargets hook functionality
 */
export const useUserTargets = (userId?: number) => {
    const { profileData, accessToken } = useAuthStore();
    const targetUserId = userId || profileData?.uid;

    const fetchUserTargets = async (): Promise<UserTarget | null> => {
        if (!targetUserId || !accessToken) {
            throw new Error('User ID or access token not available.');
        }

        const response = await axiosInstance.get<UserTargetResponse>(
            `/user/${targetUserId}/target`
        );

        if (response.data && response.data.userTarget) {
            return response.data.userTarget;
        }

        return null;
    };

    const { data, isLoading, error, refetch, isError } = useQuery<UserTarget | null, Error>({
        queryKey: ['userTarget', targetUserId],
        queryFn: fetchUserTargets,
        enabled: !!targetUserId && !!accessToken,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        refetchOnWindowFocus: true,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    return {
        data,
        isLoading,
        error: error?.message || null,
        isError,
        refetch,
    };
};
