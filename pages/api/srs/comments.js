// pages/api/srs/comments.js
// Strategic Reasoning Suite - Comments API
// Manages comments on elements

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

  // ========== GET - List comments ==========
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
      let sql = `
        SELECT c.*, u.username as author_username
        FROM srs_comments c
        LEFT JOIN users u ON u.id = c.author_id
        WHERE c.session_id = $1
      `;
      const params = [sessionId];

      if (elementId) {
        sql += ` AND c.element_id = $2`;
        params.push(elementId);
      }

      sql += ` ORDER BY c.created_at ASC`;

      const result = await query(sql, params);

      return res.status(200).json({ comments: result.rows });
    } catch (err) {
      console.error('Error listing comments:', err);
      return res.status(500).json({ error: 'Failed to list comments', details: err.message });
    }
  }

  // ========== POST - Create comment ==========
  if (req.method === 'POST') {
    const { sessionId, elementId, elementType, text } = req.body;

    if (!sessionId || !elementId || !text) {
      return res.status(400).json({ error: 'Session ID, element ID, and text required' });
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
        `INSERT INTO srs_comments (
          session_id, element_id, element_type, author_id, text, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *`,
        [sessionId, elementId, elementType || 'unknown', user, text]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating comment:', err);
      return res.status(500).json({ error: 'Failed to create comment', details: err.message });
    }
  }

  // ========== DELETE - Delete comment ==========
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Comment ID required' });
    }

    // Get comment to check ownership
    const commentResult = await query(
      `SELECT c.*, s.project_id FROM srs_comments c
       JOIN srs_sessions s ON s.id = c.session_id
       WHERE c.id = $1`,
      [id]
    );

    if (commentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = commentResult.rows[0];

    // Only author or admin can delete
    if (comment.author_id !== user && role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    try {
      await query('DELETE FROM srs_comments WHERE id = $1', [id]);
      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting comment:', err);
      return res.status(500).json({ error: 'Failed to delete comment', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
