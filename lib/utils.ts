import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const authRoutes = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/onboarding',
  '/new-password',
  '/landing-page'
]

export const isAuthRoute = (pathname: string) => {
  return authRoutes.some(route => pathname.startsWith(route))
}
