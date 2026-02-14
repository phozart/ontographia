// pages/api/node-types/index.js
// Graph node types API - PostgreSQL implementation

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

// Auto-create table if it doesn't exist
async function ensureTableExists() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS graph_node_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        label TEXT,
        description TEXT,
        layer TEXT,
        color TEXT DEFAULT '#6b7280',
        icon TEXT,
        shape TEXT DEFAULT 'ellipse',
        domain TEXT DEFAULT 'core',
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_node_types_domain ON graph_node_types(domain)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_node_types_layer ON graph_node_types(layer)`);
  } catch (err) {
    if (!err.message.includes('already exists')) {
      console.error('[node-types] Error ensuring table:', err.message);
    }
  }
}

export default async function handler(req, res) {
  // Authentication required for write operations
  const { user, role } = getUserFromRequest(req);
  if (req.method !== 'GET' && !user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'GET') {
      const { domain, domainName } = req.query;

      // Ensure table exists
      await ensureTableExists();

      let sql = 'SELECT * FROM graph_node_types WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (domain && domain !== 'all') {
        const domainFilters = [domain, domainName].filter(Boolean);
        if (domainFilters.length) {
          sql += ` AND COALESCE(domain, 'core') = ANY($${paramIdx})`;
          params.push(domainFilters);
          paramIdx++;
        }
      }

      sql += ' ORDER BY name';

      const result = await query(sql, params);

      const data = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        label: row.label || row.name,
        description: row.description || '',
        layer: row.layer || 'Unassigned',
        color: row.color || '#888888',
        icon: row.icon || 'dot',
        domain: row.domain || 'core',
        shape: row.shape || 'ellipse',
      }));

      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { name, label, description, layer, color, icon, domain, shape } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const id = `nt_${Date.now()}`;

      // Ensure table exists
      await ensureTableExists();

      await query(`
        INSERT INTO graph_node_types (id, name, label, description, layer, color, icon, domain, shape)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        id,
        name,
        label || name,
        description || '',
        layer || 'Unassigned',
        color || '#888888',
        icon || 'dot',
        domain || 'core',
        shape || 'ellipse',
      ]);

      return res.status(201).json({
        id,
        name,
        label: label || name,
        description: description || '',
        layer: layer || 'Unassigned',
        color: color || '#888888',
        icon: icon || 'dot',
        domain: domain || 'core',
        shape: shape || 'ellipse',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[node-types API error]', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
