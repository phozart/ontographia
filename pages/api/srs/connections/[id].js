// pages/api/srs/connections/[id].js
// Strategic Reasoning Suite - Single Connection API
// Manages individual connection operations

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

// Get project from connection
async function getProjectFromConnection(connectionId) {
  const result = await query(
    `SELECT s.project_id FROM srs_connections c
     JOIN srs_sessions s ON s.id = c.session_id
     WHERE c.id = $1`,
    [connectionId]
  );
  return result.rows[0]?.project_id;
}

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);
  const { id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Connection ID required' });
  }

  // Check access
  const projectId = await getProjectFromConnection(id);
  if (!projectId) {
    return res.status(404).json({ error: 'Connection not found' });
  }

  const { hasAccess, error } = await checkProjectAccess(
    req,
    projectId,
    req.method === 'GET' ? 'view' : 'edit'
  );

  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  // ========== GET - Get connection ==========
  if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT * FROM srs_connections WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching connection:', err);
      return res.status(500).json({ error: 'Failed to fetch connection', details: err.message });
    }
  }

  // ========== PUT - Update connection ==========
  if (req.method === 'PUT') {
    const { connectionType, note } = req.body;

    try {
      const updates = [];
      const params = [];
      let paramIdx = 1;

      if (connectionType !== undefined) {
        updates.push(`connection_type = $${paramIdx}`);
        params.push(connectionType);
        paramIdx++;
      }

      if (note !== undefined) {
        updates.push(`note = $${paramIdx}`);
        params.push(note);
        paramIdx++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push('updated_at = NOW()');
      params.push(id);

      const result = await query(
        `UPDATE srs_connections SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating connection:', err);
      return res.status(500).json({ error: 'Failed to update connection', details: err.message });
    }
  }

  // ========== DELETE - Delete connection ==========
  if (req.method === 'DELETE') {
    try {
      const result = await query(
        'DELETE FROM srs_connections WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting connection:', err);
      return res.status(500).json({ error: 'Failed to delete connection', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
