// pages/api/nodes/[id].js
// Single node operations - PostgreSQL implementation

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
          n.id, n.name, n.type_id, n.description, n.layer, n.tags,
          n.attributes, n.color, n.icon, n.weight, n.shape, n.domain, n.x, n.y,
          t.name as type_name, t.color as type_color, t.shape as type_shape, t.icon as type_icon, t.layer as type_layer
        FROM graph_nodes n
        LEFT JOIN graph_node_types t ON n.type_id = t.id
        WHERE n.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Node not found' });
      }

      const row = result.rows[0];

      return res.status(200).json({
        id: row.id,
        name: row.name,
        typeId: row.type_id || null,
        typeName: row.type_name || null,
        typeColor: row.type_color || row.color || null,
        typeShape: row.type_shape || row.shape || null,
        layer: row.layer || row.type_layer || 'Unassigned',
        description: row.description || '',
        tags: row.tags || [],
        icon: row.icon || row.type_icon || null,
        color: row.color || null,
        attributes: row.attributes || {},
        weight: typeof row.weight === 'number' ? row.weight : null,
        shape: row.shape || row.type_shape || 'ellipse',
        x: typeof row.x === 'number' ? row.x : null,
        y: typeof row.y === 'number' ? row.y : null,
      });
    }

    if (req.method === 'PUT') {
      const { name, layer, tags, weight, description, icon, color, attributes, shape, x, y } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const safeTags = Array.isArray(tags) ? tags : [];
      const safeWeight =
        typeof weight === 'number'
          ? weight
          : isNaN(parseFloat(weight))
            ? null
            : parseFloat(weight);
      const safeLayer = layer ?? null;
      const safeDescription = description ?? '';
      const safeIcon = icon ?? null;
      const safeColor = color === undefined || color === '' ? null : color;
      const safeShape = shape ?? null;
      const safeAttributes = attributes && typeof attributes === 'object' ? attributes : {};
      const safeX = typeof x === 'number' ? x : (typeof x === 'string' && !isNaN(parseFloat(x)) ? parseFloat(x) : null);
      const safeY = typeof y === 'number' ? y : (typeof y === 'string' && !isNaN(parseFloat(y)) ? parseFloat(y) : null);

      // Build dynamic update query
      const updates = ['name = $2', 'updated_at = NOW()'];
      const params = [id, name];
      let paramIdx = 3;

      if (layer !== undefined) {
        updates.push(`layer = $${paramIdx}`);
        params.push(safeLayer);
        paramIdx++;
      }
      if (tags !== undefined) {
        updates.push(`tags = $${paramIdx}`);
        params.push(safeTags);
        paramIdx++;
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIdx}`);
        params.push(safeDescription);
        paramIdx++;
      }
      if (icon !== undefined) {
        updates.push(`icon = $${paramIdx}`);
        params.push(safeIcon);
        paramIdx++;
      }
      if (color !== undefined) {
        updates.push(`color = $${paramIdx}`);
        params.push(safeColor);
        paramIdx++;
      }
      if (weight !== undefined) {
        updates.push(`weight = $${paramIdx}`);
        params.push(safeWeight);
        paramIdx++;
      }
      if (shape !== undefined) {
        updates.push(`shape = $${paramIdx}`);
        params.push(safeShape);
        paramIdx++;
      }
      if (attributes !== undefined) {
        updates.push(`attributes = $${paramIdx}`);
        params.push(safeAttributes);
        paramIdx++;
      }
      if (x !== undefined) {
        updates.push(`x = $${paramIdx}`);
        params.push(safeX);
        paramIdx++;
      }
      if (y !== undefined) {
        updates.push(`y = $${paramIdx}`);
        params.push(safeY);
        paramIdx++;
      }

      const result = await query(`
        UPDATE graph_nodes
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING id
      `, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Node not found' });
      }

      return res.status(200).json({ id });
    }

    if (req.method === 'DELETE') {
      // Delete relationships first (CASCADE should handle this, but explicit is safer)
      await query('DELETE FROM graph_relationships WHERE source_id = $1 OR target_id = $1', [id]);
      await query('DELETE FROM graph_nodes WHERE id = $1', [id]);

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[nodes/[id] API error]', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
