import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';
import { useAuthStore } from '@/store/auth-store';

// GPS Data Interfaces
export interface TripSummary {
    totalDistanceKm: number;
    totalTimeMinutes: number;
    movingTimeMinutes: number;
    stoppedTimeMinutes: number;
    numberOfStops: number;
    averageSpeedKmh: number;
    maxSpeedKmh: number;
}

export interface GPSStop {
    address: string;
    latitude: number;
    longitude: number;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    durationFormatted: string;
    pointsCount: number;
}

export interface LocationAnalysis {
    locationsVisited: Array<{
        address: string;
        latitude: number;
        longitude: number;
        timeSpentMinutes: number;
        timeSpentFormatted: string;
    }>;
    timeSpentByLocation: { [address: string]: number };
    averageTimePerLocation: string;
    averageTimePerLocationFormatted: string;
    averageTimePerLocationMinutes: number;
}

export interface GeocodingStatus {
    successful: number;
    failed: number;
    usedFallback: boolean;
}

export interface GPSData {
    tripSummary: TripSummary;
    stops: GPSStop[];
    locationAnalysis: LocationAnalysis;
    timeSpentByLocation: { [address: string]: number };
    averageTimePerLocationFormatted: string;
    geocodingStatus: GeocodingStatus;
}

export interface DailyReport {
    uid: number;
    name: string;
    description?: string;
    reportType: string;
    generatedAt: string;
    gpsData?: GPSData;
    totalDistanceKm?: string;
    totalStops?: number;
    notes?: string;
    reportData?: any; // Keep as any for now since it's complex
}

export interface AttendanceRecord {
    uid: number;
    status: string;
    checkIn: string;
    checkOut?: string;
    duration?: string;
    overtime?: string;
    checkInLatitude?: number;
    checkInLongitude?: number;
    checkOutLatitude?: number;
    checkOutLongitude?: number;
    checkInNotes?: string;
    checkOutNotes?: string;
    breakStartTime?: string;
    breakEndTime?: string;
    totalBreakTime?: string;
    breakCount?: number;
    breakDetails?: BreakDetail[];
    breakLatitude?: number;
    breakLongitude?: number;
    breakNotes?: string;
    createdAt: string;
    updatedAt: string;
    verifiedAt?: string;
    dailyReport?: DailyReport;
    placesOfInterest?: {
        startAddress?: string | { street?: string; suburb?: string; city?: string; state?: string; postalCode?: string };
        endAddress?: string | { street?: string; suburb?: string; city?: string; state?: string; postalCode?: string };
    };
    owner: {
        uid: number;
        username: string;
        name: string;
        surname: string;
        email: string;
        phone?: string;
        photoURL?: string;
        avatar?: string;
        role: string;
        status: string;
        accessLevel: string;
        createdAt: string;
        updatedAt: string;
    };
    branch?: {
        uid: number;
        name: string;
        ref: string;
        address: string;
    };
    organisation?: {
        uid: number;
        name: string;
        ref: string;
    };
}

interface BreakDetail {
    breakStart: string;
    breakEnd?: string;
    duration?: number;
    notes?: string;
}

interface AttendanceRecordsResponse {
    message: string;
    records: AttendanceRecord[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const useAttendanceRecords = (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}) => {
    const { accessToken, profileData } = useAuthStore();

    return useQuery<AttendanceRecordsResponse>({
        queryKey: ['attendanceRecords', profileData?.uid, params],
        queryFn: async () => {
            // Use user-specific endpoint like mobile - this gets records for the current user only
            const url = `/att/user/${profileData?.uid}`;
            
            const response = await axiosInstance.get(url);
            
            // Transform the response to match expected format
            const transformedData = {
                message: response.data?.message || 'Success',
                records: response.data?.checkIns || [],
                pagination: response.data?.pagination || null
            };
            
            return transformedData;
        },
        enabled: !!accessToken && !!profileData?.uid,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
        retry: 2,
    });
};

export const useAttendanceRecordsByDate = (date: string) => {
    const { accessToken, profileData } = useAuthStore();

    return useQuery<AttendanceRecordsResponse>({
        queryKey: ['attendanceRecordsByDate', profileData?.uid, date],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/date/${date}`);
            return response.data;
        },
        enabled: !!accessToken && !!profileData?.uid && !!date,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

export const useAttendanceRecordsByUser = (userRef: number) => {
    const { accessToken } = useAuthStore();

    return useQuery<AttendanceRecordsResponse>({
        queryKey: ['attendanceRecordsByUser', userRef],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/user/${userRef}`);
            
            // Transform the response to match expected format
            const transformedData = {
                message: response.data?.message || 'Success',
                records: response.data?.checkIns || [],
                pagination: response.data?.pagination || null
            };
            
            return transformedData;
        },
        enabled: !!accessToken && !!userRef,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
};

// Hook that exactly mimics mobile getUserAttendance functionality
export const useUserAttendance = (userUid?: number) => {
    const { accessToken, profileData } = useAuthStore();
    const targetUserId = userUid || profileData?.uid;

    return useQuery({
        queryKey: ['getUserAttendance', targetUserId],
        queryFn: async () => {
            const response = await axiosInstance.get(`/att/user/${targetUserId}`);
            return response.data;
        },
        enabled: !!accessToken && !!targetUserId,
        staleTime: 60000, // 1 minute like mobile
        retry: 2,
    });
};

// Hook for organization-wide attendance records (for admins/managers)
export const useOrganizationAttendanceRecords = (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}) => {
    const { accessToken, profileData } = useAuthStore();

    return useQuery<AttendanceRecordsResponse>({
        queryKey: ['organizationAttendanceRecords', profileData?.organisationRef, params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.startDate) queryParams.append('startDate', params.startDate);
            if (params?.endDate) queryParams.append('endDate', params.endDate);

            const queryString = queryParams.toString();
            const url = `/att${queryString ? `?${queryString}` : ''}`;
            
            const response = await axiosInstance.get(url);
            
            // Transform the response to match expected format
            const transformedData = {
                message: response.data?.message || 'Success',
                records: response.data?.checkIns || [],
                pagination: response.data?.pagination || null
            };
            
            return transformedData;
        },
        enabled: !!accessToken && !!profileData?.organisationRef,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
        retry: 2,
    });
};
