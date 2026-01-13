'use client';

import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from '@/lib/services/auth-service';

/**
 * Safely gets the access token from cookies (client-side only)
 */
export function getAccessTokenFromCookie(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];

        return token || null;
    } catch (error) {
        console.error('Failed to read access token from cookie');
        return null;
    }
}

/**
 * Safely decodes JWT token and extracts role (client-side only)
 */
export function getRoleFromToken(token: string | null): string | null {
    if (!token || typeof window === 'undefined') {
        return null;
    }

    try {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        return decodedToken.role || null;
    } catch (error) {
        console.error('Failed to extract role from token');
        return null;
    }
}

/**
 * Gets user role from token cookie (client-side only)
 * Falls back to profileData if token is not available
 */
export function getUserRole(
    token: string | null,
    profileAccessLevel: string | null | undefined,
): string | null {
    // Try to get role from token first
    const tokenRole = getRoleFromToken(token);
    if (tokenRole) {
        return tokenRole;
    }

    // Fallback to profile data
    return profileAccessLevel || null;
}

