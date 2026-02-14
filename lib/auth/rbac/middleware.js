// lib/auth/rbac/middleware.js
// RBAC middleware for API routes in Ontographia V2

import { ROLES, isRoleAtLeast, isValidRole } from './roles.js';
import { PERMISSIONS, isValidPermission } from './permissions.js';
import {
  hasPermission,
  hasRole,
  canAccessProject,
  canAccessDomain,
  buildUserContext,
  getEffectiveRole,
} from './checker.js';
import { roleRepository } from '../../repositories/RoleRepository.js';

/**
 * Extract user info from request
 * Uses req.user (set by auth middleware) or returns null
 * @param {Object} req - Request object
 * @returns {{id: string|null, role: string|null}}
 */
export function getUserFromRequest(req) {
  if (req.user) {
    return {
      id: req.user.id || null,
      role: req.user.role || null,
    };
  }
  return { id: null, role: null };
}

/**
 * Enrich request with full user context
 * Loads user's roles from database and attaches to request
 * @param {Object} req - Request object
 * @returns {Promise<Object|null>} Enriched user object or null
 */
export async function enrichUserContext(req) {
  const basicUser = getUserFromRequest(req);

  if (!basicUser.id) {
    return null;
  }

  // Build full context with roles from database
  const enrichedUser = await buildUserContext(basicUser, async (userId) => {
    return roleRepository.getUserRoles(userId);
  });

  // Attach to request for downstream use
  req.user = enrichedUser;

  return enrichedUser;
}

/**
 * Higher-order function to wrap API handlers with permission check
 * @param {string} permission - Required permission
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.requireContext] - Whether to require domain/project context
 * @returns {Function} Wrapped handler
 */
export function withPermission(permission, options = {}) {
  if (!isValidPermission(permission)) {
    console.warn(`Invalid permission in middleware: ${permission}`);
  }

  return (handler) => {
    return async (req, res) => {
      // Enrich user context
      const user = await enrichUserContext(req);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Build context from query params
      const context = {
        domainId: req.query.domainId || req.body?.domainId,
        projectId: req.query.projectId || req.query.id || req.body?.projectId,
      };

      // Check if context is required
      if (options.requireContext) {
        if (!context.domainId && !context.projectId) {
          return res.status(400).json({ error: 'Domain or project context required' });
        }
      }

      // Check permission
      if (!hasPermission(user, permission, context)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: permission,
        });
      }

      // Call the actual handler
      return handler(req, res);
    };
  };
}

/**
 * Higher-order function to wrap API handlers with role check
 * @param {string} requiredRole - Minimum required role
 * @returns {Function} Wrapped handler
 */
export function withRole(requiredRole) {
  if (!isValidRole(requiredRole)) {
    console.warn(`Invalid role in middleware: ${requiredRole}`);
  }

  return (handler) => {
    return async (req, res) => {
      const user = await enrichUserContext(req);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const context = {
        domainId: req.query.domainId || req.body?.domainId,
        projectId: req.query.projectId || req.query.id || req.body?.projectId,
      };

      if (!hasRole(user, requiredRole, context)) {
        return res.status(403).json({
          error: 'Insufficient role',
          required: requiredRole,
          current: getEffectiveRole(user, context),
        });
      }

      return handler(req, res);
    };
  };
}

/**
 * Higher-order function to wrap API handlers with project access check
 * @param {string} permission - Permission required for the project
 * @returns {Function} Wrapped handler
 */
export function withProjectAccess(permission) {
  return (handler) => {
    return async (req, res) => {
      const user = await enrichUserContext(req);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Get project ID from various sources
      const projectId = req.query.projectId || req.query.id || req.body?.projectId;

      if (!projectId) {
        return res.status(400).json({ error: 'Project ID required' });
      }

      // Get project info for context
      let projectInfo = {};
      try {
        const { projectRepository } = await import('../../repositories/index.js');
        const project = await projectRepository.findById(projectId);
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
        projectInfo = {
          domainId: project.domain_id,
          createdBy: project.created_by,
        };
      } catch (err) {
        console.error('Failed to fetch project info:', err);
      }

      // Check project access
      if (!canAccessProject(user, projectId, projectInfo)) {
        return res.status(403).json({ error: 'Access to project denied' });
      }

      // Check specific permission if provided
      if (permission) {
        const context = { projectId, domainId: projectInfo.domainId };
        if (!hasPermission(user, permission, context)) {
          return res.status(403).json({
            error: 'Insufficient permissions for this action',
            required: permission,
          });
        }
      }

      // Attach project info to request
      req.project = projectInfo;
      req.projectId = projectId;

      return handler(req, res);
    };
  };
}

/**
 * Higher-order function to wrap API handlers with domain access check
 * @param {string} permission - Permission required for the domain
 * @returns {Function} Wrapped handler
 */
export function withDomainAccess(permission) {
  return (handler) => {
    return async (req, res) => {
      const user = await enrichUserContext(req);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const domainId = req.query.domainId || req.body?.domainId;

      if (!domainId) {
        return res.status(400).json({ error: 'Domain ID required' });
      }

      // Check domain access
      if (!canAccessDomain(user, domainId)) {
        return res.status(403).json({ error: 'Access to domain denied' });
      }

      // Check specific permission if provided
      if (permission) {
        const context = { domainId };
        if (!hasPermission(user, permission, context)) {
          return res.status(403).json({
            error: 'Insufficient permissions for this action',
            required: permission,
          });
        }
      }

      req.domainId = domainId;

      return handler(req, res);
    };
  };
}

/**
 * Higher-order function to require super admin role
 * @returns {Function} Wrapped handler
 */
export function withSuperAdmin() {
  return withRole(ROLES.SUPER_ADMIN);
}

/**
 * Higher-order function to require domain admin role
 * @returns {Function} Wrapped handler
 */
export function withDomainAdmin() {
  return withRole(ROLES.DOMAIN_ADMIN);
}

/**
 * Higher-order function to require project admin role
 * @returns {Function} Wrapped handler
 */
export function withProjectAdmin() {
  return withRole(ROLES.PROJECT_ADMIN);
}

/**
 * Compose multiple middleware together
 * @param {...Function} middlewares - Middleware functions to compose
 * @returns {Function} Composed handler
 */
export function compose(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight((acc, middleware) => {
      return middleware(acc);
    }, handler);
  };
}

/**
 * Create a handler that requires authentication but no specific permission
 * Useful for routes that just need a logged-in user
 * @returns {Function} Wrapped handler
 */
export function withAuth() {
  return (handler) => {
    return async (req, res) => {
      const user = await enrichUserContext(req);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      return handler(req, res);
    };
  };
}

/**
 * Create a handler that checks resource ownership or admin access
 * @param {Function} getOwnerId - Async function to get owner ID from request
 * @param {string} [adminPermission] - Permission that allows access regardless of ownership
 * @returns {Function} Wrapped handler
 */
export function withOwnershipOrPermission(getOwnerId, adminPermission) {
  return (handler) => {
    return async (req, res) => {
      const user = await enrichUserContext(req);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check ownership
      const ownerId = await getOwnerId(req);

      if (ownerId === user.id) {
        // Owner has access
        return handler(req, res);
      }

      // Check admin permission
      if (adminPermission) {
        const context = {
          domainId: req.query.domainId || req.body?.domainId,
          projectId: req.query.projectId || req.query.id || req.body?.projectId,
        };

        if (hasPermission(user, adminPermission, context)) {
          return handler(req, res);
        }
      }

      // Super admin bypass
      if (user.systemRole === ROLES.SUPER_ADMIN || user.role === 'admin') {
        return handler(req, res);
      }

      return res.status(403).json({ error: 'Access denied' });
    };
  };
}

/**
 * Middleware factory for common resource operations
 * @param {string} resource - Resource type (artefact, project, etc.)
 * @returns {Object} Object with view, create, edit, delete middleware
 */
export function resourceMiddleware(resource) {
  return {
    view: withPermission(`${resource}:view`),
    create: withPermission(`${resource}:create`),
    edit: withPermission(`${resource}:edit`),
    delete: withPermission(`${resource}:delete`),
  };
}

export default {
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
};
