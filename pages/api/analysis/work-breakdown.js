// pages/api/analysis/work-breakdown.js
// Work Breakdown API — hierarchy queries for Epic → Feature → Story trees
//
// GET /api/analysis/work-breakdown?project_id=xxx — full WBS tree
// GET /api/analysis/work-breakdown?project_id=xxx&root_id=xxx — subtree from root
// POST /api/analysis/work-breakdown — create artefact with auto-parent relationship

import { query } from '../../../lib/pg';
import { errorResponse } from '../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../lib/projectAccess';
import { ARTEFACT_PREFIX_MAP } from '../../../lib/analysis-types';
import { getPipelineStage } from '../../../lib/pipeline-types';
import { enqueueOutboxEvents, OUTBOX_ACTIONS } from '../../../lib/services/outboxService';

const WBS_TYPES = ['Epic', 'Feature', 'UserStory'];
const HIERARCHY_ORDER = { Epic: 0, Feature: 1, UserStory: 2 };

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

/**
 * GET — Return the work breakdown tree for a project.
 * Returns a flat list with parent_id references for client-side tree building.
 */
async function handleGet(req, res) {
  const { project_id, root_id, domain_id } = req.query;

  if (!project_id && !domain_id) {
    return res.status(400).json({ error: 'project_id or domain_id is required' });
  }

  try {
    // Get all WBS artefacts for the project
    let sql = `
      SELECT a.*,
        (SELECT COUNT(*) FROM analysis_relationships r
         WHERE r.from_artefact_id = a.id AND r.relationship_type = 'contains') as child_count
      FROM analysis_artefacts a
      WHERE a.artefact_type = ANY($1::text[])
    `;
    const params = [WBS_TYPES];
    let paramIdx = 2;

    if (project_id) {
      sql += ` AND a.project_id = $${paramIdx}`;
      params.push(project_id);
      paramIdx++;
    }
    if (domain_id) {
      sql += ` AND a.domain_id = $${paramIdx}`;
      params.push(domain_id);
      paramIdx++;
    }

    sql += ' ORDER BY a.artefact_type ASC, a.number ASC';

    const artefactsResult = await query(sql, params);
    const artefacts = artefactsResult.rows;
    const artefactIds = artefacts.map(a => a.id);

    // Get all "contains" relationships between WBS artefacts
    let relationships = [];
    if (artefactIds.length > 0) {
      const relsResult = await query(`
        SELECT r.* FROM analysis_relationships r
        WHERE r.relationship_type = 'contains'
          AND r.from_artefact_id = ANY($1::uuid[])
          AND r.to_artefact_id = ANY($1::uuid[])
      `, [artefactIds]);
      relationships = relsResult.rows;
    }

    // Build parent map
    const parentMap = {};
    for (const rel of relationships) {
      parentMap[rel.to_artefact_id] = rel.from_artefact_id;
    }

    // Annotate artefacts with parent_id and level
    const tree = artefacts.map(a => ({
      ...a,
      parent_id: parentMap[a.id] || null,
      level: HIERARCHY_ORDER[a.artefact_type] || 0,
    }));

    // If root_id, filter to subtree
    if (root_id) {
      const subtreeIds = new Set([root_id]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of tree) {
          if (item.parent_id && subtreeIds.has(item.parent_id) && !subtreeIds.has(item.id)) {
            subtreeIds.add(item.id);
            changed = true;
          }
        }
      }
      return res.status(200).json({
        artefacts: tree.filter(a => subtreeIds.has(a.id)),
        relationships: relationships.filter(r =>
          subtreeIds.has(r.from_artefact_id) && subtreeIds.has(r.to_artefact_id)
        ),
      });
    }

    return res.status(200).json({
      artefacts: tree,
      relationships,
      stats: {
        epics: artefacts.filter(a => a.artefact_type === 'Epic').length,
        features: artefacts.filter(a => a.artefact_type === 'Feature').length,
        stories: artefacts.filter(a => a.artefact_type === 'UserStory').length,
      },
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch work breakdown', error);
  }
}

/**
 * POST — Create a WBS artefact with auto-parent relationship.
 * Body: { name, artefact_type, project_id, domain_id, parent_id?, ... }
 * If parent_id is provided, auto-creates a "contains" relationship.
 */
async function handlePost(req, res) {
  const user = getUserFromRequest(req);
  const {
    name,
    artefact_type,
    description,
    status = 'Draft',
    priority = 'Medium',
    project_id,
    domain_id,
    parent_id,
    metadata = {},
  } = req.body;

  if (!name || !artefact_type) {
    return res.status(400).json({ error: 'name and artefact_type are required' });
  }

  if (!WBS_TYPES.includes(artefact_type)) {
    return res.status(400).json({ error: `artefact_type must be one of: ${WBS_TYPES.join(', ')}` });
  }

  // Validate parent hierarchy
  if (parent_id) {
    const parentResult = await query(
      'SELECT artefact_type FROM analysis_artefacts WHERE id = $1',
      [parent_id]
    );
    if (parentResult.rows.length === 0) {
      return res.status(400).json({ error: 'Parent artefact not found' });
    }
    const parentType = parentResult.rows[0].artefact_type;
    const parentLevel = HIERARCHY_ORDER[parentType] ?? -1;
    const childLevel = HIERARCHY_ORDER[artefact_type] ?? -1;
    if (childLevel <= parentLevel) {
      return res.status(400).json({
        error: `Cannot nest ${artefact_type} under ${parentType}. Hierarchy: Epic → Feature → UserStory`,
      });
    }
  }

  try {
    const prefix = ARTEFACT_PREFIX_MAP[artefact_type] || 'WB';
    const pipelineStage = getPipelineStage(artefact_type);

    // Get next number
    const numberResult = await query(
      'SELECT COALESCE(MAX(number), 0) + 1 as next_number FROM analysis_artefacts WHERE project_id = $1 AND artefact_type = $2',
      [project_id, artefact_type]
    );
    const number = numberResult.rows[0].next_number;
    const displayId = `${prefix}-${String(number).padStart(3, '0')}`;

    // Create artefact
    const result = await query(
      `INSERT INTO analysis_artefacts
        (name, description, artefact_type, status, priority, project_id, domain_id, metadata, number, prefix, module, pipeline_stage, display_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [name, description || '', artefact_type, status, priority, project_id, domain_id, JSON.stringify(metadata), number, prefix, 'stories', pipelineStage, displayId, user?.user || null]
    );
    const artefact = result.rows[0];

    // Auto-create parent relationship
    if (parent_id) {
      await query(
        `INSERT INTO analysis_relationships
          (from_artefact_id, to_artefact_id, relationship_type, project_id, metadata)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (from_artefact_id, to_artefact_id, relationship_type) DO NOTHING`,
        [parent_id, artefact.id, 'contains', project_id, JSON.stringify({ auto_created: true })]
      );
    }

    // Enqueue graph sync
    enqueueOutboxEvents([
      {
        action: OUTBOX_ACTIONS.SYNC_ARTEFACT_TO_GRAPH,
        entityType: 'artefact',
        entityId: artefact.id,
        payload: artefact,
      },
      {
        action: OUTBOX_ACTIONS.MATERIALISE_ARTEFACT,
        entityType: 'artefact',
        entityId: artefact.id,
        payload: artefact,
      },
    ]).catch(err => console.error('[Outbox] Failed to enqueue:', err.message));

    return res.status(201).json({
      ...artefact,
      parent_id: parent_id || null,
      display_id: displayId,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to create work breakdown item', error);
  }
}
