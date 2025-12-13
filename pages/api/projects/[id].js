// pages/api/projects/[id].js
// Get, update, delete single project with access control

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

// ============ DATABASE CONSTRAINT VALUES ============
const VALID_STATUS = ['Draft', 'Active', 'On Hold', 'Closed'];

// Normalize status to match database constraint (case-insensitive)
// Returns null if value not provided (so COALESCE keeps existing value)
const normalizeStatus = (value) => {
  if (!value) return null;
  const lower = String(value).toLowerCase();
  const found = VALID_STATUS.find(v => v.toLowerCase() === lower);
  return found || null;
};

export default async function handler(req, res) {
  const { id } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    // Get single project
    const { hasAccess, error } = await checkProjectAccess(req, id, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await query(
        `SELECT p.*,
          COALESCE(pm.role, CASE WHEN p.created_by = $2 THEN 'Business Analyst' ELSE NULL END) as user_role,
          (SELECT COUNT(*) FROM artefacts WHERE project_id = p.id) as artefact_count,
          (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
          (SELECT COUNT(*) FROM documents WHERE project_id = p.id) as document_count
        FROM projects p
        LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
        WHERE p.id = $1`,
        [id, user]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error fetching project:', err);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  if (req.method === 'PUT') {
    // Update project
    const { hasAccess, error } = await checkProjectAccess(req, id, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      description,
      businessContext,
      startDate,
      endDate,
      status,
      inScope,
      outOfScope,
      objectives,
      successCriteria,
      settings
    } = req.body;

    // Normalize status to valid database value
    const projectStatus = normalizeStatus(status);

    try {
      const result = await query(
        `UPDATE projects SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          business_context = COALESCE($3, business_context),
          start_date = $4,
          end_date = $5,
          status = COALESCE($6, status),
          in_scope = COALESCE($7, in_scope),
          out_of_scope = COALESCE($8, out_of_scope),
          objectives = COALESCE($9, objectives),
          success_criteria = COALESCE($10, success_criteria),
          settings = COALESCE($11, settings),
          updated_at = now()
        WHERE id = $12
        RETURNING *`,
        [
          name,
          description,
          businessContext,
          startDate || null,
          endDate || null,
          projectStatus,
          inScope ? JSON.stringify(inScope) : null,
          outOfScope ? JSON.stringify(outOfScope) : null,
          objectives ? JSON.stringify(objectives) : null,
          successCriteria ? JSON.stringify(successCriteria) : null,
          settings ? JSON.stringify(settings) : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error('Error updating project:', err);
      return res.status(500).json({ error: 'Failed to update project' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete project (only creator or admin)
    const { hasAccess, projectRole, error } = await checkProjectAccess(req, id, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Only allow creator or admin to delete
    try {
      const projectResult = await query(`SELECT created_by FROM projects WHERE id = $1`, [id]);
      if (projectResult.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      if (projectResult.rows[0].created_by !== user && role !== 'admin') {
        return res.status(403).json({ error: 'Only project creator or admin can delete project' });
      }

      await query(`DELETE FROM projects WHERE id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting project:', err);
      return res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
