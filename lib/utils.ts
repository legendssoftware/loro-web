import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge tailwind classes with clsx
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a date as a string
 */
export function formatDate(date: Date | string | number) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Formats a phone number as (XXX) XXX-XXXX
 */
export function formatPhoneNumber(phoneNumber: string) {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phoneNumber;
}

/**
 * Truncates a string to maxLength and adds ellipsis
 */
export function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
}

/**
 * Generates initials from a name (up to 2 characters)
 */
export function getInitials(name: string) {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Routes where navigation should be hidden
export const noNavRoutes = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/onboarding',
    '/new-password',
    '/verify-email',
    '/verify-otp'
];

// Landing page where navigation should also be hidden
export const landingRoutes = ['/'];

// Routes where navigation should be visible (authenticated areas)
export const navRoutes = [
    '/dashboard',
    '/clients',
    '/tasks',
    '/leads',
    '/quotations',
    '/claims',
    '/staff',
    '/inventory',
    '/journals',
    '/suppliers',
    '/my-reports',
    '/settings',
    '/map',
    '/attendance-reports'
];

// Public informational routes (accessible to all, but may show different nav)
export const publicInfoRoutes = [
    '/feedback',
    '/feedback/thank-you',
    '/review-quotation',
    '/review-quotation/thank-you'
];

// Legacy auth routes array for backward compatibility
export const authRoutes = [...noNavRoutes, ...landingRoutes, ...publicInfoRoutes];

export const isAuthRoute = (pathname: string) => {
    return authRoutes.some((route) => pathname.startsWith(route));
};

export const shouldHideNav = (pathname: string) => {
    // Hide nav on auth routes and landing page
    return noNavRoutes.some(route => pathname.startsWith(route)) ||
           landingRoutes.some(route => pathname.startsWith(route));
};

export const shouldShowNav = (pathname: string) => {
    // Show nav on dashboard and other protected routes
    return navRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
};

export const isLandingPage = (pathname: string) => {
    return pathname === '/';
};

export const isDashboardPage = (pathname: string) => {
    return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
};
