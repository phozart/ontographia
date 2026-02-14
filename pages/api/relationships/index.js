// pages/api/relationships/index.js
// Graph relationships API - PostgreSQL implementation

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

async function ensureTablesExist() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS graph_relationship_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        label TEXT,
        description TEXT,
        color TEXT DEFAULT '#6b7280',
        domain TEXT DEFAULT 'core',
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS graph_relationships (
        id TEXT PRIMARY KEY,
        type_id TEXT REFERENCES graph_relationship_types(id) ON DELETE SET NULL,
        source_id TEXT NOT NULL,
        target_id TEXT NOT NULL,
        name TEXT,
        description TEXT,
        weight REAL,
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_source ON graph_relationships(source_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_target ON graph_relationships(target_id)`);
  } catch (err) {
    if (!err.message.includes('already exists')) {
      console.error('[relationships] Error ensuring tables:', err.message);
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
    await ensureTablesExist();

    if (req.method === 'GET') {
      const { nodeId, domain, domainName } = req.query;

      if (nodeId) {
        // relationships for a single node, with direction
        const domainFilters = domain ? [domain, domainName].filter(Boolean) : [];

        // Get outgoing relationships
        // Cast UUID columns to text for comparison with graph_nodes TEXT ids
        let outgoingSql = `
          SELECT
            r.id, r.type_id, t.name as type_name,
            r.source_id, r.target_id, r.name, r.description, r.weight, r.properties,
            n.id as other_id, n.name as other_name, 'out' as direction
          FROM graph_relationships r
          LEFT JOIN graph_relationship_types t ON r.type_id::text = t.id
          JOIN graph_nodes n ON r.target_id::text = n.id
          WHERE r.source_id::text = $1
        `;
        const outgoingParams = [nodeId];
        let paramIdx = 2;

        if (domainFilters.length > 0) {
          outgoingSql += ` AND COALESCE(n.domain::text, 'core') = ANY($${paramIdx})`;
          outgoingParams.push(domainFilters);
          paramIdx++;
        }

        // Get incoming relationships
        // Cast UUID columns to text for comparison with graph_nodes TEXT ids
        let incomingSql = `
          SELECT
            r.id, r.type_id, t.name as type_name,
            r.source_id, r.target_id, r.name, r.description, r.weight, r.properties,
            n.id as other_id, n.name as other_name, 'in' as direction
          FROM graph_relationships r
          LEFT JOIN graph_relationship_types t ON r.type_id::text = t.id
          JOIN graph_nodes n ON r.source_id::text = n.id
          WHERE r.target_id::text = $1
        `;
        const incomingParams = [nodeId];
        let inParamIdx = 2;

        if (domainFilters.length > 0) {
          incomingSql += ` AND COALESCE(n.domain::text, 'core') = ANY($${inParamIdx})`;
          incomingParams.push(domainFilters);
        }

        const [outgoingResult, incomingResult] = await Promise.all([
          query(outgoingSql, outgoingParams),
          query(incomingSql, incomingParams),
        ]);

        const rels = [...outgoingResult.rows, ...incomingResult.rows].map(row => ({
          id: row.id,
          type: row.type_id || row.type_name,
          direction: row.direction,
          otherNodeId: row.other_id,
          otherNodeName: row.other_name || row.other_id,
        }));

        return res.status(200).json(rels);
      }

      // all relationships (for Graph)
      // Cast UUID columns to text for comparison with graph_nodes TEXT ids
      let sql = `
        SELECT
          r.id, r.type_id, t.name as type_name,
          r.source_id, r.target_id, r.name, r.description, r.weight, r.properties
        FROM graph_relationships r
        LEFT JOIN graph_relationship_types t ON r.type_id::text = t.id
        JOIN graph_nodes a ON r.source_id::text = a.id
        JOIN graph_nodes b ON r.target_id::text = b.id
        WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      if (domain) {
        const domainFilters = [domain, domainName].filter(Boolean);
        if (domainFilters.length) {
          // Cast UUID domain column to text for comparison
          sql += ` AND COALESCE(a.domain::text, 'core') = ANY($${idx}) AND COALESCE(b.domain::text, 'core') = ANY($${idx})`;
          params.push(domainFilters);
          idx++;
        }
      }

      sql += ' ORDER BY r.id';

      const result = await query(sql, params);

      const rels = result.rows.map(row => ({
        id: row.id,
        type: row.type_id || row.type_name,
        sourceId: row.source_id,
        targetId: row.target_id,
      }));

      return res.status(200).json(rels);
    }

    if (req.method === 'POST') {
      const { sourceId, targetId, type, name, description, weight, properties } = req.body || {};

      if (!sourceId || !targetId || !type) {
        return res
          .status(400)
          .json({ error: 'sourceId, targetId and type are required' });
      }

      const relId = `rel_${Date.now()}`;

      // Check that both nodes exist
      const nodesExist = await query(
        'SELECT id FROM graph_nodes WHERE id = ANY($1)',
        [[sourceId, targetId]]
      );

      if (nodesExist.rows.length < 2) {
        return res.status(400).json({ error: 'Source or target node not found' });
      }

      const safeProperties = properties && typeof properties === 'object' ? properties : {};
      const safeWeight = typeof weight === 'number' ? weight : null;

      await query(`
        INSERT INTO graph_relationships (id, type_id, source_id, target_id, name, description, weight, properties)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [relId, type, sourceId, targetId, name || null, description || null, safeWeight, safeProperties]);

      return res.status(201).json({ id: relId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[relationships API error]', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
