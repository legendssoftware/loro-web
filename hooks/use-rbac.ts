import { AccessLevel } from '@/types/auth';
import { useAuthStore } from '@/store/auth-store';

// Role hierarchy - higher roles inherit permissions from lower roles
const roleHierarchy: Record<string, number> = {
  [AccessLevel.OWNER]: 100,
  [AccessLevel.ADMIN]: 90,
  [AccessLevel.MANAGER]: 80,
  [AccessLevel.SUPERVISOR]: 70,
  [AccessLevel.USER]: 10,
  // Add other roles as needed with appropriate hierarchy values
};

/**
 * Custom hook for role-based access control
 * @returns Functions to check user permissions
 */
export const useRBAC = () => {
  const { profileData } = useAuthStore();
  const userRole = profileData?.accessLevel;

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
    // Basic user-level permissions
    const userLevelFeatures = ['claims', 'tasks', 'leads', 'quotations'];

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
