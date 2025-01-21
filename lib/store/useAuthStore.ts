import { create } from 'zustand'

type AuthStore = {
    username: string
    password: string
    isLoading: boolean
    setUsername: (username: string) => void
    setPassword: (password: string) => void
    setIsLoading: (isLoading: boolean) => void
    reset: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
    username: '',
    password: '',
    isLoading: false,
    setUsername: (username) => set({ username }),
    setPassword: (password) => set({ password }),
    setIsLoading: (isLoading) => set({ isLoading }),
    reset: () => set({ username: '', password: '', isLoading: false })
})) 