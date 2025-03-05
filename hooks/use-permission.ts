'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import {
  hasPermission,
  PermissionValue,
  canAccessRoute,
  getPermissionsForRole
} from '@/lib/permissions/permission-manager';

/**
 * Hook to check if the current user has a specific permission
 */
export function useHasPermission(permission: PermissionValue): boolean {
  const { profileData } = useAuthStore();
  const userRole = profileData?.accessLevel || null;

  return useMemo(() => {
    return hasPermission(userRole, permission);
  }, [userRole, permission]);
}

/**
 * Hook to check if the current user has any of the specified permissions
 */
export function useHasAnyPermission(permissions: PermissionValue[]): boolean {
  const { profileData } = useAuthStore();
  const userRole = profileData?.accessLevel || null;

  return useMemo(() => {
    if (!userRole || permissions.length === 0) return false;
    return permissions.some(permission => hasPermission(userRole, permission));
  }, [userRole, permissions]);
}

/**
 * Hook to check if the current user can access a route based on required permissions
 */
export function useCanAccessRoute(requiredPermissions: PermissionValue[]): boolean {
  const { profileData } = useAuthStore();
  const userRole = profileData?.accessLevel || null;

  return useMemo(() => {
    return canAccessRoute(userRole, requiredPermissions);
  }, [userRole, requiredPermissions]);
}

/**
 * Hook to get all permissions of the current user
 */
export function useUserPermissions(): PermissionValue[] {
  const { profileData } = useAuthStore();
  const userRole = profileData?.accessLevel || null;

  return useMemo(() => {
    return getPermissionsForRole(userRole);
  }, [userRole]);
}
