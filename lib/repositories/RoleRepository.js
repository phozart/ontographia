// lib/repositories/RoleRepository.js
// Repository for RBAC role management

import { BaseRepository } from './BaseRepository.js';
import { query, withTransaction } from '../pg.js';
import { ROLES, isValidRole, getAllRoles } from '../auth/rbac/roles.js';
import { clearUserCache } from '../auth/rbac/checker.js';

/**
 * Repository for Role operations
 */
export class RoleRepository extends BaseRepository {
  constructor() {
    super('user_roles', 'id');
  }

  /**
   * Get all roles for a user (system, domain, and project roles)
   * @param {string} userId - User ID
   * @returns {Promise<{systemRole: string|null, domainRoles: Object, projectRoles: Object, spaceAccess: Object}>}
   */
  async getUserRoles(userId) {
    const result = {
      systemRole: null,
      domainRoles: {},
      projectRoles: {},
      spaceAccess: {},
    };

    try {
      // Get system role
      const systemResult = await query(
        `SELECT role FROM user_roles WHERE user_id = $1 AND scope = 'system'`,
        [userId]
      );
      if (systemResult.rows.length > 0) {
        result.systemRole = systemResult.rows[0].role;
      }

      // Check legacy admin role from users table
      if (!result.systemRole) {
        const userResult = await query(
          `SELECT role FROM users WHERE id = $1`,
          [userId]
        );
        if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
          result.systemRole = ROLES.SUPER_ADMIN;
        }
      }

      // Get domain roles
      const domainResult = await query(
        `SELECT domain_id, role FROM user_roles WHERE user_id = $1 AND scope = 'domain'`,
        [userId]
      );
      for (const row of domainResult.rows) {
        result.domainRoles[row.domain_id] = row.role;
      }

      // Also check domain_members table for legacy roles
      const domainMembersResult = await query(
        `SELECT domain_id, role FROM domain_members WHERE user_id = $1`,
        [userId]
      );
      for (const row of domainMembersResult.rows) {
        // Map legacy roles to new roles
        const mappedRole = this.mapLegacyRole(row.role, 'domain');
        if (mappedRole && !result.domainRoles[row.domain_id]) {
          result.domainRoles[row.domain_id] = mappedRole;
        }
      }

      // Get project roles
      const projectResult = await query(
        `SELECT project_id, role FROM user_roles WHERE user_id = $1 AND scope = 'project'`,
        [userId]
      );
      for (const row of projectResult.rows) {
        result.projectRoles[row.project_id] = row.role;
      }

      // Also check project_members table for legacy roles
      const projectMembersResult = await query(
        `SELECT project_id, role FROM project_members WHERE user_id = $1`,
        [userId]
      );
      for (const row of projectMembersResult.rows) {
        const mappedRole = this.mapLegacyRole(row.role, 'project');
        if (mappedRole && !result.projectRoles[row.project_id]) {
          result.projectRoles[row.project_id] = mappedRole;
        }
      }

      // Get space access overrides
      const spaceResult = await query(
        `SELECT space_code, access_level, project_id FROM space_access WHERE user_id = $1`,
        [userId]
      );
      for (const row of spaceResult.rows) {
        const key = row.project_id ? `${row.space_code}:${row.project_id}` : row.space_code;
        result.spaceAccess[key] = row.access_level;
      }

      return result;
    } catch (err) {
      // Tables might not exist yet
      console.error('Error getting user roles:', err.message);
      return result;
    }
  }

  /**
   * Map legacy role names to new RBAC roles
   * @param {string} legacyRole - Legacy role name
   * @param {string} scope - Scope (domain or project)
   * @returns {string|null}
   */
  mapLegacyRole(legacyRole, scope) {
    // Domain role mappings
    if (scope === 'domain') {
      const domainMap = {
        owner: ROLES.DOMAIN_ADMIN,
        admin: ROLES.DOMAIN_ADMIN,
        editor: ROLES.EDITOR,
        viewer: ROLES.VIEWER,
      };
      return domainMap[legacyRole] || null;
    }

    // Project role mappings
    if (scope === 'project') {
      const projectMap = {
        'Business Analyst': ROLES.PROJECT_ADMIN,
        'Product Owner': ROLES.PROJECT_ADMIN,
        Stakeholder: ROLES.EDITOR,
        Viewer: ROLES.VIEWER,
      };
      return projectMap[legacyRole] || null;
    }

    return null;
  }

  /**
   * Assign a system-level role to a user
   * @param {string} userId - User ID
   * @param {string} role - Role to assign
   * @param {string} assignedBy - User ID of assigner
   * @returns {Promise<Object>}
   */
  async assignSystemRole(userId, role, assignedBy) {
    if (!isValidRole(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    // Upsert the role
    const result = await query(
      `INSERT INTO user_roles (user_id, role, scope, assigned_by)
       VALUES ($1, $2, 'system', $3)
       ON CONFLICT (user_id, scope, COALESCE(domain_id, ''), COALESCE(project_id, ''))
       DO UPDATE SET role = $2, assigned_by = $3, assigned_at = NOW()
       RETURNING *`,
      [userId, role, assignedBy]
    );

    clearUserCache(userId);
    return result.rows[0];
  }

  /**
   * Assign a domain-level role to a user
   * @param {string} userId - User ID
   * @param {string} domainId - Domain ID
   * @param {string} role - Role to assign
   * @param {string} assignedBy - User ID of assigner
   * @returns {Promise<Object>}
   */
  async assignDomainRole(userId, domainId, role, assignedBy) {
    if (!isValidRole(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const result = await query(
      `INSERT INTO user_roles (user_id, domain_id, role, scope, assigned_by)
       VALUES ($1, $2, $3, 'domain', $4)
       ON CONFLICT (user_id, scope, COALESCE(domain_id, ''), COALESCE(project_id, ''))
       DO UPDATE SET role = $3, assigned_by = $4, assigned_at = NOW()
       RETURNING *`,
      [userId, domainId, role, assignedBy]
    );

    // Also update domain_members for backward compatibility
    await query(
      `INSERT INTO domain_members (domain_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (domain_id, user_id) DO UPDATE SET role = $3`,
      [domainId, userId, this.roleToLegacyDomainRole(role)]
    );

    clearUserCache(userId);
    return result.rows[0];
  }

  /**
   * Assign a project-level role to a user
   * @param {string} userId - User ID
   * @param {string} projectId - Project ID
   * @param {string} role - Role to assign
   * @param {string} assignedBy - User ID of assigner
   * @returns {Promise<Object>}
   */
  async assignProjectRole(userId, projectId, role, assignedBy) {
    if (!isValidRole(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const result = await query(
      `INSERT INTO user_roles (user_id, project_id, role, scope, assigned_by)
       VALUES ($1, $2, $3, 'project', $4)
       ON CONFLICT (user_id, scope, COALESCE(domain_id, ''), COALESCE(project_id, ''))
       DO UPDATE SET role = $3, assigned_by = $4, assigned_at = NOW()
       RETURNING *`,
      [userId, projectId, role, assignedBy]
    );

    // Also update project_members for backward compatibility
    await query(
      `INSERT INTO project_members (project_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3`,
      [projectId, userId, this.roleToLegacyProjectRole(role), assignedBy]
    );

    clearUserCache(userId);
    return result.rows[0];
  }

  /**
   * Convert new role to legacy domain role
   * @param {string} role - New role
   * @returns {string}
   */
  roleToLegacyDomainRole(role) {
    const map = {
      [ROLES.SUPER_ADMIN]: 'owner',
      [ROLES.DOMAIN_ADMIN]: 'admin',
      [ROLES.PROJECT_ADMIN]: 'editor',
      [ROLES.EDITOR]: 'editor',
      [ROLES.VIEWER]: 'viewer',
    };
    return map[role] || 'viewer';
  }

  /**
   * Convert new role to legacy project role
   * @param {string} role - New role
   * @returns {string}
   */
  roleToLegacyProjectRole(role) {
    const map = {
      [ROLES.SUPER_ADMIN]: 'Business Analyst',
      [ROLES.DOMAIN_ADMIN]: 'Business Analyst',
      [ROLES.PROJECT_ADMIN]: 'Business Analyst',
      [ROLES.EDITOR]: 'Stakeholder',
      [ROLES.VIEWER]: 'Viewer',
    };
    return map[role] || 'Viewer';
  }

  /**
   * Remove a user's role
   * @param {string} userId - User ID
   * @param {string} scope - Scope (system, domain, project)
   * @param {string} [contextId] - Domain or project ID (required for domain/project scope)
   * @returns {Promise<boolean>}
   */
  async removeRole(userId, scope, contextId = null) {
    let result;

    if (scope === 'system') {
      result = await query(
        `DELETE FROM user_roles WHERE user_id = $1 AND scope = 'system' RETURNING *`,
        [userId]
      );
    } else if (scope === 'domain') {
      result = await query(
        `DELETE FROM user_roles WHERE user_id = $1 AND scope = 'domain' AND domain_id = $2 RETURNING *`,
        [userId, contextId]
      );
      // Also remove from domain_members
      await query(
        `DELETE FROM domain_members WHERE user_id = $1 AND domain_id = $2`,
        [userId, contextId]
      );
    } else if (scope === 'project') {
      result = await query(
        `DELETE FROM user_roles WHERE user_id = $1 AND scope = 'project' AND project_id = $2 RETURNING *`,
        [userId, contextId]
      );
      // Also remove from project_members
      await query(
        `DELETE FROM project_members WHERE user_id = $1 AND project_id = $2`,
        [userId, contextId]
      );
    }

    clearUserCache(userId);
    return result?.rowCount > 0;
  }

  /**
   * Get all users with a specific role
   * @param {string} role - Role to search for
   * @param {string} [scope] - Optional scope filter
   * @returns {Promise<Array>}
   */
  async getUsersByRole(role, scope = null) {
    let sql = `
      SELECT ur.*, u.username, u.role as legacy_role
      FROM user_roles ur
      JOIN users u ON ur.user_id = u.id
      WHERE ur.role = $1
    `;
    const params = [role];

    if (scope) {
      sql += ` AND ur.scope = $2`;
      params.push(scope);
    }

    sql += ` ORDER BY ur.assigned_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get all roles for a domain
   * @param {string} domainId - Domain ID
   * @returns {Promise<Array>}
   */
  async getDomainRoles(domainId) {
    const result = await query(
      `SELECT ur.*, u.username
       FROM user_roles ur
       JOIN users u ON ur.user_id = u.id
       WHERE ur.domain_id = $1 AND ur.scope = 'domain'
       ORDER BY ur.role, u.username`,
      [domainId]
    );
    return result.rows;
  }

  /**
   * Get all roles for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>}
   */
  async getProjectRoles(projectId) {
    const result = await query(
      `SELECT ur.*, u.username
       FROM user_roles ur
       JOIN users u ON ur.user_id = u.id
       WHERE ur.project_id = $1 AND ur.scope = 'project'
       ORDER BY ur.role, u.username`,
      [projectId]
    );
    return result.rows;
  }

  /**
   * Set space access for a user
   * @param {string} userId - User ID
   * @param {string} spaceCode - Space code
   * @param {string} accessLevel - Access level (none, view, edit, admin)
   * @param {string} [projectId] - Optional project ID for project-specific access
   * @param {string} grantedBy - User ID of granter
   * @returns {Promise<Object>}
   */
  async setSpaceAccess(userId, spaceCode, accessLevel, projectId, grantedBy) {
    const result = await query(
      `INSERT INTO space_access (user_id, space_code, access_level, project_id, granted_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, space_code, COALESCE(project_id, ''))
       DO UPDATE SET access_level = $3, granted_by = $5, granted_at = NOW()
       RETURNING *`,
      [userId, spaceCode, accessLevel, projectId, grantedBy]
    );

    clearUserCache(userId);
    return result.rows[0];
  }

  /**
   * Remove space access for a user
   * @param {string} userId - User ID
   * @param {string} spaceCode - Space code
   * @param {string} [projectId] - Optional project ID
   * @returns {Promise<boolean>}
   */
  async removeSpaceAccess(userId, spaceCode, projectId = null) {
    let result;

    if (projectId) {
      result = await query(
        `DELETE FROM space_access WHERE user_id = $1 AND space_code = $2 AND project_id = $3`,
        [userId, spaceCode, projectId]
      );
    } else {
      result = await query(
        `DELETE FROM space_access WHERE user_id = $1 AND space_code = $2 AND project_id IS NULL`,
        [userId, spaceCode]
      );
    }

    clearUserCache(userId);
    return result.rowCount > 0;
  }

  /**
   * Get all available roles with metadata
   * @returns {Array}
   */
  getAllRoleDefinitions() {
    return getAllRoles();
  }

  /**
   * Bulk assign roles (e.g., for onboarding)
   * @param {string} userId - User ID
   * @param {Array<{scope: string, role: string, contextId?: string}>} roles - Roles to assign
   * @param {string} assignedBy - User ID of assigner
   * @returns {Promise<Array>}
   */
  async bulkAssignRoles(userId, roles, assignedBy) {
    return withTransaction(async (client) => {
      const results = [];

      for (const { scope, role, contextId } of roles) {
        if (scope === 'system') {
          const result = await client.query(
            `INSERT INTO user_roles (user_id, role, scope, assigned_by)
             VALUES ($1, $2, 'system', $3)
             ON CONFLICT (user_id, scope, COALESCE(domain_id, ''), COALESCE(project_id, ''))
             DO UPDATE SET role = $2, assigned_by = $3, assigned_at = NOW()
             RETURNING *`,
            [userId, role, assignedBy]
          );
          results.push(result.rows[0]);
        } else if (scope === 'domain') {
          const result = await client.query(
            `INSERT INTO user_roles (user_id, domain_id, role, scope, assigned_by)
             VALUES ($1, $2, $3, 'domain', $4)
             ON CONFLICT (user_id, scope, COALESCE(domain_id, ''), COALESCE(project_id, ''))
             DO UPDATE SET role = $3, assigned_by = $4, assigned_at = NOW()
             RETURNING *`,
            [userId, contextId, role, assignedBy]
          );
          results.push(result.rows[0]);
        } else if (scope === 'project') {
          const result = await client.query(
            `INSERT INTO user_roles (user_id, project_id, role, scope, assigned_by)
             VALUES ($1, $2, $3, 'project', $4)
             ON CONFLICT (user_id, scope, COALESCE(domain_id, ''), COALESCE(project_id, ''))
             DO UPDATE SET role = $3, assigned_by = $4, assigned_at = NOW()
             RETURNING *`,
            [userId, contextId, role, assignedBy]
          );
          results.push(result.rows[0]);
        }
      }

      clearUserCache(userId);
      return results;
    });
  }
}

// Export singleton instance
export const roleRepository = new RoleRepository();

export default roleRepository;
