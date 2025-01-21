import { create } from 'zustand'

interface AppState {
    isDrawerOpen: boolean
    isNotificationsOpen: boolean
    isChatOpen: boolean
    currentLang: string
    currentDateTime: string
    setDrawerOpen: (open: boolean) => void
    setNotificationsOpen: (open: boolean) => void
    setChatOpen: (open: boolean) => void
    setCurrentLang: (lang: string) => void
    setCurrentDateTime: (dateTime: string) => void
}

export const useAppStore = create<AppState>((set) => ({
    isDrawerOpen: false,
    isNotificationsOpen: false,
    isChatOpen: false,
    currentLang: 'EN',
    currentDateTime: '',
    setDrawerOpen: (open) => set({ isDrawerOpen: open }),
    setNotificationsOpen: (open) => set({ isNotificationsOpen: open }),
    setChatOpen: (open) => set({ isChatOpen: open }),
    setCurrentLang: (lang) => set({ currentLang: lang }),
    setCurrentDateTime: (dateTime) => set({ currentDateTime: dateTime }),
})) 