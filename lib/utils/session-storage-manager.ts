import { useSessionStore } from '@/store/use-session-store';

/**
 * Clears session storage when tokens expire
 */
export function clearSessionStorageOnTokenExpiry() {
    if (typeof window !== 'undefined') {
        const store = useSessionStore.getState();
        store.clearSessionStorage();
    }
}

/**
 * Checks if middleware has set the clear session storage header
 */
export function checkForClearSessionStorageHeader() {
    if (typeof document !== 'undefined') {
        // Check for the header via meta tag or data attribute
        const shouldClear = document.head.hasAttribute('data-clear-session-storage') ||
                           !!document.querySelector('meta[name="x-clear-session-storage"]');

        if (shouldClear) {
            clearSessionStorageOnTokenExpiry();
            // Clean up the attribute
            document.head.removeAttribute('data-clear-session-storage');
        }
    }
}
