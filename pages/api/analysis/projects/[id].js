// pages/api/analysis/projects/[id].js
// API for single Analysis Project operations (GET, PUT, DELETE)

import { query } from '../../../../lib/pg';
import { errorResponse } from '../../../../lib/api/errorResponse';
import { getUserFromRequest } from '../../../../lib/projectAccess';

// GET - Get single project with artefact counts
// PUT - Update project
// DELETE - Delete project and cascade artefacts/relationships
export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Project ID is required' });
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
  try {
    // Fetch project with aggregated artefact counts
    const result = await query(
      `SELECT
        ap.*,
        (SELECT COUNT(*) FROM analysis_artefacts WHERE project_id = ap.id) as artefact_count,
        (SELECT COALESCE(jsonb_object_agg(artefact_type, cnt), '{}'::jsonb)
         FROM (
           SELECT artefact_type, COUNT(*) as cnt
           FROM analysis_artefacts
           WHERE project_id = ap.id
           GROUP BY artefact_type
         ) type_counts
        ) as counts_by_type,
        (SELECT COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb)
         FROM (
           SELECT status, COUNT(*) as cnt
           FROM analysis_artefacts
           WHERE project_id = ap.id
           GROUP BY status
         ) status_counts
        ) as counts_by_status
      FROM analysis_projects ap
      WHERE ap.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return errorResponse(res, 500, 'Failed to fetch analysis project', err);
  }
}

async function handlePut(req, res, id) {
  const { user } = getUserFromRequest(req);

  const {
    name,
    description,
    status,
    priority,
    business_owner,
    technical_owner,
    start_date,
    target_date,
    linked_initiatives,
    linked_projects,
    analysis_profile
  } = req.body;

  try {
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

    if (business_owner !== undefined) {
      updates.push(`business_owner = $${paramIndex}`);
      params.push(business_owner);
      paramIndex++;
    }

    if (technical_owner !== undefined) {
      updates.push(`technical_owner = $${paramIndex}`);
      params.push(technical_owner);
      paramIndex++;
    }

    if (start_date !== undefined) {
      updates.push(`start_date = $${paramIndex}`);
      params.push(start_date || null);
      paramIndex++;
    }

    if (target_date !== undefined) {
      updates.push(`target_date = $${paramIndex}`);
      params.push(target_date || null);
      paramIndex++;
    }

    if (linked_initiatives !== undefined) {
      updates.push(`linked_initiatives = $${paramIndex}`);
      params.push(JSON.stringify(linked_initiatives));
      paramIndex++;
    }

    if (linked_projects !== undefined) {
      updates.push(`linked_projects = $${paramIndex}`);
      params.push(JSON.stringify(linked_projects));
      paramIndex++;
    }

    if (analysis_profile !== undefined) {
      updates.push(`analysis_profile = $${paramIndex}`);
      params.push(analysis_profile);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Always set updated_at and updated_by
    updates.push(`updated_at = NOW()`);

    if (user) {
      updates.push(`updated_by = $${paramIndex}`);
      params.push(user);
      paramIndex++;
    }

    params.push(id);

    const sql = `
      UPDATE analysis_projects
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return errorResponse(res, 500, 'Failed to update analysis project', err);
  }
}

async function handleDelete(req, res, id) {
  try {
    // Check the project exists first
    const check = await query(
      'SELECT id FROM analysis_projects WHERE id = $1',
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 1. Delete all artefacts for this project (cascade)
    await query(
      'DELETE FROM analysis_artefacts WHERE project_id = $1',
      [id]
    );

    // 2. Delete all relationships for this project
    await query(
      'DELETE FROM analysis_relationships WHERE project_id = $1',
      [id]
    );

    // 3. Delete the project itself
    await query(
      'DELETE FROM analysis_projects WHERE id = $1',
      [id]
    );

    return res.status(200).json({ success: true, id });
  } catch (err) {
    return errorResponse(res, 500, 'Failed to delete analysis project', err);
  }
}
