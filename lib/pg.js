import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
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
});

let initPromise = null;

async function initSchema() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          last_login_at TIMESTAMPTZ,
          login_count INTEGER DEFAULT 0
        );
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS domains (
          id UUID PRIMARY KEY,
          name TEXT NOT NULL,
          notes TEXT,
          owner TEXT NOT NULL REFERENCES users(id),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(name)
        );
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS domain_members (
          domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
          user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('owner','admin','editor','viewer')),
          PRIMARY KEY (domain_id, user_id)
        );
      `);

      // seed admin/admin
      const adminHash = bcrypt.hashSync('admin', 10);
      await client.query(
        `
        INSERT INTO users (id, username, password_hash, role)
        VALUES ('admin', 'admin', $1, 'admin')
        ON CONFLICT (id) DO NOTHING;
      `,
        [adminHash]
      );

      // seed core domain
      await client.query(
        `
        INSERT INTO domains (id, name, notes, owner)
        VALUES (gen_random_uuid(), 'core', 'Default workspace', 'admin')
        ON CONFLICT DO NOTHING;
      `
      );
      await client.query(
        `
        INSERT INTO domain_members (domain_id, user_id, role)
        SELECT d.id, 'admin', 'owner' FROM domains d WHERE d.name = 'core'
        ON CONFLICT DO NOTHING;
      `
      );
      await client.query('COMMIT');

      // dedupe domains by name (keep oldest)
      await client.query(`
        DELETE FROM domains d
        USING domains d2
        WHERE d.name = d2.name AND d.created_at > d2.created_at;
      `);
      await client.query(
        `
        INSERT INTO domain_members (domain_id, user_id, role)
        SELECT d.id, 'admin', 'owner' FROM domains d WHERE d.name = 'core'
        ON CONFLICT DO NOTHING;
      `
      );
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Failed to init schema', err);
      throw err;
    } finally {
      client.release();
    }
  })();
  return initPromise;
}

export async function query(text, params) {
  await initSchema();
  return pool.query(text, params);
}

export async function getClient() {
  await initSchema();
  return pool.connect();
}
