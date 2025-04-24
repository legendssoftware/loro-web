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
    '/feedback',
    '/feedback/thank-you',
    '/review-quotation',
    '/review-quotation/thank-you',
];

// Define path patterns that should be protected
// Simplified to check if NOT a public path and NOT an asset/API path
// const protectedPathPatterns = [ ... ]; // Removed for simplicity below

/**
 * Checks if a path requires authentication (i.e., not public and not static/API)
 */
function isProtectedPath(path: string): boolean {
    // Check if it's a static asset or API route first
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.includes('.') // Basic check for files like images, css
    ) {
        return false;
    }
    // Check if it's one of the defined public paths
    if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
        return false;
    }
    // Otherwise, it's considered protected
    return true;
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
            console.warn('Middleware: Access token expired');
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next(); // Start with a pass-through response

    // Check if the path requires authentication
    if (isProtectedPath(pathname)) {
        const accessToken = request.cookies.get('accessToken')?.value;

        if (!accessToken || !validateToken(accessToken)) {
            console.log(`Middleware: No valid token for protected path: ${pathname}. Redirecting to sign-in.`);

            // Prepare redirect URL
            const signInUrl = new URL('/sign-in', request.url);
            signInUrl.searchParams.set('callbackUrl', request.url); // Use the full requested URL

            // Create a redirect response
            const redirectResponse = NextResponse.redirect(signInUrl);

            // Clear the invalid/missing accessToken cookie
            redirectResponse.cookies.set('accessToken', '', {
                path: '/',
                expires: new Date(0), // Expire immediately
                sameSite: 'strict',
            });
            // Attempt to clear other potentially related cookies (best effort)
            redirectResponse.cookies.set('refreshToken', '', { path: '/', expires: new Date(0), sameSite: 'strict' });
            redirectResponse.cookies.set('auth', '', { path: '/', expires: new Date(0), sameSite: 'strict' });
            redirectResponse.cookies.set('session', '', { path: '/', expires: new Date(0), sameSite: 'strict' });

            return redirectResponse; // Execute the redirect and cookie clearing
        }

        // If token is valid, proceed with the original request
        return response;
    }

    // For public paths or static assets/API routes, just proceed
    return response;
}

export const config = {
    // Match all request paths except for those starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder assets inferred by presence of '.'
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'], // Adjusted matcher slightly
};
