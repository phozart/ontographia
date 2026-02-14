// lib/graphql/context.js
// GraphQL context factory for request-scoped dependencies

import { createDataLoaders } from './dataloaders';
import { getUserFromRequest } from '../projectAccess';
import { artefactRepository } from '../repositories/ArtefactRepository';
import { query } from '../pg';

/**
 * Create the GraphQL context for each request
 * This function is called for every incoming GraphQL request
 *
 * The context includes:
 * - user: The authenticated user from request headers
 * - loaders: DataLoaders for batching (request-scoped to ensure proper caching)
 * - repositories: Database repositories for CRUD operations
 * - db: Direct database query function for complex queries
 *
 * @param {Object} params - Context parameters from graphql-yoga
 * @param {Request} params.request - The incoming HTTP request
 * @returns {Object} The GraphQL context object
 */
export function createContext({ request }) {
  // Extract user from headers (following existing auth pattern)
  const { user, role } = extractUserFromRequest(request);

  // Create request-scoped DataLoaders
  // Important: Each request gets fresh loaders to prevent stale data
  const loaders = createDataLoaders();

  return {
    // User authentication
    user,
    role,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',

    // DataLoaders for N+1 prevention
    loaders,

    // Repositories for CRUD operations
    repositories: {
      artefact: artefactRepository,
    },

    // Direct database access for complex queries
    db: {
      query,
    },

    // Helper methods
    helpers: {
      /**
       * Check if user is authenticated and throw if not
       */
      requireAuth() {
        if (!user) {
          throw new Error('Authentication required');
        }
        return { user, role };
      },

      /**
       * Check if user is admin and throw if not
       */
      requireAdmin() {
        if (!user) {
          throw new Error('Authentication required');
        }
        if (role !== 'admin') {
          throw new Error('Admin privileges required');
        }
        return { user, role };
      },

      /**
       * Check user access to a domain
       */
      async checkDomainAccess(domainId, requiredPermission = 'view') {
        if (!user) {
          return { hasAccess: false, error: 'Authentication required' };
        }

        // Admins have full access
        if (role === 'admin') {
          return { hasAccess: true, domainRole: 'owner' };
        }

        // Check domain membership
        const result = await query(
          `SELECT role FROM domain_members WHERE domain_id = $1 AND user_id = $2`,
          [domainId, user]
        );

        if (result.rows.length === 0) {
          return { hasAccess: false, error: 'Not a member of this domain' };
        }

        const domainRole = result.rows[0].role;
        const permissions = getDomainPermissions(domainRole);

        if (!permissions.includes(requiredPermission)) {
          return {
            hasAccess: false,
            error: `Insufficient permissions for ${requiredPermission}`,
          };
        }

        return { hasAccess: true, domainRole };
      },

      /**
       * Check user access to a project
       */
      async checkProjectAccess(projectId, requiredPermission = 'view') {
        if (!user) {
          return { hasAccess: false, error: 'Authentication required' };
        }

        // Admins have full access
        if (role === 'admin') {
          return { hasAccess: true, projectRole: 'Business Analyst' };
        }

        // Check if project creator
        const projectResult = await query(
          `SELECT created_by FROM projects WHERE id = $1`,
          [projectId]
        );

        if (projectResult.rows.length === 0) {
          return { hasAccess: false, error: 'Project not found' };
        }

        if (projectResult.rows[0].created_by === user) {
          return { hasAccess: true, projectRole: 'Business Analyst' };
        }

        // Check project membership
        const memberResult = await query(
          `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
          [projectId, user]
        );

        if (memberResult.rows.length === 0) {
          return { hasAccess: false, error: 'Not a member of this project' };
        }

        const projectRole = memberResult.rows[0].role;
        const permissions = getProjectPermissions(projectRole);

        if (!permissions.includes(requiredPermission)) {
          return {
            hasAccess: false,
            error: `Insufficient permissions for ${requiredPermission}`,
          };
        }

        return { hasAccess: true, projectRole };
      },
    },
  };
}

/**
 * Extract user info from the Request object
 * Following the existing pattern from lib/projectAccess.js
 */
function extractUserFromRequest(request) {
  // For graphql-yoga, headers are accessed via request.headers
  const headers = request.headers;

  // Support both Request object (has .get method) and plain object
  const getHeader = (name) => {
    if (typeof headers.get === 'function') {
      return headers.get(name);
    }
    return headers[name] || headers[name.toLowerCase()];
  };

  return {
    user: getHeader('x-user') || null,
    role: getHeader('x-role') || null,
  };
}

/**
 * Get permissions for a domain role
 */
function getDomainPermissions(role) {
  const permissions = {
    owner: ['view', 'create', 'edit', 'delete', 'manage'],
    admin: ['view', 'create', 'edit', 'delete'],
    member: ['view', 'create', 'edit'],
    viewer: ['view'],
  };
  return permissions[role] || ['view'];
}

/**
 * Get permissions for a project role
 */
function getProjectPermissions(role) {
  const permissions = {
    'Business Analyst': ['view', 'create', 'edit', 'delete', 'approve', 'comment', 'manage_documents'],
    'Product Owner': ['view', 'create', 'edit', 'approve', 'comment', 'manage_documents'],
    Stakeholder: ['view', 'approve', 'comment'],
    Viewer: ['view'],
  };
  return permissions[role] || ['view'];
}

export default createContext;
