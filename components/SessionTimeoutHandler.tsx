'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';

// Timeout duration in milliseconds (1 hour)
const TIMEOUT_DURATION = 60 * 60 * 1000;
// const TIMEOUT_DURATION = 15 * 1000; // 15 seconds for testing

// List of events that reset the timer
const activityEvents: (keyof WindowEventMap)[] = [
    'mousemove',
    'mousedown',
    'keypress',
    'scroll',
    'touchstart',
];

export const SessionTimeoutHandler: React.FunctionComponent = () => {
    const signOut = useAuthStore((state) => state.signOut);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = useCallback(() => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        // Set a new timer
        timeoutId.current = setTimeout(() => {
            // Only sign out if still authenticated when timer expires
            // Prevents issues if user manually signs out during the timeout period
            if (useAuthStore.getState().isAuthenticated) {
                console.log(
                    'Session timed out due to inactivity. Signing out.',
                );
                signOut();
            }
        }, TIMEOUT_DURATION);
    }, [signOut]);

    const handleActivity = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    useEffect(() => {
        // Only run the timer logic if the user is authenticated
        if (isAuthenticated) {
            // Attach event listeners
            activityEvents.forEach((event) => {
                window.addEventListener(event, handleActivity);
            });

            // Start the initial timer
            resetTimer();

            // Cleanup function
            return () => {
                // Clear the timer
                if (timeoutId.current) {
                    clearTimeout(timeoutId.current);
                }
                // Remove event listeners
                activityEvents.forEach((event) => {
                    window.removeEventListener(event, handleActivity);
                });
            };
        } else {
            // If not authenticated, ensure any existing timer is cleared
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        }
    }, [isAuthenticated, handleActivity, resetTimer]);

    // This component does not render anything
    return null;
};
