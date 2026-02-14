// pages/api/analysis/relationships.js
// API for Analysis Relationships (traceability links between artefacts)

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { validateMetamodelRelationship } from '../../../lib/analysis-types';
import { ANALYSIS_EVENT_TYPES } from '../../../lib/services/analysisEvents';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../lib/services/outboxService';

// Auto-initialize table if it doesn't exist
let tableInitialized = false;

async function ensureTable() {
  if (tableInitialized) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS analysis_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_artefact_id UUID,
        to_artefact_id UUID,
        relationship_type VARCHAR(50) NOT NULL,
        project_id UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_analysis_rel_from ON analysis_relationships(from_artefact_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_analysis_rel_to ON analysis_relationships(to_artefact_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_analysis_rel_project ON analysis_relationships(project_id)`);
    tableInitialized = true;
  } catch (error) {
    console.error('Error initializing analysis_relationships table:', error);
  }
}

// GET - List relationships for a project
// POST - Create a new relationship
export default async function handler(req, res) {
  await ensureTable();

  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req, res) {
  const user = getUserFromRequest(req);
  const { project_id, from_artefact_id, to_artefact_id, relationship_type } = req.query;

  try {
    let sql = `
      SELECT
        r.*,
        fa.name as from_name,
        fa.artefact_type as from_type,
        ta.name as to_name,
        ta.artefact_type as to_type
      FROM analysis_relationships r
      LEFT JOIN analysis_artefacts fa ON r.from_artefact_id = fa.id
      LEFT JOIN analysis_artefacts ta ON r.to_artefact_id = ta.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (project_id) {
      sql += ` AND r.project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }

    if (from_artefact_id) {
      sql += ` AND r.from_artefact_id = $${paramIndex}`;
      params.push(from_artefact_id);
      paramIndex++;
    }

    if (to_artefact_id) {
      sql += ` AND r.to_artefact_id = $${paramIndex}`;
      params.push(to_artefact_id);
      paramIndex++;
    }

    if (relationship_type) {
      sql += ` AND r.relationship_type = $${paramIndex}`;
      params.push(relationship_type);
      paramIndex++;
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);

    // Transform to match expected format
    const relationships = result.rows.map(row => ({
      id: row.id,
      from: row.from_artefact_id,
      to: row.to_artefact_id,
      type: row.relationship_type,
      fromName: row.from_name,
      fromType: row.from_type,
      toName: row.to_name,
      toType: row.to_type,
      createdAt: row.created_at
    }));

    return res.status(200).json(relationships);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch relationships', error);
  }
}

async function handlePost(req, res) {
  const user = getUserFromRequest(req);
  const {
    from_artefact_id,
    to_artefact_id,
    relationship_type,
    project_id
  } = req.body;

  if (!from_artefact_id || !to_artefact_id) {
    return res.status(400).json({ error: 'Both from_artefact_id and to_artefact_id are required' });
  }

  if (!relationship_type) {
    return res.status(400).json({ error: 'Relationship type is required' });
  }

  try {
    // Look up artefact types for metamodel validation
    const fromArtefact = await query('SELECT artefact_type FROM analysis_artefacts WHERE id = $1', [from_artefact_id]);
    const toArtefact = await query('SELECT artefact_type FROM analysis_artefacts WHERE id = $1', [to_artefact_id]);

    if (fromArtefact.rows.length === 0 || toArtefact.rows.length === 0) {
      return res.status(404).json({ error: 'One or both artefacts not found' });
    }

    // Validate against the metamodel
    const validation = validateMetamodelRelationship(
      fromArtefact.rows[0].artefact_type,
      toArtefact.rows[0].artefact_type,
      relationship_type
    );
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check if relationship already exists
    const existing = await query(
      `SELECT id FROM analysis_relationships
       WHERE from_artefact_id = $1 AND to_artefact_id = $2 AND relationship_type = $3`,
      [from_artefact_id, to_artefact_id, relationship_type]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Relationship already exists' });
    }

    const result = await query(
      `INSERT INTO analysis_relationships
        (from_artefact_id, to_artefact_id, relationship_type, project_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [from_artefact_id, to_artefact_id, relationship_type, project_id]
    );

    // Enqueue side effects via outbox
    enqueueOutboxEvents([
      {
        action: OUTBOX_ACTIONS.EMIT_ANALYSIS_EVENT,
        entityType: 'relationship',
        entityId: result.rows[0].id,
        payload: {
          domainId: null,
          eventType: ANALYSIS_EVENT_TYPES.RELATIONSHIP_CREATED,
          entityId: result.rows[0].id,
          entityType: 'relationship',
          projectId: project_id,
          payload: {
            from_artefact_id,
            to_artefact_id,
            relationship_type,
            fromType: fromArtefact.rows[0].artefact_type,
            toType: toArtefact.rows[0].artefact_type,
          },
          actor: user?.user || null,
        },
      },
      {
        action: OUTBOX_ACTIONS.SYNC_RELATIONSHIP_TO_GRAPH,
        entityType: 'relationship',
        entityId: result.rows[0].id,
        payload: result.rows[0],
      },
    ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(201).json({
      id: result.rows[0].id,
      from: result.rows[0].from_artefact_id,
      to: result.rows[0].to_artefact_id,
      type: result.rows[0].relationship_type,
      createdAt: result.rows[0].created_at
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create relationship', error);
  }
}

async function handleDelete(req, res) {
  const user = getUserFromRequest(req);
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Relationship ID is required' });
  }

  try {
    // Fetch before deleting for event payload
    const existing = await query('SELECT * FROM analysis_relationships WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }
    const rel = existing.rows[0];

    const result = await query(
      'DELETE FROM analysis_relationships WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    // Enqueue side effects via outbox
    enqueueOutboxEvents([
      {
        action: OUTBOX_ACTIONS.EMIT_ANALYSIS_EVENT,
        entityType: 'relationship',
        entityId: id,
        payload: {
          domainId: null,
          eventType: ANALYSIS_EVENT_TYPES.RELATIONSHIP_DELETED,
          entityId: id,
          entityType: 'relationship',
          projectId: rel.project_id,
          payload: {
            from_artefact_id: rel.from_artefact_id,
            to_artefact_id: rel.to_artefact_id,
            relationship_type: rel.relationship_type,
          },
          previousState: rel,
          actor: user?.user || null,
        },
      },
      {
        action: OUTBOX_ACTIONS.REMOVE_GRAPH_RELATIONSHIP,
        entityType: 'relationship',
        entityId: id,
        payload: {
          relId: id,
          fromId: rel.from_artefact_id,
          toId: rel.to_artefact_id,
        },
      },
    ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(200).json({ success: true, id });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete relationship', error);
  }
}
