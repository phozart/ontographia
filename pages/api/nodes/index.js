// pages/api/nodes/index.js
// Graph nodes API - PostgreSQL implementation

import { query } from '../../../lib/pg';
import { getUserFromRequest } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  // Authentication required for write operations
  const { user, role } = getUserFromRequest(req);
  if (req.method !== 'GET' && !user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    if (req.method === 'GET') {
      const { typeId, typeIds, domain, domainName, count } = req.query;

      // Build query
      let sql = `
        SELECT
          n.id, n.name, n.type_id, n.description, n.layer, n.tags,
          n.attributes, n.color, n.icon, n.weight, n.shape, n.domain, n.x, n.y,
          t.name as type_name, t.color as type_color, t.shape as type_shape, t.icon as type_icon, t.layer as type_layer, t.domain as type_domain
        FROM graph_nodes n
        LEFT JOIN graph_node_types t ON n.type_id = t.id
        WHERE 1=1
      `;
      const params = [];
      let paramIdx = 1;

      // Filter by type
      let filterIds = [];
      if (typeIds) {
        const raw = Array.isArray(typeIds) ? typeIds.join(',') : typeIds;
        filterIds = raw.split(',').map(s => s.trim()).filter(Boolean);
      } else if (typeId) {
        filterIds = [typeId];
      }

      if (filterIds.length > 0) {
        sql += ` AND COALESCE(n.type_id, '') = ANY($${paramIdx})`;
        params.push(filterIds);
        paramIdx++;
      }

      // Filter by domain - cast UUID to text for comparison
      const domainFilters = domain ? [domain, domainName].filter(Boolean) : [];
      if (domainFilters.length > 0) {
        sql += ` AND COALESCE(n.domain::text, COALESCE(t.domain::text, 'core')) = ANY($${paramIdx})`;
        params.push(domainFilters);
        paramIdx++;
      }

      sql += ' ORDER BY n.name';

      // Count mode
      if (count === 'true') {
        const countSql = sql.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as count FROM');
        const result = await query(countSql.replace(' ORDER BY n.name', ''), params);
        return res.status(200).json({ count: parseInt(result.rows[0]?.count || 0) });
      }

      const result = await query(sql, params);

      const nodes = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        typeId: row.type_id,
        typeName: row.type_name,
        typeColor: row.type_color || row.color,
        typeShape: row.type_shape || row.shape,
        layer: row.layer || row.type_layer || 'Unassigned',
        description: row.description || '',
        tags: row.tags || [],
        attributes: row.attributes || {},
        color: row.color,
        icon: row.icon || row.type_icon,
        weight: row.weight,
        shape: row.shape || row.type_shape || 'ellipse',
        // Return domain with fallback to type domain - matches server-side filter logic
        domain: row.domain || row.type_domain || null,
        x: row.x,
        y: row.y,
      }));

      return res.status(200).json(nodes);
    }

    if (req.method === 'POST') {
      const { typeId, name, layer, tags, weight, description, icon, color, attributes, shape, domain, x, y } = req.body || {};

      if (!typeId) {
        return res.status(400).json({ error: 'typeId is required' });
      }
      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const id = `n_${Date.now()}`;
      const safeLayer = layer ?? null;
      const safeDomain = domain ?? null;
      const safeTags = tags ?? [];
      const safeDescription = description ?? '';
      const safeIcon = icon ?? null;
      const safeShape = shape ?? null;
      const safeAttributes = attributes && typeof attributes === 'object' ? attributes : {};
      const safeWeight = typeof weight === 'number' ? weight : (parseFloat(weight) || null);
      const safeColor = color === undefined || color === '' ? null : color;
      const safeX = typeof x === 'number' ? x : (parseFloat(x) || null);
      const safeY = typeof y === 'number' ? y : (parseFloat(y) || null);

      // Get layer from type if not specified
      let finalLayer = safeLayer;
      if (!finalLayer && typeId) {
        const typeResult = await query('SELECT layer FROM graph_node_types WHERE id = $1', [typeId]);
        if (typeResult.rows[0]) {
          finalLayer = typeResult.rows[0].layer;
        }
      }

      await query(`
        INSERT INTO graph_nodes (id, type_id, name, description, layer, tags, attributes, color, icon, weight, shape, domain, x, y)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [id, typeId, name, safeDescription, finalLayer, safeTags, safeAttributes, safeColor, safeIcon, safeWeight, safeShape, safeDomain, safeX, safeY]);

      return res.status(201).json({ id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[nodes API error]', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
