// pages/api/srs/sessions/index.js
// Strategic Reasoning Suite - Sessions API
// Manages reasoning sessions (list, create)

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List sessions ==========
  if (req.method === 'GET') {
    const { projectId, status, search, limit = 50, offset = 0 } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT s.*,
          u.username as owner_username,
          (SELECT COUNT(*) FROM srs_questions q WHERE q.session_id = s.id) as question_count,
          (SELECT COUNT(*) FROM srs_frames f WHERE f.session_id = s.id) as frame_count,
          (SELECT COUNT(*) FROM srs_parallel_states ps WHERE ps.session_id = s.id) as state_count,
          (SELECT COUNT(*) FROM srs_system_nodes sn WHERE sn.session_id = s.id) as node_count,
          (SELECT COUNT(*) FROM srs_perspectives p WHERE p.session_id = s.id) as perspective_count,
          (SELECT COUNT(*) FROM srs_decisions d WHERE d.session_id = s.id) as decision_count,
          (SELECT COUNT(*) FROM srs_snapshots snap WHERE snap.session_id = s.id) as snapshot_count
        FROM srs_sessions s
        LEFT JOIN users u ON u.id = s.owner_id
        WHERE s.project_id = $1
      `;
      const params = [projectId];
      let paramIdx = 2;

      // Filter by status
      if (status) {
        sql += ` AND s.status = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      // Search
      if (search) {
        sql += ` AND (s.title ILIKE $${paramIdx} OR s.context ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ` ORDER BY s.updated_at DESC`;
      sql += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const result = await query(sql, params);

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM srs_sessions WHERE project_id = $1`,
        [projectId]
      );

      // Enhance sessions with element counts
      const sessions = result.rows.map(s => ({
        ...s,
        elementCounts: {
          questions: parseInt(s.question_count, 10) || 0,
          frames: parseInt(s.frame_count, 10) || 0,
          states: parseInt(s.state_count, 10) || 0,
          nodes: parseInt(s.node_count, 10) || 0,
          perspectives: parseInt(s.perspective_count, 10) || 0,
          decisions: parseInt(s.decision_count, 10) || 0,
        },
        snapshotCount: parseInt(s.snapshot_count, 10) || 0,
        totalElements: (
          parseInt(s.question_count, 10) || 0 +
          parseInt(s.frame_count, 10) || 0 +
          parseInt(s.state_count, 10) || 0 +
          parseInt(s.node_count, 10) || 0 +
          parseInt(s.perspective_count, 10) || 0 +
          parseInt(s.decision_count, 10) || 0
        ),
      }));

      return res.status(200).json({
        sessions,
        total: parseInt(countResult.rows[0].total, 10),
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });
    } catch (err) {
      console.error('Error listing SRS sessions:', err);
      return res.status(500).json({ error: 'Failed to list sessions', details: err.message });
    }
  }

  // ========== POST - Create new session ==========
  if (req.method === 'POST') {
    const { projectId, title, intent, mode, context } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Session title is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // Determine starting space based on intent
      const intentStartSpaces = {
        understand: 'questions',
        decide: 'frames',
        explain: 'frames',
        explore: 'parallel',
        analyze: 'systems',
      };
      const startingSpace = intentStartSpaces[intent] || 'questions';

      const result = await query(
        `INSERT INTO srs_sessions (
          project_id, owner_id, title, intent, mode, context,
          current_space, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', NOW(), NOW())
        RETURNING *`,
        [
          projectId,
          user,
          title.trim(),
          intent || 'understand',
          mode || 'solo',
          context || '',
          startingSpace,
        ]
      );

      // Create initial space records
      const session = result.rows[0];
      const spaceIds = ['questions', 'frames', 'parallel', 'systems', 'perspectives', 'decisions'];

      for (const spaceId of spaceIds) {
        await query(
          `INSERT INTO srs_spaces (session_id, space_id, canvas_state)
           VALUES ($1, $2, $3)`,
          [session.id, spaceId, JSON.stringify({ position: { x: 0, y: 0 }, zoom: 1 })]
        );
      }

      return res.status(201).json(session);
    } catch (err) {
      console.error('Error creating SRS session:', err);
      return res.status(500).json({ error: 'Failed to create session', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
