import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from './lib/services/auth-service';

// Define public paths that don't require authentication
const publicPaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/new-password',
    '/verify-email',
    '/verify-otp',
    '/landing-page',
];

// Define path patterns that should be protected
const protectedPathPatterns = [
    '/',
    '/clients',
    '/leads',
    '/inventory',
    '/quotations',
    '/claims',
    '/tasks',
    '/staff',
    '/resellers',
    '/settings',
    '/map',
];

/**
 * Checks if a path matches any of the protected path patterns
 */
function isProtectedPath(path: string): boolean {
    return protectedPathPatterns.some(pattern => {
        // Exact match
        if (pattern === path) return true;

        // Match path with any subpaths
        if (path.startsWith(`${pattern}/`)) return true;

        return false;
    });
}

/**
 * Validates a JWT token
 */
function validateToken(token: string): boolean {
    try {
        if (!token) return false;

        const decodedToken = jwtDecode<CustomJwtPayload>(token);

        // Check expiration
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (!decodedToken.exp || decodedToken.exp <= currentTimestamp) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static assets and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // Static files like images, css, etc.
    ) {
        return NextResponse.next();
    }

    // Allow access to public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check if the requested path should be protected
    if (isProtectedPath(pathname)) {
        // Get the access token from cookies
        const accessToken = request.cookies.get('accessToken')?.value;

        // Add a grace period by setting a flag in the headers
        // This allows the client to attempt token refresh before redirecting
        if (!accessToken || !validateToken(accessToken)) {
            // Instead of immediate redirect, set a header flag
            // The client-side RouteGuard will handle the redirect if needed
            const response = NextResponse.next();
            response.headers.set('X-Auth-Required', 'true');

            // Only redirect if there's no token at all (brand new session)
            if (!accessToken) {
                const signInUrl = new URL('/sign-in', request.url);
                // Add the original URL as a parameter to redirect back after sign-in
                signInUrl.searchParams.set('callbackUrl', encodeURI(request.url));
                return NextResponse.redirect(signInUrl);
            }

            return response;
        }

        // If there is a valid token, let the request proceed
        return NextResponse.next();
    }

    // For all other paths, just proceed
    return NextResponse.next();
}

export const config = {
    // Match all request paths except for those starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'],
};
