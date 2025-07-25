/**
 * User access levels in the system
 * Synced with the server AccessLevel enum
 */
export enum AccessLevel {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  USER = 'user',
  DEVELOPER = 'developer',
  SUPPORT = 'support',
  ANALYST = 'analyst',
  ACCOUNTANT = 'accountant',
  AUDITOR = 'auditor',
  CONSULTANT = 'consultant',
  COORDINATOR = 'coordinator',
  SPECIALIST = 'specialist',
  TECHNICIAN = 'technician',
  TRAINER = 'trainer',
  RESEARCHER = 'researcher',
  OFFICER = 'officer',
  EXECUTIVE = 'executive',
  CASHIER = 'cashier',
  RECEPTIONIST = 'receptionist',
  SECRETARY = 'secretary',
  SECURITY = 'security',
  CLEANER = 'cleaner',
  MAINTENANCE = 'maintenance',
  EVENT_PLANNER = 'event planner',
  MARKETING = 'marketing',
  HR = 'hr',
  CLIENT = 'client',
}

/**
 * Interface for role-based permissions
 */
export interface RolePermissions {
  routes: string[];
  features: string[];
}

/**
 * Default permissions for each role
 * Can be extended as needed
 */
export const rolePermissions: Record<AccessLevel, RolePermissions> = {
  [AccessLevel.OWNER]: {
    routes: ['*'], // Wildcard for all routes
    features: ['*'], // Wildcard for all features
  },
  [AccessLevel.ADMIN]: {
    routes: ['*'],
    features: ['*'],
  },
  [AccessLevel.MANAGER]: {
    routes: ['*'],
    features: ['*'],
  },
  [AccessLevel.SUPERVISOR]: {
    routes: ['/claims', '/tasks', '/leads', '/quotations', '/clients', '/staff', '/my-reports'],
    features: ['claims', 'tasks', 'leads', 'quotations', 'clients', 'staff'],
  },
  [AccessLevel.USER]: {
    routes: ['/claims', '/tasks', '/leads', '/quotations', '/journals', '/my-reports'],
    features: ['claims', 'tasks', 'leads', 'quotations', 'journals'],
  },
  // Define permissions for other roles
  [AccessLevel.DEVELOPER]: { routes: ['*'], features: ['*'] },
  [AccessLevel.SUPPORT]: { routes: ['/claims', '/tasks', '/my-reports'], features: ['claims', 'tasks'] },
  [AccessLevel.ANALYST]: { routes: ['/claims', '/tasks', '/my-reports'], features: ['claims', 'tasks'] },
  [AccessLevel.ACCOUNTANT]: { routes: ['/claims', '/quotations', '/my-reports'], features: ['claims', 'quotations'] },
  [AccessLevel.AUDITOR]: { routes: ['/claims', '/quotations', '/my-reports'], features: ['claims', 'quotations'] },
  [AccessLevel.CONSULTANT]: { routes: ['/leads', '/clients', '/my-reports'], features: ['leads', 'clients'] },
  [AccessLevel.COORDINATOR]: { routes: ['/tasks', '/leads', '/my-reports'], features: ['tasks', 'leads'] },
  [AccessLevel.SPECIALIST]: { routes: ['/leads', '/clients', '/my-reports'], features: ['leads', 'clients'] },
  [AccessLevel.TECHNICIAN]: { routes: ['/tasks', '/claims', '/my-reports'], features: ['tasks', 'claims'] },
  [AccessLevel.TRAINER]: { routes: ['/staff', '/tasks', '/my-reports'], features: ['staff', 'tasks'] },
  [AccessLevel.RESEARCHER]: { routes: ['/leads', '/clients', '/my-reports'], features: ['leads', 'clients'] },
  [AccessLevel.OFFICER]: { routes: ['/claims', '/tasks', '/my-reports'], features: ['claims', 'tasks'] },
  [AccessLevel.EXECUTIVE]: { routes: ['*'], features: ['*'] },
  [AccessLevel.CASHIER]: { routes: ['/quotations', '/my-reports'], features: ['quotations'] },
  [AccessLevel.RECEPTIONIST]: { routes: ['/leads', '/clients', '/my-reports'], features: ['leads', 'clients'] },
  [AccessLevel.SECRETARY]: { routes: ['/tasks', '/leads', '/my-reports'], features: ['tasks', 'leads'] },
  [AccessLevel.SECURITY]: { routes: ['/staff', '/my-reports'], features: ['staff'] },
  [AccessLevel.CLEANER]: { routes: ['/tasks', '/my-reports'], features: ['tasks'] },
  [AccessLevel.MAINTENANCE]: { routes: ['/tasks', '/claims', '/my-reports'], features: ['tasks', 'claims'] },
  [AccessLevel.EVENT_PLANNER]: { routes: ['/leads', '/clients', '/my-reports'], features: ['leads', 'clients'] },
  [AccessLevel.MARKETING]: { routes: ['/leads', '/clients', '/my-reports'], features: ['leads', 'clients'] },
  [AccessLevel.HR]: { routes: ['/staff', '/claims', '/my-reports'], features: ['staff', 'claims'] },
  [AccessLevel.CLIENT]: { routes: ['/quotations', '/my-reports'], features: ['quotations'] },
};
