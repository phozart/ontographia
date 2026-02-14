// pages/api/analysis/artefacts.js
// API for Analysis Artefacts (requirements, stories, architecture, design, etc.)

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { ARTEFACT_PREFIX_MAP, ANALYSIS_ARTEFACT_TYPES } from '../../../lib/analysis-types';
import { emitAnalysisEvent, ANALYSIS_EVENT_TYPES } from '../../../lib/services/analysisEvents';
import { syncArtefactToGraph } from '../../../lib/services/analysisGraphSync';

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
  const { project_id, artefact_type, domain_id } = req.query;

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

    sql += ' ORDER BY created_at DESC';

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

    const result = await query(
      `INSERT INTO analysis_artefacts
        (name, description, artefact_type, status, priority, project_id, domain_id, metadata, number, prefix, parent_id, module, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [name, description, artefact_type, status, priority, project_id, domain_id, JSON.stringify(metadata), number, prefix, parent_id || null, module, user?.user || null]
    );

    // Fire-and-forget: emit event
    emitAnalysisEvent({
      domainId: domain_id,
      eventType: ANALYSIS_EVENT_TYPES.ARTEFACT_CREATED,
      entityId: result.rows[0].id,
      entityType: 'artefact',
      projectId: project_id,
      payload: { name, artefactType: artefact_type, status },
      actor: user?.user || null,
    }).catch(err => console.error('Failed to emit artefact created event:', err));

    // Fire-and-forget: sync to knowledge graph
    syncArtefactToGraph(result.rows[0])
      .catch(err => console.error('Failed to sync artefact to graph:', err));

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create artefact', error);
  }
}
