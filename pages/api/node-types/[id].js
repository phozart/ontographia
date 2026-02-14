// pages/api/node-types/[id].js
// Single node type operations - PostgreSQL implementation

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
      const result = await query(
        'SELECT * FROM graph_node_types WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NodeType not found' });
      }

      const row = result.rows[0];

      return res.status(200).json({
        id: row.id,
        name: row.name,
        label: row.label || row.name,
        description: row.description || '',
        layer: row.layer || 'Unassigned',
        color: row.color || '#888888',
        icon: row.icon || 'dot',
        domain: row.domain || 'core',
        shape: row.shape || 'ellipse',
      });
    }

    if (req.method === 'PUT') {
      const { name, label, description, layer, color, icon, domain, shape } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const result = await query(`
        UPDATE graph_node_types
        SET name = $2,
            label = COALESCE($3, name),
            description = COALESCE($4, description, ''),
            layer = COALESCE($5, layer, 'Unassigned'),
            color = COALESCE($6, color, '#888888'),
            icon = COALESCE($7, icon, 'dot'),
            domain = COALESCE($8, domain, 'core'),
            shape = COALESCE($9, shape, 'ellipse'),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [id, name, label, description, layer, color, icon, domain, shape]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NodeType not found' });
      }

      return res.status(200).json({ id });
    }

    if (req.method === 'DELETE') {
      // Check if any nodes are using this type
      const nodesResult = await query(
        'SELECT COUNT(*) as count FROM graph_nodes WHERE type_id = $1',
        [id]
      );

      const count = parseInt(nodesResult.rows[0]?.count || 0);
      if (count > 0) {
        return res.status(400).json({ error: 'Cannot delete NodeType with existing nodes' });
      }

      const result = await query(
        'DELETE FROM graph_node_types WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'NodeType not found' });
      }

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[node-types/[id] API error]', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
