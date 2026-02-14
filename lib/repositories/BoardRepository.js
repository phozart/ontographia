// lib/repositories/BoardRepository.js
// Repository for board CRUD operations

import { query, getClient } from '../pg';
import { BaseRepository } from './BaseRepository';

/**
 * Repository for managing boards
 */
export class BoardRepository extends BaseRepository {
  constructor() {
    super('boards', 'id');
  }

  /**
   * Create a new board
   * @param {Object} data - Board data
   * @param {string} data.name - Board name
   * @param {string} [data.description] - Board description
   * @param {string} [data.workspaceId] - Parent workspace ID
   * @param {string} [data.domainId] - Domain ID
   * @param {Object} [data.settings] - Board settings
   * @param {boolean} [data.isTemplate] - Whether this is a template
   * @param {string} [data.templateCategory] - Template category
   * @param {string} data.createdBy - Creator user ID
   * @returns {Promise<Object>} Created board
   */
  async create(data) {
    const result = await query(
      `INSERT INTO boards (
        name, description, workspace_id, domain_id, settings,
        is_template, template_category, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.name,
        data.description || null,
        data.workspaceId || null,
        data.domainId || null,
        JSON.stringify(data.settings || {}),
        data.isTemplate || false,
        data.templateCategory || null,
        data.createdBy,
      ]
    );

    const board = result.rows[0];

    // Add creator as owner
    await query(
      `INSERT INTO board_members (board_id, user_id, role, invited_by)
       VALUES ($1, $2, 'owner', $2)`,
      [board.id, data.createdBy]
    );

    return this.formatBoard(board);
  }

  /**
   * Get board by ID with access check
   * @param {string} boardId - Board ID
   * @param {string} [userId] - User ID for access check
   * @returns {Promise<Object|null>}
   */
  async findById(boardId, userId = null) {
    let sql = `
      SELECT b.*,
             u.username as created_by_name,
             bm.role as user_role
      FROM boards b
      LEFT JOIN users u ON b.created_by = u.id
      LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = $2
      WHERE b.id = $1
    `;

    const result = await query(sql, [boardId, userId]);
    if (result.rows.length === 0) return null;

    return this.formatBoard(result.rows[0]);
  }

  /**
   * List boards for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {string} [options.workspaceId] - Filter by workspace
   * @param {string} [options.domainId] - Filter by domain
   * @param {string} [options.search] - Search term
   * @param {number} [options.limit] - Limit results
   * @param {number} [options.offset] - Offset for pagination
   * @param {string} [options.orderBy] - Order by column
   * @param {string} [options.orderDirection] - ASC or DESC
   * @returns {Promise<{boards: Object[], total: number}>}
   */
  async listForUser(userId, options = {}) {
    const {
      workspaceId,
      domainId,
      search,
      limit = 20,
      offset = 0,
      orderBy = 'updated_at',
      orderDirection = 'DESC',
    } = options;

    const params = [userId];
    let paramIndex = 2;

    let whereClauses = [`bm.user_id = $1`];

    if (workspaceId) {
      whereClauses.push(`b.workspace_id = $${paramIndex}`);
      params.push(workspaceId);
      paramIndex++;
    }

    if (domainId) {
      whereClauses.push(`b.domain_id = $${paramIndex}`);
      params.push(domainId);
      paramIndex++;
    }

    if (search) {
      whereClauses.push(`(b.name ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Validate orderBy to prevent SQL injection
    const validOrderColumns = ['name', 'created_at', 'updated_at'];
    const safeOrderBy = validOrderColumns.includes(orderBy) ? orderBy : 'updated_at';
    const safeDirection = orderDirection === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM boards b
       INNER JOIN board_members bm ON b.id = bm.board_id
       ${whereClause}`,
      params
    );

    // Get boards
    const result = await query(
      `SELECT b.*,
              bm.role as user_role,
              u.username as created_by_name,
              (SELECT COUNT(*) FROM board_members WHERE board_id = b.id) as member_count
       FROM boards b
       INNER JOIN board_members bm ON b.id = bm.board_id
       LEFT JOIN users u ON b.created_by = u.id
       ${whereClause}
       ORDER BY b.${safeOrderBy} ${safeDirection}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      boards: result.rows.map((row) => this.formatBoard(row)),
      total: parseInt(countResult.rows[0].total, 10),
    };
  }

  /**
   * Update a board
   * @param {string} boardId - Board ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async update(boardId, updates) {
    const allowedFields = ['name', 'description', 'settings', 'thumbnail'];
    const entries = Object.entries(updates).filter(([key]) =>
      allowedFields.includes(key)
    );

    if (entries.length === 0) {
      return this.findById(boardId);
    }

    const setClauses = entries.map(([key], index) => {
      const column = key === 'settings' ? 'settings' : key;
      return `${column} = $${index + 2}`;
    });
    setClauses.push(`updated_at = NOW()`);

    const values = entries.map(([key, value]) =>
      key === 'settings' ? JSON.stringify(value) : value
    );

    const result = await query(
      `UPDATE boards SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      [boardId, ...values]
    );

    return this.formatBoard(result.rows[0]);
  }

  /**
   * Delete a board
   * @param {string} boardId - Board ID
   * @returns {Promise<boolean>}
   */
  async delete(boardId) {
    const result = await query('DELETE FROM boards WHERE id = $1', [boardId]);
    return result.rowCount > 0;
  }

  /**
   * Duplicate a board
   * @param {string} boardId - Source board ID
   * @param {string} userId - User performing the duplication
   * @param {string} [newName] - Optional new name
   * @returns {Promise<Object>}
   */
  async duplicate(boardId, userId, newName = null) {
    const client = await getClient();

    try {
      await client.query('BEGIN');

      // Get source board
      const sourceResult = await client.query(
        'SELECT * FROM boards WHERE id = $1',
        [boardId]
      );
      if (sourceResult.rows.length === 0) {
        throw new Error('Board not found');
      }
      const source = sourceResult.rows[0];

      // Create new board
      const newBoard = await client.query(
        `INSERT INTO boards (
          name, description, workspace_id, domain_id, settings,
          is_template, template_category, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          newName || `${source.name} (Copy)`,
          source.description,
          source.workspace_id,
          source.domain_id,
          source.settings,
          false, // Duplicates are never templates
          null,
          userId,
        ]
      );

      // Add creator as owner
      await client.query(
        `INSERT INTO board_members (board_id, user_id, role, invited_by)
         VALUES ($1, $2, 'owner', $2)`,
        [newBoard.rows[0].id, userId]
      );

      // Copy latest snapshot if exists
      const snapshotResult = await client.query(
        `SELECT * FROM board_snapshots
         WHERE board_id = $1
         ORDER BY sequence DESC
         LIMIT 1`,
        [boardId]
      );

      if (snapshotResult.rows.length > 0) {
        await client.query(
          `INSERT INTO board_snapshots (board_id, sequence, snapshot)
           VALUES ($1, 0, $2)`,
          [newBoard.rows[0].id, snapshotResult.rows[0].snapshot]
        );
      }

      await client.query('COMMIT');
      return this.formatBoard(newBoard.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get templates
   * @param {string} [category] - Filter by category
   * @returns {Promise<Object[]>}
   */
  async getTemplates(category = null) {
    let sql = `
      SELECT b.*, u.username as created_by_name
      FROM boards b
      LEFT JOIN users u ON b.created_by = u.id
      WHERE b.is_template = true
    `;
    const params = [];

    if (category) {
      sql += ' AND b.template_category = $1';
      params.push(category);
    }

    sql += ' ORDER BY b.name ASC';

    const result = await query(sql, params);
    return result.rows.map((row) => this.formatBoard(row));
  }

  /**
   * Format a board row from the database
   * @param {Object} row - Database row
   * @returns {Object} Formatted board
   */
  formatBoard(row) {
    if (!row) return null;

    return {
      id: row.id,
      workspaceId: row.workspace_id,
      domainId: row.domain_id,
      name: row.name,
      description: row.description,
      thumbnail: row.thumbnail,
      settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
      isTemplate: row.is_template,
      templateCategory: row.template_category,
      createdBy: row.created_by,
      createdByName: row.created_by_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userRole: row.user_role,
      memberCount: row.member_count ? parseInt(row.member_count, 10) : undefined,
    };
  }
}

/**
 * Repository for managing board members
 */
export class BoardMemberRepository extends BaseRepository {
  constructor() {
    super('board_members', 'id');
  }

  /**
   * Get members of a board
   * @param {string} boardId - Board ID
   * @returns {Promise<Object[]>}
   */
  async listForBoard(boardId) {
    const result = await query(
      `SELECT bm.*, u.username, u.id as user_id
       FROM board_members bm
       INNER JOIN users u ON bm.user_id = u.id
       WHERE bm.board_id = $1
       ORDER BY
         CASE bm.role
           WHEN 'owner' THEN 1
           WHEN 'editor' THEN 2
           WHEN 'commenter' THEN 3
           WHEN 'viewer' THEN 4
         END`,
      [boardId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      boardId: row.board_id,
      userId: row.user_id,
      username: row.username,
      role: row.role,
      invitedBy: row.invited_by,
      invitedAt: row.invited_at,
    }));
  }

  /**
   * Add a member to a board
   * @param {string} boardId - Board ID
   * @param {string} userId - User ID to add
   * @param {string} role - Role to assign
   * @param {string} invitedBy - User ID who invited
   * @returns {Promise<Object>}
   */
  async addMember(boardId, userId, role, invitedBy) {
    const result = await query(
      `INSERT INTO board_members (board_id, user_id, role, invited_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (board_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [boardId, userId, role, invitedBy]
    );
    return result.rows[0];
  }

  /**
   * Update a member's role
   * @param {string} boardId - Board ID
   * @param {string} userId - User ID
   * @param {string} newRole - New role
   * @returns {Promise<Object>}
   */
  async updateRole(boardId, userId, newRole) {
    const result = await query(
      `UPDATE board_members SET role = $3 WHERE board_id = $1 AND user_id = $2 RETURNING *`,
      [boardId, userId, newRole]
    );
    return result.rows[0];
  }

  /**
   * Remove a member from a board
   * @param {string} boardId - Board ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<boolean>}
   */
  async removeMember(boardId, userId) {
    const result = await query(
      'DELETE FROM board_members WHERE board_id = $1 AND user_id = $2',
      [boardId, userId]
    );
    return result.rowCount > 0;
  }

  /**
   * Check if a user has access to a board
   * @param {string} boardId - Board ID
   * @param {string} userId - User ID
   * @returns {Promise<string|null>} Role or null if no access
   */
  async getUserRole(boardId, userId) {
    const result = await query(
      'SELECT role FROM board_members WHERE board_id = $1 AND user_id = $2',
      [boardId, userId]
    );
    return result.rows[0]?.role || null;
  }

  /**
   * Check if a user can edit a board
   * @param {string} boardId - Board ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>}
   */
  async canEdit(boardId, userId) {
    const role = await this.getUserRole(boardId, userId);
    return role === 'owner' || role === 'editor';
  }
}

// Export singleton instances
export const boardRepository = new BoardRepository();
export const boardMemberRepository = new BoardMemberRepository();

export default boardRepository;
