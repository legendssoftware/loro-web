import axios from 'axios';
import { toast } from 'sonner';
import { UploadResponse } from '@/lib/types/settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const FALLBACK_LOGO = '/images/fallback-logo.png';
const FALLBACK_FAVICON = '/images/fallback-favicon.png';

export interface UploadFileOptions {
    onSuccess?: (url: string) => void;
    onError?: (error: Error) => void;
    maxSize?: number; // in bytes
    allowedTypes?: string[];
}

export async function uploadFile(
    file: File,
    type: 'logo' | 'favicon',
    options: UploadFileOptions = {}
): Promise<string> {
    const {
        onSuccess,
        onError,
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    } = options;

    try {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }

        // Validate file size
        if (file.size > maxSize) {
            throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const { data } = await axios.post<UploadResponse>(`${API_URL}/docs/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 seconds timeout
        });

        onSuccess?.(data.url);
        toast.success('File uploaded successfully');
        return data.url;
    } catch (error) {
        const fallbackImage = type === 'logo' ? FALLBACK_LOGO : FALLBACK_FAVICON;

        let errorMessage = 'Failed to upload file';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        onError?.(new Error(errorMessage));
        toast.error(errorMessage);

        // Return fallback image URL
        return fallbackImage;
    }
}

export async function deleteFile(filename: string): Promise<void> {
    try {
        await axios.delete(`${API_URL}/docs/remove/${filename}`);
        toast.success('File deleted successfully');
    } catch (error) {
        let errorMessage = 'Failed to delete file';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        toast.error(errorMessage);
        throw new Error(errorMessage);
    }
}
