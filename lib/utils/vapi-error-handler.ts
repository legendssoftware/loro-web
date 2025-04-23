import { toast } from 'react-hot-toast';
import { showErrorToast, toastConfig } from './toast-config';

// Define error types based on possible Vapi errors
export enum VapiErrorType {
    INITIALIZATION = 'initialization',
    CONNECTION = 'connection',
    AUTHENTICATION = 'authentication',
    PERMISSION = 'permission',
    CONFIGURATION = 'configuration',
    SERVER = 'server',
    TIMEOUT = 'timeout',
    NETWORK = 'network',
    UNKNOWN = 'unknown',
}

interface VapiErrorDetails {
    type: VapiErrorType;
    userMessage: string;
    logMessage: string;
    recoverable: boolean;
    retryable: boolean;
}

// Error mapping for specific error patterns
const errorPatterns: Record<string, VapiErrorDetails> = {
    'Permission denied|not allowed': {
        type: VapiErrorType.PERMISSION,
        userMessage: 'Microphone access denied. Please enable microphone permissions.',
        logMessage: 'Vapi error: Microphone permission denied',
        recoverable: true,
        retryable: true,
    },
    'network|connection|offline': {
        type: VapiErrorType.NETWORK,
        userMessage: 'Network connection issue. Please check your internet connection.',
        logMessage: 'Vapi error: Network connection issue',
        recoverable: true,
        retryable: true,
    },
    'timeout|timed out': {
        type: VapiErrorType.TIMEOUT,
        userMessage: 'Connection timed out. Please try again.',
        logMessage: 'Vapi error: Connection timeout',
        recoverable: true,
        retryable: true,
    },
    'assistant|not found': {
        type: VapiErrorType.CONFIGURATION,
        userMessage: 'Assistant configuration error. Support has been notified.',
        logMessage: 'Vapi error: Assistant ID not found or invalid',
        recoverable: false,
        retryable: false,
    },
    'API key|apiKey|invalid key': {
        type: VapiErrorType.AUTHENTICATION,
        userMessage: 'Authentication error. Support has been notified.',
        logMessage: 'Vapi error: API key invalid or missing',
        recoverable: false,
        retryable: false,
    },
    'initialization|not initialized': {
        type: VapiErrorType.INITIALIZATION,
        userMessage: 'Voice assistant not ready. Please try again later.',
        logMessage: 'Vapi error: Initialization failed',
        recoverable: true,
        retryable: true,
    },
    '5xx|server error': {
        type: VapiErrorType.SERVER,
        userMessage: 'Voice service temporarily unavailable. Please try again later.',
        logMessage: 'Vapi error: Server error occurred',
        recoverable: true,
        retryable: true,
    },
};

// Default error details for unknown errors
const defaultErrorDetails: VapiErrorDetails = {
    type: VapiErrorType.UNKNOWN,
    userMessage: 'An unexpected error occurred with the voice assistant.',
    logMessage: 'Vapi unknown error',
    recoverable: false,
    retryable: false,
};

/**
 * Find matching error pattern for a given error
 */
export const getErrorDetails = (error: any): VapiErrorDetails => {
    // Extract error message string
    const errorMessage =
        typeof error === 'string'
            ? error
            : error?.message || error?.toString() || 'Unknown error';

    // Find matching error pattern
    for (const [pattern, details] of Object.entries(errorPatterns)) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(errorMessage)) {
            return {
                ...details,
                logMessage: `${details.logMessage}: ${errorMessage}`,
            };
        }
    }

    // Return default error details for unknown errors
    return {
        ...defaultErrorDetails,
        logMessage: `${defaultErrorDetails.logMessage}: ${errorMessage}`,
    };
};

/**
 * Handle Vapi errors with appropriate user feedback and logging
 */
export const handleVapiError = (error: any, toast: any, options?: {
    silent?: boolean;
    onError?: (errorDetails: VapiErrorDetails) => void;
}): VapiErrorDetails => {
    const errorDetails = getErrorDetails(error);

    // Log the error for debugging
    console.error(errorDetails.logMessage, error);

    // Show user-friendly toast notification if not silent
    if (!options?.silent) {
        showErrorToast(errorDetails.userMessage, toast);
    }

    // Execute additional error handler if provided
    if (options?.onError) {
        options.onError(errorDetails);
    }

    return errorDetails;
};

/**
 * Handle retry logic for retryable Vapi errors
 */
export const retryVapiOperation = async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 2,
    toastInstance: any = toast,
    options?: {
        onRetry?: (attempt: number, error: any) => void;
        retryDelay?: number;
    }
): Promise<T> => {
    let attempts = 0;
    const retryDelay = options?.retryDelay || 1000;

    while (attempts < maxRetries + 1) {
        try {
            return await operation();
        } catch (error) {
            attempts++;
            const errorDetails = getErrorDetails(error);

            // If error is not retryable or we've reached max retries, throw it
            if (!errorDetails.retryable || attempts > maxRetries) {
                handleVapiError(error, toastInstance);
                throw error;
            }

            // Show retry notification
            if (toastInstance) {
                toast(`Retrying voice connection (${attempts}/${maxRetries})...`, {
                    ...toastConfig,
                    icon: '🔄',
                });
            }

            // Execute retry callback if provided
            if (options?.onRetry) {
                options.onRetry(attempts, error);
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }

    // This should never be reached due to the throw above, but TypeScript requires it
    throw new Error('Maximum retry attempts reached');
};
