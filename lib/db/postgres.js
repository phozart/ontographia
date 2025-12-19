// lib/db/postgres.js
// Clean PostgreSQL client - no schema initialization here
// For backwards compatibility, use lib/pg.js which handles migrations

import { Pool } from 'pg';

/**
 * PostgreSQL connection pool configuration
 */
const poolConfig = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'ontographia',
  user: process.env.PGUSER || 'ontographia',
  password: process.env.PGPASSWORD || 'ontographia',
  ssl:
    process.env.PGSSLMODE && process.env.PGSSLMODE !== 'disable'
      ? { rejectUnauthorized: process.env.PGSSLMODE === 'require' }
      : false,
  max: 10,
};

// Singleton pool instance
let pool = null;

/**
 * Get or create the database pool
 * @returns {Pool}
 */
export function getPool() {
  if (!pool) {
    pool = new Pool(poolConfig);

    // Log connection errors
    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err);
    });
  }
  return pool;
}

/**
 * Execute a SQL query
 * @param {string} text - SQL query string
 * @param {any[]} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('Slow query:', { text: text.substring(0, 100), duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('Query error:', { text: text.substring(0, 100), error: error.message });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<import('pg').PoolClient>}
 */
export async function getClient() {
  const pool = getPool();
  return pool.connect();
}

/**
 * Execute a function within a transaction
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn - Function to execute
 * @returns {Promise<T>}
 * @template T
 */
export async function withTransaction(fn) {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// For testing - allows injecting a mock pool
export function setPool(mockPool) {
  pool = mockPool;
}

export default {
  query,
  getClient,
  getPool,
  withTransaction,
  closePool,
  setPool,
};
