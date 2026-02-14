// lib/auth/withApiAuth.js
// Higher-order function for API route authentication
// Provides JWT validation and RBAC integration for Next.js API routes

import { verifyToken, extractBearerToken } from './jwt';
import { getUserFromRequest, getRefreshTokenFromCookies } from './middleware';
import { hasPermission, hasRole, canAccessProject, canAccessDomain } from './rbac';
import { userRepository } from '../repositories';

/**
 * Authentication error response helper
 * @param {Object} res - Next.js response object
 * @param {number} status - HTTP status code
 * @param {string} error - Error message
 * @param {string} code - Error code
 * @returns {Object} JSON response
 */
function authError(res, status, error, code) {
  return res.status(status).json({
    error,
    code,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Extract and validate user from JWT token
 * @param {Object} req - Next.js request object
 * @returns {Promise<Object|null>} User object or null
 */
async function extractUserFromToken(req) {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (token) {
    const result = verifyToken(token);

    if (result.valid && result.payload) {
      const { sub: userId, username, role, email } = result.payload;

      // Optionally fetch fresh user data from database
      if (userId) {
        try {
          const user = await userRepository.findById(userId);
          if (user) {
            return user;
          }
        } catch (err) {
          console.error('[withApiAuth] Error fetching user:', err);
        }
      }

      // Fall back to token payload
      return {
        id: userId,
        username,
        email,
        role,
        _fromToken: true,
      };
    }
  }

  return null;
}

/**
 * withApiAuth - Higher-order function for API route authentication
 *
 * Validates JWT tokens and optionally checks permissions.
 * Attaches user object to req for handler use.
 *
 * @param {Function} handler - API route handler
 * @param {Object} [options] - Auth options
 * @param {string} [options.requiredPermission] - Required permission
 * @param {string} [options.requiredRole] - Required role (viewer, editor, admin)
 * @param {boolean} [options.optional=false] - Make auth optional
 * @param {Function} [options.getContext] - Function to extract context from request
 * @returns {Function} Wrapped handler with authentication
 *
 * @example
 * // Basic authentication
 * export default withApiAuth(handler);
 *
 * @example
 * // With permission check
 * export default withApiAuth(handler, {
 *   requiredPermission: 'artefact:create',
 * });
 *
 * @example
 * // With role check
 * export default withApiAuth(handler, {
 *   requiredRole: 'editor',
 * });
 *
 * @example
 * // Optional auth (user attached if authenticated)
 * export default withApiAuth(handler, {
 *   optional: true,
 * });
 *
 * @example
 * // With context for permission checking
 * export default withApiAuth(handler, {
 *   requiredPermission: 'project:edit',
 *   getContext: (req) => ({
 *     projectId: req.query.projectId,
 *     domainId: req.query.domainId,
 *   }),
 * });
 */
export function withApiAuth(handler, options = {}) {
  const {
    requiredPermission,
    requiredRole,
    optional = false,
    getContext,
  } = options;

  return async function authenticatedHandler(req, res) {
    try {
      // Extract user from JWT token
      let user = await extractUserFromToken(req);

      // Fall back to legacy getUserFromRequest for backward compatibility
      if (!user) {
        user = await getUserFromRequest(req);
      }

      // Check if authentication is required
      if (!user && !optional) {
        return authError(res, 401, 'Authentication required', 'UNAUTHORIZED');
      }

      // Attach user to request
      req.user = user || null;

      // If no user and auth is optional, continue to handler
      if (!user && optional) {
        return handler(req, res);
      }

      // Get context for permission checking
      const context = getContext ? getContext(req) : {};

      // Check required role
      if (requiredRole) {
        if (!hasRole(user, requiredRole, context)) {
          return authError(
            res,
            403,
            `Insufficient permissions. Required role: ${requiredRole}`,
            'FORBIDDEN'
          );
        }
      }

      // Check required permission
      if (requiredPermission) {
        if (!hasPermission(user, requiredPermission, context)) {
          return authError(
            res,
            403,
            `Insufficient permissions. Required: ${requiredPermission}`,
            'FORBIDDEN'
          );
        }
      }

      // Call the original handler
      return handler(req, res);
    } catch (err) {
      console.error('[withApiAuth] Error:', err);
      return authError(res, 500, 'Authentication error', 'AUTH_ERROR');
    }
  };
}

/**
 * withProjectAuth - API auth with project access check
 *
 * Validates that user can access the specified project.
 * Extracts projectId from request query or body.
 *
 * @param {Function} handler - API route handler
 * @param {Object} [options] - Options
 * @param {string} [options.requiredPermission] - Additional permission required
 * @param {string} [options.projectIdParam='projectId'] - Parameter name for project ID
 * @returns {Function} Wrapped handler
 *
 * @example
 * export default withProjectAuth(handler, {
 *   requiredPermission: 'artefact:edit',
 * });
 */
export function withProjectAuth(handler, options = {}) {
  const {
    requiredPermission,
    projectIdParam = 'projectId',
  } = options;

  return withApiAuth(handler, {
    requiredPermission,
    getContext: (req) => {
      const projectId = req.query[projectIdParam] || req.body?.[projectIdParam];
      const domainId = req.query.domainId || req.body?.domainId;
      return { projectId, domainId };
    },
  });
}

/**
 * withDomainAuth - API auth with domain access check
 *
 * Validates that user can access the specified domain.
 * Extracts domainId from request query or body.
 *
 * @param {Function} handler - API route handler
 * @param {Object} [options] - Options
 * @param {string} [options.requiredPermission] - Additional permission required
 * @param {string} [options.domainIdParam='domainId'] - Parameter name for domain ID
 * @returns {Function} Wrapped handler
 *
 * @example
 * export default withDomainAuth(handler, {
 *   requiredPermission: 'domain:manage',
 * });
 */
export function withDomainAuth(handler, options = {}) {
  const {
    requiredPermission,
    domainIdParam = 'domainId',
  } = options;

  return withApiAuth(handler, {
    requiredPermission,
    getContext: (req) => {
      const domainId = req.query[domainIdParam] || req.body?.[domainIdParam];
      return { domainId };
    },
  });
}

/**
 * withAdminAuth - API auth requiring admin role
 *
 * Shorthand for withApiAuth with admin role requirement.
 *
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 *
 * @example
 * export default withAdminAuth(handler);
 */
export function withAdminAuth(handler) {
  return withApiAuth(handler, {
    requiredRole: 'admin',
  });
}

/**
 * withEditorAuth - API auth requiring editor role or higher
 *
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 */
export function withEditorAuth(handler) {
  return withApiAuth(handler, {
    requiredRole: 'editor',
  });
}

/**
 * withOptionalAuth - API auth that's optional
 *
 * User is attached to req if authenticated, but
 * unauthenticated requests are allowed through.
 *
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler
 */
export function withOptionalAuth(handler) {
  return withApiAuth(handler, {
    optional: true,
  });
}

/**
 * composeMiddleware - Compose multiple middleware functions
 *
 * Applies middleware in order, allowing each to modify
 * req/res before passing to the next.
 *
 * @param {...Function} middlewares - Middleware functions
 * @returns {Function} Composed middleware
 *
 * @example
 * export default composeMiddleware(
 *   withRateLimit({ maxRequests: 10 }),
 *   withApiAuth,
 *   (handler) => async (req, res) => {
 *     // Custom middleware logic
 *     return handler(req, res);
 *   }
 * )(handler);
 */
export function composeMiddleware(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}

/**
 * createAuthGuard - Create a custom auth guard with specific requirements
 *
 * Factory function for creating reusable auth guards.
 *
 * @param {Object} defaultOptions - Default options for the guard
 * @returns {Function} Auth guard function
 *
 * @example
 * const requireProjectEditor = createAuthGuard({
 *   requiredPermission: 'artefact:edit',
 *   getContext: (req) => ({ projectId: req.query.projectId }),
 * });
 *
 * export default requireProjectEditor(handler);
 */
export function createAuthGuard(defaultOptions = {}) {
  return (handler, overrideOptions = {}) => {
    return withApiAuth(handler, {
      ...defaultOptions,
      ...overrideOptions,
    });
  };
}

export default withApiAuth;
