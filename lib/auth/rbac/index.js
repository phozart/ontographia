// lib/auth/rbac/index.js
// Main exports for Ontographia V2 RBAC system

// Import for internal use (must be before usage in `can` object and default export)
import { hasPermission } from './checker.js';
import { PERMISSIONS, ROLE_PERMISSIONS } from './permissions.js';
import { ROLES, ROLE_HIERARCHY } from './roles.js';
import { SPACE_ACCESS_LEVELS } from './spaceAccess.js';

// Role definitions
export {
  ROLES,
  ROLE_HIERARCHY,
  ROLE_METADATA,
  getRoleLevel,
  isRoleAtLeast,
  isValidRole,
  getRoleMetadata,
  getAllRoles,
  getRolesAtOrBelow,
  getHighestRole,
} from './roles.js';

// Permission definitions
export {
  PERMISSIONS,
  PERMISSION_METADATA,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  roleHasPermission,
  getPermissionsByCategory,
  getPermissionMetadata,
  isValidPermission,
  getRequiredPermission,
} from './permissions.js';

// Permission checker utilities
export {
  hasPermission,
  hasRole,
  getEffectiveRole,
  getUserPermissions,
  canAccessProject,
  canAccessDomain,
  canPerformAction,
  canAssignRole,
  getRoleSummary,
  buildUserContext,
  clearUserCache,
  clearAllCache,
} from './checker.js';

// Middleware
export {
  getUserFromRequest,
  enrichUserContext,
  withPermission,
  withRole,
  withProjectAccess,
  withDomainAccess,
  withSuperAdmin,
  withDomainAdmin,
  withProjectAdmin,
  withAuth,
  withOwnershipOrPermission,
  compose,
  resourceMiddleware,
} from './middleware.js';

// Space access control
export {
  SPACE_ACCESS_LEVELS,
  DEFAULT_SPACE_ACCESS,
  canAccessSpace,
  canEditInSpace,
  canAdminSpace,
  getSpaceAccessLevel,
  getAccessibleSpaces,
  setSpaceAccess,
  getSpacesByCategory,
  requireSpaceAccess,
} from './spaceAccess.js';

/**
 * Quick permission check for common operations
 * Convenience functions that combine permission and context checking
 */
export const can = {
  // System operations
  manageSystem: (user) => hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS),
  viewAuditLogs: (user) => hasPermission(user, PERMISSIONS.SYSTEM_AUDIT),

  // Domain operations
  createDomain: (user) => hasPermission(user, PERMISSIONS.DOMAIN_CREATE),
  manageDomain: (user, domainId) => hasPermission(user, PERMISSIONS.DOMAIN_MANAGE, { domainId }),
  viewDomain: (user, domainId) => hasPermission(user, PERMISSIONS.DOMAIN_VIEW, { domainId }),

  // Project operations
  createProject: (user, domainId) => hasPermission(user, PERMISSIONS.PROJECT_CREATE, { domainId }),
  manageProject: (user, projectId, domainId) =>
    hasPermission(user, PERMISSIONS.PROJECT_MANAGE, { projectId, domainId }),
  deleteProject: (user, projectId, domainId) =>
    hasPermission(user, PERMISSIONS.PROJECT_DELETE, { projectId, domainId }),
  viewProject: (user, projectId, domainId) =>
    hasPermission(user, PERMISSIONS.PROJECT_VIEW, { projectId, domainId }),

  // Artefact operations
  createArtefact: (user, projectId, domainId) =>
    hasPermission(user, PERMISSIONS.ARTEFACT_CREATE, { projectId, domainId }),
  editArtefact: (user, projectId, domainId) =>
    hasPermission(user, PERMISSIONS.ARTEFACT_EDIT, { projectId, domainId }),
  deleteArtefact: (user, projectId, domainId) =>
    hasPermission(user, PERMISSIONS.ARTEFACT_DELETE, { projectId, domainId }),
  approveArtefact: (user, projectId, domainId) =>
    hasPermission(user, PERMISSIONS.ARTEFACT_APPROVE, { projectId, domainId }),

  // User operations
  inviteUsers: (user, context) => hasPermission(user, PERMISSIONS.USER_INVITE, context),
  assignRoles: (user, context) => hasPermission(user, PERMISSIONS.USER_ROLE_ASSIGN, context),

  // Space operations - All authenticated users can access/edit/admin spaces based on their project permissions
  accessSpace: (user, spaceCode, context) => hasPermission(user, PERMISSIONS.PROJECT_VIEW, context),
  editInSpace: (user, spaceCode, context) => hasPermission(user, PERMISSIONS.PROJECT_EDIT, context),
  adminSpace: (user, spaceCode, context) => hasPermission(user, PERMISSIONS.PROJECT_MANAGE, context),
};

/**
 * Default export with all RBAC functionality
 */
export default {
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  SPACE_ACCESS_LEVELS,
  can,
};
