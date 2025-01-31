import axios from 'axios';
import { RequestConfig } from '@/lib/types/tasks';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Notification {
    uid: number;
    title: string;
    type: string;
    message: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    recordAge: string;
    updateAge: string;
    owner?: {
        uid: number;
        name: string;
    };
}

export const fetchUserNotifications = async (userId: number, config: RequestConfig) => {
    try {
        const response = await axios.get<{ message: string, notification: Notification[] }>(
            `${API_URL}/notifications/personal/${userId}`,
            {
                headers: {
                    'Authorization': `Bearer ${config?.headers?.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        return { message: error, notification: [] };
    }
}; 