'use client';

import { ReactNode } from 'react';
import { AccessLevel } from '@/types/auth';
import { useRBAC } from '@/hooks/use-rbac';

interface ProtectedProps {
  /**
   * The roles allowed to access this component
   * If not provided, will use the feature prop for permission check
   */
  allowedRoles?: AccessLevel[];

  /**
   * The feature this component relates to
   * Used for permission check if allowedRoles is not provided
   */
  feature?: string;

  /**
   * The content to render if user has permission
   */
  children: ReactNode;

  /**
   * Optional fallback component to render if user doesn't have permission
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders its children based on user's role/permissions
 */
export function Protected({
  allowedRoles,
  feature,
  children,
  fallback = null
}: ProtectedProps) {
  const { hasRole, hasPermission } = useRBAC();

  // If allowedRoles is provided, check if user has one of these roles
  if (allowedRoles) {
    return hasRole(allowedRoles) ? <>{children}</> : <>{fallback}</>;
  }

  // Otherwise, check if user has permission for the feature
  if (feature) {
    return hasPermission(feature) ? <>{children}</> : <>{fallback}</>;
  }

  // If neither allowedRoles nor feature is provided, don't render anything
  return null;
}

/**
 * Component that only renders its children for admin users
 */
export function AdminOnly({ children, fallback = null }: Omit<ProtectedProps, 'allowedRoles' | 'feature'>) {
  return (
    <Protected allowedRoles={[AccessLevel.ADMIN, AccessLevel.OWNER]} fallback={fallback}>
      {children}
    </Protected>
  );
}

/**
 * Component that only renders its children for manager users or higher
 */
export function ManagerOnly({ children, fallback = null }: Omit<ProtectedProps, 'allowedRoles' | 'feature'>) {
  return (
    <Protected
      allowedRoles={[AccessLevel.MANAGER, AccessLevel.ADMIN, AccessLevel.OWNER]}
      fallback={fallback}
    >
      {children}
    </Protected>
  );
}

/**
 * Component that renders its children for regular users (based on the feature they can access)
 */
export function UserAccess({
  feature,
  children,
  fallback = null
}: Omit<ProtectedProps, 'allowedRoles'>) {
  return (
    <Protected feature={feature} fallback={fallback}>
      {children}
    </Protected>
  );
}
