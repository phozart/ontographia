/**
 * Admin API to fix graph tables schema
 * POST /api/admin/fix-graph-schema
 *
 * Creates missing graph tables that the API expects
 */

import { query } from '../../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const role = req.headers['x-role'];
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const results = [];

  try {
    // Create graph_nodes table if not exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS graph_nodes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          type TEXT,
          domain TEXT,
          description TEXT,
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      results.push('Created/verified graph_nodes table');
    } catch (err) {
      results.push(`graph_nodes: ${err.message}`);
    }

    // Create graph_relationship_types table if not exists
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS graph_relationship_types (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      results.push('Created/verified graph_relationship_types table');
    } catch (err) {
      results.push(`graph_relationship_types: ${err.message}`);
    }

    // Create graph_relationships table if not exists (without foreign keys first)
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS graph_relationships (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          source_id UUID,
          target_id UUID,
          type_id UUID,
          name TEXT,
          description TEXT,
          weight FLOAT DEFAULT 1.0,
          properties JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      results.push('Created/verified graph_relationships table');
    } catch (err) {
      results.push(`graph_relationships: ${err.message}`);
    }

    // Create indexes (only if columns exist)
    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_graph_nodes_domain ON graph_nodes(domain)`);
      results.push('Created idx_graph_nodes_domain');
    } catch (err) {
      results.push(`idx_graph_nodes_domain: ${err.message}`);
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_graph_relationships_source ON graph_relationships(source_id)`);
      results.push('Created idx_graph_relationships_source');
    } catch (err) {
      results.push(`idx_graph_relationships_source: ${err.message}`);
    }

    try {
      await query(`CREATE INDEX IF NOT EXISTS idx_graph_relationships_target ON graph_relationships(target_id)`);
      results.push('Created idx_graph_relationships_target');
    } catch (err) {
      results.push(`idx_graph_relationships_target: ${err.message}`);
    }

    // Create artefacts table if not exists (for project artefact counts)
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS artefacts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID,
          name TEXT NOT NULL,
          type TEXT,
          content TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      results.push('Created/verified artefacts table');
    } catch (err) {
      results.push(`artefacts: ${err.message}`);
    }

    return res.json({ success: true, results });

  } catch (error) {
    console.error('[API /admin/fix-graph-schema]', error);
    return res.status(500).json({ error: 'Schema fix failed', results, ...(process.env.NODE_ENV !== 'production' && { details: error.message }) });
  }
}
