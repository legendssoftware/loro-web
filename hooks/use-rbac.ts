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

  // Get user role from profile data or extract from JWT token if needed
  let userRole = profileData?.accessLevel;

  // If accessLevel is not available but we have a JWT token, try to extract role
  if (!userRole && accessToken) {
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      userRole = payload.role;
    } catch (e) {
      console.error("Failed to extract role from token:", e);
    }
  }

  /**
   * Check if the user has at least one of the required roles
   * @param allowedRoles Array of roles that are allowed to access a feature
   * @returns Boolean indicating if user has permission
   */
  const hasRole = (allowedRoles: AccessLevel[]): boolean => {
    // If no user role, deny access
    if (!userRole) return false;

    // Admin and Manager have access to everything
    if (userRole === AccessLevel.ADMIN || userRole === AccessLevel.MANAGER || userRole === AccessLevel.OWNER) {
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
  const hasPermission = (feature: 'claims' | 'tasks' | 'leads' | 'quotations' | string): boolean => {
    // Basic user-level features
    const userLevelFeatures = ['claims', 'tasks', 'leads', 'quotations'];

    // Client permissions are restricted to quotations
    if (userRole === AccessLevel.CLIENT) {
      // For clients, only check the features from the JWT token
      if (profileData?.licenseInfo?.features) {
        const features = profileData.licenseInfo.features as any;

        // Check for exact match
        if (features && features[feature] === true) {
          return true;
        }

        // Check for dotted permissions
        if (features && Object.keys(features).some(key => key.startsWith(`${feature}.`) && features[key] === true)) {
          return true;
        }
      }

      // Only allow quotations for clients by default
      return feature === 'quotations';
    }

    // Check for CLIENT specific permissions from JWT token for other roles
    if (profileData?.licenseInfo?.features) {
      // Cast features to any first to work around TypeScript limitations with dynamic objects
      const features = profileData.licenseInfo.features as any;

      // Check for exact match
      if (features && features[feature] === true) {
        return true;
      }

      // Check for dotted permissions
      if (features && Object.keys(features).some(key => key.startsWith(`${feature}.`) && features[key] === true)) {
        return true;
      }
    }

    // Admin and Manager have access to everything
    if (userRole === AccessLevel.ADMIN || userRole === AccessLevel.MANAGER || userRole === AccessLevel.OWNER) {
      return true;
    }

    // Regular users can only access specific features
    if (userRole === AccessLevel.USER && userLevelFeatures.includes(feature)) {
      return true;
    }

    return false;
  };

  return {
    hasRole,
    hasPermission,
    userRole,
  };
};
