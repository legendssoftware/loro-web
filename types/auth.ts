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
 * Server-side feature mapping for client-side role permissions
 * Based on server/src/lib/constants/license-features.ts
 */
const SERVER_FEATURES = {
  // Core Features
  'leads.basic': 'leads',
  'leads.advanced': 'leads',
  'leads.premium': 'leads',
  'leads.enterprise': 'leads',

  'clients.basic': 'clients',
  'clients.advanced': 'clients',
  'clients.premium': 'clients',
  'clients.enterprise': 'clients',

  'tasks.basic': 'tasks',
  'tasks.advanced': 'tasks',
  'tasks.premium': 'tasks',
  'tasks.enterprise': 'tasks',

  'claims.view': 'claims',
  'claims.management': 'claims',
  'claims.premium': 'claims',
  'claims.enterprise': 'claims',

  'quotations.basic': 'quotations',
  'quotations.advanced': 'quotations',
  'quotations.premium': 'quotations',
  'quotations.enterprise': 'quotations',

  'journal.view': 'journal',
  'journal.advanced': 'journal',
  'journal.premium': 'journal',
  'journal.enterprise': 'journal',

  'shop.basic': 'shop',
  'shop.advanced': 'shop',
  'shop.premium': 'shop',
  'shop.enterprise': 'shop',

  'inventory.single_location': 'inventory',
  'inventory.multi_location': 'inventory',

  'reports.basic': 'reports',
  'reports.advanced': 'reports',
  'reports.premium': 'reports',
  'reports.enterprise': 'reports',

  // HR Features
  'users.basic': 'staff',
  'users.advanced': 'staff',
  'users.premium': 'staff',
  'users.enterprise': 'staff',

  // Map/Tracking Features (restricted for USER role)
  'tracking.mapping': 'map',
  'tracking.unlimited': 'map',
  'tracking.enterprise': 'map',

  // Platform Access
  'platform.hr': 'dashboard',
  'platform.sales': 'dashboard',
  'platform.crm': 'dashboard',
  'platform.all': 'dashboard',

  // Other features
  'assets.view': 'assets',
  'assets.advanced': 'assets',
  'assets.tracking': 'assets',
  'assets.enterprise': 'assets',

  'products.view': 'products',
  'products.advanced': 'products',
  'products.premium': 'products',
  'products.enterprise': 'products',

  'news.view': 'news',
  'news.announcements': 'news',
  'news.enterprise': 'news',

  'communication.advanced': 'communication',
  'communication.premium': 'communication',
  'communication.enterprise': 'communication',

  'notifications.basic': 'notifications',
  'notifications.advanced': 'notifications',
  'notifications.enterprise': 'notifications',

  'organisation.basic': 'organisation',
  'organisation.advanced': 'organisation',
  'organisation.enterprise': 'organisation',
};

/**
 * Default permissions for each role
 * Now synced with server-side features
 */
export const rolePermissions: Record<AccessLevel, RolePermissions> = {
  [AccessLevel.OWNER]: {
    routes: ['*'], // Wildcard for all routes
    features: Object.values(SERVER_FEATURES), // All server features
  },
  [AccessLevel.ADMIN]: {
    routes: ['*'],
    features: Object.values(SERVER_FEATURES),
  },
  [AccessLevel.MANAGER]: {
    routes: ['*'],
    features: Object.values(SERVER_FEATURES),
  },
  [AccessLevel.SUPERVISOR]: {
    routes: ['/claims', '/tasks', '/leads', '/quotations', '/clients', '/staff', '/my-reports', '/dashboard'],
    features: [
      'claims', 'tasks', 'leads', 'quotations', 'clients', 'staff', 'dashboard',
      'journal', 'reports', 'assets', 'products', 'news', 'communication',
      'notifications', 'organisation'
    ],
  },
  [AccessLevel.USER]: {
    routes: ['/claims', '/tasks', '/leads', '/quotations', '/journals', '/my-reports', '/dashboard'],
    features: [
      'claims', 'tasks', 'leads', 'quotations', 'journal', 'dashboard',
      // USER role does NOT have access to map/tracking features
    ],
  },
  // Define permissions for other roles
  [AccessLevel.DEVELOPER]: {
    routes: ['*'],
    features: Object.values(SERVER_FEATURES)
  },
  [AccessLevel.SUPPORT]: {
    routes: ['/claims', '/tasks', '/my-reports', '/dashboard'],
    features: ['claims', 'tasks', 'dashboard', 'journal', 'notifications']
  },
  [AccessLevel.ANALYST]: {
    routes: ['/claims', '/tasks', '/my-reports', '/dashboard'],
    features: ['claims', 'tasks', 'dashboard', 'reports', 'journal']
  },
  [AccessLevel.ACCOUNTANT]: {
    routes: ['/claims', '/quotations', '/my-reports', '/dashboard'],
    features: ['claims', 'quotations', 'dashboard', 'reports', 'journal']
  },
  [AccessLevel.AUDITOR]: {
    routes: ['/claims', '/quotations', '/my-reports', '/dashboard'],
    features: ['claims', 'quotations', 'dashboard', 'reports', 'journal']
  },
  [AccessLevel.CONSULTANT]: {
    routes: ['/leads', '/clients', '/my-reports', '/dashboard'],
    features: ['leads', 'clients', 'dashboard', 'journal', 'reports']
  },
  [AccessLevel.COORDINATOR]: {
    routes: ['/tasks', '/leads', '/my-reports', '/dashboard'],
    features: ['tasks', 'leads', 'dashboard', 'journal']
  },
  [AccessLevel.SPECIALIST]: {
    routes: ['/leads', '/clients', '/my-reports', '/dashboard'],
    features: ['leads', 'clients', 'dashboard', 'journal']
  },
  [AccessLevel.TECHNICIAN]: {
    routes: ['/tasks', '/claims', '/my-reports', '/dashboard'],
    features: ['tasks', 'claims', 'dashboard', 'journal']
  },
  [AccessLevel.TRAINER]: {
    routes: ['/staff', '/tasks', '/my-reports', '/dashboard'],
    features: ['staff', 'tasks', 'dashboard', 'journal']
  },
  [AccessLevel.RESEARCHER]: {
    routes: ['/leads', '/clients', '/my-reports', '/dashboard'],
    features: ['leads', 'clients', 'dashboard', 'journal', 'reports']
  },
  [AccessLevel.OFFICER]: {
    routes: ['/claims', '/tasks', '/my-reports', '/dashboard'],
    features: ['claims', 'tasks', 'dashboard', 'journal']
  },
  [AccessLevel.EXECUTIVE]: {
    routes: ['*'],
    features: Object.values(SERVER_FEATURES)
  },
  [AccessLevel.CASHIER]: {
    routes: ['/quotations', '/my-reports', '/dashboard'],
    features: ['quotations', 'dashboard', 'journal']
  },
  [AccessLevel.RECEPTIONIST]: {
    routes: ['/leads', '/clients', '/my-reports', '/dashboard'],
    features: ['leads', 'clients', 'dashboard', 'journal']
  },
  [AccessLevel.SECRETARY]: {
    routes: ['/tasks', '/leads', '/my-reports', '/dashboard'],
    features: ['tasks', 'leads', 'dashboard', 'journal']
  },
  [AccessLevel.SECURITY]: {
    routes: ['/staff', '/my-reports', '/dashboard'],
    features: ['staff', 'dashboard', 'journal']
  },
  [AccessLevel.CLEANER]: {
    routes: ['/tasks', '/my-reports', '/dashboard'],
    features: ['tasks', 'dashboard', 'journal']
  },
  [AccessLevel.MAINTENANCE]: {
    routes: ['/tasks', '/claims', '/my-reports', '/dashboard'],
    features: ['tasks', 'claims', 'dashboard', 'journal']
  },
  [AccessLevel.EVENT_PLANNER]: {
    routes: ['/leads', '/clients', '/my-reports', '/dashboard'],
    features: ['leads', 'clients', 'dashboard', 'journal']
  },
  [AccessLevel.MARKETING]: {
    routes: ['/leads', '/clients', '/my-reports', '/dashboard'],
    features: ['leads', 'clients', 'dashboard', 'journal']
  },
  [AccessLevel.HR]: {
    routes: ['/staff', '/claims', '/my-reports', '/dashboard'],
    features: ['staff', 'claims', 'dashboard', 'journal']
  },
  [AccessLevel.CLIENT]: {
    routes: ['/quotations', '/my-reports'],
    features: ['quotations', 'journal']
  },
};
