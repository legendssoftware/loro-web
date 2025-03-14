import { useCallback } from 'react';
import {
    User,
    UserFilterParams,
    PaginatedUsersResponse,
} from '@/lib/types/user';
import { axiosInstance } from '@/lib/services/api-client';

/**
 * A hook that provides user API methods
 * Relies on axios interceptors for token handling
 */
export const useUserApi = () => {
    // Get users with pagination and filtering
    const getUsers = useCallback(
        async (
            filters: UserFilterParams = {},
        ): Promise<PaginatedUsersResponse> => {
            try {
                const queryParams = new URLSearchParams();

                // Map frontend filter parameters to backend expectations
                if (filters.status)
                    queryParams.append('status', filters.status);
                if (filters.accessLevel)
                    queryParams.append('accessLevel', filters.accessLevel);
                if (filters.search)
                    queryParams.append('search', filters.search);
                if (filters.branchId)
                    queryParams.append('branchId', String(filters.branchId));
                if (filters.organisationId)
                    queryParams.append(
                        'organisationId',
                        String(filters.organisationId),
                    );

                // The backend expects these specific parameter names based on the controller
                if (filters.page)
                    queryParams.append('page', String(filters.page));
                if (filters.limit)
                    queryParams.append('limit', String(filters.limit));

                const response = await axiosInstance.get(
                    `/user?${queryParams.toString()}`,
                );

                // Process response based on server format
                if (response.data) {
                    return {
                        items: response.data.data || [],
                        total: response.data.meta?.total || 0,
                        page: response.data.meta?.page || 1,
                        limit: response.data.meta?.limit || 10,
                        totalPages: response.data.meta?.totalPages || 1,
                    };
                } else {
                    return {
                        items: [],
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0,
                    };
                }
            } catch (error) {
                throw error;
            }
        },
        [],
    );

    // Get a single user by ID
    const getUser = useCallback(async (userId: number): Promise<User> => {
        try {
            // The controller endpoint is /user/:ref
            const response = await axiosInstance.get(`/user/${userId}`);

            // From user.controller.ts, the response should contain { message, data }
            if (response.data && response.data.data) {
                return response.data.data;
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            throw error;
        }
    }, []);

    // Update a user
    const updateUser = useCallback(
        async (userId: number, updates: Partial<User>): Promise<void> => {
            try {
                // The controller endpoint is /user/:ref for PATCH
                const response = await axiosInstance.patch(
                    `/user/${userId}`,
                    updates,
                );

                if (!response.data) {
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                throw error;
            }
        },
        [],
    );

    // Delete a user
    const deleteUser = useCallback(async (userId: number): Promise<void> => {
        try {
            // The controller endpoint is /user/:ref for DELETE
            const response = await axiosInstance.delete(`/user/${userId}`);

            if (!response.data) {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            throw error;
        }
    }, []);

    // Add a user
    const createUser = useCallback(
        async (userData: Partial<User>): Promise<void> => {
            try {
                // The controller endpoint is /user for POST
                const response = await axiosInstance.post('/user', userData);

                if (!response.data) {
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                throw error;
            }
        },
        [],
    );

    return {
        getUsers,
        getUser,
        updateUser,
        deleteUser,
        createUser,
    };
};
