import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';

export interface AttendanceMetrics {
    firstAttendance: {
        date: string | null;
        checkInTime: string | null;
        daysAgo: number | null;
    };
    lastAttendance: {
        date: string | null;
        checkInTime: string | null;
        checkOutTime: string | null;
        daysAgo: number | null;
    };
    totalHours: {
        allTime: number;
        thisMonth: number;
        thisWeek: number;
        today: number;
    };
    totalShifts: {
        allTime: number;
        thisMonth: number;
        thisWeek: number;
        today: number;
    };
    averageHoursPerDay: number;
    attendanceStreak: number;
    breakAnalytics: {
        totalBreakTime: {
            allTime: number; // in minutes
            thisMonth: number;
            thisWeek: number;
            today: number;
        };
        averageBreakDuration: number; // in minutes per shift
        breakFrequency: number; // average breaks per shift
        longestBreak: number; // in minutes
        shortestBreak: number; // in minutes
    };
    timingPatterns: {
        averageCheckInTime: string;
        averageCheckOutTime: string;
        punctualityScore: number; // percentage of on-time arrivals
        overtimeFrequency: number; // percentage of shifts with overtime
    };
    overtimeAnalytics: {
        totalOvertimeHours: {
            allTime: number; // in hours
            thisMonth: number;
            thisWeek: number;
            today: number;
        };
        averageOvertimePerShift: number; // in hours
        overtimeFrequency: number; // percentage of shifts with overtime
        longestOvertimeShift: number; // in hours
    };
    productivityInsights: {
        workEfficiencyScore: number; // percentage based on work vs break time
        shiftCompletionRate: number; // percentage of completed shifts
        lateArrivalsCount: number;
        earlyDeparturesCount: number;
    };
}

interface AttendanceMetricsResponse {
    message: string;
    metrics: AttendanceMetrics;
}

/**
 * Hook for fetching user attendance metrics from the web dashboard
 * Mirrors the mobile useAttendanceMetrics hook functionality
 */
export const useAttendanceMetrics = (userId?: number) => {
    const { profileData, accessToken } = useAuthStore();
    const targetUserId = userId || profileData?.uid;

    const fetchAttendanceMetrics = async (): Promise<AttendanceMetrics | null> => {
        if (!targetUserId || !accessToken) {
            throw new Error('User ID or access token not available.');
        }

        const response = await axiosInstance.get<AttendanceMetricsResponse>(
            `/att/metrics/${targetUserId}`
        );

        if (response.data && response.data.metrics) {
            return response.data.metrics;
        }

        return null;
    };

    const { data, isLoading, error, refetch, isError } = useQuery<AttendanceMetrics | null, Error>({
        queryKey: ['attendanceMetrics', targetUserId],
        queryFn: fetchAttendanceMetrics,
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
