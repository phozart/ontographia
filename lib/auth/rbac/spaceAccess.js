// lib/auth/rbac/spaceAccess.js
// Space-specific access control for Ontographia V2

import { ROLES, isRoleAtLeast } from './roles.js';
import { PERMISSIONS, roleHasPermission } from './permissions.js';
import { getEffectiveRole, hasPermission } from './checker.js';
import { SPACES } from '../../spaceRegistry.js';

/**
 * Space access levels
 */
export const SPACE_ACCESS_LEVELS = Object.freeze({
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
  ADMIN: 'admin',
});

/**
 * Default space access by role
 * Defines what spaces each role can access by default
 */
export const DEFAULT_SPACE_ACCESS = Object.freeze({
  [ROLES.SUPER_ADMIN]: {
    default: SPACE_ACCESS_LEVELS.ADMIN,
    spaces: {}, // All spaces at admin level
  },
  [ROLES.DOMAIN_ADMIN]: {
    default: SPACE_ACCESS_LEVELS.ADMIN,
    spaces: {},
  },
  [ROLES.PROJECT_ADMIN]: {
    default: SPACE_ACCESS_LEVELS.EDIT,
    spaces: {
      // Project admins can admin project-related spaces
      ba: SPACE_ACCESS_LEVELS.ADMIN,
      pds: SPACE_ACCESS_LEVELS.ADMIN,
      // New main flow studios
      blueprint: SPACE_ACCESS_LEVELS.EDIT,
      analysis: SPACE_ACCESS_LEVELS.ADMIN,
      enterprise: SPACE_ACCESS_LEVELS.EDIT,
      gtm: SPACE_ACCESS_LEVELS.EDIT,
    },
  },
  [ROLES.EDITOR]: {
    default: SPACE_ACCESS_LEVELS.EDIT,
    spaces: {},
  },
  [ROLES.VIEWER]: {
    default: SPACE_ACCESS_LEVELS.VIEW,
    spaces: {},
  },
});

/**
 * Check if user can access a specific space
 * @param {Object} user - User object with roles
 * @param {string} spaceCode - Space code (e.g., 'ea', 'ba')
 * @param {Object} [context] - Context with domainId, projectId
 * @returns {boolean}
 */
export function canAccessSpace(user, spaceCode, context = {}) {
  if (!user) return false;

  // Validate space exists
  const space = SPACES[spaceCode];
  if (!space) {
    console.warn(`Unknown space: ${spaceCode}`);
    return false;
  }

  // Super admin can access all spaces
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  // Get effective role
  const effectiveRole = getEffectiveRole(user, context);

  if (!effectiveRole) {
    return false;
  }

  // Check if role has space access permission
  if (!roleHasPermission(effectiveRole, PERMISSIONS.SPACE_ACCESS)) {
    return false;
  }

  // Check custom space access if defined
  if (user.spaceAccess && user.spaceAccess[spaceCode]) {
    const access = user.spaceAccess[spaceCode];
    return access !== SPACE_ACCESS_LEVELS.NONE;
  }

  // Check project space requirement
  if (space.requiresProject && !context.projectId) {
    // Space requires project context
    // User needs to have project access
    if (!user.projectRoles || Object.keys(user.projectRoles).length === 0) {
      return false;
    }
  }

  // Check domain space requirement
  if (space.requiresDomain && !context.domainId) {
    // Space requires domain context
    if (!user.domainRoles || Object.keys(user.domainRoles).length === 0) {
      // Check if user has a personal domain
      if (!user.personalDomainId) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if user can edit in a specific space
 * @param {Object} user - User object
 * @param {string} spaceCode - Space code
 * @param {Object} [context] - Context
 * @returns {boolean}
 */
export function canEditInSpace(user, spaceCode, context = {}) {
  if (!user) return false;

  // First check basic access
  if (!canAccessSpace(user, spaceCode, context)) {
    return false;
  }

  // Super admin can edit all spaces
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  // Get effective role
  const effectiveRole = getEffectiveRole(user, context);

  if (!effectiveRole) {
    return false;
  }

  // Check if role has space edit permission
  if (!roleHasPermission(effectiveRole, PERMISSIONS.SPACE_EDIT)) {
    return false;
  }

  // Check custom space access level
  if (user.spaceAccess && user.spaceAccess[spaceCode]) {
    const access = user.spaceAccess[spaceCode];
    return access === SPACE_ACCESS_LEVELS.EDIT || access === SPACE_ACCESS_LEVELS.ADMIN;
  }

  // Check default access for role
  const defaultAccess = DEFAULT_SPACE_ACCESS[effectiveRole];
  if (defaultAccess) {
    const spaceLevel = defaultAccess.spaces[spaceCode] || defaultAccess.default;
    return spaceLevel === SPACE_ACCESS_LEVELS.EDIT || spaceLevel === SPACE_ACCESS_LEVELS.ADMIN;
  }

  return false;
}

/**
 * Check if user can administer a specific space
 * @param {Object} user - User object
 * @param {string} spaceCode - Space code
 * @param {Object} [context] - Context
 * @returns {boolean}
 */
export function canAdminSpace(user, spaceCode, context = {}) {
  if (!user) return false;

  // Super admin can admin all spaces
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return true;
  }

  // Get effective role
  const effectiveRole = getEffectiveRole(user, context);

  if (!effectiveRole) {
    return false;
  }

  // Check if role has space admin permission
  if (!roleHasPermission(effectiveRole, PERMISSIONS.SPACE_ADMIN)) {
    return false;
  }

  // Check custom space access level
  if (user.spaceAccess && user.spaceAccess[spaceCode]) {
    return user.spaceAccess[spaceCode] === SPACE_ACCESS_LEVELS.ADMIN;
  }

  // Check default access for role
  const defaultAccess = DEFAULT_SPACE_ACCESS[effectiveRole];
  if (defaultAccess) {
    const spaceLevel = defaultAccess.spaces[spaceCode] || defaultAccess.default;
    return spaceLevel === SPACE_ACCESS_LEVELS.ADMIN;
  }

  return false;
}

/**
 * Get user's access level for a space
 * @param {Object} user - User object
 * @param {string} spaceCode - Space code
 * @param {Object} [context] - Context
 * @returns {string} Access level
 */
export function getSpaceAccessLevel(user, spaceCode, context = {}) {
  if (!user) return SPACE_ACCESS_LEVELS.NONE;

  // Super admin has admin access to all
  if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
    return SPACE_ACCESS_LEVELS.ADMIN;
  }

  // Check if can access at all
  if (!canAccessSpace(user, spaceCode, context)) {
    return SPACE_ACCESS_LEVELS.NONE;
  }

  // Check custom space access
  if (user.spaceAccess && user.spaceAccess[spaceCode]) {
    return user.spaceAccess[spaceCode];
  }

  // Get from role defaults
  const effectiveRole = getEffectiveRole(user, context);
  const defaultAccess = DEFAULT_SPACE_ACCESS[effectiveRole];

  if (defaultAccess) {
    return defaultAccess.spaces[spaceCode] || defaultAccess.default;
  }

  return SPACE_ACCESS_LEVELS.VIEW;
}

/**
 * Get all accessible spaces for a user
 * @param {Object} user - User object
 * @param {Object} [context] - Context
 * @returns {Array<{code: string, name: string, accessLevel: string}>}
 */
export function getAccessibleSpaces(user, context = {}) {
  if (!user) return [];

  const result = [];

  for (const [code, space] of Object.entries(SPACES)) {
    const accessLevel = getSpaceAccessLevel(user, code, context);

    if (accessLevel !== SPACE_ACCESS_LEVELS.NONE) {
      result.push({
        code,
        name: space.name,
        description: space.description,
        accessLevel,
        canEdit: accessLevel === SPACE_ACCESS_LEVELS.EDIT || accessLevel === SPACE_ACCESS_LEVELS.ADMIN,
        canAdmin: accessLevel === SPACE_ACCESS_LEVELS.ADMIN,
        requiresDomain: space.requiresDomain,
        requiresProject: space.requiresProject,
        defaultView: space.defaultView,
        views: space.views,
        icon: space.icon,
        color: space.color,
      });
    }
  }

  return result;
}

/**
 * Set custom space access for a user
 * @param {Object} user - User object to modify
 * @param {string} spaceCode - Space code
 * @param {string} accessLevel - Access level to set
 * @returns {Object} Modified user object
 */
export function setSpaceAccess(user, spaceCode, accessLevel) {
  if (!user) return user;

  // Validate space
  if (!SPACES[spaceCode]) {
    throw new Error(`Invalid space code: ${spaceCode}`);
  }

  // Validate access level
  if (!Object.values(SPACE_ACCESS_LEVELS).includes(accessLevel)) {
    throw new Error(`Invalid access level: ${accessLevel}`);
  }

  // Initialize spaceAccess if needed
  if (!user.spaceAccess) {
    user.spaceAccess = {};
  }

  user.spaceAccess[spaceCode] = accessLevel;

  return user;
}

/**
 * Get spaces grouped by category with access levels
 * @param {Object} user - User object
 * @param {Object} [context] - Context
 * @returns {Object} Spaces grouped by category
 */
export function getSpacesByCategory(user, context = {}) {
  const accessible = getAccessibleSpaces(user, context);

  const categories = {
    'Main Flow': [],
    'Enterprise & Architecture': [],
    'Delivery & Requirements': [],
    'Reasoning & Thinking': [],
    'Operations & Governance': [],
    'Learning & Work Design': [],
    'Development': [],
    'Tools': [],
  };

  // Map spaces to categories
  const spaceToCategory = {
    // Main Flow Studios (new consolidated structure)
    blueprint: 'Main Flow',
    analysis: 'Main Flow',
    enterprise: 'Main Flow',
    gtm: 'Main Flow',
    // Legacy categories
    ea: 'Enterprise & Architecture',
    sd: 'Enterprise & Architecture',
    ba: 'Delivery & Requirements',
    pdw: 'Delivery & Requirements',
    pds: 'Delivery & Requirements',
    als: 'Learning & Work Design',
    dwd: 'Learning & Work Design',
    diagram: 'Tools',
    ks: 'Tools',
  };

  for (const space of accessible) {
    const category = spaceToCategory[space.code] || 'Tools';
    if (categories[category]) {
      categories[category].push(space);
    }
  }

  // Filter out empty categories
  return Object.fromEntries(
    Object.entries(categories).filter(([, spaces]) => spaces.length > 0)
  );
}

/**
 * Middleware to check space access
 * @param {string} spaceCode - Required space
 * @param {string} [accessLevel] - Required access level (default: 'view')
 * @returns {Function} Middleware function
 */
export function requireSpaceAccess(spaceCode, accessLevel = SPACE_ACCESS_LEVELS.VIEW) {
  return (handler) => {
    return async (req, res) => {
      const { enrichUserContext } = await import('./middleware.js');
      const user = await enrichUserContext(req);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const context = {
        domainId: req.query.domainId || req.body?.domainId,
        projectId: req.query.projectId || req.query.id || req.body?.projectId,
      };

      const userAccessLevel = getSpaceAccessLevel(user, spaceCode, context);

      // Check access level hierarchy
      const levelHierarchy = [
        SPACE_ACCESS_LEVELS.NONE,
        SPACE_ACCESS_LEVELS.VIEW,
        SPACE_ACCESS_LEVELS.EDIT,
        SPACE_ACCESS_LEVELS.ADMIN,
      ];

      const requiredIndex = levelHierarchy.indexOf(accessLevel);
      const userIndex = levelHierarchy.indexOf(userAccessLevel);

      if (userIndex < requiredIndex) {
        return res.status(403).json({
          error: 'Insufficient space access',
          space: spaceCode,
          required: accessLevel,
          current: userAccessLevel,
        });
      }

      req.spaceCode = spaceCode;
      req.spaceAccessLevel = userAccessLevel;

      return handler(req, res);
    };
  };
}

export default {
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
};
