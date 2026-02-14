/**
 * EA PDS Projects API - Fetch PDS projects with EA cross-reference status
 *
 * GET /api/ea/pds-projects - List PDS projects with EA link status
 *
 * @module pages/api/ea/pds-projects/index
 */

import { query } from '../../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../../lib/projectAccess';
import { errorResponse } from '../../../../lib/api/errorResponse';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // GET - List PDS projects with EA cross-reference status
  if (req.method === 'GET') {
    const {
      domainId,
      projectId,
      includeArtefacts,
      includeEAStatus,
      status,
      search,
      limit = 100,
      offset = 0,
    } = req.query;

    if (!domainId) {
      return res.status(400).json({ error: 'Domain ID is required' });
    }

    // Check domain access
    const { hasAccess, error: accessError } = await checkDomainAccess(req, domainId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error: accessError || 'Access denied' });
    }

    try {
      // Base query for PDS projects (artefacts of type pds_project)
      let sql = `
        SELECT
          a.id,
          a.project_id,
          a.name,
          a.description,
          a.status,
          a.custom_fields,
          a.tags,
          a.created_at,
          a.updated_at,
          a.display_id,
          p.name as parent_project_name,
          p.display_id as parent_project_display_id,
          u.username as owner_username,
          cb.username as created_by_username
      `;

      // Optionally include EA cross-reference info
      if (includeEAStatus === 'true') {
        sql += `,
          xref.id as ea_cross_reference_id,
          xref.ea_element_id,
          xref.sync_status as ea_sync_status,
          xref.last_synced_at as ea_last_synced_at,
          ea_el.name as ea_element_name,
          ea_el.element_type as ea_element_type
        `;
      }

      sql += `
        FROM artefacts a
        LEFT JOIN projects p ON p.id = a.project_id
        LEFT JOIN users u ON u.username = a.owner_id
        LEFT JOIN users cb ON cb.username = a.created_by
      `;

      if (includeEAStatus === 'true') {
        sql += `
          LEFT JOIN ea_cross_references xref ON xref.source_artefact_id = a.id
            AND xref.domain_id = $1
          LEFT JOIN ea_elements ea_el ON ea_el.id = xref.ea_element_id
        `;
      }

      sql += `
        WHERE a.domain_id = $1
          AND a.artefact_type = 'pds_project'
      `;

      const params = [domainId];
      let paramIdx = 2;

      // Filter by parent project
      if (projectId) {
        sql += ` AND a.project_id = $${paramIdx}`;
        params.push(projectId);
        paramIdx++;
      }

      // Filter by status
      if (status) {
        sql += ` AND (a.custom_fields->>'status' = $${paramIdx} OR a.status = $${paramIdx})`;
        params.push(status);
        paramIdx++;
      }

      // Search in name and description
      if (search) {
        sql += ` AND (a.name ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`;
        params.push(`%${search}%`);
        paramIdx++;
      }

      sql += ` ORDER BY a.updated_at DESC`;
      sql += ` LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const result = await query(sql, params);
      const projects = result.rows;

      // Get total count
      let countSql = `
        SELECT COUNT(*) as total
        FROM artefacts a
        WHERE a.domain_id = $1
          AND a.artefact_type = 'pds_project'
      `;
      const countParams = [domainId];
      if (projectId) {
        countSql += ` AND a.project_id = $2`;
        countParams.push(projectId);
      }
      const countResult = await query(countSql, countParams);
      const total = parseInt(countResult.rows[0].total, 10);

      // Optionally include artefacts for each project
      let artefactsByProject = {};

      if (includeArtefacts === 'true' && projects.length > 0) {
        const projectIds = projects.map(p => p.id);

        // Get all PDS artefacts linked to these projects
        const artefactsSql = `
          SELECT
            a.id,
            a.name,
            a.description,
            a.artefact_type,
            a.status,
            a.custom_fields,
            a.created_at,
            a.updated_at,
            a.custom_fields->>'pds_project_id' as pds_project_id,
            xref.id as ea_cross_reference_id,
            xref.ea_element_id,
            xref.sync_status as ea_sync_status
          FROM artefacts a
          LEFT JOIN ea_cross_references xref ON xref.source_artefact_id = a.id
            AND xref.domain_id = $1
          WHERE a.domain_id = $1
            AND a.artefact_type LIKE 'pds_%'
            AND a.artefact_type != 'pds_project'
            AND (
              a.custom_fields->>'pds_project_id' = ANY($2::text[])
              OR a.id IN (
                SELECT to_artefact_id FROM artefact_relationships
                WHERE from_artefact_id = ANY($2::uuid[])
                UNION
                SELECT from_artefact_id FROM artefact_relationships
                WHERE to_artefact_id = ANY($2::uuid[])
              )
            )
          ORDER BY a.artefact_type, a.name
        `;

        const artefactsResult = await query(artefactsSql, [domainId, projectIds]);

        // Group artefacts by project ID
        for (const artefact of artefactsResult.rows) {
          const projId = artefact.pds_project_id;
          if (projId) {
            if (!artefactsByProject[projId]) {
              artefactsByProject[projId] = [];
            }
            artefactsByProject[projId].push(artefact);
          }
        }

        // Also add artefacts based on relationships
        // (Already included in the query via UNION)
      }

      // Calculate statistics
      const stats = {
        total,
        linked: projects.filter(p => p.ea_cross_reference_id).length,
        unlinked: projects.filter(p => !p.ea_cross_reference_id).length,
        byStatus: {},
      };

      for (const project of projects) {
        const projectStatus = project.custom_fields?.status || project.status || 'unknown';
        if (!stats.byStatus[projectStatus]) {
          stats.byStatus[projectStatus] = 0;
        }
        stats.byStatus[projectStatus]++;
      }

      return res.status(200).json({
        projects,
        artefactsByProject,
        total,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        stats,
      });
    } catch (err) {
      console.error('Error fetching PDS projects for EA:', err);
      return res.status(500).json({
        error: 'Failed to fetch PDS projects',
        details: process.env.NODE_ENV !== 'production' ? err.message : undefined,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
