// pages/api/srs/spaces/[spaceId]/index.js
// Strategic Reasoning Suite - Space Elements API
// Manages elements within a specific reasoning space

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

// Get project ID from session
async function getSessionProject(sessionId) {
  const result = await query(
    'SELECT project_id FROM srs_sessions WHERE id = $1',
    [sessionId]
  );
  return result.rows[0]?.project_id;
}

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);
  const { spaceId } = req.query;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!SPACE_TABLES[spaceId]) {
    return res.status(400).json({ error: 'Invalid space ID' });
  }

  // ========== POST - Create element in space ==========
  if (req.method === 'POST') {
    const { sessionId, elementType, ...data } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    if (!elementType || !SPACE_TABLES[spaceId][elementType]) {
      return res.status(400).json({ error: 'Invalid element type for this space' });
    }

    // Check access
    const projectId = await getSessionProject(sessionId);
    if (!projectId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const table = SPACE_TABLES[spaceId][elementType];

    try {
      let result;

      // Handle different element types
      switch (`${spaceId}.${elementType}`) {
        case 'questions.question':
          result = await query(
            `INSERT INTO ${table} (
              session_id, content, question_type, maturity,
              x, y, custom_fields, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *`,
            [
              sessionId,
              data.text || data.content || '',
              data.question_type || 'clarifying',
              data.maturity || 'surfaced',
              data.canvas_x || data.x || 100,
              data.canvas_y || data.y || 100,
              JSON.stringify(data.custom_fields || {}),
            ]
          );
          break;

        case 'frames.frame':
          result = await query(
            `INSERT INTO ${table} (
              session_id, name, description, frame_source, confidence,
              x, y, custom_fields, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING *`,
            [
              sessionId,
              data.title || data.name || 'New Frame',
              data.description || '',
              data.frame_source || null,
              data.confidence || 'untested',
              data.canvas_x || data.x || 100,
              data.canvas_y || data.y || 100,
              JSON.stringify(data.custom_fields || {}),
            ]
          );
          break;

        case 'frames.frame_element':
          result = await query(
            `INSERT INTO srs_frame_elements (
              frame_id, element_type, content,
              position_order, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *`,
            [
              data.frame_id,
              data.element_type || 'statement',
              data.content || '',
              data.position_order || 0,
            ]
          );
          break;

        case 'parallel.state':
          result = await query(
            `INSERT INTO ${table} (
              session_id, title, description, state_type, probability, confidence,
              evidence, implications, is_collapsed, is_ruled_out, collapse_reason,
              position_order, x, y, custom_fields, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
            RETURNING *`,
            [
              sessionId,
              data.title || 'New State',
              data.description || '',
              data.state_type || 'expected',
              data.probability || 'medium',
              data.confidence || 0.5,
              JSON.stringify(data.evidence || []),
              JSON.stringify(data.implications || []),
              data.is_collapsed || false,
              data.is_ruled_out || false,
              data.collapse_reason || '',
              data.position_order || 0,
              data.canvas_x || data.x || 100,
              data.canvas_y || data.y || 100,
              JSON.stringify(data.custom_fields || {}),
            ]
          );
          break;

        case 'systems.node':
          result = await query(
            `INSERT INTO ${table} (
              session_id, name, node_type, description,
              x, y, custom_fields, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *`,
            [
              sessionId,
              data.label || data.name || 'New Node',
              data.node_type || 'variable',
              data.description || '',
              data.canvas_x || data.x || 100,
              data.canvas_y || data.y || 100,
              JSON.stringify(data.custom_fields || {}),
            ]
          );
          break;

        case 'systems.link':
          result = await query(
            `INSERT INTO ${table} (
              session_id, from_node_id, to_node_id, polarity, delay,
              description, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING *`,
            [
              sessionId,
              data.from_node_id,
              data.to_node_id,
              data.polarity || 'positive',
              data.delay || data.time_delay || null,
              data.description || '',
            ]
          );
          break;

        case 'systems.loop':
          result = await query(
            `INSERT INTO ${table} (
              session_id, name, loop_type, description, node_ids, link_ids,
              x, y, custom_fields, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING *`,
            [
              sessionId,
              data.name || 'New Loop',
              data.loop_type || 'reinforcing',
              data.description || '',
              JSON.stringify(data.node_ids || []),
              JSON.stringify(data.link_ids || []),
              data.canvas_x || data.x || 100,
              data.canvas_y || data.y || 100,
              JSON.stringify(data.custom_fields || {}),
            ]
          );
          break;

        case 'perspectives.perspective':
          result = await query(
            `INSERT INTO ${table} (
              session_id, stakeholder, viewpoint, interests, concerns,
              influence, alignment, x, y, custom_fields, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            RETURNING *`,
            [
              sessionId,
              data.name || data.stakeholder || 'New Stakeholder',
              data.viewpoint || '',
              JSON.stringify(data.interests || []),
              JSON.stringify(data.concerns || []),
              data.influence || 'medium',
              data.alignment || 'neutral',
              data.canvas_x || data.x || 100,
              data.canvas_y || data.y || 100,
              JSON.stringify(data.custom_fields || {}),
            ]
          );
          break;

        case 'decisions.decision':
          result = await query(
            `INSERT INTO ${table} (
              session_id, title, description, options, chosen_option,
              rationale, readiness_score, status, reversibility, stakes,
              deadline, outcome, outcome_rationale, success_criteria, knows, unknowns,
              x, y, custom_fields, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
            RETURNING *`,
            [
              sessionId,
              data.title || 'New Decision',
              data.description || '',
              JSON.stringify(data.options || []),
              data.chosen_option || null,
              data.rationale || '',
              data.readiness_score || 0,
              data.status || 'pending',
              data.reversibility || 'reversible_with_cost',
              data.stakes || 'medium',
              data.deadline || null,
              data.outcome || null,
              data.outcome_rationale || '',
              JSON.stringify(data.success_criteria || []),
              JSON.stringify(data.knows || []),
              JSON.stringify(data.unknowns || []),
              data.canvas_x || data.x || 100,
              data.canvas_y || data.y || 100,
              JSON.stringify(data.custom_fields || {}),
            ]
          );
          break;

        default:
          return res.status(400).json({ error: 'Unsupported element type' });
      }

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating element:', err);
      return res.status(500).json({ error: 'Failed to create element', details: err.message });
    }
  }

  // ========== GET - List elements in space ==========
  if (req.method === 'GET') {
    const { sessionId, elementType } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Check access
    const projectId = await getSessionProject(sessionId);
    if (!projectId) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const elements = {};

      // If specific element type requested
      if (elementType && SPACE_TABLES[spaceId][elementType]) {
        const table = SPACE_TABLES[spaceId][elementType];
        const result = await query(
          `SELECT * FROM ${table} WHERE session_id = $1 ORDER BY created_at ASC`,
          [sessionId]
        );
        elements[elementType] = result.rows;
      } else {
        // Get all element types for the space
        for (const [type, table] of Object.entries(SPACE_TABLES[spaceId])) {
          // Special handling for frame_elements which don't have session_id
          if (type === 'frame_element') {
            const result = await query(
              `SELECT fe.* FROM srs_frame_elements fe
               JOIN srs_frames f ON f.id = fe.frame_id
               WHERE f.session_id = $1
               ORDER BY fe.created_at ASC`,
              [sessionId]
            );
            elements[type] = result.rows;
          } else {
            const result = await query(
              `SELECT * FROM ${table} WHERE session_id = $1 ORDER BY created_at ASC`,
              [sessionId]
            );
            elements[type] = result.rows;
          }
        }
      }

      return res.status(200).json(elements);
    } catch (err) {
      console.error('Error listing elements:', err);
      return res.status(500).json({ error: 'Failed to list elements', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
