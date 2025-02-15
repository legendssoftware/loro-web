import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API functions
const authAPI = {
    signUp: async (data: { email: string }) => {
        const response = await api.post('/auth/sign-up', data);
        return response.data;
    },
    verifyEmail: async (data: { token: string }) => {
        const response = await api.post('/auth/verify-email', data);
        return response.data;
    },
    setPassword: async (data: { token: string; password: string }) => {
        const response = await api.post('/auth/set-password', data);
        return response.data;
    },
    forgotPassword: async (data: { email: string }) => {
        const response = await api.post('/auth/forgot-password', data);
        return response.data;
    },
    resetPassword: async (data: { token: string; password: string }) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
};

// Response types
interface AuthResponse {
    message: string;
    status?: string;
    email?: string;
}

// Custom hooks for mutations
export const useSignUpMutation = () => {
    return useMutation<AuthResponse, Error, { email: string }>({
        mutationFn: authAPI.signUp,
    });
};

export const useVerifyEmailMutation = () => {
    return useMutation<AuthResponse, Error, { token: string }>({
        mutationFn: authAPI.verifyEmail,
    });
};

export const useSetPasswordMutation = () => {
    return useMutation<AuthResponse, Error, { token: string; password: string }>({
        mutationFn: authAPI.setPassword,
    });
};

export const useForgotPasswordMutation = () => {
    return useMutation<AuthResponse, Error, { email: string }>({
        mutationFn: authAPI.forgotPassword,
    });
};

export const useResetPasswordMutation = () => {
    return useMutation<AuthResponse, Error, { token: string; password: string }>({
        mutationFn: authAPI.resetPassword,
    });
}; 