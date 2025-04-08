import { useState, useEffect, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { toast } from 'react-hot-toast';
import {
    showSuccessToast,
    showErrorToast,
    toastConfig,
} from '@/lib/utils/toast-config';
import { useAuthStore } from '@/store/auth-store';

interface UseHelpOptions {
    onCallStart?: () => void;
    onCallEnd?: () => void;
}

export function useHelp(options: UseHelpOptions = {}) {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [isCallInitializing, setIsCallInitializing] = useState(false);

    // Get authentication state
    const { isAuthenticated, accessToken } = useAuthStore();

    // Memoize callback functions to prevent recreation on every render
    const handleCallStart = useCallback(() => {
        setIsCallActive(true);
        setIsCallInitializing(false);
        options.onCallStart?.();
        showSuccessToast('Voice assistant activated', toast);
    }, [options.onCallStart]);

    const handleCallEnd = useCallback(() => {
        setIsCallActive(false);
        options.onCallEnd?.();
        showSuccessToast('Voice assistant call ended', toast);
    }, [options.onCallEnd]);

    const handleVolumeLevel = useCallback((volume: number) => {
        setVolumeLevel(volume);
    }, []);

    const handleError = useCallback((error: any) => {
        setIsCallInitializing(false);
        setIsCallActive(false);
        showErrorToast('Voice assistant error', toast);
        console.error('Vapi error:', error);
    }, []);

    // Initialize Vapi instance
    useEffect(() => {
        // Only initialize if user is authenticated
        if (!isAuthenticated || !accessToken) {
            return;
        }

        const apiKey = process.env.NEXT_PUBLIC_VAPI_KEY;

        if (!apiKey) {
            console.error('Vapi API key is not defined in environment variables');
            return;
        }

        // Create Vapi instance only once
        const vapiInstance = new Vapi(apiKey);

        // Set up event listeners
        vapiInstance.on('call-start', handleCallStart);
        vapiInstance.on('call-end', handleCallEnd);
        vapiInstance.on('volume-level', handleVolumeLevel);
        vapiInstance.on('error', handleError);

        setVapi(vapiInstance);

        return () => {
            // Clean up event listeners and end call if active
            if (vapiInstance) {
                // Remove event listeners
                vapiInstance.off('call-start', handleCallStart);
                vapiInstance.off('call-end', handleCallEnd);
                vapiInstance.off('volume-level', handleVolumeLevel);
                vapiInstance.off('error', handleError);

                try {
                    vapiInstance.stop();
                } catch (e) {
                    console.error('Error stopping Vapi call:', e);
                }
            }
        };
    }, [
        isAuthenticated,
        accessToken,
        handleCallStart,
        handleCallEnd,
        handleVolumeLevel,
        handleError
    ]);

    const startCall = async () => {
        if (!isAuthenticated) {
            showErrorToast('Please sign in to use the voice assistant', toast);
            return;
        }

        if (!vapi) {
            showErrorToast('Voice assistant not available', toast);
            return;
        }

        if (isCallActive) {
            toast('Voice assistant is already active', {
                ...toastConfig,
                icon: 'ℹ️',
            });
            return;
        }

        try {
            setIsCallInitializing(true);

            // Get assistant ID from environment variables
            const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

            if (!assistantId) {
                throw new Error('Assistant ID not found in environment variables');
            }

            // Start the call with the assistant ID
            await vapi.start(assistantId);
        } catch (error) {
            console.error('Failed to start Vapi call:', error);
            setIsCallInitializing(false);

            showErrorToast('Failed to start voice assistant', toast);
        }
    };

    const endCall = () => {
        if (!vapi || !isCallActive) return;

        try {
            vapi.stop();
        } catch (error) {
            console.error('Failed to stop Vapi call:', error);
        }
    };

    const toggleMute = () => {
        if (!vapi || !isCallActive) return;

        try {
            const newMuteState = !isMuted;
            vapi.setMuted(newMuteState);
            setIsMuted(newMuteState);
        } catch (error) {
            console.error('Failed to toggle mute:', error);
        }
    };

    return {
        startCall,
        endCall,
        toggleMute,
        isCallActive,
        isCallInitializing,
        isMuted,
        volumeLevel,
    };
}
