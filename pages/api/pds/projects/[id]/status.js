// pages/api/pds/projects/[id]/status.js
// PDS Status Reports API - Sub-resource endpoint
// Task PD-024

import { query } from '../../../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';
import { PDS_ARTEFACT_TYPES, PDS_PROJECT_HEALTH, getDefaultValues } from '../../../../../lib/pds-types';

// Health dimensions for status reporting
const HEALTH_DIMENSIONS = ['scope', 'schedule', 'budget', 'quality', 'resources', 'risks'];
const HEALTH_VALUES = ['green', 'amber', 'red'];
const TREND_VALUES = ['improving', 'stable', 'declining'];

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id: pdsProjectId } = req.query;

  if (!pdsProjectId) {
    return res.status(400).json({ error: 'PDS Project ID is required' });
  }

  // GET - List status reports or get latest
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

    const { latest, limit, offset } = req.query;

    try {
      let sql = `
        SELECT a.*,
          u.username as reporter_username
        FROM artefacts a
        LEFT JOIN users u ON u.username = a.created_by
        WHERE a.project_id = $1
          AND a.artefact_type = 'pds_status_update'
          AND (
            a.custom_fields->>'pds_project_id' = $2
            OR a.id IN (
              SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $2
              UNION
              SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $2
            )
          )
        ORDER BY a.created_at DESC
      `;
      const params = [projectId, pdsProjectId];
      let paramIdx = 3;

      // If only want latest, limit to 1
      if (latest === 'true') {
        sql += ' LIMIT 1';
      } else {
        if (limit) {
          sql += ` LIMIT $${paramIdx}`;
          params.push(parseInt(limit, 10));
          paramIdx++;
        }
        if (offset) {
          sql += ` OFFSET $${paramIdx}`;
          params.push(parseInt(offset, 10));
        }
      }

      const result = await query(sql, params);

      // If requesting latest, return single object
      if (latest === 'true') {
        if (result.rows.length === 0) {
          return res.status(200).json({
            status: null,
            message: 'No status reports found',
          });
        }
        return res.status(200).json({
          status: result.rows[0],
          reportedAt: result.rows[0].created_at,
        });
      }

      // Calculate trends from historical data
      const reports = result.rows;
      const trends = {};

      if (reports.length >= 2) {
        const latest = reports[0].custom_fields?.health || {};
        const previous = reports[1].custom_fields?.health || {};

        HEALTH_DIMENSIONS.forEach(dim => {
          const latestVal = HEALTH_VALUES.indexOf(latest[dim] || 'amber');
          const prevVal = HEALTH_VALUES.indexOf(previous[dim] || 'amber');
          if (latestVal < prevVal) trends[dim] = 'improving';
          else if (latestVal > prevVal) trends[dim] = 'declining';
          else trends[dim] = 'stable';
        });
      }

      return res.status(200).json({
        reports,
        total: reports.length,
        trends,
        dimensions: HEALTH_DIMENSIONS,
        healthValues: HEALTH_VALUES,
      });
    } catch (err) {
      console.error('Error fetching status reports:', err);
      return res.status(500).json({ error: 'Failed to fetch status reports' });
    }
  }

  // POST - Create status report
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
      reportingPeriod,
      overallHealth = 'amber',
      health = {},
      accomplishments = [],
      plannedActivities = [],
      blockers = [],
      risks = [],
      decisions = [],
      escalations = [],
      notes,
      percentComplete,
      budgetSpent,
      budgetForecast,
      ...customFields
    } = req.body;

    // Validate overall health
    if (!HEALTH_VALUES.includes(overallHealth)) {
      return res.status(400).json({ error: `Invalid overallHealth. Use: ${HEALTH_VALUES.join(', ')}` });
    }

    // Validate dimension health values
    for (const [dim, value] of Object.entries(health)) {
      if (!HEALTH_DIMENSIONS.includes(dim)) {
        return res.status(400).json({ error: `Invalid health dimension: ${dim}` });
      }
      if (!HEALTH_VALUES.includes(value)) {
        return res.status(400).json({ error: `Invalid health value for ${dim}. Use: ${HEALTH_VALUES.join(', ')}` });
      }
    }

    const typeDef = PDS_ARTEFACT_TYPES.pds_status_update;
    const defaults = getDefaultValues('pds_status_update');

    // Generate report name
    const reportDate = new Date();
    const reportName = reportingPeriod || `Status Report - ${reportDate.toISOString().split('T')[0]}`;

    const mergedCustomFields = {
      ...defaults,
      ...customFields,
      reporting_period: reportingPeriod,
      overall_health: overallHealth,
      health,
      accomplishments,
      planned_activities: plannedActivities,
      blockers,
      risks,
      decisions,
      escalations,
      notes,
      percent_complete: percentComplete,
      budget_spent: budgetSpent,
      budget_forecast: budgetForecast,
      report_date: reportDate.toISOString(),
      pds_project_id: pdsProjectId,
      pds_stage: typeDef?.stage || 'control',
      pds_type: 'pds_status_update',
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
          'pds_status_update',
          reportName,
          notes || '',
          'Approved', // Status reports are typically immediately valid
          'N/A',
          'Medium',
          user,
          JSON.stringify(mergedCustomFields),
          user,
        ]
      );

      const newReport = result.rows[0];

      // Create relationship to PDS project
      await query(
        `INSERT INTO artefact_relationships (from_artefact_id, to_artefact_id, relationship_type, created_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [newReport.id, pdsProjectId, 'reports_on', user]
      );

      // Update project's overall health if provided
      if (overallHealth) {
        await query(
          `UPDATE artefacts
           SET custom_fields = custom_fields || $1, updated_at = now()
           WHERE id = $2`,
          [JSON.stringify({ overall_health: overallHealth, last_status_date: reportDate.toISOString() }), pdsProjectId]
        );
      }

      return res.status(201).json(newReport);
    } catch (err) {
      console.error('Error creating status report:', err);
      return res.status(500).json({ error: 'Failed to create status report' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
