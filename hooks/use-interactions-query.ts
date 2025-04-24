import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast-config';
import { axiosInstance } from '@/lib/services/api-client';

// Export enums for interaction types
export enum InteractionType {
    MESSAGE = 'message',
    DOCUMENT = 'document',
    TASK = 'task',
    NOTE = 'note',
    APPOINTMENT = 'appointment',
    REMINDER = 'reminder',
    GENERAL = 'general',
    SALES = 'sales',
    SUPPORT = 'support',
    FOLLOWUP = 'followup',
    FEEDBACK = 'feedback',
    ONBOARDING = 'onboarding',
    EMAIL = 'email',
    CALL = 'call',
    MEETING = 'meeting',
}

// Define the query key for interactions
export const INTERACTIONS_QUERY_KEY = 'interactions';

// Define interface for Interaction
export interface Interaction {
    uid: number;
    message: string;
    attachmentUrl?: string;
    type: InteractionType;
    createdAt: Date;
    createdBy: {
        uid: number;
        name: string;
        surname?: string;
        email?: string;
        photoURL?: string;
    };
    lead?: {
        uid: number;
        name: string;
    };
    client?: {
        uid: number;
        name: string;
    };
}

// Interface for interaction filter parameters
export interface InteractionFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    leadUid?: number;
    clientUid?: number;
}

// Interaction API client methods
const interactionApi = {
    // Get interactions for a specific lead
    getLeadInteractions: async (leadId: number): Promise<Interaction[]> => {
        try {
            const response = await axiosInstance.get(
                `/interactions/lead/${leadId}`,
            );
            return response.data.data;
        } catch (error) {
            console.error('Error fetching lead interactions:', error);
            throw error;
        }
    },

    // Get all interactions with optional filters
    getInteractions: async (
        filters: InteractionFilterParams = {},
    ): Promise<any> => {
        try {
            const {
                page = 1,
                limit = 25,
                search,
                startDate,
                endDate,
                leadUid,
                clientUid,
            } = filters;

            let url = `/interactions?page=${page}&limit=${limit}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;
            if (startDate) url += `&startDate=${startDate.toISOString()}`;
            if (endDate) url += `&endDate=${endDate.toISOString()}`;
            if (leadUid) url += `&leadUid=${leadUid}`;
            if (clientUid) url += `&clientUid=${clientUid}`;

            const response = await axiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching interactions:', error);
            throw error;
        }
    },

    // Create a new interaction
    createInteraction: async (data: {
        message: string;
        attachmentUrl?: string;
        type?: InteractionType;
        leadUid?: number;
        clientUid?: number;
    }): Promise<any> => {
        try {
            const response = await axiosInstance.post('/interactions', data);
            return response.data;
        } catch (error) {
            console.error('Error creating interaction:', error);
            throw error;
        }
    },

    // Upload file and return the URL
    uploadFile: async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Set file type based on MIME type
            const fileType = file.type.split('/')[0]; // Gets 'image' from 'image/png'
            formData.append('type', fileType);

            const response = await axiosInstance.post(
                '/docs/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            if (response.data.publicUrl) {
                return response.data.publicUrl;
            }
            throw new Error('File upload failed');
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },
};

// Hook for interaction-related data and operations
export function useInteractionsQuery(filters: InteractionFilterParams = {}) {
    const queryClient = useQueryClient();
    const [uploadProgress, setUploadProgress] = useState<{
        [key: string]: number;
    }>({});

    // Query for fetching all interactions
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [INTERACTIONS_QUERY_KEY, filters],
        queryFn: () => interactionApi.getInteractions(filters),
        staleTime: 60000, // 1 minute
    });

    // Query for fetching lead-specific interactions
    const useLeadInteractions = (leadId?: number) => {
        return useQuery({
            queryKey: [INTERACTIONS_QUERY_KEY, 'lead', leadId],
            queryFn: () =>
                leadId
                    ? interactionApi.getLeadInteractions(leadId)
                    : Promise.resolve([]),
            enabled: !!leadId,
            staleTime: 60000, // 1 minute
            refetchInterval: 15000, // 15 seconds
        });
    };

    // Upload file(s) mutation
    const uploadFileMutation = useMutation({
        mutationFn: async (file: File): Promise<string> => {
            try {
                // Reset progress for this file
                setUploadProgress((prev) => ({
                    ...prev,
                    [file.name]: 0,
                }));

                // Create a custom axios instance with upload progress
                const customAxiosInstance = axiosInstance;
                customAxiosInstance.defaults.onUploadProgress = (
                    progressEvent,
                ) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) /
                            (progressEvent.total || 100),
                    );
                    setUploadProgress((prev) => ({
                        ...prev,
                        [file.name]: progress,
                    }));
                };

                const formData = new FormData();
                formData.append('file', file);

                // Set file type based on MIME type
                const fileType = file.type.split('/')[0]; // Gets 'image' from 'image/png'
                formData.append('type', fileType);

                const response = await customAxiosInstance.post(
                    '/docs/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    },
                );

                if (response.data.publicUrl) {
                    return response.data.publicUrl;
                }
                throw new Error('File upload failed');
            } catch (error) {
                console.error('Error uploading file:', error);
                showErrorToast(
                    'Failed to upload file. Please try again.',
                    toast,
                );
                throw error;
            }
        },
    });

    // Create interaction mutation
    const createInteractionMutation = useMutation({
        mutationFn: async ({
            message,
            attachmentUrl,
            type = InteractionType.MESSAGE,
            leadUid,
            clientUid,
        }: {
            message: string;
            attachmentUrl?: string;
            type?: InteractionType;
            leadUid?: number;
            clientUid?: number;
        }) => {
            try {
                const result = await interactionApi.createInteraction({
                    message,
                    attachmentUrl,
                    type,
                    leadUid,
                    clientUid,
                });
                showSuccessToast('Message sent successfully.', toast);
                return result;
            } catch (error) {
                showErrorToast(
                    'Failed to send message. Please try again.',
                    toast,
                );
                console.error('Create interaction error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            // Invalidate interactions query to trigger a refetch
            queryClient.invalidateQueries({
                queryKey: [INTERACTIONS_QUERY_KEY],
            });
        },
    });

    // Upload file and create interaction
    const sendMessageWithAttachment = useCallback(
        async ({
            message,
            file,
            type = InteractionType.MESSAGE,
            leadUid,
            clientUid,
        }: {
            message: string;
            file?: File;
            type?: InteractionType;
            leadUid?: number;
            clientUid?: number;
        }) => {
            try {
                let attachmentUrl: string | undefined;

                // Upload file if provided
                if (file) {
                    attachmentUrl = await uploadFileMutation.mutateAsync(file);
                }

                // Create interaction with file URL if uploaded
                return createInteractionMutation.mutate({
                    message,
                    attachmentUrl,
                    type,
                    leadUid,
                    clientUid,
                });
            } catch (error) {
                console.error('Error sending message with attachment:', error);
                throw error;
            }
        },
        [uploadFileMutation, createInteractionMutation],
    );

    return {
        interactions: data?.data || [],
        meta: data?.meta,
        isLoading,
        error,
        refetch,
        useLeadInteractions,
        createInteraction: createInteractionMutation.mutate,
        sendMessageWithAttachment,
        uploadFile: uploadFileMutation.mutate,
        uploadProgress,
        isUploading:
            uploadFileMutation.isPending || createInteractionMutation.isPending,
    };
}
