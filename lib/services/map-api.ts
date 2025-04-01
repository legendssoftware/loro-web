import { axiosInstance } from './api-client';
import {
    WorkerType,
    EventType,
    ClientType,
    CompetitorType,
    QuotationType,
} from '@/lib/data';

export interface MapConfigType {
    defaultCenter: { lat: number; lng: number };
    orgRegions: Array<{
        name: string;
        center: { lat: number; lng: number };
        zoom: number;
    }>;
}

export interface MapDataResponse {
    data: {
        workers: WorkerType[];
        events: EventType[];
        mapConfig?: MapConfigType;
        competitors?: CompetitorType[];
        clients?: ClientType[];
        quotations?: QuotationType[];
    };
}

/**
 * Service for map-related API requests
 */
export class MapApi {
    private static instance: MapApi;

    constructor() {}

    /**
     * Get singleton instance
     */
    public static getInstance(): MapApi {
        if (!MapApi.instance) {
            MapApi.instance = new MapApi();
        }
        return MapApi.instance;
    }

    /**
     * Get map data for dashboard visualization
     * @param options Optional parameters (org ID, branch ID, user ID)
     * @returns Promise with map data (workers, events, and map configuration)
     */
    public async getMapData(options?: {
        orgId?: string;
        branchId?: string;
        userId?: string;
    }): Promise<MapDataResponse> {
        try {
            const params = new URLSearchParams();
            if (options?.orgId) params.append('orgId', options.orgId);
            if (options?.branchId) params.append('branchId', options.branchId);
            if (options?.userId) params.append('userId', options.userId);

            const queryString = params.toString();
            const endpoint = `/reports/map-data${queryString ? `?${queryString}` : ''}`;

            const { data } = await axiosInstance.get<MapDataResponse>(endpoint);
            return data;
        } catch (error) {
            console.error('Error fetching map data:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const mapApi = MapApi.getInstance();
