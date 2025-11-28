import { useQuery } from '@tanstack/react-query';
import {
    WorkerType,
    EventType,
    ClientType,
    CompetitorType,
    QuotationType,
} from '@/lib/data';
import { mapApi, MapConfigType } from '@/lib/services/map-api';

const MAP_DATA_QUERY_KEY = 'mapData';

/**
 * Interface for map query params
 */
export interface MapQueryParams {
    orgId?: string;
    branchId?: string;
    userId?: string;
    enabled?: boolean;
}

/**
 * Interface for map data - Enhanced with comprehensive marker types
 */
export interface MapData {
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
}

/**
 * Hook for fetching map data using React Query
 *
 * @param params - Query parameters
 * @returns Map data with loading and error states
 */
export function useMapQuery(params: MapQueryParams = {}) {
    const { orgId, branchId, userId, enabled = true } = params;

    const { data, isLoading, isError, error, refetch, isRefetching } = useQuery(
        {
            queryKey: [MAP_DATA_QUERY_KEY, { orgId, branchId, userId }],
            queryFn: () => mapApi.getMapData({ orgId, branchId, userId }),
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 2,
            retryDelay: (attemptIndex) =>
                Math.min(1000 * 2 ** attemptIndex, 30000),
            enabled,
        },
    );

    // Extract data or provide empty defaults
    const workers = data?.data?.workers || [];
    const events = data?.data?.events || [];
    const mapConfig = data?.data?.mapConfig;
    const competitors = data?.data?.competitors || [];
    const clients = data?.data?.clients || [];
    const quotations = data?.data?.quotations || [];

    // Extract new comprehensive data arrays
    const leads = data?.data?.leads || [];
    const journals = data?.data?.journals || [];
    const tasks = data?.data?.tasks || [];
    const checkIns = data?.data?.checkIns || [];
    const shiftStarts = data?.data?.shiftStarts || [];
    const shiftEnds = data?.data?.shiftEnds || [];
    const breakStarts = data?.data?.breakStarts || [];
    const breakEnds = data?.data?.breakEnds || [];
    const allMarkers = data?.data?.allMarkers || [];

    return {
        workers,
        events,
        mapConfig,
        competitors,
        clients,
        quotations,
        // New comprehensive data arrays
        leads,
        journals,
        tasks,
        checkIns,
        shiftStarts,
        shiftEnds,
        breakStarts,
        breakEnds,
        allMarkers,
        isLoading,
        isRefetching,
        isError,
        error,
        refetch,
    };
}
