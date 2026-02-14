// pages/api/relationship-types/[id].js
// Single relationship type operations - PostgreSQL implementation

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
        'SELECT * FROM graph_relationship_types WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'RelationshipType not found' });
      }

      const row = result.rows[0];

      return res.status(200).json({
        id: row.id,
        name: row.name,
        label: row.label || row.name,
        description: row.description || '',
        color: row.color || '#9ca3af',
        domain: row.domain || 'core',
      });
    }

    if (req.method === 'PUT') {
      const { name, label, description, color, domain } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'name is required' });
      }

      const result = await query(`
        UPDATE graph_relationship_types
        SET name = $2,
            label = COALESCE($3, label, $2),
            description = COALESCE($4, description, ''),
            color = COALESCE($5, color, '#9ca3af'),
            domain = COALESCE($6, domain, 'core'),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `, [id, name, label, description, color, domain]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'RelationshipType not found' });
      }

      return res.status(200).json({ id });
    }

    if (req.method === 'DELETE') {
      // Check if any relationships are using this type
      const relsResult = await query(
        'SELECT COUNT(*) as count FROM graph_relationships WHERE type_id = $1',
        [id]
      );

      const count = parseInt(relsResult.rows[0]?.count || 0);
      if (count > 0) {
        return res.status(400).json({ error: 'Cannot delete RelationshipType with existing relationships' });
      }

      const result = await query(
        'DELETE FROM graph_relationship_types WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'RelationshipType not found' });
      }

      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[relationship-types/[id] API error]', e);
    return res.status(500).json({ error: 'Internal server error', details: e.message });
  }
}
