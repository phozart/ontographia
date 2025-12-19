// lib/repositories/UserRepository.js
// Repository for user-related database operations

import bcrypt from 'bcryptjs';
import { BaseRepository } from './BaseRepository';
import { query } from '../db/postgres';

/**
 * Valid user role values
 * @type {readonly string[]}
 */
export const USER_ROLES = Object.freeze(['admin', 'editor', 'viewer']);

/**
 * Transform a database row to a user object
 * @param {Object|null} row
 * @returns {Object|null}
 */
function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    loginCount: row.login_count,
    personalDomainId: row.personal_domain_id,
  };
}

/**
 * Repository for User operations
 */
export class UserRepository extends BaseRepository {
  constructor() {
    super('users', 'id');
  }

  /**
   * List all users ordered by creation date
   * @returns {Promise<Object[]>}
   */
  async findAll() {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return result.rows.map(rowToUser);
  }

  /**
   * Find a user by ID
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async findById(userId) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return rowToUser(result.rows[0]);
  }

  /**
   * Find a user by username
   * @param {string} username
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return rowToUser(result.rows[0]);
  }

  /**
   * Create a new user with optional personal domain
   * @param {Object} data
   * @param {string} data.username
   * @param {string} data.password
   * @param {string} [data.role='viewer']
   * @param {string} [data.id]
   * @param {boolean} [data.createPersonalDomain=true]
   * @returns {Promise<Object>}
   */
  async createUser(data) {
    const {
      username,
      password,
      role = 'viewer',
      id,
      createPersonalDomain = true,
    } = data;

    if (!username) {
      throw new Error('Username is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    const hash = bcrypt.hashSync(password, 10);
    const userId = id || username;

    await query(
      `INSERT INTO users (id, username, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [userId, username, hash, role]
    );

    if (createPersonalDomain) {
      const domainId = await this.createPersonalDomain(userId, username);
      if (domainId) {
        await query(
          `UPDATE users SET personal_domain_id = $1 WHERE id = $2`,
          [domainId, userId]
        );
      }
    }

    return this.findById(userId);
  }

  /**
   * Create a personal domain for a user
   * @param {string} userId
   * @param {string} username
   * @returns {Promise<string|null>} - Domain ID or null
   */
  async createPersonalDomain(userId, username) {
    try {
      const domainName = `${username}'s Workspace`;
      const domainNotes = `Personal workspace for ${username}`;

      // Check if domain already exists
      const existing = await query(
        `SELECT id FROM domains WHERE name = $1 AND owner = $2`,
        [domainName, userId]
      );

      if (existing.rows.length > 0) {
        return existing.rows[0].id;
      }

      // Create new personal domain
      const result = await query(
        `INSERT INTO domains (id, name, notes, owner)
         VALUES (gen_random_uuid(), $1, $2, $3)
         RETURNING id`,
        [domainName, domainNotes, userId]
      );

      const domainId = result.rows[0].id;

      // Add user as owner in domain_members
      await query(
        `INSERT INTO domain_members (domain_id, user_id, role)
         VALUES ($1, $2, 'owner')
         ON CONFLICT DO NOTHING`,
        [domainId, userId]
      );

      return domainId;
    } catch (err) {
      console.error('Failed to create personal domain for user', userId, err);
      return null;
    }
  }

  /**
   * Set a user's personal domain reference
   * @param {string} userId
   * @param {string} domainId
   * @returns {Promise<Object|null>}
   */
  async setPersonalDomain(userId, domainId) {
    await query(
      `UPDATE users SET personal_domain_id = $1, updated_at = now() WHERE id = $2`,
      [domainId, userId]
    );
    return this.findById(userId);
  }

  /**
   * Update a user
   * @param {string} userId
   * @param {Object} updates
   * @param {string} [updates.role]
   * @param {string} [updates.password]
   * @returns {Promise<Object|null>}
   */
  async updateUser(userId, updates) {
    const existing = await this.findById(userId);
    if (!existing) return null;

    const nextRole = updates.role || existing.role;
    const params = [nextRole, userId];
    let sql = `UPDATE users SET role = $1, updated_at = now()`;

    if (updates.password) {
      const hash = bcrypt.hashSync(updates.password, 10);
      sql += `, password_hash = $3`;
      params.push(hash);
    }

    sql += ` WHERE id = $2`;
    await query(sql, params);

    return this.findById(userId);
  }

  /**
   * Delete a user
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteUser(userId) {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );
    return result.rowCount > 0;
  }

  /**
   * Record a user login
   * @param {string} username
   * @returns {Promise<Object|null>}
   */
  async recordLogin(username) {
    await query(
      `UPDATE users
       SET last_login_at = now(),
           login_count = COALESCE(login_count, 0) + 1,
           updated_at = now()
       WHERE username = $1`,
      [username]
    );
    return this.findByUsername(username);
  }

  /**
   * Verify a user's password and record login
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object|null>}
   */
  async verifyUser(username, password) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    const row = result.rows[0];
    if (!row) return null;

    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) return null;

    try {
      await this.recordLogin(username);
    } catch (err) {
      console.error('Failed to record login', err);
    }

    return rowToUser(row);
  }

  /**
   * Ensure the seed admin user exists
   * @returns {Promise<void>}
   */
  async ensureSeedAdmin() {
    try {
      const result = await query('SELECT COUNT(*) AS c FROM users');
      const count = Number(result.rows[0].c || result.rows[0].count || 0);

      if (count === 0) {
        await this.createUser({
          username: 'admin',
          password: 'admin',
          role: 'admin',
          id: 'admin',
        });
      }
    } catch (err) {
      console.error('ensureSeedAdmin failed', err);
    }
  }

  /**
   * Check if a user exists
   * @param {string} userId
   * @returns {Promise<{exists: boolean, username: string|null}>}
   */
  async userExists(userId) {
    const result = await query(
      'SELECT id, username FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return { exists: false, username: null };
    }
    return { exists: true, username: result.rows[0].username };
  }

  /**
   * Get user count
   * @returns {Promise<number>}
   */
  async count() {
    const result = await query('SELECT COUNT(*) AS count FROM users');
    return Number(result.rows[0].count);
  }

  /**
   * Change a user's password (with current password verification)
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user's current password hash
    const result = await query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = result.rows[0];

    // Verify current password
    const isValid = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = bcrypt.hashSync(newPassword, 10);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    return { success: true };
  }

  /**
   * Get password hash for a user (internal use)
   * @param {string} userId
   * @returns {Promise<string|null>}
   */
  async getPasswordHash(userId) {
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.password_hash || null;
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

export default userRepository;
