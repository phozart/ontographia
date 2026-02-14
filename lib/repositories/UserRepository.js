// lib/repositories/UserRepository.js
// Repository for user-related database operations

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { BaseRepository } from './BaseRepository';
import { query, withTransaction } from '../pg';

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
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at || row.last_login, // Support both column names
    loginCount: row.login_count || 0,
    personalDomainId: row.personal_domain_id,
    settings: row.settings || {},
    oauthProvider: row.oauth_provider,
    oauthProviderId: row.oauth_provider_id,
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
       ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash
       WHERE users.password_hash IS NULL`,
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
    // Use last_login column (schema uses last_login, not last_login_at)
    // login_count is optional - may not exist in all schemas
    await query(
      `UPDATE users
       SET last_login = now(),
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

    if (!row.password_hash) return null;
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
      const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'admin';
      if (!process.env.ADMIN_SEED_PASSWORD) {
        console.warn('ADMIN_SEED_PASSWORD not set, using default "admin" — change in production');
      }

      const result = await query('SELECT COUNT(*) AS c FROM users');
      const count = Number(result.rows[0].c || result.rows[0].count || 0);

      if (count === 0) {
        await this.createUser({
          username: 'admin',
          password: seedPassword,
          role: 'admin',
          id: 'admin',
        });
      } else {
        // Ensure existing admin has a password hash (fixes null-hash bug)
        const admin = await query(
          'SELECT id, password_hash FROM users WHERE id = $1',
          ['admin']
        );
        if (admin.rows.length > 0 && !admin.rows[0].password_hash) {
          const hash = bcrypt.hashSync(seedPassword, 10);
          await query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [hash, 'admin']
          );
          console.warn('Fixed admin user with missing password hash');
        }
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
    if (!user.password_hash) {
      return { success: false, error: 'Account has no password set' };
    }
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

  /**
   * Find a user by email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return rowToUser(result.rows[0]);
  }

  /**
   * Save a refresh token for a user
   * @param {string} userId - User ID
   * @param {string} tokenId - Unique token identifier (jti)
   * @param {Date} expiresAt - Token expiration date
   * @returns {Promise<void>}
   */
  async saveRefreshToken(userId, tokenId, expiresAt) {
    await query(
      `INSERT INTO user_refresh_tokens (user_id, token_id, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, token_id) DO UPDATE SET expires_at = $3`,
      [userId, tokenId, expiresAt]
    );
  }

  /**
   * Validate a refresh token exists and is not expired
   * @param {string} userId - User ID
   * @param {string} tokenId - Token identifier
   * @returns {Promise<boolean>} True if valid
   */
  async validateRefreshToken(userId, tokenId) {
    const result = await query(
      `SELECT token_id FROM user_refresh_tokens
       WHERE user_id = $1 AND token_id = $2 AND expires_at > NOW()`,
      [userId, tokenId]
    );
    return result.rows.length > 0;
  }

  /**
   * Invalidate a specific refresh token
   * @param {string} userId - User ID
   * @param {string} tokenId - Token identifier to invalidate
   * @returns {Promise<void>}
   */
  async invalidateRefreshToken(userId, tokenId) {
    await query(
      'DELETE FROM user_refresh_tokens WHERE user_id = $1 AND token_id = $2',
      [userId, tokenId]
    );
  }

  /**
   * Invalidate all refresh tokens for a user (logout everywhere)
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async invalidateAllRefreshTokens(userId) {
    await query(
      'DELETE FROM user_refresh_tokens WHERE user_id = $1',
      [userId]
    );
  }

  /**
   * Clean up expired refresh tokens
   * @returns {Promise<number>} Number of tokens deleted
   */
  async cleanupExpiredTokens() {
    const result = await query(
      'DELETE FROM user_refresh_tokens WHERE expires_at < NOW()'
    );
    return result.rowCount;
  }

  /**
   * Get user settings
   * @param {string} userId
   * @returns {Promise<Object>} User settings
   */
  async getUserSettings(userId) {
    const result = await query(
      'SELECT settings FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0]?.settings || {
      theme: 'system',
      defaultSpace: null,
      notifications: { email: true, inApp: true },
      dashboardLayout: {},
    };
  }

  /**
   * Update user settings
   * @param {string} userId
   * @param {Object} settings - Settings to merge
   * @returns {Promise<Object>} Updated settings
   */
  async updateUserSettings(userId, settings) {
    const result = await query(
      `UPDATE users
       SET settings = COALESCE(settings, '{}'::jsonb) || $1::jsonb,
           updated_at = NOW()
       WHERE id = $2
       RETURNING settings`,
      [JSON.stringify(settings), userId]
    );
    return result.rows[0]?.settings || settings;
  }

  /**
   * Find or create a user from OAuth profile
   * @param {string} provider - OAuth provider (google, github)
   * @param {Object} profile - Normalized OAuth profile
   * @returns {Promise<{ user: Object, created: boolean }>}
   */
  async findOrCreateOAuthUser(provider, profile) {
    const { providerId, email, name, username, picture } = profile;

    // First, try to find by OAuth provider + ID
    let result = await query(
      `SELECT * FROM users
       WHERE oauth_provider = $1 AND oauth_provider_id = $2`,
      [provider, providerId]
    );

    if (result.rows.length > 0) {
      const user = rowToUser(result.rows[0]);
      // Update last login
      await this.recordLogin(user.username);
      return { user, created: false };
    }

    // Try to find by email if provided
    if (email) {
      result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length > 0) {
        // Link OAuth to existing account
        await query(
          `UPDATE users
           SET oauth_provider = $1, oauth_provider_id = $2, updated_at = NOW()
           WHERE id = $3`,
          [provider, providerId, result.rows[0].id]
        );
        const user = rowToUser(result.rows[0]);
        user.oauthProvider = provider;
        user.oauthProviderId = providerId;
        await this.recordLogin(user.username);
        return { user, created: false };
      }
    }

    // Create new user
    const userId = crypto.randomUUID();
    const finalUsername = await this.generateUniqueUsername(username || name || 'user');

    await query(
      `INSERT INTO users (id, username, email, password_hash, role, oauth_provider, oauth_provider_id, settings)
       VALUES ($1, $2, $3, $4, 'viewer', $5, $6, $7)`,
      [
        userId,
        finalUsername,
        email ? email.toLowerCase() : null,
        '', // No password for OAuth users
        provider,
        providerId,
        JSON.stringify({ picture }),
      ]
    );

    // Create personal domain for new user
    await this.createPersonalDomain(userId, finalUsername);

    const newUser = await this.findById(userId);
    return { user: newUser, created: true };
  }

  /**
   * Generate a unique username by appending numbers if needed
   * @param {string} baseUsername - Base username to try
   * @returns {Promise<string>} Unique username
   */
  async generateUniqueUsername(baseUsername) {
    // Clean the username
    let username = baseUsername
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);

    if (!username) {
      username = 'user';
    }

    // Check if it exists
    const exists = await this.findByUsername(username);
    if (!exists) {
      return username;
    }

    // Try appending numbers
    for (let i = 1; i < 1000; i++) {
      const candidate = `${username}${i}`;
      const candidateExists = await this.findByUsername(candidate);
      if (!candidateExists) {
        return candidate;
      }
    }

    // Fallback to random suffix
    return `${username}_${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Create a user with email (for registration)
   * @param {Object} data - User data
   * @param {string} data.email - User email
   * @param {string} data.password - User password
   * @param {string} [data.username] - Optional username (generated from email if not provided)
   * @returns {Promise<Object>} Created user
   */
  async createUserWithEmail(data) {
    const { email, password, username: providedUsername } = data;

    if (!email) {
      throw new Error('Email is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    // Check if email already exists
    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    // Generate username from email if not provided
    const baseUsername = providedUsername || email.split('@')[0];
    const username = await this.generateUniqueUsername(baseUsername);

    // Check if username already exists
    const existingUsername = await this.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const userId = crypto.randomUUID();
    const hash = bcrypt.hashSync(password, 10);

    await query(
      `INSERT INTO users (id, username, email, password_hash, role, settings)
       VALUES ($1, $2, $3, $4, 'viewer', '{}')`,
      [userId, username, email.toLowerCase(), hash]
    );

    // Create personal domain
    const domainId = await this.createPersonalDomain(userId, username);
    if (domainId) {
      await query(
        'UPDATE users SET personal_domain_id = $1 WHERE id = $2',
        [domainId, userId]
      );
    }

    return this.findById(userId);
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

export default userRepository;
