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
        // New comprehensive data arrays
        leads?: any[];
        journals?: any[];
        tasks?: any[];
        checkIns?: any[];
        shiftStarts?: any[];
        shiftEnds?: any[];
        breakStarts?: any[];
        breakEnds?: any[];
        allMarkers?: any[];
        
        // Enhanced GPS Analysis Data
        gpsAnalysis?: {
            totalWorkersAnalyzed: number;
            totalDistanceCovered: number;
            totalStopsDetected: number;
            averageStopsPerWorker: number;
            averageSpeedKmh: number;
            maxSpeedRecorded: number;
            workersData: Array<{
                workerId: number;
                workerName: string;
                tripSummary?: {
                    totalDistanceKm: number;
                    totalTimeMinutes: number;
                    averageSpeedKmh: number;
                    movingTimeMinutes: number;
                    stoppedTimeMinutes: number;
                    numberOfStops: number;
                    maxSpeedKmh: number;
                };
                stopsCount: number;
                topStops: Array<{
                    latitude: number;
                    longitude: number;
                    address: string;
                    startTime: string;
                    endTime: string;
                    durationMinutes: number;
                    durationFormatted: string;
                    pointsCount: number;
                }>;
            }>;
        };
        
        routeOptimizations?: {
            totalWorkersOptimized: number;
            totalPotentialSaving: number;
            averagePotentialSaving: number;
            workersWithOptimizations: Array<{
                workerId: number;
                workerName: string;
                optimization: {
                    originalDistance: number;
                    optimizedDistance: number;
                    potentialSaving: number;
                    optimizedWaypointOrder: number[];
                    stops: number;
                    recommendation: string;
                };
            }>;
        };
        
        // Enhanced analytics data
        analytics?: {
            totalMarkers: number;
            markerBreakdown: {
                workers: any[];
                clients: any[];
                competitors: any[];
                quotations: any[];
                leads: any[];
                journals: any[];
                tasks: any[];
                checkIns: any[];
                shiftStarts: any[];
                shiftEnds: any[];
                breakStarts: any[];
                breakEnds: any[];
            };
            gpsInsights: any;
            routeInsights: any;
        };
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
            const endpoint = `/reports/map${queryString ? `?${queryString}` : ''}`;

            const { data } = await axiosInstance.get<MapDataResponse>(endpoint);
            return data;
        } catch (error) {
            console.error('Error fetching map data:', error);
            throw error;
        }
    }

    /**
     * Get enhanced map data with GPS analysis and route optimization
     * @param options Extended parameters including GPS analysis options
     * @returns Promise with enhanced map data including GPS insights and route optimizations
     */
    public async getEnhancedMapData(options?: {
        orgId?: string;
        branchId?: string;
        userId?: string;
        includeGpsAnalysis?: boolean;
        includeRouteOptimization?: boolean;
        gpsAnalysisDate?: string; // YYYY-MM-DD format
    }): Promise<MapDataResponse> {
        try {
            const params = new URLSearchParams();
            if (options?.orgId) params.append('orgId', options.orgId);
            if (options?.branchId) params.append('branchId', options.branchId);
            if (options?.userId) params.append('userId', options.userId);
            if (options?.includeGpsAnalysis) params.append('includeGpsAnalysis', 'true');
            if (options?.includeRouteOptimization) params.append('includeRouteOptimization', 'true');
            if (options?.gpsAnalysisDate) params.append('gpsAnalysisDate', options.gpsAnalysisDate);

            const queryString = params.toString();
            const endpoint = `/reports/map${queryString ? `?${queryString}` : ''}`;

            const { data } = await axiosInstance.get<MapDataResponse>(endpoint);
            return data;
        } catch (error) {
            console.error('Error fetching enhanced map data:', error);
            throw error;
        }
    }

    /**
     * Get GPS analytics summary for the organization
     * @param options Parameters for GPS analytics
     * @returns Promise with GPS analytics data
     */
    public async getGpsAnalytics(options: {
        orgId: string;
        branchId?: string;
        date?: string; // YYYY-MM-DD format
    }): Promise<{
        gpsAnalysis?: MapDataResponse['data']['gpsAnalysis'];
        routeOptimizations?: MapDataResponse['data']['routeOptimizations'];
    }> {
        try {
            const enhancedData = await this.getEnhancedMapData({
                ...options,
                includeGpsAnalysis: true,
                includeRouteOptimization: true,
                gpsAnalysisDate: options.date,
            });

            return {
                gpsAnalysis: enhancedData.data.gpsAnalysis,
                routeOptimizations: enhancedData.data.routeOptimizations,
            };
        } catch (error) {
            console.error('Error fetching GPS analytics:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const mapApi = MapApi.getInstance();
