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

    // Get license features in a consistent format
    const getLicenseFeatures = () => {
        if (profileData?.licenseInfo?.features) {
            const features = profileData.licenseInfo.features;
            
            // If it's already an object, return it
            if (typeof features === 'object' && !Array.isArray(features)) {
                return features;
            }
            
            // If it's an array, convert to object format
            if (Array.isArray(features)) {
                const featuresObj: Record<string, boolean> = {};
                features.forEach(feature => {
                    featuresObj[feature] = true;
                });
                return featuresObj;
            }
        }
        
        return {};
    };

    const userRole = getUserRole();
    const licenseFeatures = getLicenseFeatures();

    /**
     * Check if the user has at least one of the required roles
     * @param allowedRoles Array of roles that are allowed to access a feature
     * @returns Boolean indicating if user has permission
     */
    const hasRole = (allowedRoles: AccessLevel[]): boolean => {
        // If no user role, deny access
        if (!userRole) return false;

        // Normalize role name for comparison
        const normalizedRole = userRole.toLowerCase() as AccessLevel;

        // Admin and Manager have access to everything
        if (
            normalizedRole === AccessLevel.ADMIN ||
            normalizedRole === AccessLevel.MANAGER ||
            normalizedRole === AccessLevel.OWNER
        ) {
            return true;
        }

        // Check if the user's role is in the allowed roles
        return allowedRoles.includes(normalizedRole);
    };

    /**
     * Check if user has permission for a specified feature
     * @param feature The feature to check permission for
     * @returns Boolean indicating if user has permission
     */
    const hasPermission = (
        feature: 'claims' | 'tasks' | 'leads' | 'quotations' | 'dashboard' | string,
    ): boolean => {
        // Import role permissions
        const { rolePermissions } = require('@/types/auth');

        // If no user role, deny access
        if (!userRole) return false;

        // Normalize role name for comparison
        const normalizedRole = userRole.toLowerCase() as AccessLevel;

        // Admin, Manager, and Owner have access to everything
        if (
            normalizedRole === AccessLevel.ADMIN ||
            normalizedRole === AccessLevel.MANAGER ||
            normalizedRole === AccessLevel.OWNER
        ) {
            return true;
        }

        // Get the role permissions from auth.ts
        const permissions = rolePermissions[normalizedRole];

        if (!permissions) return false;

        // Check if the feature is in the role's features array
        const hasFeatureAccess = permissions.features.includes(feature);

        // Check license features for additional validation
        const hasLicenseFeature = checkLicenseFeature(feature);

        // Special handling for CLIENT role - only allow quotations and journal
        if (normalizedRole === AccessLevel.CLIENT) {
            // For clients, check both role permissions and license features
            if (hasFeatureAccess && hasLicenseFeature) {
                return true;
            }
            // Only allow quotations for clients by default if no license features
            return feature === 'quotations' || feature === 'journal';
        }

        // For other roles, both role and license must allow the feature
        return hasFeatureAccess && hasLicenseFeature;
    };

    /**
     * Helper function to check if a feature is allowed by license
     */
    const checkLicenseFeature = (feature: string): boolean => {
        // If no license features, allow access (backward compatibility)
        if (!licenseFeatures || Object.keys(licenseFeatures).length === 0) {
            return true;
        }

        // Check for exact match
        if (licenseFeatures[feature] === true) {
            return true;
        }

        // Check for dotted notation (e.g., "dashboard.access", "dashboard.premium")
        const hasRelatedFeature = Object.keys(licenseFeatures).some(
            (key) => key.startsWith(`${feature}.`) && licenseFeatures[key] === true
        );

        return hasRelatedFeature;
    };

    return {
        hasRole,
        hasPermission,
        checkLicenseFeature,
        userRole,
        licenseFeatures,
    };
};
