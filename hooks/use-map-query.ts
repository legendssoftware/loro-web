import { useQuery } from '@tanstack/react-query';
import { WorkerType, EventType, ClientType, CompetitorType, QuotationType } from '@/lib/data';
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
 * Interface for map data
 */
export interface MapData {
    workers: WorkerType[];
    events: EventType[];
    mapConfig?: MapConfigType;
    competitors?: CompetitorType[];
    clients?: ClientType[];
    quotations?: QuotationType[];
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
    const workers = data?.workers || [];
    const events = data?.events || [];
    const mapConfig = data?.mapConfig;
    const competitors = data?.competitors || [];
    const clients = data?.clients || [];
    const quotations = data?.quotations || [];

    return {
        workers,
        events,
        mapConfig,
        competitors,
        clients,
        quotations,
        isLoading,
        isRefetching,
        isError,
        error,
        refetch,
    };
}
