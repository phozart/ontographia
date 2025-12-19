// pages/api/srs/snapshots.js
// Strategic Reasoning Suite - Snapshots API
// Manages reasoning trail snapshots

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

// Get project from session
async function getProjectFromSession(sessionId) {
  const result = await query(
    'SELECT project_id FROM srs_sessions WHERE id = $1',
    [sessionId]
  );
  return result.rows[0]?.project_id;
}

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List snapshots ==========
  if (req.method === 'GET') {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const projectId = await getProjectFromSession(sessionId);
    if (!projectId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `SELECT id, session_id, description, created_by, created_at
         FROM srs_snapshots
         WHERE session_id = $1
         ORDER BY created_at DESC`,
        [sessionId]
      );

      return res.status(200).json({ snapshots: result.rows });
    } catch (err) {
      console.error('Error listing snapshots:', err);
      return res.status(500).json({ error: 'Failed to list snapshots', details: err.message });
    }
  }

  // ========== POST - Create snapshot ==========
  if (req.method === 'POST') {
    const { sessionId, description, snapshotData } = req.body;

    if (!sessionId || !snapshotData) {
      return res.status(400).json({ error: 'Session ID and snapshot data required' });
    }

    const projectId = await getProjectFromSession(sessionId);
    if (!projectId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `INSERT INTO srs_snapshots (
          session_id, description, snapshot_data, created_by, created_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING *`,
        [sessionId, description || '', JSON.stringify(snapshotData), user]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating snapshot:', err);
      return res.status(500).json({ error: 'Failed to create snapshot', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
