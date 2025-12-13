// pages/api/ea/elements/[id].js
// Single EA element CRUD

import { query } from '../../../../lib/pg';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Element ID required' });
  }

  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT e.*,
          u.username as created_by_username,
          p.name as parent_name
        FROM ea_elements e
        LEFT JOIN users u ON u.id = e.created_by
        LEFT JOIN ea_elements p ON p.id = e.parent_id
        WHERE e.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Element not found' });
      }

      // Get children
      const childrenResult = await query(
        `SELECT id, name, element_type, layer FROM ea_elements WHERE parent_id = $1 ORDER BY name`,
        [id]
      );

      // Get relationships
      const relsResult = await query(
        `SELECT r.*,
          se.name as source_name, se.element_type as source_type,
          te.name as target_name, te.element_type as target_type
        FROM ea_relationships r
        LEFT JOIN ea_elements se ON se.id = r.source_id
        LEFT JOIN ea_elements te ON te.id = r.target_id
        WHERE r.source_id = $1 OR r.target_id = $1`,
        [id]
      );

      return res.status(200).json({
        ...result.rows[0],
        children: childrenResult.rows,
        relationships: relsResult.rows,
      });
    } catch (err) {
      console.error('Error fetching EA element:', err);
      return res.status(500).json({ error: 'Failed to fetch EA element' });
    }
  }

  if (req.method === 'PUT') {
    const { name, description, properties, parentId, positionX, positionY } = req.body;

    try {
      const result = await query(
        `UPDATE ea_elements SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          properties = COALESCE($3, properties),
          parent_id = $4,
          position_x = COALESCE($5, position_x),
          position_y = COALESCE($6, position_y),
          updated_at = now()
        WHERE id = $7
        RETURNING *`,
        [
          name,
          description,
          properties ? JSON.stringify(properties) : null,
          parentId,
          positionX,
          positionY,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating EA element:', err);
      return res.status(500).json({ error: 'Failed to update EA element' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // First delete relationships involving this element
      await query(
        'DELETE FROM ea_relationships WHERE source_id = $1 OR target_id = $1',
        [id]
      );

      // Update children to remove parent reference
      await query(
        'UPDATE ea_elements SET parent_id = NULL WHERE parent_id = $1',
        [id]
      );

      // Delete the element
      const result = await query('DELETE FROM ea_elements WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA element:', err);
      return res.status(500).json({ error: 'Failed to delete EA element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
