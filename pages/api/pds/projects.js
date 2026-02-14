/**
 * PDS Projects API - Project Design Workspace
 *
 * CRUD operations for PDS projects (pds_project artefacts)
 * Projects are created from SRS decisions with readiness validation.
 *
 * @module pages/api/pds/projects
 */

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { PDS_PROJECT_STATUS, PDS_PROJECT_HEALTH, validateSRSReadiness } from '../../../lib/pds-types';
import { errorResponse } from '../../../lib/api/errorResponse';

// Valid artefact status values for database constraint
const VALID_ARTEFACT_STATUS = ['Draft', 'InReview', 'Approved', 'Deprecated', 'Superseded'];

// Map PDS project status to valid artefact status
const mapPDSStatusToArtefactStatus = (pdsStatus) => {
  const mapping = {
    'draft': 'Draft',
    'initiating': 'Draft',
    'planning': 'Draft',
    'executing': 'InReview',
    'monitoring': 'InReview',
    'closing': 'Approved',
    'closed': 'Approved',
    'on_hold': 'Draft',
    'cancelled': 'Deprecated',
  };
  return mapping[pdsStatus] || 'Draft';
};

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // List PDS projects
    const { projectId, status, health, search, includeStats, limit, offset } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let sql = `
        SELECT a.*,
          u.username as owner_username,
          cb.username as created_by_username,
          (SELECT COUNT(*) FROM artefact_relationships WHERE from_artefact_id = a.id OR to_artefact_id = a.id) as relationship_count
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
        WHERE a.project_id = $1
          AND a.artefact_type = 'pds_project'
      `;
      const params = [projectId];
      let paramIdx = 2;

      // Filter by PDS status
      if (status) {
        sql += ` AND a.custom_fields->>'status' = $${paramIdx}`;
        params.push(status);
        paramIdx++;
      }

      // Filter by health
      if (health) {
        sql += ` AND a.custom_fields->>'health' = $${paramIdx}`;
        params.push(health);
        paramIdx++;
      }

      // Search
      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx} OR a.custom_fields->>'vision' ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ` ORDER BY a.updated_at DESC`;

      // Pagination
      if (limit) {
        sql += ` LIMIT $${paramIdx}`;
        params.push(parseInt(limit, 10));
        paramIdx++;
      }
      if (offset) {
        sql += ` OFFSET $${paramIdx}`;
        params.push(parseInt(offset, 10));
        paramIdx++;
      }

      const result = await query(sql, params);

      // Optionally include stats for each project
      let projects = result.rows;
      if (includeStats === 'true') {
        projects = await Promise.all(projects.map(async (project) => {
          const statsResult = await query(
            `SELECT artefact_type, COUNT(*) as count
             FROM artefacts
             WHERE project_id = $1
               AND artefact_type LIKE 'pds_%'
               AND artefact_type != 'pds_project'
               AND (custom_fields->>'pds_project_id' = $2 OR id IN (
                 SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $2
               ))
             GROUP BY artefact_type`,
            [projectId, project.id]
          );
          return {
            ...project,
            stats: statsResult.rows.reduce((acc, row) => {
              acc[row.artefact_type] = parseInt(row.count, 10);
              return acc;
            }, {}),
          };
        }));
      }

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM artefacts WHERE project_id = $1 AND artefact_type = 'pds_project'`,
        [projectId]
      );

      return res.status(200).json({
        projects,
        total: parseInt(countResult.rows[0].total, 10),
        limit: limit ? parseInt(limit, 10) : null,
        offset: offset ? parseInt(offset, 10) : 0,
      });
    } catch (err) {
      console.error('Error listing PDS projects:', err);
      return errorResponse(res, 500, 'Failed to list projects', err);
    }
  }

  if (req.method === 'POST') {
    // Create PDS project
    const {
      projectId,
      name,
      vision,
      successCriteria,
      srsDecisionId,
      status: pdsStatus,
      health,
      startDate,
      targetEndDate,
      budget,
      sponsor,
      ownerId,
      tags,
      skipReadinessCheck,
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (!vision || !vision.trim()) {
      return res.status(400).json({ error: 'Vision statement is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    // Validate SRS decision readiness if linked
    if (srsDecisionId && !skipReadinessCheck) {
      try {
        const decisionResult = await query(
          `SELECT * FROM artefacts WHERE id = $1 AND artefact_type = 'srs_decision'`,
          [srsDecisionId]
        );

        if (decisionResult.rows.length === 0) {
          return res.status(400).json({ error: 'SRS decision not found' });
        }

        const decision = decisionResult.rows[0];
        const validation = validateSRSReadiness({
          status: decision.custom_fields?.status,
          custom_fields: decision.custom_fields,
        });

        if (!validation.valid) {
          return res.status(400).json({
            error: 'SRS decision does not meet readiness requirements',
            reason: validation.reason,
          });
        }
      } catch (err) {
        console.error('Error validating SRS decision:', err);
        // Continue without validation if there's an error
      }
    }

    const customFields = {
      vision: vision.trim(),
      success_criteria: successCriteria || [],
      srs_decision_id: srsDecisionId || null,
      status: pdsStatus || PDS_PROJECT_STATUS.DRAFT,
      health: health || PDS_PROJECT_HEALTH.UNKNOWN,
      start_date: startDate || null,
      target_end_date: targetEndDate || null,
      budget: budget || null,
      sponsor: sponsor || null,
    };

    const artefactStatus = mapPDSStatusToArtefactStatus(pdsStatus || 'draft');

    try {
      const result = await query(
        `INSERT INTO artefacts (
          project_id, artefact_type, name, description, status,
          architecture_state, priority, owner_id, tags, custom_fields,
          created_by, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), now())
        RETURNING *`,
        [
          projectId,
          'pds_project',
          name.trim(),
          vision.trim(),
          artefactStatus,
          'N/A',
          'High',
          ownerId || user,
          JSON.stringify(tags || []),
          JSON.stringify(customFields),
          user
        ]
      );

      // If linked to SRS decision, create relationship
      if (srsDecisionId) {
        await query(
          `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, created_by)
           VALUES ($1, $2, $3, $4)`,
          [result.rows[0].id, srsDecisionId, 'originated_from', user]
        );
      }

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error creating PDS project:', err);
      return errorResponse(res, 500, 'Failed to create project', err);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
