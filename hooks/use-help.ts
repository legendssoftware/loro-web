import { useState, useEffect, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { toast } from 'react-hot-toast';
import {
    showSuccessToast,
    showErrorToast,
    toastConfig,
} from '@/lib/utils/toast-config';
import {
    handleVapiError,
    retryVapiOperation,
    VapiErrorType,
    getErrorDetails
} from '@/lib/utils/vapi-error-handler';
import { useAuthStore } from '@/store/auth-store';

// Update the constants for call time management to use environment variables with fallbacks
const CALL_MAX_DURATION_MS = parseInt(process.env.NEXT_PUBLIC_MAX_CALL_DURATION_MINUTES || '5', 10) * 60 * 1000; // Default: 5 minutes
const WARNING_TIME_REMAINING_MS = parseInt(process.env.NEXT_PUBLIC_CALL_WARNING_SECONDS || '60', 10) * 1000; // Default: 60 seconds

interface UseHelpOptions {
    onCallStart?: () => void;
    onCallEnd?: () => void;
    onError?: (error: any) => void;
    maxRetries?: number;
    autoRetry?: boolean;
    maxCallDuration?: number; // Optional override in milliseconds
}

export function useHelp(options: UseHelpOptions = {}) {
    const [vapi, setVapi] = useState<Vapi | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [isCallInitializing, setIsCallInitializing] = useState(false);
    const [lastError, setLastError] = useState<Error | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

    // Track call start time and timer intervals
    const callStartTimeRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const warningShownRef = useRef(false);

    // Get max call duration from options or use default
    const maxCallDuration = options.maxCallDuration || CALL_MAX_DURATION_MS;

    // Use a ref to track if initialization has been attempted already
    const initAttempted = useRef(false);
    const autoRetry = options.autoRetry ?? true;
    const maxRetries = options.maxRetries ?? 2;

    // Get authentication state
    const { isAuthenticated, accessToken } = useAuthStore();

    // Start the call timer
    const startCallTimer = useCallback(() => {
        // Clear any existing timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        // Reset warning state
        warningShownRef.current = false;

        // Set initial time
        callStartTimeRef.current = Date.now();
        setTimeRemaining(maxCallDuration);

        // Start interval to update time remaining
        timerIntervalRef.current = setInterval(() => {
            if (!callStartTimeRef.current) return;

            const elapsed = Date.now() - callStartTimeRef.current;
            const remaining = Math.max(0, maxCallDuration - elapsed);
            setTimeRemaining(remaining);

            // Show warning when 1 minute is left
            if (remaining <= WARNING_TIME_REMAINING_MS && !warningShownRef.current) {
                warningShownRef.current = true;
                toast('1 minute remaining in your consultation call', {
                    ...toastConfig,
                    duration: 4000,
                    icon: '⏱️',
                });
            }

            // End call when time is up
            if (remaining <= 0) {
                toast('Call time limit reached (5 minutes)', {
                    ...toastConfig,
                    icon: '⏰',
                });

                clearInterval(timerIntervalRef.current!);
                timerIntervalRef.current = null;
                endCall();
            }
        }, 1000);
    }, [maxCallDuration]);

    // Stop the call timer
    const stopCallTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        callStartTimeRef.current = null;
        setTimeRemaining(null);
        warningShownRef.current = false;
    }, []);

    // Memoize callback functions to prevent recreation on every render
    const handleCallStart = useCallback(() => {
        setIsCallActive(true);
        setIsCallInitializing(false);
        setLastError(null);
        startCallTimer(); // Start the timer when call begins
        options.onCallStart?.();

        // Show connected notification
        showSuccessToast('Call connected to voice assistant', toast);
    }, [options.onCallStart, startCallTimer]);

    const handleCallEnd = useCallback(() => {
        setIsCallActive(false);
        setLastError(null);
        stopCallTimer(); // Stop the timer when call ends
        options.onCallEnd?.();

        // Show thank you notification
        showSuccessToast('Call ended. Thank you!', toast);
    }, [options.onCallEnd, stopCallTimer]);

    const handleVolumeLevel = useCallback((volume: number) => {
        setVolumeLevel(volume);
    }, []);

    const handleError = useCallback((error: any) => {
        setIsCallInitializing(false);
        setIsCallActive(false);
        stopCallTimer(); // Stop the timer on error

        // Store the error for potential retry operations
        setLastError(error instanceof Error ? error : new Error(String(error)));

        // Use our new error handler
        const errorDetails = handleVapiError(error, toast, {
            onError: (details) => {
                // Call the user-provided error handler if available
                options.onError?.(error);

                // If certain errors occur, show more specific messages based on error type
                if (details.type === VapiErrorType.PERMISSION) {
                    setTimeout(() => {
                        toast.error('Please ensure microphone access is allowed in your browser settings.', {
                            ...toastConfig,
                            duration: 6000,
                        });
                    }, 1000);
                }
            }
        });
    }, [options.onError, stopCallTimer]);

    // Initialize Vapi instance with better error handling
    useEffect(() => {
        // Only initialize if user is authenticated and not already attempted
        if (!isAuthenticated || !accessToken || initAttempted.current) {
            return;
        }

        initAttempted.current = true;

        const initializeVapi = async () => {
            try {
                const apiKey = process.env.NEXT_PUBLIC_VAPI_KEY;

                if (!apiKey) {
                    throw new Error('Vapi API key is not defined in environment variables');
                }

                // Create Vapi instance only once
                const vapiInstance = new Vapi(apiKey);

                // Set up event listeners
                vapiInstance.on('call-start', handleCallStart);
                vapiInstance.on('call-end', handleCallEnd);
                vapiInstance.on('volume-level', handleVolumeLevel);
                vapiInstance.on('error', handleError);

                setVapi(vapiInstance);
                return vapiInstance;
            } catch (error) {
                handleVapiError(error, toast);
                return null;
            }
        };

        // Initialize with potential retries for network issues
        initializeVapi();

        // Cleanup function
        return () => {
            stopCallTimer(); // Ensure timer is cleared on unmount

            if (vapi) {
                try {
                    // Remove event listeners
                    vapi.off('call-start', handleCallStart);
                    vapi.off('call-end', handleCallEnd);
                    vapi.off('volume-level', handleVolumeLevel);
                    vapi.off('error', handleError);

                    // End call if active
                    if (isCallActive) {
                        vapi.stop();
                    }
                } catch (e) {
                    console.error('Error cleaning up Vapi instance:', e);
                }
            }
        };
    }, [
        isAuthenticated,
        accessToken,
        handleCallStart,
        handleCallEnd,
        handleVolumeLevel,
        handleError,
        isCallActive,
        vapi,
        stopCallTimer
    ]);

    // Improved startCall function with retry capabilities
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

        setIsCallInitializing(true);
        setLastError(null);

        // Show call initiation notification
        showSuccessToast('Call initiated. Connecting...', toast);

        try {
            // Define the operation to retry if needed
            const startOperation = async () => {
                // Get assistant ID from environment variables
                const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

                if (!assistantId) {
                    throw new Error('Assistant ID not found in environment variables');
                }

                // Start the call with the assistant ID
                return await vapi.start(assistantId);
            };

            if (autoRetry) {
                // Use the retry utility for automatic retries on certain errors
                await retryVapiOperation(startOperation, maxRetries, toast, {
                    onRetry: (attempt) => {
                        // Update UI during retry attempts
                        setIsCallInitializing(true);
                    }
                });
            } else {
                // Just run the operation once without retry
                await startOperation();
            }
        } catch (error) {
            // If we got here, all retries failed or the error wasn't retryable
            // handleError event will be triggered by Vapi, so we don't need additional handling here
            setIsCallInitializing(false);
        }
    };

    // Enhanced endCall with better error handling
    const endCall = () => {
        if (!vapi) {
            return;
        }

        if (!isCallActive) {
            setIsCallInitializing(false);
            return;
        }

        try {
            vapi.stop();
            setIsCallInitializing(false);
            stopCallTimer(); // Stop the timer when call is manually ended
        } catch (error) {
            // Use our error handler but silent the toast since this is less critical
            handleVapiError(error, toast, { silent: true });
            // Force UI update in case the event doesn't fire
            setIsCallActive(false);
            setIsCallInitializing(false);
            stopCallTimer(); // Ensure timer is stopped even on error
        }
    };

    // Improved toggleMute with error handling
    const toggleMute = () => {
        if (!vapi || !isCallActive) return;

        try {
            const newMuteState = !isMuted;
            vapi.setMuted(newMuteState);
            setIsMuted(newMuteState);
        } catch (error) {
            handleVapiError(error, toast, {
                // Use a silent error for less critical functions
                silent: true
            });
        }
    };

    // New method to retry the last failed call
    const retryLastCall = async () => {
        if (isCallActive || isCallInitializing) {
            return;
        }

        // Reset error state
        setLastError(null);

        // Try to start the call again
        await startCall();
    };

    // Format remaining time as MM:SS
    const formattedTimeRemaining = useCallback(() => {
        if (timeRemaining === null) return null;

        const totalSeconds = Math.ceil(timeRemaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [timeRemaining]);

    return {
        startCall,
        endCall,
        toggleMute,
        retryLastCall,
        isCallActive,
        isCallInitializing,
        isMuted,
        volumeLevel,
        lastError,
        timeRemaining,
        formattedTimeRemaining: formattedTimeRemaining(),
    };
}
