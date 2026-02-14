// pages/api/analysis/artefacts/[id].js
// API for single Analysis Artefact operations

import { query } from '../../../../lib/pg';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../../lib/projectAccess';
import { isValidStatusTransition } from '../../../../lib/analysis-rules';
import { emitAnalysisEvent, ANALYSIS_EVENT_TYPES } from '../../../../lib/services/analysisEvents';
import { syncArtefactToGraph, removeArtefactFromGraph } from '../../../../lib/services/analysisGraphSync';

// GET - Get single artefact
// PUT - Update artefact
// DELETE - Delete artefact
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Artefact ID is required' });
  }

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  } else if (req.method === 'PUT') {
    return handlePut(req, res, id);
  } else if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req, res, id) {
  const user = getUserFromRequest(req);

  try {
    const result = await query(
      'SELECT * FROM analysis_artefacts WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artefact not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch artefact', error);
  }
}

async function handlePut(req, res, id) {
  const user = getUserFromRequest(req);
  const {
    name,
    description,
    status,
    priority,
    metadata,
    parent_id,
    sort_order
  } = req.body;

  try {
    // Validate status transition if status is being changed
    if (status !== undefined) {
      const current = await query('SELECT status FROM analysis_artefacts WHERE id = $1', [id]);
      if (current.rows.length > 0 && current.rows[0].status !== status) {
        if (!isValidStatusTransition(current.rows[0].status, status)) {
          return res.status(400).json({
            error: `Invalid status transition from '${current.rows[0].status}' to '${status}'`
          });
        }
      }
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(name);
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex}`);
      params.push(JSON.stringify(metadata));
      paramIndex++;
    }

    if (parent_id !== undefined) {
      updates.push(`parent_id = $${paramIndex}`);
      params.push(parent_id);
      paramIndex++;
    }

    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramIndex}`);
      params.push(sort_order);
      paramIndex++;
    }

    // Track who updated
    updates.push(`updated_by = $${paramIndex}`);
    params.push(user?.user || null);
    paramIndex++;

    if (updates.length <= 1) {
      // Only updated_by was added, no real fields to update
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `
      UPDATE analysis_artefacts
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artefact not found' });
    }

    // Fire-and-forget: emit event
    emitAnalysisEvent({
      domainId: result.rows[0].domain_id,
      eventType: ANALYSIS_EVENT_TYPES.ARTEFACT_UPDATED,
      entityId: id,
      entityType: 'artefact',
      projectId: result.rows[0].project_id,
      payload: { name, status, priority, parent_id, sort_order },
      actor: user?.user || null,
    }).catch(err => console.error('Failed to emit artefact updated event:', err));

    // Fire-and-forget: sync to knowledge graph
    syncArtefactToGraph(result.rows[0])
      .catch(err => console.error('Failed to sync artefact to graph:', err));

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update artefact', error);
  }
}

async function handleDelete(req, res, id) {
  const user = getUserFromRequest(req);

  try {
    // Fetch artefact before deleting for event payload
    const existing = await query('SELECT * FROM analysis_artefacts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Artefact not found' });
    }
    const artefact = existing.rows[0];

    // First delete any relationships involving this artefact
    await query(
      'DELETE FROM analysis_relationships WHERE from_artefact_id = $1 OR to_artefact_id = $1',
      [id]
    );

    // Then delete the artefact
    const result = await query(
      'DELETE FROM analysis_artefacts WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artefact not found' });
    }

    // Fire-and-forget: emit event
    emitAnalysisEvent({
      domainId: artefact.domain_id,
      eventType: ANALYSIS_EVENT_TYPES.ARTEFACT_DELETED,
      entityId: id,
      entityType: 'artefact',
      projectId: artefact.project_id,
      payload: { name: artefact.name, artefactType: artefact.artefact_type },
      previousState: artefact,
      actor: user?.user || null,
    }).catch(err => console.error('Failed to emit artefact deleted event:', err));

    // Fire-and-forget: remove from knowledge graph
    removeArtefactFromGraph(id)
      .catch(err => console.error('Failed to remove artefact from graph:', err));

    return res.status(200).json({ success: true, id });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete artefact', error);
  }
}
