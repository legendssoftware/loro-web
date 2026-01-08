import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/services/api-client';

export interface IoTDevice {
    id: number;
    deviceID: string;
    deviceTag: string;
    devicLocation: string;
    deviceType: string;
    currentStatus: string;
    branchID: number;
}

interface IoTDevicesResponse {
    data: IoTDevice[];
    total: number;
    page: number;
    limit: number;
}

const IOT_DEVICES_QUERY_KEY = 'iot-devices';

export function useIoTDevicesQuery() {
    const { data, isLoading, error, refetch } = useQuery<IoTDevicesResponse>({
        queryKey: [IOT_DEVICES_QUERY_KEY],
        queryFn: async () => {
            const response = await axiosInstance.get('/iot/devices', {
                params: {
                    limit: 500,
                    deviceType: 'door_sensor',
                },
            });
            return response.data;
        },
        staleTime: 1000 * 60 * 2,
        retry: 2,
    });

    return {
        devices: data?.data || [],
        isLoading,
        error,
        refetch,
    };
}
