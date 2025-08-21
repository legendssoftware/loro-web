import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { CustomJwtPayload } from './lib/services/auth-service';
import { AccessLevel, rolePermissions } from './types/auth';

// Performance optimization: Cache for token validation results
interface TokenCacheEntry {
    isValid: boolean;
    reason?: string;
    timestamp: number;
}

const tokenCache = new Map<string, TokenCacheEntry>();
const TOKEN_CACHE_TTL = 30000; // 30 seconds cache for token validation

// Define public paths that don't require authentication
const publicPaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/new-password',
    '/verify-email',
    '/verify-otp',
    '/',
    '/feedback',
    '/feedback/thank-you',
    '/review-quotation',
    '/review-quotation/thank-you',
];

// Define auth-only paths that should redirect authenticated users to dashboard
const authOnlyPaths = [
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/new-password',
    '/verify-email',
    '/verify-otp',
];

// Define public informational paths that authenticated users can still access
const publicInfoPaths = [
    '/feedback',
    '/feedback/thank-you',
    '/review-quotation',
    '/review-quotation/thank-you',
];

/**
 * Check if a path is public (auth pages, informational pages, or landing page)
 */
function isPublicPath(path: string): boolean {
    // Quick checks for static assets and API routes
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.includes('.') ||
        path.startsWith('/favicon')
    ) {
        return true;
    }

    // Check if it's in any of the public path categories
    return publicPaths.some((publicPath) => path.startsWith(publicPath));
}

/**
 * Fast path check for protected routes
 */
function isProtectedPath(path: string): boolean {
    // If it's not a public path and not a static asset, it's protected
    return !isPublicPath(path);
}

/**
 * Enhanced token validation with caching and session cleanup
 */
function validateToken(token: string): { isValid: boolean; reason?: string } {
    try {
        if (!token) return { isValid: false, reason: 'no-token' };

        // Check cache first
        const cached = tokenCache.get(token);
        if (cached && Date.now() - cached.timestamp < TOKEN_CACHE_TTL) {
            return { isValid: cached.isValid, reason: cached.reason };
        }

        const decodedToken = jwtDecode<CustomJwtPayload>(token);

        // Check token structure
        if (!decodedToken || typeof decodedToken !== 'object') {
            const result = { isValid: false, reason: 'malformed-token' };
            tokenCache.set(token, { ...result, timestamp: Date.now() });
            return result;
        }

        // Check expiration
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (!decodedToken.exp || decodedToken.exp <= currentTimestamp) {
            const result = { isValid: false, reason: 'token-expired' };
            tokenCache.set(token, { ...result, timestamp: Date.now() });

            // Clear expired token from cache and session storage
            tokenCache.delete(token);
            return result;
        }

        // Check if token was issued in the future (clock skew protection)
        if (decodedToken.iat && decodedToken.iat > currentTimestamp + 300) {
            // 5 minute buffer
            const result = { isValid: false, reason: 'token-future' };
            tokenCache.set(token, { ...result, timestamp: Date.now() });
            return result;
        }

        const result = { isValid: true };
        tokenCache.set(token, { ...result, timestamp: Date.now() });
        return result;
    } catch (error) {
        const result = { isValid: false, reason: 'decode-error' };
        tokenCache.set(token, { ...result, timestamp: Date.now() });
        return result;
    }
}

/**
 * Clears all authentication cookies and session storage
 */
function clearAuthCookies(response: NextResponse): void {
    const cookiesToClear = ['accessToken', 'refreshToken', 'auth', 'session'];

    cookiesToClear.forEach((cookieName) => {
        response.cookies.set(cookieName, '', {
            path: '/',
            expires: new Date(0),
            sameSite: 'strict',
        });
    });

    // Also clear session storage by setting a response header that client can use
    response.headers.set('x-clear-session-storage', 'true');
}

/**
 * Checks if a user has permission to access a specific route based on their role and license features
 */
function hasRoutePermission(
    path: string,
    userRole: string | null,
    licenseFeatures: string[] | Record<string, boolean> = [],
): boolean {
    if (!userRole) return false;

    // Dashboard should be accessible to all authenticated users with valid licenses
    if (path === '/dashboard' || path.startsWith('/dashboard')) {
        // Check if user has dashboard access in their license features
        return hasLicenseFeatureAccess(path, licenseFeatures);
    }

    // Debug: Log the user role and path for troubleshooting
    console.log('Middleware check:', { path, userRole, licenseFeatures: licenseFeatures.length });

    // Normalize role names to handle different formats
    const normalizedRole = userRole.toLowerCase() as AccessLevel;

    // Super users (admin, manager, owner) have access to all routes
    if (
        normalizedRole === AccessLevel.ADMIN ||
        normalizedRole === AccessLevel.MANAGER ||
        normalizedRole === AccessLevel.OWNER ||
        normalizedRole === AccessLevel.DEVELOPER ||
        normalizedRole === AccessLevel.EXECUTIVE
    ) {
        return hasLicenseFeatureAccess(path, licenseFeatures);
    }

    // For other roles, check specific permissions
    if (rolePermissions[normalizedRole]) {
        const allowedRoutes = rolePermissions[normalizedRole].routes;

        // Check for wildcard or exact path match
        if (allowedRoutes.includes('*')) {
            return hasLicenseFeatureAccess(path, licenseFeatures);
        }

        // Check if any allowed route matches the current path
        const hasRouteAccess = allowedRoutes.some((route) =>
            path.startsWith(route),
        );

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
    '/dashboard': ['dashboard'],
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
function hasLicenseFeatureAccess(
    path: string,
    licenseFeatures: string[] | Record<string, boolean>,
): boolean {
    console.log('Checking license features for path:', path, 'Features type:', typeof licenseFeatures);

    // If no features specified, deny access for security
    if (!licenseFeatures) {
        console.log('No license features provided, denying access');
        return false;
    }

    // Handle both array format and object format
    let featuresObject: Record<string, boolean> = {};
    
    if (Array.isArray(licenseFeatures)) {
        // Convert array to object for consistent handling
        licenseFeatures.forEach(feature => {
            featuresObject[feature] = true;
        });
    } else if (typeof licenseFeatures === 'object') {
        featuresObject = licenseFeatures;
    } else {
        console.log('Invalid license features format');
        return false;
    }

    // Check if the path requires specific features
    for (const [routePath, requiredFeatures] of Object.entries(routeFeatureMap)) {
        if (path.startsWith(routePath)) {
            console.log(`Checking access for route ${routePath}, required features:`, requiredFeatures);
            
            // Check if user has at least one of the required features
            const hasAccess = requiredFeatures.some(feature => {
                // Check for exact match (e.g., "dashboard")
                if (featuresObject[feature]) {
                    console.log(`Found exact feature match: ${feature}`);
                    return true;
                }
                
                // Check for dotted notation (e.g., "dashboard.access", "dashboard.premium")
                const dottedFeatures = Object.keys(featuresObject).filter(key => 
                    key.startsWith(`${feature}.`) && featuresObject[key] === true
                );
                
                if (dottedFeatures.length > 0) {
                    console.log(`Found dotted feature matches for ${feature}:`, dottedFeatures);
                    return true;
                }
                
                return false;
            });
            
            console.log(`Access result for ${routePath}: ${hasAccess}`);
            return hasAccess;
        }
    }

    // If no specific feature requirements found, allow access
    console.log('No specific feature requirements found, allowing access');
    return true;
}

/**
 * Gets the required feature for a specific path (for error reporting)
 */
function getRequiredFeatureForPath(path: string): string {
    for (const [routePath, requiredFeatures] of Object.entries(
        routeFeatureMap,
    )) {
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
    console.log('getDefaultRedirectPath called with:', userRole);

    // ALWAYS redirect to dashboard after successful sign-in
    // This ensures consistent behavior regardless of role
    // The client-side route guards will handle role-based access control
            return '/dashboard';
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
            return pathname;
        }

        // Return the safe callback URL
        return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    } catch (error) {
        // If callback URL is not a valid URL, treat it as a path
        if (typeof callbackUrl === 'string' && callbackUrl.startsWith('/')) {
            return callbackUrl;
        }

        return pathname;
    }
}

export function middleware(request: NextRequest) {
    const { pathname, searchParams, origin } = request.nextUrl;
    const response = NextResponse.next();
    const accessToken = request.cookies.get('accessToken')?.value;

    // Skip middleware for static assets and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') ||
        pathname.startsWith('/favicon')
    ) {
        return response;
    }

    // Validate the token and extract information
    let isAuthenticated = false;
    let userRole: string | null = null;
    let licenseFeatures: string[] | Record<string, boolean> = [];
    let licensePlan: string | null = null;

    if (accessToken) {
        const validationResult = validateToken(accessToken);
        if (validationResult.isValid) {
            isAuthenticated = true;
            try {
                const decodedToken = jwtDecode<CustomJwtPayload>(accessToken);
                userRole = decodedToken.role || null;

                // Debug: Log the extracted role and features
                console.log('JWT Token Role:', userRole);
                console.log('JWT Token Features type:', typeof decodedToken.features);

                // Handle both array and object formats for license features
                if (Array.isArray(decodedToken.features)) {
                    licenseFeatures = decodedToken.features;
                    console.log('JWT Token Features array length:', decodedToken.features.length);
                } else if (typeof decodedToken.features === 'object' && decodedToken.features !== null) {
                    licenseFeatures = decodedToken.features;
                    console.log('JWT Token Features object keys:', Object.keys(decodedToken.features).length);
                } else {
                    licenseFeatures = [];
                    console.log('No valid license features found in token');
                }

                licensePlan = decodedToken.licensePlan || null;
            } catch (error) {
                // If token decoding fails, treat as unauthenticated
                isAuthenticated = false;
                console.log('Token decoding error:', error);
            }
        } else {
            // Clear invalid tokens
            clearAuthCookies(response);
            console.log('Token validation failed:', validationResult.reason);
        }
    }

        // Handle root path (/) - redirect authenticated users to dashboard
    if (pathname === '/') {
        if (isAuthenticated) {
            const defaultPath = getDefaultRedirectPath(userRole || '');
            console.log('Root path redirect:', { userRole, defaultPath });

            const redirectUrl = new URL(defaultPath, request.url);

            // Only add redirect parameter if we're not redirecting to dashboard
            if (defaultPath !== '/dashboard') {
                redirectUrl.searchParams.set('middleware_redirect', 'authenticated-user');
            }

            // Prevent redirect loops by checking if we're already going to the target path
            if (defaultPath !== pathname) {
                console.log('Redirecting to:', redirectUrl.toString());
                return NextResponse.redirect(redirectUrl);
            }
        }
        // If not authenticated, allow access to landing page
        return response;
    }

    // Handle auth-only paths - redirect authenticated users to dashboard
    const isAuthOnlyPath = authOnlyPaths.some((authPath) => pathname.startsWith(authPath));
    if (isAuthOnlyPath) {
        if (isAuthenticated) {
            // Redirect authenticated users away from auth pages to their dashboard
            const defaultPath = getDefaultRedirectPath(userRole || '');
            const redirectUrl = new URL(defaultPath, request.url);
            redirectUrl.searchParams.set('middleware_redirect', 'authenticated-user');

            // Prevent redirect loops
            if (defaultPath !== pathname) {
                return NextResponse.redirect(redirectUrl);
            }
        }
        // If not authenticated, allow access to auth pages
        return response;
    }

    // Handle public informational paths - allow access to everyone
    const isPublicInfoPath = publicInfoPaths.some((infoPath) => pathname.startsWith(infoPath));
    if (isPublicInfoPath) {
        // Allow access to everyone (authenticated and unauthenticated users)
        return response;
    }

    // Handle protected paths
    if (isProtectedPath(pathname)) {
        if (!isAuthenticated) {
            // Redirect to landing page for unauthenticated users
            const landingUrl = new URL('/', request.url);
            landingUrl.searchParams.set('callbackUrl', pathname);

            if (accessToken) {
                const validationResult = validateToken(accessToken);
                if (validationResult.reason === 'token-expired') {
                    landingUrl.searchParams.set('middleware_redirect', 'token-expired');
                    landingUrl.searchParams.set('token_status', 'expired');
                } else {
                    landingUrl.searchParams.set('middleware_redirect', 'unauthenticated');
                    landingUrl.searchParams.set('token_status', 'invalid');
                }
            } else {
                landingUrl.searchParams.set('middleware_redirect', 'unauthenticated');
            }

            const redirectResponse = NextResponse.redirect(landingUrl);
            clearAuthCookies(redirectResponse);
            redirectResponse.headers.set('x-middleware-redirect', 'unauthenticated');

            return redirectResponse;
        }

        // User is authenticated, check permissions
        if (!hasRoutePermission(pathname, userRole, licenseFeatures)) {
            // For unauthorized access, redirect to dashboard with error message
            const redirectPath = getDefaultRedirectPath(userRole || '');
            const redirectUrl = new URL(redirectPath, request.url);

            redirectUrl.searchParams.set('middleware_redirect', 'unauthorized');
            redirectUrl.searchParams.set('denied_feature', getRequiredFeatureForPath(pathname));

            const redirectResponse = NextResponse.redirect(redirectUrl);
            redirectResponse.headers.set('x-middleware-redirect', 'unauthorized');

            return redirectResponse;
        }

        // User is authenticated and has permission - allow access
        return response;
    }

    // For all other paths (public paths), allow access
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
