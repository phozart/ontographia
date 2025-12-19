// pages/api/srs/sessions/[id].js
// Strategic Reasoning Suite - Single Session API
// Manages individual session operations (get, update, delete)

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);
  const { id } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Session ID required' });
  }

  // Get session first to check access
  const sessionResult = await query(
    'SELECT * FROM srs_sessions WHERE id = $1',
    [id]
  );

  if (sessionResult.rows.length === 0) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const session = sessionResult.rows[0];

  const { hasAccess, error: accessError } = await checkProjectAccess(
    req,
    session.project_id,
    req.method === 'GET' ? 'view' : 'edit'
  );

  if (!hasAccess) {
    return res.status(403).json({ error: accessError });
  }

  // ========== GET - Load session with all data ==========
  if (req.method === 'GET') {
    try {
      // Fetch all elements for each space
      const [
        questionsResult,
        framesResult,
        frameElementsResult,
        parallelStatesResult,
        systemNodesResult,
        causalLinksResult,
        feedbackLoopsResult,
        perspectivesResult,
        decisionsResult,
        connectionsResult,
        commentsResult,
        assumptionsResult,
        snapshotsResult,
        participantsResult,
      ] = await Promise.all([
        query('SELECT * FROM srs_questions WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_frames WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query(`
          SELECT fe.* FROM srs_frame_elements fe
          JOIN srs_frames f ON f.id = fe.frame_id
          WHERE f.session_id = $1
          ORDER BY fe.created_at ASC
        `, [id]),
        query('SELECT * FROM srs_parallel_states WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_system_nodes WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_causal_links WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_feedback_loops WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_perspectives WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_decisions WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_connections WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_comments WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_assumptions WHERE session_id = $1 ORDER BY created_at ASC', [id]),
        query('SELECT * FROM srs_snapshots WHERE session_id = $1 ORDER BY created_at DESC', [id]),
        query(`
          SELECT sp.*, u.username
          FROM srs_session_participants sp
          LEFT JOIN users u ON u.id = sp.user_id
          WHERE sp.session_id = $1
        `, [id]),
      ]);

      // Get space canvas states
      const spacesResult = await query(
        'SELECT * FROM srs_spaces WHERE session_id = $1',
        [id]
      );

      const spaceStates = {};
      spacesResult.rows.forEach(s => {
        spaceStates[s.space_id] = s.canvas_state || { position: { x: 0, y: 0 }, zoom: 1 };
      });

      return res.status(200).json({
        session,
        questions: questionsResult.rows,
        frames: framesResult.rows,
        frameElements: frameElementsResult.rows,
        parallelStates: parallelStatesResult.rows,
        systemNodes: systemNodesResult.rows,
        causalLinks: causalLinksResult.rows,
        feedbackLoops: feedbackLoopsResult.rows,
        perspectives: perspectivesResult.rows,
        decisions: decisionsResult.rows,
        connections: connectionsResult.rows,
        comments: commentsResult.rows,
        assumptions: assumptionsResult.rows,
        snapshots: snapshotsResult.rows,
        participants: participantsResult.rows,
        spaceStates,
      });
    } catch (err) {
      console.error('Error loading SRS session:', err);
      return res.status(500).json({ error: 'Failed to load session', details: err.message });
    }
  }

  // ========== PUT - Update session ==========
  if (req.method === 'PUT') {
    const { title, context, current_space, status, duration_minutes, conclusion } = req.body;

    try {
      const updates = [];
      const params = [];
      let paramIdx = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramIdx}`);
        params.push(title);
        paramIdx++;
      }

      if (context !== undefined) {
        updates.push(`context = $${paramIdx}`);
        params.push(context);
        paramIdx++;
      }

      if (current_space !== undefined) {
        updates.push(`current_space = $${paramIdx}`);
        params.push(current_space);
        paramIdx++;
      }

      if (status !== undefined) {
        updates.push(`status = $${paramIdx}`);
        params.push(status);
        paramIdx++;

        // Set closed_at if completing
        if (status === 'completed' || status === 'archived') {
          updates.push(`closed_at = NOW()`);
        }
      }

      if (duration_minutes !== undefined) {
        updates.push(`duration_minutes = $${paramIdx}`);
        params.push(duration_minutes);
        paramIdx++;
      }

      if (conclusion !== undefined) {
        updates.push(`conclusion = $${paramIdx}`);
        params.push(conclusion);
        paramIdx++;
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      updates.push('updated_at = NOW()');
      params.push(id);

      const result = await query(
        `UPDATE srs_sessions SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        params
      );

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating SRS session:', err);
      return res.status(500).json({ error: 'Failed to update session', details: err.message });
    }
  }

  // ========== DELETE - Delete session ==========
  if (req.method === 'DELETE') {
    try {
      // Delete in correct order due to foreign keys
      // The schema should have ON DELETE CASCADE, but we'll be explicit
      await query('DELETE FROM srs_coaching_events WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_exports WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_snapshots WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_assumptions WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_comments WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_connections WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_decisions WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_perspectives WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_feedback_loops WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_causal_links WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_system_nodes WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_parallel_states WHERE session_id = $1', [id]);
      await query(`
        DELETE FROM srs_frame_elements WHERE frame_id IN (
          SELECT id FROM srs_frames WHERE session_id = $1
        )
      `, [id]);
      await query('DELETE FROM srs_frames WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_questions WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_spaces WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_session_participants WHERE session_id = $1', [id]);
      await query('DELETE FROM srs_sessions WHERE id = $1', [id]);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting SRS session:', err);
      return res.status(500).json({ error: 'Failed to delete session', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
