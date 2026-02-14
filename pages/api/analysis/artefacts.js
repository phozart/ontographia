// pages/api/analysis/artefacts.js
// API for Analysis Artefacts (requirements, stories, architecture, design, etc.)

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { ARTEFACT_PREFIX_MAP, ANALYSIS_ARTEFACT_TYPES } from '../../../lib/analysis-types';
import { getPipelineStage } from '../../../lib/pipeline-types';
import { ANALYSIS_EVENT_TYPES } from '../../../lib/services/analysisEvents';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../lib/services/outboxService';

// GET - List artefacts for a project (optionally filtered by type)
// POST - Create a new artefact
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req, res) {
  const user = getUserFromRequest(req);
  const { project_id, artefact_type, domain_id, pipeline_stage } = req.query;

  try {
    let sql = 'SELECT * FROM analysis_artefacts WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (project_id) {
      sql += ` AND project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }

    if (domain_id) {
      sql += ` AND domain_id = $${paramIndex}`;
      params.push(domain_id);
      paramIndex++;
    }

    if (artefact_type) {
      sql += ` AND artefact_type = $${paramIndex}`;
      params.push(artefact_type);
      paramIndex++;
    }

    if (pipeline_stage) {
      sql += ` AND pipeline_stage = $${paramIndex}`;
      params.push(pipeline_stage);
      paramIndex++;
    }

    sql += ' ORDER BY pipeline_order ASC NULLS LAST, created_at DESC';

    const result = await query(sql, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch artefacts', error);
  }
}

async function handlePost(req, res) {
  const user = getUserFromRequest(req);
  const {
    name,
    description,
    artefact_type,
    status = 'Draft',
    priority,
    project_id,
    domain_id,
    parent_id,
    metadata = {}
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (!artefact_type) {
    return res.status(400).json({ error: 'Artefact type is required' });
  }

  try {
    // Get prefix from central type definitions
    const prefix = ARTEFACT_PREFIX_MAP[artefact_type] || 'ART';

    // Derive module from type definitions
    const typeInfo = ANALYSIS_ARTEFACT_TYPES[artefact_type];
    const module = typeInfo?.module || null;

    // Get next number for this type in this project
    const numberResult = await query(
      `SELECT COALESCE(MAX(number), 0) + 1 as next_number
       FROM analysis_artefacts
       WHERE project_id = $1 AND artefact_type = $2`,
      [project_id, artefact_type]
    );
    const number = numberResult.rows[0].next_number;

    // Auto-assign pipeline stage from artefact type
    const pipelineStage = getPipelineStage(artefact_type);

    const result = await query(
      `INSERT INTO analysis_artefacts
        (name, description, artefact_type, status, priority, project_id, domain_id, metadata, number, prefix, parent_id, module, created_by, pipeline_stage, display_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [name, description, artefact_type, status, priority, project_id, domain_id, JSON.stringify(metadata), number, prefix, parent_id || null, module, user?.user || null, pipelineStage, `${prefix}-${String(number).padStart(3, '0')}`]
    );

    // Enqueue side effects via outbox
    enqueueOutboxEvents([
      {
        action: OUTBOX_ACTIONS.EMIT_ANALYSIS_EVENT,
        entityType: 'artefact',
        entityId: result.rows[0].id,
        payload: {
          domainId: domain_id,
          eventType: ANALYSIS_EVENT_TYPES.ARTEFACT_CREATED,
          entityId: result.rows[0].id,
          entityType: 'artefact',
          projectId: project_id,
          payload: { name, artefactType: artefact_type, status },
          actor: user?.user || null,
        },
      },
      {
        action: OUTBOX_ACTIONS.SYNC_ARTEFACT_TO_GRAPH,
        entityType: 'artefact',
        entityId: result.rows[0].id,
        payload: result.rows[0],
      },
      {
        action: OUTBOX_ACTIONS.MATERIALISE_ARTEFACT,
        entityType: 'artefact',
        entityId: result.rows[0].id,
        payload: { ...result.rows[0], metadata },
      },
    ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create artefact', error);
  }
}
