// pages/api/pds/projects/[id]/tasks.js
// PDS Work Packages (Tasks) API - Sub-resource endpoint
// Task PD-021

import { query } from '../../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';
import { PDS_ARTEFACT_TYPES, getDefaultValues } from '../../../../../lib/pds-types';

const TASK_TYPES = ['pds_work_package', 'pds_deliverable', 'pds_milestone'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id: pdsProjectId } = req.query;

  if (!pdsProjectId) {
    return res.status(400).json({ error: 'PDS Project ID is required' });
  }

  // GET - List tasks for project
  if (req.method === 'GET') {
    // First get the project to find the main project_id
    const projectResult = await query(
      `SELECT project_id FROM artefacts WHERE id = $1 AND artefact_type = 'pds_project'`,
      [pdsProjectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'PDS Project not found' });
    }

    const projectId = projectResult.rows[0].project_id;

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { type, status, assignee, limit, offset } = req.query;

    try {
      let sql = `
        SELECT a.*,
          u.username as assignee_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.custom_fields->>'assignee'
        WHERE a.project_id = $1
          AND a.artefact_type = ANY($2::text[])
          AND (
            a.custom_fields->>'pds_project_id' = $3
            OR a.id IN (
              SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $3
              UNION
              SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $3
            )
          )
      `;
      const params = [projectId, TASK_TYPES, pdsProjectId];
      let paramIdx = 4;

      // Filter by specific type
      if (type && TASK_TYPES.includes(type)) {
        sql += ` AND a.artefact_type = $${paramIdx}`;
        params.push(type);
        paramIdx++;
      }

      // Filter by status
      if (status) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      // Filter by assignee
      if (assignee) {
        sql += ` AND a.custom_fields->>'assignee' = $${paramIdx}`;
        params.push(assignee);
        paramIdx++;
      }

      sql += ` ORDER BY a.custom_fields->>'order' ASC NULLS LAST, a.created_at DESC`;

      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
      }

      const result = await query(sql, params);

      return res.status(200).json({
        tasks: result.rows,
        total: result.rows.length,
        types: TASK_TYPES,
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  // POST - Create task
  if (req.method === 'POST') {
    // Get project to find project_id
    const projectResult = await query(
      `SELECT project_id FROM artefacts WHERE id = $1 AND artefact_type = 'pds_project'`,
      [pdsProjectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'PDS Project not found' });
    }

    const projectId = projectResult.rows[0].project_id;

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      artefactType = 'pds_work_package',
      name,
      description,
      assignee,
      startDate,
      endDate,
      effort,
      status = 'not_started',
      priority,
      parentId,
      ...customFields
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!TASK_TYPES.includes(artefactType)) {
      return res.status(400).json({ error: `Invalid type. Use: ${TASK_TYPES.join(', ')}` });
    }

    const typeDef = PDS_ARTEFACT_TYPES[artefactType];
    const defaults = getDefaultValues(artefactType);

    const mergedCustomFields = {
      ...defaults,
      ...customFields,
      assignee,
      start_date: startDate,
      end_date: endDate,
      effort,
      status,
      priority,
      parent_id: parentId,
      pds_project_id: pdsProjectId,
      pds_stage: typeDef?.stage || 'structure',
      pds_type: artefactType,
    };

    try {
      const result = await query(
        `INSERT INTO artefacts (
          project_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
        RETURNING *`,
        [
          projectId,
          artefactType,
          name.trim(),
          description || '',
          'Draft',
          'N/A',
          priority || 'Medium',
          assignee || user,
          JSON.stringify(mergedCustomFields),
          user,
        ]
      );

      const newTask = result.rows[0];

      // Create relationship to PDS project
      await query(
        `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [newTask.id, pdsProjectId, 'belongs_to', user]
      );

      return res.status(201).json(newTask);
    } catch (err) {
      console.error('Error creating task:', err);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
