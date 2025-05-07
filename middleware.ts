import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from './lib/services/auth-service';
import { AccessLevel, rolePermissions } from './types/auth';

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

/**
 * Checks if a user has permission to access a specific route based on their role
 */
function hasRoutePermission(path: string, userRole: string | null): boolean {
    if (!userRole) return false;

    // Super users (admin, manager, owner) have access to all routes
    if (
        userRole === AccessLevel.ADMIN ||
        userRole === AccessLevel.MANAGER ||
        userRole === AccessLevel.OWNER ||
        userRole === AccessLevel.DEVELOPER ||
        userRole === AccessLevel.EXECUTIVE
    ) {
        return true;
    }

    // For other roles, check specific permissions
    const role = userRole as AccessLevel;
    if (rolePermissions[role]) {
        const allowedRoutes = rolePermissions[role].routes;

        // Check for wildcard or exact path match
        if (allowedRoutes.includes('*')) return true;

        // Check if any allowed route matches the current path
        return allowedRoutes.some(route => path.startsWith(route));
    }

    return false;
}

export function middleware(request: NextRequest) {
    const { pathname, searchParams, origin } = request.nextUrl; // Get searchParams and origin
    const response = NextResponse.next();
    const accessToken = request.cookies.get('accessToken')?.value;

    // Validate the token and extract information
    let isAuthenticated = false;
    let userRole: string | null = null;

    if (accessToken && validateToken(accessToken)) {
        isAuthenticated = true;
        try {
            const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
            userRole = decodedToken.role || null;
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    }

    // If user is authenticated and tries to access a public-only path like /sign-in
    if (isAuthenticated && publicPaths.some(publicPath => pathname.startsWith(publicPath))) {
        let callbackUrlStr = searchParams.get('callbackUrl');
        let targetUrl = '/'; // Default redirect target

        if (callbackUrlStr) {
            try {
                const parsedCallbackUrl = new URL(callbackUrlStr);
                // Ensure callbackUrl is from the same origin to prevent open redirects
                if (parsedCallbackUrl.origin === origin) {
                    targetUrl = parsedCallbackUrl.pathname + parsedCallbackUrl.search + parsedCallbackUrl.hash;
                } else {
                    console.warn(`Middleware: Invalid callbackUrl origin. Defaulting to /. Original: ${callbackUrlStr}`);
                }
            } catch (e) {
                // If callbackUrl is not a valid URL (e.g., just a path like '/dashboard')
                if (callbackUrlStr.startsWith('/')) {
                    targetUrl = callbackUrlStr;
                } else {
                    console.warn(`Middleware: Invalid callbackUrl format. Defaulting to /. Original: ${callbackUrlStr}`);
                }
            }
        }

        // Ensure targetUrl is at least '/'
        if (!targetUrl.startsWith('/')) {
            targetUrl = '/';
        }

        console.log(`Middleware: Authenticated user on public path ${pathname}. Redirecting to ${targetUrl}.`);
        return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    // If path is protected and user is not authenticated
    if (isProtectedPath(pathname)) {
        if (!isAuthenticated) {
            console.log(`Middleware: No valid token for protected path: ${pathname}. Redirecting to sign-in.`);
            const signInUrl = new URL('/sign-in', request.url);
            // Preserve the original intended URL as callbackUrl for the sign-in page
            signInUrl.searchParams.set('callbackUrl', request.url.toString()); // Use full request URL string

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

        // Check if user has permission to access this route
        if (!hasRoutePermission(pathname, userRole)) {
            console.log(`Middleware: User role ${userRole} does not have permission for path: ${pathname}`);

            // Redirect based on user role
            let redirectPath = '/';

            // Clients are redirected to quotations page
            if (userRole === AccessLevel.CLIENT) {
                redirectPath = '/quotations';
            }
            // Users are redirected to tasks page
            else if (userRole === AccessLevel.USER) {
                redirectPath = '/tasks';
            }

            const redirectUrl = new URL(redirectPath, request.url);
            return NextResponse.redirect(redirectUrl);
        }

        // If token is valid and user has permission for protected path, proceed
        return response;
    }

    // For public paths (and user is not authenticated) or static assets/API routes
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
