import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';

export interface DailyReportPDF {
    uid: number;
    name: string;
    description?: string;
    reportType: 'MORNING' | 'EVENING' | 'MAIN' | 'USER_DAILY' | 'user_daily' | string;
    generatedAt: string;
    reportData: {
        pdfUrl?: string;
        [key: string]: any;
    };
    filters?: Record<string, any>;
    notes?: string;
    gpsData?: {
        tripSummary?: {
            totalDistanceKm: number;
            totalTimeMinutes: number;
            averageSpeedKmh: number;
            movingTimeMinutes: number;
            stoppedTimeMinutes: number;
            numberOfStops: number;
            maxSpeedKmh: number;
        };
        stops?: Array<{
            latitude: number;
            longitude: number;
            address: string;
            startTime: string;
            endTime: string;
            durationMinutes: number;
            durationFormatted: string;
            pointsCount: number;
        }>;
        timeSpentByLocation?: Record<string, number>;
        averageTimePerLocationFormatted?: string;
        locationAnalysis?: {
            locationsVisited: number;
            averageTimePerLocation: number;
            averageTimePerLocationMinutes: number;
        };
    };
    organisation?: {
        uid: number;
        name: string;
        ref: string;
    };
    branch?: {
        uid: number;
        name: string;
        ref: string;
    };
    owner?: {
        uid: number;
        name: string;
        surname: string;
        email: string;
    };
}

interface DailyReportsResponse {
    message: string;
    reports: DailyReportPDF[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Hook to fetch organization daily reports (for HR/Admin)
export const useOrganizationDailyReports = (params?: {
    reportType?: 'MORNING' | 'EVENING' | 'MAIN';
    branchId?: number;
    page?: number;
    limit?: number;
}) => {
    const { accessToken, profileData } = useAuthStore();
    const organisationRef = profileData?.organisationRef;

    return useQuery<DailyReportsResponse>({
        queryKey: ['organizationDailyReports', organisationRef, params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();

            if (params?.reportType) queryParams.append('reportType', params.reportType);
            if (params?.branchId) queryParams.append('branchId', params.branchId.toString());
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const response = await axiosInstance.get(
                `/reports/organization/${organisationRef}/daily-reports?${queryParams.toString()}`
            );
            return response.data;
        },
        enabled: !!accessToken && !!organisationRef,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

// Hook to fetch user's personal daily reports
export const useUserDailyReports = (params?: {
    reportType?: 'MORNING' | 'EVENING' | 'MAIN';
    page?: number;
    limit?: number;
}) => {
    const { accessToken, profileData } = useAuthStore();
    const userId = profileData?.uid;

    return useQuery<DailyReportsResponse>({
        queryKey: ['userDailyReports', userId, params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();

            if (params?.reportType) queryParams.append('reportType', params.reportType);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const response = await axiosInstance.get(
                `/reports/user/${userId}/daily-reports?${queryParams.toString()}`
            );
            return response.data;
        },
        enabled: !!accessToken && !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

