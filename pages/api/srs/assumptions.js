// pages/api/srs/assumptions.js
// Strategic Reasoning Suite - Assumptions API
// Manages assumptions attached to decisions

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

  // ========== GET - List assumptions ==========
  if (req.method === 'GET') {
    const { sessionId, decisionId } = req.query;

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
      let sql = `SELECT * FROM srs_assumptions WHERE session_id = $1`;
      const params = [sessionId];

      if (decisionId) {
        sql += ` AND decision_id = $2`;
        params.push(decisionId);
      }

      sql += ` ORDER BY created_at ASC`;

      const result = await query(sql, params);

      return res.status(200).json({ assumptions: result.rows });
    } catch (err) {
      console.error('Error listing assumptions:', err);
      return res.status(500).json({ error: 'Failed to list assumptions', details: err.message });
    }
  }

  // ========== POST - Create assumption ==========
  if (req.method === 'POST') {
    const { sessionId, decisionId, text, criticality } = req.body;

    if (!sessionId || !decisionId || !text) {
      return res.status(400).json({ error: 'Session ID, decision ID, and text required' });
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
        `INSERT INTO srs_assumptions (
          session_id, decision_id, text, criticality, is_validated,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, false, NOW(), NOW())
        RETURNING *`,
        [sessionId, decisionId, text, criticality || 'medium']
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating assumption:', err);
      return res.status(500).json({ error: 'Failed to create assumption', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
