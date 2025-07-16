import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'react-hot-toast';
import { showErrorToast } from '@/lib/utils/toast-config';

// Define interfaces for HR report data
export interface HRAttendanceData {
    summary: {
        totalEmployees: number;
        presentToday: number;
        attendanceRate: number;
        averageHoursWorked: number;
        lateArrivals: number;
        earlyDepartures: number;
        punctualityRate: number;
        totalWorkingMinutes: number;
        organizationEfficiency: number;
    };
    trends: {
        dailyAttendance: Array<{ date: string; present: number; absent: number; rate: number }>;
        monthlyAttendance: Array<{ month: string; rate: number }>;
        punctualityTrends: Array<{ date: string; onTime: number; late: number; rate: number }>;
    };
    chartData: {
        attendanceOverTime: Array<{ period: string; rate: number }>;
        punctualityDistribution: Array<{ name: string; value: number }>;
        departmentBreakdown: Array<{ department: string; rate: number; total: number }>;
    };
}

export interface HREmployeePerformanceData {
    summary: {
        totalEmployees: number;
        averagePerformanceScore: number;
        topPerformers: Array<{ name: string; score: number }>;
        improvementNeeded: Array<{ name: string; score: number }>;
        targetAchievementRate: number;
    };
    metrics: {
        productivityScores: Array<{ employee: string; score: number }>;
        goalAchievements: Array<{ goal: string; achieved: number; target: number }>;
        skillAssessments: Array<{ skill: string; level: number; employees: number }>;
    };
    chartData: {
        performanceDistribution: Array<{ range: string; count: number }>;
        skillsMatrix: Array<{ skill: string; average: number; trend: number }>;
        performanceTrends: Array<{ period: string; score: number }>;
    };
}

export interface HRPayrollData {
    summary: {
        totalPayrollCost: number;
        averageSalary: number;
        totalBenefitsCost: number;
        payrollGrowth: number;
        costPerEmployee: number;
    };
    breakdown: {
        salaryDistribution: Array<{ range: string; count: number }>;
        benefitsUtilization: Array<{ benefit: string; cost: number; utilization: number }>;
        departmentCosts: Array<{ department: string; cost: number; employees: number }>;
    };
    chartData: {
        payrollTrends: Array<{ period: string; cost: number }>;
        salaryBands: Array<{ band: string; employees: number; avgSalary: number }>;
        benefitsCosts: Array<{ benefit: string; cost: number }>;
    };
}

export interface HRRecruitmentData {
    summary: {
        totalApplications: number;
        activePositions: number;
        averageTimeToHire: number;
        offerAcceptanceRate: number;
        recruitmentCost: number;
    };
    pipeline: {
        candidatesByStage: Array<{ stage: string; count: number }>;
        interviewScheduled: number;
        offersSent: number;
        positionsToFill: number;
    };
    chartData: {
        hiringTrends: Array<{ period: string; hired: number; applications: number }>;
        sourcingChannels: Array<{ channel: string; applications: number; hired: number }>;
        candidatePipeline: Array<{ stage: string; count: number; conversionRate: number }>;
    };
}

// HR Reports API client
const hrReportsApi = {
    // Fetch attendance analytics
    fetchAttendanceAnalytics: async (): Promise<HRAttendanceData> => {
        const response = await axiosInstance.get('/reports/hr/attendance');
        return response.data;
    },

    // Fetch employee performance analytics
    fetchEmployeePerformanceAnalytics: async (): Promise<HREmployeePerformanceData> => {
        const response = await axiosInstance.get('/reports/hr/employee-performance');
        return response.data;
    },

    // Fetch payroll analytics
    fetchPayrollAnalytics: async (): Promise<HRPayrollData> => {
        const response = await axiosInstance.get('/reports/hr/payroll');
        return response.data;
    },

    // Fetch recruitment analytics
    fetchRecruitmentAnalytics: async (): Promise<HRRecruitmentData> => {
        const response = await axiosInstance.get('/reports/hr/recruitment');
        return response.data;
    },
};

// Hook for fetching attendance analytics
export function useHRAttendanceQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['hrAttendance', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return hrReportsApi.fetchAttendanceAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching employee performance analytics
export function useHREmployeePerformanceQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['hrEmployeePerformance', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return hrReportsApi.fetchEmployeePerformanceAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching payroll analytics
export function useHRPayrollQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['hrPayroll', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return hrReportsApi.fetchPayrollAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Hook for fetching recruitment analytics
export function useHRRecruitmentQuery(branchId?: number) {
    const { profileData } = useAuthStore();
    const organisationId = profileData?.organisationRef;

    return useQuery({
        queryKey: ['hrRecruitment', organisationId, branchId],
        queryFn: () => {
            if (!organisationId) throw new Error('Organization ID not found');
            return hrReportsApi.fetchRecruitmentAnalytics();
        },
        enabled: !!organisationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

// Combined hook for all HR reports data
export function useHRReportsQuery(branchId?: number) {
    const attendanceAnalytics = useHRAttendanceQuery(branchId);
    const employeePerformanceAnalytics = useHREmployeePerformanceQuery(branchId);
    const payrollAnalytics = useHRPayrollQuery(branchId);
    const recruitmentAnalytics = useHRRecruitmentQuery(branchId);

    return {
        attendanceAnalytics: {
            data: attendanceAnalytics.data,
            isLoading: attendanceAnalytics.isLoading,
            error: attendanceAnalytics.error,
            refetch: attendanceAnalytics.refetch,
        },
        employeePerformanceAnalytics: {
            data: employeePerformanceAnalytics.data,
            isLoading: employeePerformanceAnalytics.isLoading,
            error: employeePerformanceAnalytics.error,
            refetch: employeePerformanceAnalytics.refetch,
        },
        payrollAnalytics: {
            data: payrollAnalytics.data,
            isLoading: payrollAnalytics.isLoading,
            error: payrollAnalytics.error,
            refetch: payrollAnalytics.refetch,
        },
        recruitmentAnalytics: {
            data: recruitmentAnalytics.data,
            isLoading: recruitmentAnalytics.isLoading,
            error: recruitmentAnalytics.error,
            refetch: recruitmentAnalytics.refetch,
        },
        isLoading: attendanceAnalytics.isLoading || employeePerformanceAnalytics.isLoading ||
                   payrollAnalytics.isLoading || recruitmentAnalytics.isLoading,
        refetchAll: () => {
            attendanceAnalytics.refetch();
            employeePerformanceAnalytics.refetch();
            payrollAnalytics.refetch();
            recruitmentAnalytics.refetch();
        },
    };
}
