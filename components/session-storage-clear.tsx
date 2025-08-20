'use client';

import { useEffect } from 'react';
import { checkForClearSessionStorageHeader } from '@/lib/utils/session-storage-manager';

export function SessionStorageClearHandler() {
    useEffect(() => {
        // Check if middleware set the header to clear session storage
        checkForClearSessionStorageHeader();

        // Also listen for custom events from middleware
        const handleClearSessionStorage = () => {
            checkForClearSessionStorageHeader();
        };

        window.addEventListener('clear-session-storage', handleClearSessionStorage);

        return () => {
            window.removeEventListener('clear-session-storage', handleClearSessionStorage);
        };
    }, []);

    return null; // This component doesn't render anything
}
