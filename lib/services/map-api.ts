import { axiosInstance } from './api-client';
import { WorkerType, EventType } from '@/lib/data';

interface MapConfigType {
  defaultCenter: { lat: number; lng: number };
  orgRegions: Array<{
    name: string;
    center: { lat: number; lng: number };
    zoom: number;
  }>;
}

interface ServerMapData {
  workers: WorkerType[];
  events: EventType[];
  mapConfig?: MapConfigType;
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
   * @returns Promise with map data (workers, events, and map configuration)
   */
  public async getMapData(): Promise<ServerMapData> {
    try {
      const { data } = await axiosInstance.get<ServerMapData>('/reports/map-data');
      return data;
    } catch (error) {
      console.error('Error fetching map data:', error);
      // Return empty data in case of error
      return {
        workers: [],
        events: [],
        mapConfig: {
          defaultCenter: {
            lat: process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT
              ? parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT)
              : -26.2041,
            lng: process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG
              ? parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG)
              : 28.0473,
          },
          orgRegions: []
        }
      };
    }
  }
}

// Export a singleton instance
export const mapApi = MapApi.getInstance();
