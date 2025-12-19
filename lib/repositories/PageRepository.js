// lib/repositories/PageRepository.js
// Repository for page registry and permissions database operations

import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * Repository for Page Registry and Permission operations
 */
export class PageRepository extends BaseRepository {
  constructor() {
    super('page_registry', 'path');
  }

  // ============================================================
  // Page Registry Operations
  // ============================================================

  /**
   * Find all pages with optional filtering
   * @param {Object} [options]
   * @param {string} [options.category]
   * @param {string} [options.section]
   * @param {boolean} [options.activeOnly=true]
   * @returns {Promise<Object[]>}
   */
  async findAllPages(options = {}) {
    const { category, section, activeOnly = true } = options;

    let sql = 'SELECT * FROM page_registry WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (activeOnly) {
      sql += ' AND is_active = true';
    }

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (section) {
      sql += ` AND section = $${paramIndex++}`;
      params.push(section);
    }

    sql += ' ORDER BY sort_order';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find a page by path
   * @param {string} path
   * @returns {Promise<Object|null>}
   */
  async findByPath(path) {
    const result = await query(
      'SELECT * FROM page_registry WHERE path = $1',
      [path]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new page in the registry
   * @param {Object} data
   * @param {string} data.path
   * @param {string} data.name
   * @param {string} data.category
   * @param {string} [data.section]
   * @param {string} [data.description]
   * @param {string[]} [data.defaultRoles=[]]
   * @param {boolean} [data.isActive=true]
   * @param {number} [data.sortOrder=0]
   * @returns {Promise<Object>}
   */
  async createPage(data) {
    const {
      path,
      name,
      category,
      section,
      description,
      defaultRoles = [],
      isActive = true,
      sortOrder = 0,
    } = data;

    if (!path) throw new Error('Path is required');
    if (!name) throw new Error('Name is required');
    if (!category) throw new Error('Category is required');

    const result = await query(
      `INSERT INTO page_registry (path, name, category, section, description, default_roles, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        path,
        name,
        category,
        section || null,
        description || null,
        defaultRoles,
        isActive,
        sortOrder,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update a page in the registry
   * @param {string} path
   * @param {Object} updates
   * @returns {Promise<Object|null>}
   */
  async updatePage(path, updates) {
    const {
      name,
      category,
      section,
      description,
      defaultRoles,
      isActive,
      sortOrder,
    } = updates;

    const result = await query(
      `UPDATE page_registry SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        section = COALESCE($3, section),
        description = COALESCE($4, description),
        default_roles = COALESCE($5, default_roles),
        is_active = COALESCE($6, is_active),
        sort_order = COALESCE($7, sort_order)
      WHERE path = $8
      RETURNING *`,
      [
        name || null,
        category || null,
        section || null,
        description || null,
        defaultRoles || null,
        isActive,
        sortOrder,
        path,
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete a page from the registry
   * @param {string} path
   * @returns {Promise<Object|null>} - Deleted page or null
   */
  async deletePage(path) {
    const result = await query(
      'DELETE FROM page_registry WHERE path = $1 RETURNING *',
      [path]
    );
    return result.rows[0] || null;
  }

  // ============================================================
  // User Page Permissions Operations
  // ============================================================

  /**
   * Get all accessible pages for a user
   * @param {string} userId
   * @returns {Promise<{userId: string, role: string, pages: Object[], allPages: Object[]}>}
   */
  async getUserAccessiblePages(userId) {
    // Get user's role
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return null;
    }

    const userRole = userResult.rows[0].role;

    // Get pages: either explicitly granted OR in default_roles for their role
    const sql = `
      SELECT pr.path, pr.name, pr.category, pr.section, pr.description, pr.sort_order,
        COALESCE(upp.can_access, $2 = ANY(pr.default_roles)) as can_access,
        CASE WHEN upp.id IS NOT NULL THEN 'explicit' ELSE 'default' END as grant_type
      FROM page_registry pr
      LEFT JOIN user_page_permissions upp ON upp.page_path = pr.path AND upp.user_id = $1
      WHERE pr.is_active = true
      ORDER BY pr.sort_order
    `;

    const result = await query(sql, [userId, userRole]);
    const accessiblePages = result.rows.filter(p => p.can_access);

    return {
      userId,
      role: userRole,
      pages: accessiblePages,
      allPages: result.rows,
    };
  }

  /**
   * Get all permissions for a user
   * @param {string} userId
   * @returns {Promise<Object[]>}
   */
  async getUserPermissions(userId) {
    const result = await query(
      'SELECT * FROM user_page_permissions WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  /**
   * Grant or revoke page access for a user
   * @param {string} userId
   * @param {string} pagePath
   * @param {boolean} canAccess
   * @param {string} [grantedBy]
   * @returns {Promise<Object>}
   */
  async setUserPageAccess(userId, pagePath, canAccess, grantedBy = null) {
    const result = await query(
      `INSERT INTO user_page_permissions (user_id, page_path, can_access, granted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, page_path)
       DO UPDATE SET can_access = $3, granted_by = $4, granted_at = now()
       RETURNING *`,
      [userId, pagePath, canAccess !== false, grantedBy]
    );

    return result.rows[0];
  }

  /**
   * Bulk update permissions for a user
   * @param {string} userId
   * @param {Array<{page_path: string, can_access: boolean}>} permissions
   * @param {string} [grantedBy]
   * @returns {Promise<{userId: string, updated: number, permissions: Object[]}>}
   */
  async bulkUpdateUserPermissions(userId, permissions, grantedBy = null) {
    // Delete existing explicit permissions for this user
    await query(
      'DELETE FROM user_page_permissions WHERE user_id = $1',
      [userId]
    );

    // Insert new permissions
    for (const perm of permissions) {
      if (perm.page_path && perm.can_access !== undefined) {
        await query(
          `INSERT INTO user_page_permissions (user_id, page_path, can_access, granted_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, page_path) DO UPDATE SET can_access = $3, granted_by = $4`,
          [userId, perm.page_path, perm.can_access, grantedBy]
        );
      }
    }

    // Return updated permissions
    const result = await query(
      'SELECT * FROM user_page_permissions WHERE user_id = $1',
      [userId]
    );

    return {
      userId,
      updated: permissions.length,
      permissions: result.rows,
    };
  }

  /**
   * Remove explicit permission (fall back to default role)
   * @param {string} userId
   * @param {string} pagePath
   * @returns {Promise<Object|null>}
   */
  async removeUserPageAccess(userId, pagePath) {
    const result = await query(
      'DELETE FROM user_page_permissions WHERE user_id = $1 AND page_path = $2 RETURNING *',
      [userId, pagePath]
    );
    return result.rows[0] || null;
  }

  /**
   * Check if a user can access a specific page
   * @param {string} userId
   * @param {string} pagePath
   * @returns {Promise<boolean>}
   */
  async canUserAccessPage(userId, pagePath) {
    const result = await query(
      `SELECT
        COALESCE(upp.can_access, u.role = ANY(pr.default_roles)) as can_access
       FROM users u
       CROSS JOIN page_registry pr
       LEFT JOIN user_page_permissions upp ON upp.user_id = u.id AND upp.page_path = pr.path
       WHERE u.id = $1 AND pr.path = $2 AND pr.is_active = true`,
      [userId, pagePath]
    );

    return result.rows[0]?.can_access || false;
  }
}

// Export singleton instance
export const pageRepository = new PageRepository();

export default pageRepository;
