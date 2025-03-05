// Define permission constants
export const PERMISSIONS = {
  // User management
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',

  // Client management
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENT: 'create_client',
  EDIT_CLIENT: 'edit_client',
  DELETE_CLIENT: 'delete_client',

  // Lead management
  VIEW_LEADS: 'view_leads',
  CREATE_LEAD: 'create_lead',
  EDIT_LEAD: 'edit_lead',
  DELETE_LEAD: 'delete_lead',

  // Inventory management
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY: 'create_inventory',
  EDIT_INVENTORY: 'edit_inventory',
  DELETE_INVENTORY: 'delete_inventory',

  // Quotation management
  VIEW_QUOTATIONS: 'view_quotations',
  CREATE_QUOTATION: 'create_quotation',
  EDIT_QUOTATION: 'edit_quotation',
  DELETE_QUOTATION: 'delete_quotation',

  // Claims management
  VIEW_CLAIMS: 'view_claims',
  CREATE_CLAIM: 'create_claim',
  EDIT_CLAIM: 'edit_claim',
  DELETE_CLAIM: 'delete_claim',

  // Task management
  VIEW_TASKS: 'view_tasks',
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',

  // Reports
  VIEW_REPORTS: 'view_reports',
  GENERATE_REPORT: 'generate_report',

  // Admin
  ADMIN_ACCESS: 'admin_access',
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[Permission];

// Define user roles
export type UserRole = 'admin' | 'manager' | 'staff' | 'reseller' | 'client' | 'guest';

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, PermissionValue[]> = {
  admin: Object.values(PERMISSIONS),

  manager: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.EDIT_LEAD,
    PERMISSIONS.DELETE_LEAD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.EDIT_QUOTATION,
    PERMISSIONS.VIEW_CLAIMS,
    PERMISSIONS.CREATE_CLAIM,
    PERMISSIONS.EDIT_CLAIM,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.GENERATE_REPORT,
  ],

  staff: [
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.EDIT_LEAD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.EDIT_QUOTATION,
    PERMISSIONS.VIEW_CLAIMS,
    PERMISSIONS.CREATE_CLAIM,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.VIEW_REPORTS,
  ],

  reseller: [
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENT,
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.CREATE_LEAD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.CREATE_QUOTATION,
    PERMISSIONS.VIEW_CLAIMS,
    PERMISSIONS.CREATE_CLAIM,
    PERMISSIONS.VIEW_TASKS,
  ],

  client: [
    PERMISSIONS.VIEW_QUOTATIONS,
    PERMISSIONS.VIEW_CLAIMS,
    PERMISSIONS.CREATE_CLAIM,
    PERMISSIONS.VIEW_TASKS,
  ],

  guest: [],
};

/**
 * Checks if a role has a specific permission
 */
export function hasPermission(role: UserRole | string | null, permission: PermissionValue): boolean {
  if (!role) return false;

  // Check if the role exists in our defined roles
  const validatedRole = Object.keys(ROLE_PERMISSIONS).includes(role)
    ? role as UserRole
    : 'guest';

  return ROLE_PERMISSIONS[validatedRole].includes(permission);
}

/**
 * Gets all permissions for a specific role
 */
export function getPermissionsForRole(role: UserRole | string | null): PermissionValue[] {
  if (!role) return [];

  // Check if the role exists in our defined roles
  const validatedRole = Object.keys(ROLE_PERMISSIONS).includes(role)
    ? role as UserRole
    : 'guest';

  return ROLE_PERMISSIONS[validatedRole];
}

/**
 * Checks if a user can access a specific route based on required permissions
 */
export function canAccessRoute(
  userRole: UserRole | string | null,
  requiredPermissions: PermissionValue[]
): boolean {
  if (!userRole || requiredPermissions.length === 0) return false;

  // Check if the role exists in our defined roles
  const validatedRole = Object.keys(ROLE_PERMISSIONS).includes(userRole)
    ? userRole as UserRole
    : 'guest';

  const userPermissions = ROLE_PERMISSIONS[validatedRole];

  // User can access if they have at least one of the required permissions
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}
