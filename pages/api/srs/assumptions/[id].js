// pages/api/srs/assumptions/[id].js
// Strategic Reasoning Suite - Single Assumption API
// Manages individual assumption operations

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

// Get project from assumption
async function getProjectFromAssumption(assumptionId) {
  const result = await query(
    `SELECT s.project_id FROM srs_assumptions a
     JOIN srs_sessions s ON s.id = a.session_id
     WHERE a.id = $1`,
    [assumptionId]
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
    return res.status(400).json({ error: 'Assumption ID required' });
  }

  // Check access
  const projectId = await getProjectFromAssumption(id);
  if (!projectId) {
    return res.status(404).json({ error: 'Assumption not found' });
  }

  const { hasAccess, error } = await checkProjectAccess(
    req,
    projectId,
    req.method === 'GET' ? 'view' : 'edit'
  );

  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  // ========== GET - Get assumption ==========
  if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT * FROM srs_assumptions WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assumption not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching assumption:', err);
      return res.status(500).json({ error: 'Failed to fetch assumption', details: err.message });
    }
  }

  // ========== PUT - Update assumption ==========
  if (req.method === 'PUT') {
    const { text, criticality, is_validated, validation_notes } = req.body;

    try {
      const updates = [];
      const params = [];
      let paramIdx = 1;

      if (text !== undefined) {
        updates.push(`text = $${paramIdx}`);
        params.push(text);
        paramIdx++;
      }

      if (criticality !== undefined) {
        updates.push(`criticality = $${paramIdx}`);
        params.push(criticality);
        paramIdx++;
      }

      if (is_validated !== undefined) {
        updates.push(`is_validated = $${paramIdx}`);
        params.push(is_validated);
        paramIdx++;

        // Set validated_at timestamp
        if (is_validated) {
          updates.push(`validated_at = NOW()`);
        } else {
          updates.push(`validated_at = NULL`);
        }
      }

      if (validation_notes !== undefined) {
        updates.push(`validation_notes = $${paramIdx}`);
        params.push(validation_notes);
        paramIdx++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push('updated_at = NOW()');
      params.push(id);

      const result = await query(
        `UPDATE srs_assumptions SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assumption not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating assumption:', err);
      return res.status(500).json({ error: 'Failed to update assumption', details: err.message });
    }
  }

  // ========== DELETE - Delete assumption ==========
  if (req.method === 'DELETE') {
    try {
      const result = await query(
        'DELETE FROM srs_assumptions WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Assumption not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting assumption:', err);
      return res.status(500).json({ error: 'Failed to delete assumption', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
