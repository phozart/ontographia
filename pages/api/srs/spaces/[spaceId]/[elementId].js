// pages/api/srs/spaces/[spaceId]/[elementId].js
// Strategic Reasoning Suite - Single Element API
// Manages individual element operations (get, update, delete)

import { query } from '../../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';

// Map space IDs to their element tables
const SPACE_TABLES = {
  questions: {
    question: 'srs_questions',
  },
  frames: {
    frame: 'srs_frames',
    frame_element: 'srs_frame_elements',
  },
  parallel: {
    state: 'srs_parallel_states',
  },
  systems: {
    node: 'srs_system_nodes',
    link: 'srs_causal_links',
    loop: 'srs_feedback_loops',
  },
  perspectives: {
    perspective: 'srs_perspectives',
  },
  decisions: {
    decision: 'srs_decisions',
  },
};

// Updatable fields by element type
const UPDATABLE_FIELDS = {
  question: ['text', 'question_type', 'maturity', 'notes', 'answer', 'canvas_x', 'canvas_y'],
  frame: ['title', 'description', 'is_active', 'canvas_x', 'canvas_y'],
  frame_element: ['element_type', 'frame_type', 'content', 'position_order'],
  state: ['title', 'description', 'state_type', 'confidence', 'is_collapsed', 'is_ruled_out', 'collapse_reason', 'position_order', 'canvas_x', 'canvas_y'],
  node: ['label', 'node_type', 'description', 'canvas_x', 'canvas_y'],
  link: ['from_node_id', 'to_node_id', 'polarity', 'time_delay', 'description'],
  loop: ['name', 'loop_type', 'description', 'node_ids'],
  perspective: ['name', 'perspective_type', 'archetype', 'description', 'viewpoint', 'concerns', 'interests', 'canvas_x', 'canvas_y'],
  decision: ['title', 'description', 'reversibility', 'stakes', 'deadline', 'outcome', 'outcome_rationale', 'success_criteria', 'knows', 'unknowns', 'canvas_x', 'canvas_y'],
};

// Get session from element
async function getSessionFromElement(table, elementId, spaceId, elementType) {
  // Frame elements need special handling
  if (elementType === 'frame_element') {
    const result = await query(
      `SELECT f.session_id FROM srs_frame_elements fe
       JOIN srs_frames f ON f.id = fe.frame_id
       WHERE fe.id = $1`,
      [elementId]
    );
    return result.rows[0]?.session_id;
  }

  const result = await query(
    `SELECT session_id FROM ${table} WHERE id = $1`,
    [elementId]
  );
  return result.rows[0]?.session_id;
}

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
  const { spaceId, elementId, elementType } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!SPACE_TABLES[spaceId]) {
    return res.status(400).json({ error: 'Invalid space ID' });
  }

  // elementType comes from query params on PUT/DELETE
  const type = elementType || req.body?.elementType;

  if (!type || !SPACE_TABLES[spaceId][type]) {
    return res.status(400).json({ error: 'Element type required' });
  }

  const table = SPACE_TABLES[spaceId][type];

  // Get session and check access
  const sessionId = await getSessionFromElement(table, elementId, spaceId, type);
  if (!sessionId) {
    return res.status(404).json({ error: 'Element not found' });
  }

  const projectId = await getProjectFromSession(sessionId);
  if (!projectId) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { hasAccess, error } = await checkProjectAccess(
    req,
    projectId,
    req.method === 'GET' ? 'view' : 'edit'
  );

  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  // ========== GET - Get single element ==========
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT * FROM ${table} WHERE id = $1`,
        [elementId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching element:', err);
      return res.status(500).json({ error: 'Failed to fetch element', details: err.message });
    }
  }

  // ========== PUT - Update element ==========
  if (req.method === 'PUT') {
    const allowedFields = UPDATABLE_FIELDS[type];
    if (!allowedFields) {
      return res.status(400).json({ error: 'Unknown element type' });
    }

    try {
      const updates = [];
      const params = [];
      let paramIdx = 1;

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          let value = req.body[field];

          // Handle JSON fields
          if (['concerns', 'interests', 'node_ids', 'success_criteria', 'knows', 'unknowns'].includes(field)) {
            value = JSON.stringify(value);
          }

          updates.push(`${field} = $${paramIdx}`);
          params.push(value);
          paramIdx++;
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No valid updates provided' });
      }

      updates.push('updated_at = NOW()');
      params.push(elementId);

      const result = await query(
        `UPDATE ${table} SET ${updates.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
        params
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating element:', err);
      return res.status(500).json({ error: 'Failed to update element', details: err.message });
    }
  }

  // ========== DELETE - Delete element ==========
  if (req.method === 'DELETE') {
    try {
      // For nodes, also delete related links
      if (type === 'node') {
        await query(
          'DELETE FROM srs_causal_links WHERE from_node_id = $1 OR to_node_id = $1',
          [elementId]
        );
      }

      // For frames, also delete frame elements
      if (type === 'frame') {
        await query(
          'DELETE FROM srs_frame_elements WHERE frame_id = $1',
          [elementId]
        );
      }

      // Delete connections related to this element
      await query(
        'DELETE FROM srs_connections WHERE from_element_id = $1 OR to_element_id = $1',
        [elementId]
      );

      // Delete comments related to this element
      await query(
        'DELETE FROM srs_comments WHERE element_id = $1',
        [elementId]
      );

      // Delete assumptions if this is a decision
      if (type === 'decision') {
        await query(
          'DELETE FROM srs_assumptions WHERE decision_id = $1',
          [elementId]
        );
      }

      // Delete the element itself
      const result = await query(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
        [elementId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json({ success: true, id: elementId });
    } catch (err) {
      console.error('Error deleting element:', err);
      return res.status(500).json({ error: 'Failed to delete element', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
