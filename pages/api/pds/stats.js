/**
 * PDS Stats API - Project Design Workspace
 *
 * Analytics and statistics for PDS projects.
 *
 * @module pages/api/pds/stats
 */

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { PDS_STAGES, PDS_ARTEFACT_TYPES } from '../../../lib/pds-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, pdsProjectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    // Base filter for PDS types
    let baseFilter = `a.project_id = $1 AND a.artefact_type LIKE 'pds_%'`;
    const params = [projectId];
    let paramIdx = 2;

    // Filter by specific PDS project if provided
    if (pdsProjectId) {
      baseFilter += ` AND (
        a.id = $${paramIdx}
        OR a.custom_fields->>'pds_project_id' = $${paramIdx}
        OR a.id IN (
          SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $${paramIdx}
          UNION
          SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $${paramIdx}
        )
      )`;
      params.push(pdsProjectId);
      paramIdx++;
    }

    // Count by type
    const typeCountResult = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts a
       WHERE ${baseFilter}
       GROUP BY artefact_type
       ORDER BY count DESC`,
      params
    );

    const byType = typeCountResult.rows.reduce((acc, row) => {
      acc[row.artefact_type] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Count by stage
    const byStage = {};
    for (const [stageKey, stageId] of Object.entries(PDS_STAGES)) {
      const stageTypes = Object.values(PDS_ARTEFACT_TYPES)
        .filter(t => t.stage === stageId)
        .map(t => t.id);

      byStage[stageId] = stageTypes.reduce((sum, type) => sum + (byType[type] || 0), 0);
    }

    // Risk statistics
    const riskStatsResult = await query(
      `SELECT
        custom_fields->>'exposure' as exposure,
        custom_fields->>'status' as status,
        COUNT(*) as count
       FROM artefacts a
       WHERE ${baseFilter} AND a.artefact_type = 'pds_risk'
       GROUP BY custom_fields->>'exposure', custom_fields->>'status'`,
      params
    );

    const riskStats = {
      byExposure: {},
      byStatus: {},
      total: 0,
    };

    riskStatsResult.rows.forEach(row => {
      const count = parseInt(row.count, 10);
      riskStats.total += count;
      if (row.exposure) {
        riskStats.byExposure[row.exposure] = (riskStats.byExposure[row.exposure] || 0) + count;
      }
      if (row.status) {
        riskStats.byStatus[row.status] = (riskStats.byStatus[row.status] || 0) + count;
      }
    });

    // Issue statistics
    const issueStatsResult = await query(
      `SELECT
        custom_fields->>'status' as status,
        custom_fields->>'urgency' as urgency,
        COUNT(*) as count
       FROM artefacts a
       WHERE ${baseFilter} AND a.artefact_type = 'pds_issue'
       GROUP BY custom_fields->>'status', custom_fields->>'urgency'`,
      params
    );

    const issueStats = {
      byStatus: {},
      byUrgency: {},
      total: 0,
      open: 0,
    };

    issueStatsResult.rows.forEach(row => {
      const count = parseInt(row.count, 10);
      issueStats.total += count;
      if (row.status) {
        issueStats.byStatus[row.status] = (issueStats.byStatus[row.status] || 0) + count;
        if (['open', 'in_progress', 'escalated'].includes(row.status)) {
          issueStats.open += count;
        }
      }
      if (row.urgency) {
        issueStats.byUrgency[row.urgency] = (issueStats.byUrgency[row.urgency] || 0) + count;
      }
    });

    // Milestone statistics
    const milestoneStatsResult = await query(
      `SELECT
        custom_fields->>'status' as status,
        custom_fields->>'planned_date' as planned_date,
        COUNT(*) as count
       FROM artefacts a
       WHERE ${baseFilter} AND a.artefact_type = 'pds_milestone'
       GROUP BY custom_fields->>'status', custom_fields->>'planned_date'`,
      params
    );

    const milestoneStats = {
      byStatus: {},
      total: 0,
      upcoming: 0,
      overdue: 0,
    };

    const now = new Date();
    milestoneStatsResult.rows.forEach(row => {
      const count = parseInt(row.count, 10);
      milestoneStats.total += count;
      if (row.status) {
        milestoneStats.byStatus[row.status] = (milestoneStats.byStatus[row.status] || 0) + count;
      }
      // Count upcoming and overdue
      if (row.planned_date && row.status === 'upcoming') {
        const plannedDate = new Date(row.planned_date);
        if (plannedDate > now) {
          milestoneStats.upcoming += count;
        } else {
          milestoneStats.overdue += count;
        }
      }
    });

    // Deliverable progress
    const deliverableStatsResult = await query(
      `SELECT
        custom_fields->>'status' as status,
        AVG(COALESCE((custom_fields->>'progress')::numeric, 0)) as avg_progress,
        COUNT(*) as count
       FROM artefacts a
       WHERE ${baseFilter} AND a.artefact_type = 'pds_deliverable'
       GROUP BY custom_fields->>'status'`,
      params
    );

    const deliverableStats = {
      byStatus: {},
      total: 0,
      avgProgress: 0,
      completed: 0,
    };

    let totalProgress = 0;
    let progressCount = 0;
    deliverableStatsResult.rows.forEach(row => {
      const count = parseInt(row.count, 10);
      deliverableStats.total += count;
      deliverableStats.byStatus[row.status] = count;
      if (row.status === 'completed') {
        deliverableStats.completed += count;
      }
      totalProgress += parseFloat(row.avg_progress || 0) * count;
      progressCount += count;
    });
    deliverableStats.avgProgress = progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

    // Assumption validation stats
    const assumptionStatsResult = await query(
      `SELECT
        custom_fields->>'status' as status,
        COUNT(*) as count
       FROM artefacts a
       WHERE ${baseFilter} AND a.artefact_type = 'pds_assumption'
       GROUP BY custom_fields->>'status'`,
      params
    );

    const assumptionStats = {
      byStatus: {},
      total: 0,
      validated: 0,
      invalidated: 0,
      unvalidated: 0,
    };

    assumptionStatsResult.rows.forEach(row => {
      const count = parseInt(row.count, 10);
      assumptionStats.total += count;
      assumptionStats.byStatus[row.status] = count;
      if (row.status === 'validated') assumptionStats.validated = count;
      if (row.status === 'invalidated') assumptionStats.invalidated = count;
      if (row.status === 'unvalidated') assumptionStats.unvalidated = count;
    });

    // Change request stats
    const changeStatsResult = await query(
      `SELECT
        custom_fields->>'decision' as decision,
        COUNT(*) as count
       FROM artefacts a
       WHERE ${baseFilter} AND a.artefact_type = 'pds_change_request'
       GROUP BY custom_fields->>'decision'`,
      params
    );

    const changeStats = {
      byDecision: {},
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    changeStatsResult.rows.forEach(row => {
      const count = parseInt(row.count, 10);
      changeStats.total += count;
      changeStats.byDecision[row.decision] = count;
      if (row.decision === 'pending') changeStats.pending = count;
      if (row.decision === 'approved') changeStats.approved = count;
      if (row.decision === 'rejected') changeStats.rejected = count;
    });

    // Lesson stats
    const lessonStatsResult = await query(
      `SELECT COUNT(*) as count FROM artefacts a WHERE ${baseFilter} AND a.artefact_type = 'pds_lesson'`,
      params
    );

    const lessonStats = {
      total: parseInt(lessonStatsResult.rows[0]?.count || 0, 10),
    };

    // Calculate total artefacts
    const total = Object.values(byType).reduce((sum, count) => sum + count, 0);

    // Health indicators
    const health = {
      hasHighRisks: (riskStats.byExposure.critical || 0) + (riskStats.byExposure.high || 0) > 0,
      hasOpenIssues: issueStats.open > 0,
      hasOverdueMilestones: milestoneStats.overdue > 0,
      hasPendingChanges: changeStats.pending > 0,
      hasInvalidatedAssumptions: assumptionStats.invalidated > 0,
      completionRate: deliverableStats.total > 0
        ? Math.round((deliverableStats.completed / deliverableStats.total) * 100)
        : 0,
    };

    return res.status(200).json({
      total,
      byType,
      byStage,
      risks: riskStats,
      issues: issueStats,
      milestones: milestoneStats,
      deliverables: deliverableStats,
      assumptions: assumptionStats,
      changes: changeStats,
      lessons: lessonStats,
      health,
    });
  } catch (err) {
    console.error('Error fetching PDS stats:', err);
    return res.status(500).json({ error: 'Failed to fetch stats', details: err.message });
  }
}
