import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ForgotPasswordResponse {
    message: string;
    success: boolean;
}

interface ResetPasswordResponse {
    message: string;
    success: boolean;
}

interface SetPasswordResponse {
    message: string;
    success: boolean;
}

/**
 * Hook for the forgot password flow
 */
export function useForgotPasswordMutation() {
    return useMutation({
        mutationFn: async ({
            email,
        }: {
            email: string;
        }): Promise<ForgotPasswordResponse> => {
            try {
                const { data } = await axios.post(
                    `${API_URL}/auth/forgot-password`,
                    { email },
                );
                return data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(
                        error.response?.data?.message ||
                            'Failed to send password reset email',
                    );
                }
                throw new Error('Failed to send password reset email');
            }
        },
    });
}

/**
 * Hook for resetting a password with a token (for non-authenticated users)
 */
export function useResetPasswordMutation() {
    return useMutation({
        mutationFn: async ({
            token,
            password,
        }: {
            token: string;
            password: string;
        }): Promise<ResetPasswordResponse> => {
            try {
                const { data } = await axios.post(
                    `${API_URL}/auth/reset-password`,
                    { token, password },
                );
                return data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(
                        error.response?.data?.message ||
                            'Failed to reset password',
                    );
                }
                throw new Error('Failed to reset password');
            }
        },
    });
}

/**
 * Hook for setting a password with a token (for authenticated but new users)
 */
export function useSetPasswordMutation() {
    return useMutation({
        mutationFn: async ({
            token,
            password,
        }: {
            token: string;
            password: string;
        }): Promise<SetPasswordResponse> => {
            try {
                const { data } = await axios.post(
                    `${API_URL}/auth/set-password`,
                    { token, password },
                );
                return data;
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    throw new Error(
                        error.response?.data?.message ||
                            'Failed to set password',
                    );
                }
                throw new Error('Failed to set password');
            }
        },
    });
}
