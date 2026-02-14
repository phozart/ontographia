// pages/api/pds/projects/[id]/issues.js
// PDS Issues API - Sub-resource endpoint
// Task PD-023

import { query } from '../../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';
import { PDS_ARTEFACT_TYPES, getDefaultValues } from '../../../../../lib/pds-types';

// Issue priority and status
const ISSUE_PRIORITY = ['low', 'medium', 'high', 'critical'];
const ISSUE_STATUS = ['open', 'in_progress', 'escalated', 'resolved', 'closed'];
const ISSUE_CATEGORY = ['scope', 'schedule', 'resource', 'quality', 'stakeholder', 'technical', 'process', 'other'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id: pdsProjectId } = req.query;

  if (!pdsProjectId) {
    return res.status(400).json({ error: 'PDS Project ID is required' });
  }

  // GET - List issues for project
  if (req.method === 'GET') {
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

    const { status, priority, category, assignee, limit, offset } = req.query;

    try {
      let sql = `
        SELECT a.*,
          u.username as assignee_username,
          cb.username as created_by_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.custom_fields->>'assignee'
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.project_id = $1
          AND a.artefact_type = 'pds_issue'
          AND (
            a.custom_fields->>'pds_project_id' = $2
            OR a.id IN (
              SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $2
              UNION
              SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $2
            )
          )
      `;
      const params = [projectId, pdsProjectId];
      let paramIdx = 3;

      if (status && ISSUE_STATUS.includes(status)) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      if (priority && ISSUE_PRIORITY.includes(priority)) {
        sql += ` AND a.custom_fields->>'priority' = $${paramIdx}`;
        params.push(priority);
        paramIdx++;
      }

      if (category && ISSUE_CATEGORY.includes(category)) {
        sql += ` AND a.custom_fields->>'category' = $${paramIdx}`;
        params.push(category);
        paramIdx++;
      }

      if (assignee) {
        sql += ` AND a.custom_fields->>'assignee' = $${paramIdx}`;
        params.push(assignee);
        paramIdx++;
      }

      // Order by priority (critical first) then by created date
      sql += ` ORDER BY
        CASE a.custom_fields->>'priority'
          WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 ELSE 5
        END,
        a.created_at DESC`;

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

      // Calculate summary metrics
      const issues = result.rows;
      const summary = {
        total: issues.length,
        open: issues.filter(i => ['open', 'in_progress', 'escalated'].includes(i.custom_fields?.status)).length,
        resolved: issues.filter(i => ['resolved', 'closed'].includes(i.custom_fields?.status)).length,
        byStatus: {},
        byPriority: {},
        byCategory: {},
        escalated: issues.filter(i => i.custom_fields?.status === 'escalated').length,
        critical: issues.filter(i => i.custom_fields?.priority === 'critical').length,
      };

      issues.forEach(i => {
        const st = i.custom_fields?.status || 'open';
        const pr = i.custom_fields?.priority || 'medium';
        const cat = i.custom_fields?.category || 'other';
        summary.byStatus[st] = (summary.byStatus[st] || 0) + 1;
        summary.byPriority[pr] = (summary.byPriority[pr] || 0) + 1;
        summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;
      });

      return res.status(200).json({
        issues,
        summary,
        options: {
          priority: ISSUE_PRIORITY,
          status: ISSUE_STATUS,
          category: ISSUE_CATEGORY,
        },
      });
    } catch (err) {
      console.error('Error fetching issues:', err);
      return res.status(500).json({ error: 'Failed to fetch issues' });
    }
  }

  // POST - Create issue
  if (req.method === 'POST') {
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
      name,
      description,
      priority = 'medium',
      status = 'open',
      category = 'other',
      assignee,
      reportedBy,
      reportedDate,
      dueDate,
      impact,
      resolution,
      linkedRiskId,
      ...customFields
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    if (!ISSUE_PRIORITY.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Use: ${ISSUE_PRIORITY.join(', ')}` });
    }

    if (!ISSUE_STATUS.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Use: ${ISSUE_STATUS.join(', ')}` });
    }

    const typeDef = PDS_ARTEFACT_TYPES.pds_issue;
    const defaults = getDefaultValues('pds_issue');

    const mergedCustomFields = {
      ...defaults,
      ...customFields,
      priority,
      status,
      category,
      assignee,
      reported_by: reportedBy || user,
      reported_date: reportedDate || new Date().toISOString(),
      due_date: dueDate,
      impact,
      resolution,
      linked_risk_id: linkedRiskId,
      pds_project_id: pdsProjectId,
      pds_stage: typeDef?.stage || 'uncertainty',
      pds_type: 'pds_issue',
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
          'pds_issue',
          name.trim(),
          description || '',
          'Draft',
          'N/A',
          priority === 'critical' ? 'Critical' : priority === 'high' ? 'High' : priority === 'low' ? 'Low' : 'Medium',
          assignee || user,
          JSON.stringify(mergedCustomFields),
          user,
        ]
      );

      const newIssue = result.rows[0];

      // Create relationship to PDS project
      await query(
        `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [newIssue.id, pdsProjectId, 'affects', user]
      );

      // If linked to a risk, create that relationship too
      if (linkedRiskId) {
        await query(
          `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [newIssue.id, linkedRiskId, 'raised_from', user]
        );
      }

      return res.status(201).json(newIssue);
    } catch (err) {
      console.error('Error creating issue:', err);
      return res.status(500).json({ error: 'Failed to create issue' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
