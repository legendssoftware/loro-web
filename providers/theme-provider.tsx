"use client"

import * as React from "react"
import { useThemeStore } from "@/store/theme-store"
import { type ThemeProviderProps } from "next-themes"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    const { theme } = useThemeStore()

    return (
        <NextThemesProvider
            {...props}
            defaultTheme={theme}
            enableSystem={theme === 'system'}>
            {children}
        </NextThemesProvider>
    )
}