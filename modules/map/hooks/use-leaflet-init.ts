import { useEffect } from 'react';
import L from 'leaflet';

export const useLeafletInit = () => {
    useEffect(() => {
        // Fix Leaflet icon issues
        delete (L.Icon.Default.prototype as any)._getIconUrl;

        L.Icon.Default.mergeOptions({
            iconRetinaUrl:
                'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl:
                'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);
}; 