// pages/api/meta/init-core.js
// Initialize core PostgreSQL tables that may be missing

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST for initialisation' });
  }

  // Admin authentication required for init endpoints
  const { user, role } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required for initialization' });
  }

  try {
    const results = {
      tables: [],
      indexes: [],
    };

    // Project members table
    await query(`
      CREATE TABLE IF NOT EXISTS project_members (
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('Business Analyst', 'Product Owner', 'Stakeholder', 'Viewer')),
        added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        added_by TEXT,
        PRIMARY KEY (project_id, user_id)
      )
    `);
    results.tables.push('project_members');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id)
    `);
    results.indexes.push('idx_project_members_user');

    // Menu sections table
    await query(`
      CREATE TABLE IF NOT EXISTS menu_sections (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        is_system BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    results.tables.push('menu_sections');

    // Menu items table
    await query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        href TEXT NOT NULL,
        icon TEXT,
        default_section TEXT,
        roles TEXT[] DEFAULT '{admin,editor,viewer}',
        is_active BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    results.tables.push('menu_items');

    // Menu config default table
    await query(`
      CREATE TABLE IF NOT EXISTS menu_config_default (
        id SERIAL PRIMARY KEY,
        version INTEGER NOT NULL DEFAULT 1,
        config JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_by TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    results.tables.push('menu_config_default');

    // Menu config user table
    await query(`
      CREATE TABLE IF NOT EXISTS menu_config_user (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        config JSONB NOT NULL DEFAULT '{}',
        based_on_version INTEGER,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )
    `);
    results.tables.push('menu_config_user');

    return res.status(200).json({
      ok: true,
      message: 'Core tables initialized successfully',
      results,
    });
  } catch (err) {
    console.error('Error initializing core tables:', err);
    return res.status(500).json({ error: 'Failed to initialize core tables', ...(process.env.NODE_ENV !== 'production' && { details: err.message }) });
  }
}
