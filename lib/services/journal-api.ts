import { axiosInstance } from './api-client';
import {
    CreateJournalDto,
    Journal,
    JournalFilterParams,
    JournalResponse,
    SingleJournalResponse,
    UpdateJournalDto,
} from '../types/journal';

// Get all journals with optional filtering
export const getJournals = async (
    params?: JournalFilterParams,
): Promise<JournalResponse> => {
    try {
        const response = await axiosInstance.get('/journal', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching journals:', error);
        return {
            data: [],
            message: 'Failed to fetch journals',
            meta: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            },
        };
    }
};

// Get a single journal by ID
export const getJournalById = async (
    id: number,
): Promise<SingleJournalResponse> => {
    try {
        const response = await axiosInstance.get(`/journal/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching journal details:', error);
        return {
            data: null,
            message: 'Failed to fetch journal details',
            meta: {
                total: 0,
            },
        };
    }
};

// Create a new journal
export const createJournal = async (
    data: CreateJournalDto,
): Promise<SingleJournalResponse> => {
    try {
        const response = await axiosInstance.post('/journal', data);
        return response.data;
    } catch (error) {
        console.error('Error creating journal:', error);
        return {
            data: null,
            message: 'Failed to create journal',
            meta: {
                total: 0,
            },
        };
    }
};

// Update an existing journal
export const updateJournal = async (
    id: number,
    data: UpdateJournalDto,
): Promise<SingleJournalResponse> => {
    try {
        const response = await axiosInstance.patch(`/journal/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating journal:', error);
        return {
            data: null,
            message: 'Failed to update journal',
            meta: {
                total: 0,
            },
        };
    }
};

// Delete a journal
export const deleteJournal = async (id: number): Promise<boolean> => {
    try {
        await axiosInstance.delete(`/journal/${id}`);
        return true;
    } catch (error) {
        console.error('Error deleting journal:', error);
        return false;
    }
};

// Get journals for a specific user
export const getJournalsForUser = async (
    userId: number,
    params?: JournalFilterParams,
): Promise<JournalResponse> => {
    try {
        const response = await axiosInstance.get(`/journal/for/${userId}`, {
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user journals:', error);
        return {
            data: [],
            message: 'Failed to fetch user journals',
            meta: {
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            },
        };
    }
};
