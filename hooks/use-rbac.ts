import { AccessLevel } from '@/types/auth';
import { useAuthStore } from '@/store/auth-store';

// Role hierarchy - higher roles inherit permissions from lower roles
const roleHierarchy: Record<string, number> = {
    [AccessLevel.OWNER]: 100,
    [AccessLevel.ADMIN]: 90,
    [AccessLevel.MANAGER]: 80,
    [AccessLevel.SUPERVISOR]: 70,
    [AccessLevel.USER]: 10,
    [AccessLevel.CLIENT]: 5,
    // Add other roles as needed with appropriate hierarchy values
};

/**
 * Custom hook for role-based access control
 * @returns Functions to check user permissions
 */
export const useRBAC = () => {
    const { profileData, accessToken } = useAuthStore();

    // Get user role - prioritize JWT token role for consistency with middleware
    const getUserRole = () => {
        // First, try to get role from JWT token (same as middleware)
        if (accessToken) {
            try {
                const base64Url = accessToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map(
                            (c) =>
                                '%' +
                                ('00' + c.charCodeAt(0).toString(16)).slice(-2),
                        )
                        .join(''),
                );
                const payload = JSON.parse(jsonPayload);
                if (payload.role) {
                    return payload.role;
                }
            } catch (e) {
                console.error('Failed to extract role from token:', e);
            }
        }

        // Fallback to profile data accessLevel
        return profileData?.accessLevel;
    };

    const userRole = getUserRole();

    /**
     * Check if the user has at least one of the required roles
     * @param allowedRoles Array of roles that are allowed to access a feature
     * @returns Boolean indicating if user has permission
     */
    const hasRole = (allowedRoles: AccessLevel[]): boolean => {
        // If no user role, deny access
        if (!userRole) return false;

        // Admin and Manager have access to everything
        if (
            userRole === AccessLevel.ADMIN ||
            userRole === AccessLevel.MANAGER ||
            userRole === AccessLevel.OWNER
        ) {
            return true;
        }

        // Check if the user's role is in the allowed roles
        return allowedRoles.includes(userRole as AccessLevel);
    };

    /**
     * Check if user has permission for a specified feature
     * @param feature The feature to check permission for
     * @returns Boolean indicating if user has permission
     */
    const hasPermission = (
        feature: 'claims' | 'tasks' | 'leads' | 'quotations' | string,
    ): boolean => {
        // Import role permissions
        const { rolePermissions } = require('@/types/auth');

        // If no user role, deny access
        if (!userRole) return false;

        // Admin, Manager, and Owner have access to everything
        if (
            userRole === AccessLevel.ADMIN ||
            userRole === AccessLevel.MANAGER ||
            userRole === AccessLevel.OWNER
        ) {
            return true;
        }

        // Get the role permissions from auth.ts
        const role = userRole as AccessLevel;
        const permissions = rolePermissions[role];

        if (!permissions) return false;

        // Check if the feature is in the role's features array
        const hasFeatureAccess = permissions.features.includes(feature);

        // Special handling for CLIENT role - only allow quotations
        if (userRole === AccessLevel.CLIENT) {
            // For clients, also check license features if available
            if (profileData?.licenseInfo?.features) {
                const features = profileData.licenseInfo.features as any;

                // Check for exact match or dotted permissions
                if (features && features[feature] === true) {
                    return true;
                }

                if (
                    features &&
                    Object.keys(features).some(
                        (key) =>
                            key.startsWith(`${feature}.`) && features[key] === true,
                    )
                ) {
                    return true;
                }
            }

            // Only allow quotations for clients by default
            return feature === 'quotations';
        }

        // For other roles, check license features if available (additional restrictions)
        if (profileData?.licenseInfo?.features) {
            const features = profileData.licenseInfo.features as any;

            // Check for exact match
            if (features && features[feature] === true) {
                return hasFeatureAccess; // Only grant if role also allows it
            }

            // Check for dotted permissions
            if (
                features &&
                Object.keys(features).some(
                    (key) =>
                        key.startsWith(`${feature}.`) && features[key] === true,
                )
            ) {
                return hasFeatureAccess; // Only grant if role also allows it
            }
        }

        // Return the role-based permission
        return hasFeatureAccess;
    };

    return {
        hasRole,
        hasPermission,
        userRole,
    };
};
