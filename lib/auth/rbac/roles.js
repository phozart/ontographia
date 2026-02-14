// lib/auth/rbac/roles.js
// Role definitions for Ontographia V2 RBAC system

/**
 * System role hierarchy (from highest to lowest privilege)
 * Each role inherits all permissions from roles below it
 */
export const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  DOMAIN_ADMIN: 'domain_admin',
  PROJECT_ADMIN: 'project_admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
});

/**
 * Role hierarchy - higher index = more privileges
 * Used for role comparison and inheritance
 */
export const ROLE_HIERARCHY = Object.freeze([
  ROLES.VIEWER,
  ROLES.EDITOR,
  ROLES.PROJECT_ADMIN,
  ROLES.DOMAIN_ADMIN,
  ROLES.SUPER_ADMIN,
]);

/**
 * Role metadata for display and configuration
 */
export const ROLE_METADATA = Object.freeze({
  [ROLES.SUPER_ADMIN]: {
    name: 'Super Admin',
    shortName: 'SA',
    description: 'Full system access - can manage all domains, projects, users, and system settings',
    color: '#dc2626', // red-600
    level: 4,
    scope: 'system',
  },
  [ROLES.DOMAIN_ADMIN]: {
    name: 'Domain Admin',
    shortName: 'DA',
    description: 'Domain-level access - can manage projects, users, and settings within their domain',
    color: '#7c3aed', // violet-600
    level: 3,
    scope: 'domain',
  },
  [ROLES.PROJECT_ADMIN]: {
    name: 'Project Admin',
    shortName: 'PA',
    description: 'Project-level access - can manage project settings, members, and all artefacts',
    color: '#2563eb', // blue-600
    level: 2,
    scope: 'project',
  },
  [ROLES.EDITOR]: {
    name: 'Editor',
    shortName: 'ED',
    description: 'Default role - can create and edit artefacts in assigned spaces',
    color: '#059669', // emerald-600
    level: 1,
    scope: 'project',
  },
  [ROLES.VIEWER]: {
    name: 'Viewer',
    shortName: 'VW',
    description: 'Read-only access - can view artefacts and export data',
    color: '#6b7280', // gray-500
    level: 0,
    scope: 'project',
  },
});

/**
 * Get role hierarchy level (higher = more privileges)
 * @param {string} role - Role identifier
 * @returns {number} Hierarchy level (0-4)
 */
export function getRoleLevel(role) {
  const index = ROLE_HIERARCHY.indexOf(role);
  return index >= 0 ? index : -1;
}

/**
 * Check if roleA has equal or higher privileges than roleB
 * @param {string} roleA - Role to check
 * @param {string} roleB - Role to compare against
 * @returns {boolean}
 */
export function isRoleAtLeast(roleA, roleB) {
  return getRoleLevel(roleA) >= getRoleLevel(roleB);
}

/**
 * Check if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean}
 */
export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

/**
 * Get role metadata
 * @param {string} role - Role identifier
 * @returns {Object|null}
 */
export function getRoleMetadata(role) {
  return ROLE_METADATA[role] || null;
}

/**
 * Get all roles as array with metadata
 * @returns {Array<{id: string, ...metadata}>}
 */
export function getAllRoles() {
  return Object.entries(ROLE_METADATA).map(([id, metadata]) => ({
    id,
    ...metadata,
  }));
}

/**
 * Get roles at or below a given level
 * @param {string} maxRole - Maximum role level
 * @returns {string[]}
 */
export function getRolesAtOrBelow(maxRole) {
  const maxLevel = getRoleLevel(maxRole);
  return ROLE_HIERARCHY.filter((_, index) => index <= maxLevel);
}

/**
 * Get the highest role from a list of roles
 * @param {string[]} roles - Array of roles
 * @returns {string|null}
 */
export function getHighestRole(roles) {
  if (!roles || roles.length === 0) return null;

  let highest = null;
  let highestLevel = -1;

  for (const role of roles) {
    const level = getRoleLevel(role);
    if (level > highestLevel) {
      highest = role;
      highestLevel = level;
    }
  }

  return highest;
}

export default ROLES;
