// lib/auth/rbac/checker.js
// Permission checking utilities for Ontographia V2 RBAC system

import { ROLES, getRoleLevel, isRoleAtLeast, getHighestRole } from './roles.js';
import { PERMISSIONS, roleHasPermission, getPermissionsForRole } from './permissions.js';

// In-memory permission cache with TTL
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache key generator
 * @param {string} userId
 * @param {string} [contextType]
 * @param {string} [contextId]
 * @returns {string}
 */
function getCacheKey(userId, contextType, contextId) {
  return `${userId}:${contextType || 'global'}:${contextId || 'all'}`;
}

/**
 * Get cached permissions or null if expired/missing
 * @param {string} cacheKey
 * @returns {Object|null}
 */
function getCachedPermissions(cacheKey) {
  const cached = permissionCache.get(cacheKey);
  if (!cached) return null;

  if (Date.now() > cached.expiry) {
    permissionCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

/**
 * Cache permissions
 * @param {string} cacheKey
 * @param {Object} data
 */
function setCachedPermissions(cacheKey, data) {
  permissionCache.set(cacheKey, {
    data,
    expiry: Date.now() + CACHE_TTL,
  });
}

/**
 * Clear cache for a user (call after role changes)
 * @param {string} userId
 */
export function clearUserCache(userId) {
  for (const key of permissionCache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      permissionCache.delete(key);
    }
  }
}

/**
 * Clear entire permission cache
 */
export function clearAllCache() {
  permissionCache.clear();
}

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with roles
 * @param {string} permission - Permission to check
 * @param {Object} [context] - Optional context (domain, project)
 * @returns {boolean}
 */
export function hasPermission(user, permission, context = {}) {
  if (!user) return false;

  // Super admin has all permissions
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  // Get effective role for the context
  const effectiveRole = getEffectiveRole(user, context);

  if (!effectiveRole) {
    return false;
  }

  return roleHasPermission(effectiveRole, permission);
}

/**
 * Check if user has a specific role or higher
 * @param {Object} user - User object
 * @param {string} requiredRole - Minimum required role
 * @param {Object} [context] - Optional context
 * @returns {boolean}
 */
export function hasRole(user, requiredRole, context = {}) {
  if (!user) return false;

  // Super admin passes all role checks
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  const effectiveRole = getEffectiveRole(user, context);

  if (!effectiveRole) {
    return false;
  }

  return isRoleAtLeast(effectiveRole, requiredRole);
}

/**
 * Get user's effective role in a context
 * Priority: project role > domain role > system role
 * @param {Object} user - User object
 * @param {Object} context - Context with domainId and/or projectId
 * @returns {string|null}
 */
export function getEffectiveRole(user, context = {}) {
  if (!user) return null;

  const { domainId, projectId } = context;

  // Collect all applicable roles
  const roles = [];

  // System role (from legacy 'role' field or new systemRole)
  if (user.systemRole) {
    roles.push(user.systemRole);
  } else if (user.role === 'admin') {
    return ROLES.SUPER_ADMIN;
  } else if (user.role === 'editor') {
    roles.push(ROLES.EDITOR);
  } else if (user.role === 'viewer') {
    roles.push(ROLES.VIEWER);
  }

  // Domain-level role
  if (domainId && user.domainRoles) {
    const domainRole = user.domainRoles[domainId];
    if (domainRole) {
      roles.push(domainRole);
    }
  }

  // Project-level role
  if (projectId && user.projectRoles) {
    const projectRole = user.projectRoles[projectId];
    if (projectRole) {
      roles.push(projectRole);
    }
  }

  // Return highest role
  return getHighestRole(roles);
}

/**
 * Get all permissions for a user in a context
 * @param {Object} user - User object
 * @param {Object} [context] - Optional context
 * @returns {string[]} Array of permission strings
 */
export function getUserPermissions(user, context = {}) {
  if (!user) return [];

  const effectiveRole = getEffectiveRole(user, context);

  if (!effectiveRole) {
    return [];
  }

  return getPermissionsForRole(effectiveRole);
}

/**
 * Check if user can access a project
 * @param {Object} user - User object
 * @param {string} projectId - Project ID
 * @param {Object} [projectInfo] - Optional project metadata (domainId, createdBy)
 * @returns {boolean}
 */
export function canAccessProject(user, projectId, projectInfo = {}) {
  if (!user || !projectId) return false;

  // Super admin can access all projects
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  // Project creator always has access
  if (projectInfo.createdBy === user.id) {
    return true;
  }

  // Check project-level role
  if (user.projectRoles && user.projectRoles[projectId]) {
    return true;
  }

  // Check domain-level role (domain admins can access all projects in domain)
  if (projectInfo.domainId && user.domainRoles) {
    const domainRole = user.domainRoles[projectInfo.domainId];
    if (domainRole && isRoleAtLeast(domainRole, ROLES.DOMAIN_ADMIN)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can access a domain
 * @param {Object} user - User object
 * @param {string} domainId - Domain ID
 * @returns {boolean}
 */
export function canAccessDomain(user, domainId) {
  if (!user || !domainId) return false;

  // Super admin can access all domains
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  // Check domain membership
  if (user.domainRoles && user.domainRoles[domainId]) {
    return true;
  }

  // Check if user's personal domain
  if (user.personalDomainId === domainId) {
    return true;
  }

  return false;
}

/**
 * Check if user can perform action on resource
 * @param {Object} user - User object
 * @param {string} resource - Resource type
 * @param {string} action - Action (create, edit, delete, view)
 * @param {Object} [context] - Context with domainId, projectId, resourceOwnerId
 * @returns {boolean}
 */
export function canPerformAction(user, resource, action, context = {}) {
  if (!user) return false;

  // Build permission string
  const permission = `${resource}:${action}`;

  // Check if permission exists
  if (!Object.values(PERMISSIONS).includes(permission)) {
    console.warn(`Unknown permission: ${permission}`);
    return false;
  }

  // Super admin bypass
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  // Check permission in context
  return hasPermission(user, permission, context);
}

/**
 * Get user's role assignment summary
 * @param {Object} user - User object
 * @returns {Object} Summary of roles
 */
export function getRoleSummary(user) {
  if (!user) {
    return {
      systemRole: null,
      domainCount: 0,
      projectCount: 0,
      highestRole: null,
    };
  }

  const allRoles = [];

  if (user.systemRole) {
    allRoles.push(user.systemRole);
  }

  const domainRoles = user.domainRoles || {};
  const projectRoles = user.projectRoles || {};

  allRoles.push(...Object.values(domainRoles));
  allRoles.push(...Object.values(projectRoles));

  return {
    systemRole: user.systemRole || null,
    domainCount: Object.keys(domainRoles).length,
    projectCount: Object.keys(projectRoles).length,
    highestRole: getHighestRole(allRoles),
    domainRoles,
    projectRoles,
  };
}

/**
 * Validate that assigner can assign a role to target
 * Users can only assign roles at or below their own level
 * @param {Object} assigner - User assigning the role
 * @param {string} roleToAssign - Role being assigned
 * @param {Object} [context] - Context for the assignment
 * @returns {{allowed: boolean, reason: string|null}}
 */
export function canAssignRole(assigner, roleToAssign, context = {}) {
  if (!assigner) {
    return { allowed: false, reason: 'No assigner provided' };
  }

  // Super admin can assign any role
  if (assigner.systemRole === ROLES.SUPER_ADMIN || assigner.role === 'admin') {
    return { allowed: true, reason: null };
  }

  const assignerRole = getEffectiveRole(assigner, context);

  if (!assignerRole) {
    return { allowed: false, reason: 'Assigner has no role in this context' };
  }

  // Check if assigner has USER_ROLE_ASSIGN permission
  if (!roleHasPermission(assignerRole, PERMISSIONS.USER_ROLE_ASSIGN)) {
    return { allowed: false, reason: 'Assigner does not have role assignment permission' };
  }

  // Assigner can only assign roles at or below their level
  if (!isRoleAtLeast(assignerRole, roleToAssign)) {
    return { allowed: false, reason: 'Cannot assign a role higher than your own' };
  }

  // Domain admins cannot assign super_admin
  if (roleToAssign === ROLES.SUPER_ADMIN && assignerRole !== ROLES.SUPER_ADMIN) {
    return { allowed: false, reason: 'Only super admins can assign super admin role' };
  }

  return { allowed: true, reason: null };
}

/**
 * Build user context from request headers and database lookups
 * This is used by middleware to enrich the user object
 * @param {Object} basicUser - Basic user info from request
 * @param {Function} getRoles - Async function to fetch roles from DB
 * @returns {Promise<Object>} Enriched user object
 */
export async function buildUserContext(basicUser, getRoles) {
  if (!basicUser || !basicUser.id) {
    return null;
  }

  const cacheKey = getCacheKey(basicUser.id, 'context', 'all');
  const cached = getCachedPermissions(cacheKey);

  if (cached) {
    return { ...basicUser, ...cached };
  }

  try {
    const roles = await getRoles(basicUser.id);

    const enrichedUser = {
      ...basicUser,
      systemRole: roles.systemRole || null,
      domainRoles: roles.domainRoles || {},
      projectRoles: roles.projectRoles || {},
    };

    // Map legacy role field to system role
    if (!enrichedUser.systemRole && basicUser.role === 'admin') {
      enrichedUser.systemRole = ROLES.SUPER_ADMIN;
    }

    setCachedPermissions(cacheKey, {
      systemRole: enrichedUser.systemRole,
      domainRoles: enrichedUser.domainRoles,
      projectRoles: enrichedUser.projectRoles,
    });

    return enrichedUser;
  } catch (err) {
    console.error('Failed to build user context:', err);
    return basicUser;
  }
}

export default {
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
};
