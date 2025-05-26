import { create } from 'zustand';

// Report modes for switching between user and organization views
export type ReportMode = 'user' | 'organization';

interface AppState {
    isDrawerOpen: boolean;
    isNotificationsOpen: boolean;
    currentLang: string;
    currentDateTime: string;
    reportMode: ReportMode;
    setDrawerOpen: (open: boolean) => void;
    setNotificationsOpen: (open: boolean) => void;
    setCurrentLang: (lang: string) => void;
    setCurrentDateTime: (dateTime: string) => void;
    setReportMode: (mode: ReportMode) => void;
}

export const useAppStore = create<AppState>(set => ({
    isDrawerOpen: false,
    isNotificationsOpen: false,
    currentLang: 'EN',
    currentDateTime: '',
    reportMode: 'organization', // Default to organization reports
    setDrawerOpen: open => set({ isDrawerOpen: open }),
    setNotificationsOpen: open => set({ isNotificationsOpen: open }),
    setCurrentLang: lang => set({ currentLang: lang }),
    setCurrentDateTime: dateTime => set({ currentDateTime: dateTime }),
    setReportMode: mode => set({ reportMode: mode }),
}));
