// lib/projectAccess.js
// Project-level access control middleware

import { query } from './pg';

// Role permissions mapping
export const PROJECT_ROLES = {
  'Business Analyst': {
    id: 'Business Analyst',
    name: 'Business Analyst',
    shortName: 'BA',
    color: '#3b82f6',
    permissions: ['view', 'create', 'edit', 'delete', 'approve', 'comment', 'manage_documents'],
    description: 'Full access to create, edit, and approve artefacts'
  },
  'Product Owner': {
    id: 'Product Owner',
    name: 'Product Owner',
    shortName: 'PO',
    color: '#8b5cf6',
    permissions: ['view', 'create', 'edit', 'approve', 'comment', 'manage_documents'],
    description: 'Can create, edit, and approve artefacts'
  },
  'Stakeholder': {
    id: 'Stakeholder',
    name: 'Stakeholder',
    shortName: 'SH',
    color: '#f59e0b',
    permissions: ['view', 'approve', 'comment'],
    description: 'Can view and approve artefacts, add comments'
  },
  'Viewer': {
    id: 'Viewer',
    name: 'Viewer',
    shortName: 'VW',
    color: '#6b7280',
    permissions: ['view'],
    description: 'Read-only access to project'
  }
};

// Permission definitions
export const PERMISSIONS = {
  view: { id: 'view', name: 'View', description: 'View project and artefacts' },
  create: { id: 'create', name: 'Create', description: 'Create new artefacts' },
  edit: { id: 'edit', name: 'Edit', description: 'Edit existing artefacts' },
  delete: { id: 'delete', name: 'Delete', description: 'Delete artefacts' },
  approve: { id: 'approve', name: 'Approve', description: 'Change artefact status to Approved' },
  comment: { id: 'comment', name: 'Comment', description: 'Add comments to artefacts' },
  manage_documents: { id: 'manage_documents', name: 'Manage Documents', description: 'Create and edit documents' },
  manage_members: { id: 'manage_members', name: 'Manage Members', description: 'Add/remove project members' }
};

/**
 * Get user info from request headers
 */
export function getUserFromRequest(req) {
  return {
    user: req.headers['x-user'] || null,
    role: req.headers['x-role'] || null
  };
}

/**
 * Check if user has access to a project with the required permission
 * @param {Object} req - Request object with headers
 * @param {string} projectId - Project ID to check access for
 * @param {string} requiredPermission - Permission required (view, create, edit, delete, approve, comment, manage_documents, manage_members)
 * @returns {Promise<{hasAccess: boolean, projectRole: string|null, error: string|null}>}
 */
export async function checkProjectAccess(req, projectId, requiredPermission = 'view') {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return { hasAccess: false, projectRole: null, error: 'Authentication required' };
  }

  // System admins have full access
  if (role === 'admin') {
    return { hasAccess: true, projectRole: 'admin', error: null };
  }

  try {
    // Check if user is project creator
    const projectResult = await query(
      `SELECT created_by FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return { hasAccess: false, projectRole: null, error: 'Project not found' };
    }

    // Project creator has full access
    if (projectResult.rows[0].created_by === user) {
      return { hasAccess: true, projectRole: 'Business Analyst', error: null };
    }

    // Check project membership
    const memberResult = await query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, user]
    );

    if (memberResult.rows.length === 0) {
      return { hasAccess: false, projectRole: null, error: 'Not a member of this project' };
    }

    const projectRole = memberResult.rows[0].role;
    const roleConfig = PROJECT_ROLES[projectRole];

    if (!roleConfig) {
      return { hasAccess: false, projectRole, error: 'Invalid project role' };
    }

    // Check if role has required permission
    if (!roleConfig.permissions.includes(requiredPermission)) {
      return {
        hasAccess: false,
        projectRole,
        error: `Insufficient permissions. ${projectRole} role does not have '${requiredPermission}' permission`
      };
    }

    return { hasAccess: true, projectRole, error: null };
  } catch (err) {
    console.error('Error checking project access:', err);
    return { hasAccess: false, projectRole: null, error: 'Error checking access' };
  }
}

/**
 * Check if user has access to a domain with the required permission
 * @param {Object} req - Request object with headers
 * @param {string} domainId - Domain ID to check access for
 * @param {string} requiredPermission - Permission required (view, create, edit, delete)
 * @returns {Promise<{hasAccess: boolean, domainRole: string|null, error: string|null}>}
 */
export async function checkDomainAccess(req, domainId, requiredPermission = 'view') {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return { hasAccess: false, domainRole: null, error: 'Authentication required' };
  }

  // System admins have full access
  if (role === 'admin') {
    return { hasAccess: true, domainRole: 'owner', error: null };
  }

  try {
    // Check domain membership
    const memberResult = await query(
      `SELECT role FROM domain_members WHERE domain_id = $1 AND user_id = $2`,
      [domainId, user]
    );

    if (memberResult.rows.length === 0) {
      return { hasAccess: false, domainRole: null, error: 'Not a member of this domain' };
    }

    const domainRole = memberResult.rows[0].role;

    // Domain role permissions mapping
    const domainRolePermissions = {
      owner: ['view', 'create', 'edit', 'delete', 'manage'],
      admin: ['view', 'create', 'edit', 'delete'],
      member: ['view', 'create', 'edit'],
      viewer: ['view']
    };

    const permissions = domainRolePermissions[domainRole] || ['view'];

    // Check if role has required permission
    if (!permissions.includes(requiredPermission)) {
      return {
        hasAccess: false,
        domainRole,
        error: `Insufficient permissions. ${domainRole} role does not have '${requiredPermission}' permission`
      };
    }

    return { hasAccess: true, domainRole, error: null };
  } catch (err) {
    console.error('Error checking domain access:', err);
    return { hasAccess: false, domainRole: null, error: 'Error checking access' };
  }
}

/**
 * Get user's role in a project
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @returns {Promise<string|null>} Project role or null if not a member
 */
export async function getUserProjectRole(projectId, userId) {
  try {
    // Check if creator
    const projectResult = await query(
      `SELECT created_by FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length > 0 && projectResult.rows[0].created_by === userId) {
      return 'Business Analyst';
    }

    // Check membership
    const result = await query(
      `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [projectId, userId]
    );

    return result.rows.length > 0 ? result.rows[0].role : null;
  } catch (err) {
    console.error('Error getting user project role:', err);
    return null;
  }
}

/**
 * Get all projects accessible to a user
 * @param {string} userId - User ID
 * @param {string} systemRole - User's system role (admin, editor, viewer)
 * @param {string} domainId - Optional domain ID to filter by
 * @returns {Promise<Array>} List of accessible projects
 */
export async function getAccessibleProjects(userId, systemRole, domainId = null) {
  try {
    const params = [userId];
    let paramIdx = 2;

    // Build the domain sort expression if needed
    let domainSortExpr = '0';
    if (domainId) {
      domainSortExpr = `CASE WHEN p.domain_id = $${paramIdx} THEN 0 WHEN p.domain_id IS NULL THEN 1 ELSE 2 END`;
      params.push(domainId);
      paramIdx++;
    }

    let sql = `
      SELECT DISTINCT p.*,
        COALESCE(pm.role, CASE WHEN p.created_by = $1 THEN 'Business Analyst' ELSE NULL END) as user_role,
        (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id) as artefact_count,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
        ${domainSortExpr} as domain_sort_order
      FROM projects p
      LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
      WHERE 1=1
    `;

    // Non-admins can only see their own projects or ones they're members of
    if (systemRole !== 'admin') {
      sql += ` AND (p.created_by = $1 OR pm.user_id = $1)`;
    }

    // Order by domain priority then updated_at
    sql += ` ORDER BY domain_sort_order, p.updated_at DESC`;

    // Log for debugging
    console.log(`[getAccessibleProjects] User: ${userId}, Role: ${systemRole}, Domain: ${domainId || 'all'}`);
    console.log(`[getAccessibleProjects] SQL:`, sql);
    console.log(`[getAccessibleProjects] Params:`, params);

    const result = await query(sql, params);
    console.log(`[getAccessibleProjects] Found ${result.rows.length} projects`);

    // Also check total projects in database for debugging
    const totalResult = await query('SELECT COUNT(*) as count FROM projects');
    console.log(`[getAccessibleProjects] Total projects in DB: ${totalResult.rows[0].count}`);

    if (result.rows.length === 0 && totalResult.rows[0].count > 0) {
      // Projects exist but user can't see them - check why
      const allProjects = await query('SELECT id, name, domain_id, created_by FROM projects LIMIT 5');
      console.log(`[getAccessibleProjects] Sample projects:`, allProjects.rows);
    }

    return result.rows;
  } catch (err) {
    console.error('Error getting accessible projects:', err);
    return [];
  }
}

/**
 * Middleware wrapper for API routes that require project access
 * @param {string} requiredPermission - Permission required
 * @returns {Function} Express-style middleware
 */
export function requireProjectAccess(requiredPermission = 'view') {
  return async (req, res, next) => {
    const projectId = req.query.projectId || req.query.id || req.body?.projectId;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, projectRole, error } = await checkProjectAccess(req, projectId, requiredPermission);

    if (!hasAccess) {
      return res.status(403).json({ error: error || 'Access denied' });
    }

    // Add project role to request for downstream use
    req.projectRole = projectRole;

    if (typeof next === 'function') {
      next();
    }

    return { hasAccess, projectRole };
  };
}

/**
 * Check if user can perform action on artefact
 * @param {Object} req - Request object
 * @param {string} artefactId - Artefact ID
 * @param {string} action - Action to perform (view, edit, delete, approve)
 * @returns {Promise<{hasAccess: boolean, error: string|null}>}
 */
export async function checkArtefactAccess(req, artefactId, action = 'view') {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return { hasAccess: false, error: 'Authentication required' };
  }

  // System admins have full access
  if (role === 'admin') {
    return { hasAccess: true, error: null };
  }

  try {
    // Get artefact's project
    const artefactResult = await query(
      `SELECT project_id, created_by, status FROM artefacts WHERE id = $1`,
      [artefactId]
    );

    if (artefactResult.rows.length === 0) {
      return { hasAccess: false, error: 'Artefact not found' };
    }

    const { project_id, created_by, status } = artefactResult.rows[0];

    // Check project access
    const { hasAccess, projectRole, error } = await checkProjectAccess(req, project_id, action);

    if (!hasAccess) {
      return { hasAccess: false, error };
    }

    // Additional checks for specific actions
    if (action === 'delete' && status === 'Approved') {
      return { hasAccess: false, error: 'Approved artefacts cannot be deleted' };
    }

    return { hasAccess: true, error: null };
  } catch (err) {
    console.error('Error checking artefact access:', err);
    return { hasAccess: false, error: 'Error checking access' };
  }
}
