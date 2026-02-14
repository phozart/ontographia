// pages/api/relationships/[id].js
// Single relationship operations - PostgreSQL implementation

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  // Authentication required for write operations
  const { user, role } = getUserFromRequest(req);
  if (req.method !== 'GET' && !user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    if (req.method === 'GET') {
      const result = await query(`
        SELECT
          r.id, r.type_id, r.source_id, r.target_id, r.name, r.description, r.weight, r.properties,
          t.name as type_name
        FROM graph_relationships r
        LEFT JOIN graph_relationship_types t ON r.type_id = t.id
        WHERE r.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      const row = result.rows[0];

      return res.status(200).json({
        id: row.id,
        type: row.type_id || row.type_name,
        sourceId: row.source_id,
        targetId: row.target_id,
        name: row.name,
        description: row.description,
        weight: row.weight,
        properties: row.properties || {},
      });
    }

    if (req.method === 'DELETE') {
      await query('DELETE FROM graph_relationships WHERE id = $1', [id]);
      return res.status(204).end();
    }

    if (req.method === 'PUT') {
      const { sourceId, targetId, type, properties, name, description, weight } = req.body || {};

      // If source/target/type present, treat as structural update
      if (sourceId || targetId || type) {
        if (!sourceId || !targetId || !type) {
          return res.status(400).json({ error: 'sourceId, targetId, and type are required for structural update' });
        }

        // Check that both nodes exist
        const nodesExist = await query(
          'SELECT id FROM graph_nodes WHERE id = ANY($1)',
          [[sourceId, targetId]]
        );

        if (nodesExist.rows.length < 2) {
          return res.status(400).json({ error: 'Source or target node not found' });
        }

        const result = await query(`
          UPDATE graph_relationships
          SET type_id = $2, source_id = $3, target_id = $4, updated_at = NOW()
          WHERE id = $1
          RETURNING id
        `, [id, type, sourceId, targetId]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Relationship not found' });
        }

        return res.status(200).json({ id, sourceId, targetId, type });
      }

      // Otherwise treat as property update
      const updates = ['updated_at = NOW()'];
      const params = [id];
      let paramIdx = 2;

      if (properties !== undefined) {
        if (typeof properties !== 'object') {
          return res.status(400).json({ error: 'properties must be an object' });
        }
        updates.push(`properties = $${paramIdx}`);
        params.push(properties);
        paramIdx++;
      }

      if (name !== undefined) {
        updates.push(`name = $${paramIdx}`);
        params.push(name);
        paramIdx++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIdx}`);
        params.push(description);
        paramIdx++;
      }

      if (weight !== undefined) {
        updates.push(`weight = $${paramIdx}`);
        params.push(typeof weight === 'number' ? weight : null);
        paramIdx++;
      }

      if (updates.length === 1) {
        return res.status(400).json({ error: 'No properties to update' });
      }

      const result = await query(`
        UPDATE graph_relationships
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING id
      `, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ id, properties });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[relationships/[id] API error]', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
