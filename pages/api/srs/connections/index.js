// pages/api/srs/connections/index.js
// Strategic Reasoning Suite - Connections API
// Manages cross-space connections between elements

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

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

  // ========== GET - List connections ==========
  if (req.method === 'GET') {
    const { sessionId, elementId } = req.query;

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
      let sql = `SELECT * FROM srs_connections WHERE session_id = $1`;
      const params = [sessionId];

      // Optionally filter by element
      if (elementId) {
        sql += ` AND (from_element_id = $2 OR to_element_id = $2)`;
        params.push(elementId);
      }

      sql += ` ORDER BY created_at ASC`;

      const result = await query(sql, params);

      return res.status(200).json({ connections: result.rows });
    } catch (err) {
      console.error('Error listing connections:', err);
      return res.status(500).json({ error: 'Failed to list connections', details: err.message });
    }
  }

  // ========== POST - Create connection ==========
  if (req.method === 'POST') {
    const {
      sessionId,
      fromElementId,
      fromElementType,
      toElementId,
      toElementType,
      connectionType,
      note,
    } = req.body;

    if (!sessionId || !fromElementId || !toElementId || !connectionType) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      // Check for existing connection
      const existing = await query(
        `SELECT id FROM srs_connections
         WHERE session_id = $1
           AND from_element_id = $2
           AND to_element_id = $3
           AND connection_type = $4`,
        [sessionId, fromElementId, toElementId, connectionType]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({
          error: 'Connection already exists',
          existingId: existing.rows[0].id,
        });
      }

      const result = await query(
        `INSERT INTO srs_connections (
          session_id, from_element_id, from_element_type,
          to_element_id, to_element_type, connection_type, note,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
        [
          sessionId,
          fromElementId,
          fromElementType || 'unknown',
          toElementId,
          toElementType || 'unknown',
          connectionType,
          note || '',
          user,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating connection:', err);
      return res.status(500).json({ error: 'Failed to create connection', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
