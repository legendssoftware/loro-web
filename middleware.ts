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
 * Enhanced token validation with session cleanup
 */
function validateToken(token: string): { isValid: boolean; reason?: string } {
    try {
        if (!token) return { isValid: false, reason: 'no-token' };

        const decodedToken = jwtDecode<CustomJwtPayload>(token);

        // Check token structure
        if (!decodedToken || typeof decodedToken !== 'object') {
            return { isValid: false, reason: 'malformed-token' };
        }

        // Check expiration
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (!decodedToken.exp || decodedToken.exp <= currentTimestamp) {
            return { isValid: false, reason: 'token-expired' };
        }

        // Check if token was issued in the future (clock skew protection)
        if (decodedToken.iat && decodedToken.iat > currentTimestamp + 300) { // 5 minute buffer
            return { isValid: false, reason: 'token-future' };
        }

        return { isValid: true };
    } catch (error) {
        return { isValid: false, reason: 'decode-error' };
    }
}

/**
 * Clears all authentication cookies
 */
function clearAuthCookies(response: NextResponse): void {
    const cookiesToClear = ['accessToken', 'refreshToken', 'auth', 'session'];

    cookiesToClear.forEach(cookieName => {
        response.cookies.set(cookieName, '', {
            path: '/',
            expires: new Date(0),
            sameSite: 'strict',
        });
    });
}

/**
 * Checks if a user has permission to access a specific route based on their role and license features
 */
function hasRoutePermission(path: string, userRole: string | null, licenseFeatures: string[] = []): boolean {
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
        const hasRouteAccess = allowedRoutes.some(route => path.startsWith(route));

        // If user has route access, also check license features
        if (hasRouteAccess) {
            return hasLicenseFeatureAccess(path, licenseFeatures);
        }
    }

    return false;
}

/**
 * Map routes to required features
 */
const routeFeatureMap: Record<string, string[]> = {
    '/claims': ['claims'],
    '/tasks': ['tasks'],
    '/leads': ['leads'],
    '/quotations': ['quotations'],
    '/clients': ['clients'],
    '/staff': ['staff'],
    '/inventory': ['inventory'],
    '/journals': ['journals'],
    '/suppliers': ['suppliers'],
    '/my-reports': ['reports'],
    '/settings': ['settings'],
    '/map': ['mapping', 'location'],
};

/**
 * Checks if the user's license features allow access to a specific route
 */
function hasLicenseFeatureAccess(path: string, licenseFeatures: string[]): boolean {
    // If no features specified or features is not an array, allow access (backward compatibility)
    if (!Array.isArray(licenseFeatures) || licenseFeatures.length === 0) {
        return true;
    }

    // Check if the path requires specific features
    for (const [routePath, requiredFeatures] of Object.entries(routeFeatureMap)) {
        if (path.startsWith(routePath)) {
            // Check if user has at least one of the required features
            return requiredFeatures.some(feature =>
                typeof feature === 'string' && licenseFeatures.includes(feature)
            );
        }
    }

    // If no specific feature requirements found, allow access
    return true;
}

/**
 * Gets the required feature for a specific path (for error reporting)
 */
function getRequiredFeatureForPath(path: string): string {
    for (const [routePath, requiredFeatures] of Object.entries(routeFeatureMap)) {
        if (path.startsWith(routePath)) {
            return requiredFeatures[0] || 'unknown';
        }
    }
    return 'unknown';
}

/**
 * Gets the default redirect path for a user role
 */
function getDefaultRedirectPath(userRole: string): string {
    const role = userRole as AccessLevel;

    // Use centralized role permissions to determine redirect
    if (rolePermissions[role]?.routes) {
        const allowedRoutes = rolePermissions[role].routes;

        // If user has access to all routes, redirect to dashboard
        if (allowedRoutes.includes('*')) {
            return '/';
        }

        // Otherwise, redirect to the first allowed route
        const firstAllowedRoute = allowedRoutes[0];
        return firstAllowedRoute === '/' ? '/' : firstAllowedRoute;
    }

    // Fallback redirects
    switch (role) {
        case AccessLevel.CLIENT:
            return '/quotations';
        case AccessLevel.USER:
            return '/tasks';
        default:
            return '/';
    }
}

/**
 * Safely extracts callback URL from search parameters
 */
function getSafeCallbackUrl(request: NextRequest): string {
    const { searchParams, origin, pathname } = request.nextUrl;

    // Get callback URL from search params
    const callbackUrl = searchParams.get('callbackUrl');

    if (!callbackUrl) {
        // If no callback URL provided, use the current path (without query params)
        return pathname;
    }

    try {
        const parsedUrl = new URL(callbackUrl);

        // Ensure callback URL is from the same origin
        if (parsedUrl.origin !== origin) {
            console.warn(`Middleware: Invalid callback URL origin. Using current path instead.`);
            return pathname;
        }

        // Return the safe callback URL
        return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    } catch (error) {
        // If callback URL is not a valid URL, treat it as a path
        if (typeof callbackUrl === 'string' && callbackUrl.startsWith('/')) {
            return callbackUrl;
        }

        console.warn(`Middleware: Invalid callback URL format. Using current path instead.`);
        return pathname;
    }
}

export function middleware(request: NextRequest) {
    const { pathname, searchParams, origin } = request.nextUrl;
    const response = NextResponse.next();
    const accessToken = request.cookies.get('accessToken')?.value;

    // Validate the token and extract information
    let isAuthenticated = false;
    let userRole: string | null = null;
    let licenseFeatures: string[] = [];
    let licensePlan: string | null = null;

    if (accessToken) {
        const validationResult = validateToken(accessToken);
        if (validationResult.isValid) {
            isAuthenticated = true;
                                    try {
                const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
                userRole = decodedToken.role || null;

                // Ensure licenseFeatures is always an array
                if (Array.isArray(decodedToken.features)) {
                    licenseFeatures = decodedToken.features;
                } else {
                    licenseFeatures = [];
                    if (decodedToken.features !== undefined) {
                        console.warn('Middleware: Token features is not an array:', typeof decodedToken.features, decodedToken.features);
                    }
                }

                licensePlan = decodedToken.licensePlan || null;

                console.log(`Middleware: User ${userRole} with license ${licensePlan} and features: ${licenseFeatures.join(', ')}`);
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        } else {
            console.warn(`Middleware: Token validation failed: ${validationResult.reason}`);
            // Optionally, clear invalid tokens
            clearAuthCookies(response);
        }
    }

        // If user is authenticated and tries to access a public-only path
    if (isAuthenticated && publicPaths.some(publicPath => pathname.startsWith(publicPath))) {
        const targetUrl = getSafeCallbackUrl(request);

        // Ensure target URL is not a public path to avoid redirect loops
        if (publicPaths.some(publicPath => targetUrl.startsWith(publicPath))) {
            const defaultPath = getDefaultRedirectPath(userRole || '');
            console.log(`Middleware: Callback URL is public path. Redirecting to default: ${defaultPath}`);

            // Add notification parameters for authenticated user redirect
            const redirectUrl = new URL(defaultPath, request.url);
            redirectUrl.searchParams.set('middleware_redirect', 'authenticated-user');

            return NextResponse.redirect(redirectUrl);
        }

        console.log(`Middleware: Authenticated user on public path ${pathname}. Redirecting to ${targetUrl}.`);

        // Add notification parameters for authenticated user redirect
        const redirectUrl = new URL(targetUrl, request.url);
        redirectUrl.searchParams.set('middleware_redirect', 'authenticated-user');

        const redirectResponse = NextResponse.redirect(redirectUrl);
        redirectResponse.headers.set('x-middleware-redirect', 'authenticated-user');
        return redirectResponse;
    }

    // If path is protected and user is not authenticated
    if (isProtectedPath(pathname)) {
        if (!isAuthenticated) {
            console.log(`Middleware: No valid token for protected path: ${pathname}. Redirecting to sign-in.`);
            const signInUrl = new URL('/sign-in', request.url);

            // Use the safe callback URL method
            signInUrl.searchParams.set('callbackUrl', pathname);

            // Add notification parameters based on validation result
            if (accessToken) {
                const validationResult = validateToken(accessToken);
                if (validationResult.reason === 'token-expired') {
                    signInUrl.searchParams.set('middleware_redirect', 'token-expired');
                    signInUrl.searchParams.set('token_status', 'expired');
                } else {
                    signInUrl.searchParams.set('middleware_redirect', 'unauthenticated');
                    signInUrl.searchParams.set('token_status', 'invalid');
                }
            } else {
                signInUrl.searchParams.set('middleware_redirect', 'unauthenticated');
            }

            const redirectResponse = NextResponse.redirect(signInUrl);

            // Clear invalid/expired tokens
            clearAuthCookies(redirectResponse);

            // Set header to indicate this is an unauthenticated redirect
            redirectResponse.headers.set('x-middleware-redirect', 'unauthenticated');

            return redirectResponse;
        }

                // Check if user has permission to access this route
        if (!hasRoutePermission(pathname, userRole, licenseFeatures)) {
            console.log(`Middleware: User role ${userRole} does not have permission for path: ${pathname} (License: ${licensePlan}, Features: ${licenseFeatures.join(', ')})`);

            const redirectPath = getDefaultRedirectPath(userRole || '');
            const redirectUrl = new URL(redirectPath, request.url);

            // Add notification parameters for unauthorized access
            redirectUrl.searchParams.set('middleware_redirect', 'unauthorized');
            redirectUrl.searchParams.set('denied_feature', getRequiredFeatureForPath(pathname));

            // Set header to indicate this is an unauthorized redirect
            const redirectResponse = NextResponse.redirect(redirectUrl);
            redirectResponse.headers.set('x-middleware-redirect', 'unauthorized');

            return redirectResponse;
        }

        // If token is valid and user has permission, proceed
        return response;
    }

    // For public paths or static assets
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
