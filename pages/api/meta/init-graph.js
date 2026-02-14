// pages/api/meta/init-graph.js
// Initialize PostgreSQL tables for graph/knowledge studio (replacing Neo4j)

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
    const results = { tables: [], indexes: [] };

    // Node Types table (was Neo4j NodeType)
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
    results.tables.push('graph_node_types');

    // Add studio_source column (metamodel tracking — added Feb 2026)
    await query(`ALTER TABLE graph_node_types ADD COLUMN IF NOT EXISTS studio_source TEXT`).catch(() => {});

    await query(`CREATE INDEX IF NOT EXISTS idx_graph_node_types_domain ON graph_node_types(domain)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_node_types_layer ON graph_node_types(layer)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_node_types_studio ON graph_node_types(studio_source)`).catch(() => {});
    results.indexes.push('idx_graph_node_types_domain', 'idx_graph_node_types_layer', 'idx_graph_node_types_studio');

    // Relationship Types table (was Neo4j RelationshipType)
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
    results.tables.push('graph_relationship_types');

    // Add studio_source column (metamodel tracking — added Feb 2026)
    await query(`ALTER TABLE graph_relationship_types ADD COLUMN IF NOT EXISTS studio_source TEXT`).catch(() => {});

    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rel_types_domain ON graph_relationship_types(domain)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rel_types_studio ON graph_relationship_types(studio_source)`).catch(() => {});
    results.indexes.push('idx_graph_rel_types_domain', 'idx_graph_rel_types_studio');

    // Domain Nodes table (was Neo4j DomainNode)
    await query(`
      CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT PRIMARY KEY,
        type_id TEXT REFERENCES graph_node_types(id),
        name TEXT NOT NULL,
        description TEXT,
        layer TEXT,
        tags TEXT[] DEFAULT '{}',
        attributes JSONB DEFAULT '{}',
        color TEXT,
        icon TEXT,
        weight REAL,
        shape TEXT,
        domain TEXT,
        x REAL,
        y REAL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    results.tables.push('graph_nodes');

    await query(`CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON graph_nodes(type_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_nodes_domain ON graph_nodes(domain)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_nodes_layer ON graph_nodes(layer)`);
    results.indexes.push('idx_graph_nodes_type', 'idx_graph_nodes_domain', 'idx_graph_nodes_layer');

    // Domain Relationships table (was Neo4j relationships)
    await query(`
      CREATE TABLE IF NOT EXISTS graph_relationships (
        id TEXT PRIMARY KEY,
        type_id TEXT REFERENCES graph_relationship_types(id),
        source_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
        target_id TEXT NOT NULL REFERENCES graph_nodes(id) ON DELETE CASCADE,
        name TEXT,
        description TEXT,
        weight REAL,
        domain TEXT,
        properties JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    results.tables.push('graph_relationships');

    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_type ON graph_relationships(type_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_source ON graph_relationships(source_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_target ON graph_relationships(target_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_graph_rels_domain ON graph_relationships(domain)`);
    results.indexes.push('idx_graph_rels_type', 'idx_graph_rels_source', 'idx_graph_rels_target', 'idx_graph_rels_domain');

    // Layers table
    await query(`
      CREATE TABLE IF NOT EXISTS graph_layers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    results.tables.push('graph_layers');

    // Seed default layers
    const defaultLayers = [
      { id: 'physical', name: 'Physical', order: 1 },
      { id: 'information', name: 'Information', order: 2 },
      { id: 'systems', name: 'Systems', order: 3 },
      { id: 'rules', name: 'Rules', order: 4 },
      { id: 'governance', name: 'Governance', order: 5 },
    ];

    for (const layer of defaultLayers) {
      await query(`
        INSERT INTO graph_layers (id, name, sort_order)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `, [layer.id, layer.name, layer.order]);
    }

    return res.status(200).json({
      ok: true,
      message: 'Graph tables initialized successfully',
      results,
    });
  } catch (err) {
    console.error('Error initializing graph tables:', err);
    return res.status(500).json({ error: 'Failed to initialize graph tables', ...(process.env.NODE_ENV !== 'production' && { details: err.message }) });
  }
}
