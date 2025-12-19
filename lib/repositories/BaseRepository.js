// lib/repositories/BaseRepository.js
// Base class for all repositories with common CRUD operations

import { query, getClient, withTransaction } from '../db/postgres';

/**
 * @typedef {Object} PaginationOptions
 * @property {number} [limit] - Maximum number of results
 * @property {number} [offset] - Number of results to skip
 * @property {string} [orderBy] - Column to order by
 * @property {'ASC'|'DESC'} [orderDirection] - Order direction
 */

/**
 * Base repository class with common database operations
 * @abstract
 */
export class BaseRepository {
  /**
   * @param {string} tableName - The database table name
   * @param {string} [primaryKey='id'] - The primary key column name
   */
  constructor(tableName, primaryKey = 'id') {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Find a record by its primary key
   * @param {string|number} id - The primary key value
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all records matching the given conditions
   * @param {Object} [conditions={}] - Column-value pairs to filter by
   * @param {PaginationOptions} [options={}] - Pagination and ordering options
   * @returns {Promise<Object[]>}
   */
  async findAll(conditions = {}, options = {}) {
    const { limit, offset, orderBy, orderDirection = 'ASC' } = options;
    const entries = Object.entries(conditions);

    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];

    if (entries.length > 0) {
      const whereClauses = entries.map((_, index) => {
        const paramNum = index + 1;
        return `${entries[index][0]} = $${paramNum}`;
      });
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
      params.push(...entries.map(([, value]) => value));
    }

    if (orderBy) {
      // Validate orderDirection to prevent SQL injection
      const direction = orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${orderBy} ${direction}`;
    }

    if (limit) {
      sql += ` LIMIT ${parseInt(limit, 10)}`;
    }

    if (offset) {
      sql += ` OFFSET ${parseInt(offset, 10)}`;
    }

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Find one record matching the given conditions
   * @param {Object} conditions - Column-value pairs to filter by
   * @returns {Promise<Object|null>}
   */
  async findOne(conditions) {
    const results = await this.findAll(conditions, { limit: 1 });
    return results[0] || null;
  }

  /**
   * Create a new record
   * @param {Object} data - The data to insert
   * @returns {Promise<Object>} The created record
   */
  async create(data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, i) => `$${i + 1}`);

    const sql = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Update a record by its primary key
   * @param {string|number} id - The primary key value
   * @param {Object} data - The data to update
   * @returns {Promise<Object|null>} The updated record or null if not found
   */
  async update(id, data) {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return this.findById(id);
    }

    const setClauses = entries.map(([key], index) => `${key} = $${index + 1}`);
    const values = entries.map(([, value]) => value);

    const sql = `
      UPDATE ${this.tableName}
      SET ${setClauses.join(', ')}, updated_at = NOW()
      WHERE ${this.primaryKey} = $${entries.length + 1}
      RETURNING *
    `;

    const result = await query(sql, [...values, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete a record by its primary key
   * @param {string|number} id - The primary key value
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await query(
      `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *`,
      [id]
    );
    return result.rowCount > 0;
  }

  /**
   * Count records matching the given conditions
   * @param {Object} [conditions={}] - Column-value pairs to filter by
   * @returns {Promise<number>}
   */
  async count(conditions = {}) {
    const entries = Object.entries(conditions);

    let sql = `SELECT COUNT(*) FROM ${this.tableName}`;
    const params = [];

    if (entries.length > 0) {
      const whereClauses = entries.map((_, index) => {
        return `${entries[index][0]} = $${index + 1}`;
      });
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
      params.push(...entries.map(([, value]) => value));
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Check if a record exists
   * @param {Object} conditions - Column-value pairs to filter by
   * @returns {Promise<boolean>}
   */
  async exists(conditions) {
    const count = await this.count(conditions);
    return count > 0;
  }

  /**
   * Execute a custom query
   * @param {string} sql - The SQL query
   * @param {any[]} [params] - Query parameters
   * @returns {Promise<Object[]>}
   */
  async rawQuery(sql, params = []) {
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Execute operations within a transaction
   * @param {(client: import('pg').PoolClient) => Promise<T>} fn
   * @returns {Promise<T>}
   * @template T
   */
  async transaction(fn) {
    return withTransaction(fn);
  }
}

export default BaseRepository;
