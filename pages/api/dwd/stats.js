// pages/api/dwd/stats.js
// Dynamic Work Design - Statistics and health API

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { DWD_TYPE_DEFS, DWD_STAGES, generateObservations } from '../../../lib/dwd-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, caseId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    // Base query for DWD artefacts
    let baseCondition = `project_id = $1 AND artefact_type LIKE 'dwd_%'`;
    const baseParams = [projectId];

    // If caseId provided, filter to case-related artefacts
    if (caseId) {
      baseCondition += ` AND (id = $2 OR id IN (
        SELECT to_artefact_id FROM artefact_relationships WHERE from_artefact_id = $2
        UNION
        SELECT from_artefact_id FROM artefact_relationships WHERE to_artefact_id = $2
      ))`;
      baseParams.push(caseId);
    }

    // ========== Counts by type ==========
    const typeCountsResult = await query(
      `SELECT artefact_type, COUNT(*) as count
       FROM artefacts
       WHERE ${baseCondition}
       GROUP BY artefact_type
       ORDER BY count DESC`,
      baseParams
    );

    const countsByType = {};
    typeCountsResult.rows.forEach(row => {
      countsByType[row.artefact_type] = parseInt(row.count, 10);
    });

    // ========== Counts by stage ==========
    const countsByStage = {};
    for (const [stageId, stage] of Object.entries(DWD_STAGES)) {
      const stageCount = stage.types.reduce((sum, type) => sum + (countsByType[type] || 0), 0);
      countsByStage[stageId] = stageCount;
    }

    // ========== Case status breakdown ==========
    const caseStatusResult = await query(
      `SELECT custom_fields->>'case_status' as status, COUNT(*) as count
       FROM artefacts
       WHERE ${baseCondition} AND artefact_type = 'dwd_case'
       GROUP BY custom_fields->>'case_status'`,
      baseParams
    );

    const casesByStatus = {};
    caseStatusResult.rows.forEach(row => {
      casesByStatus[row.status || 'unknown'] = parseInt(row.count, 10);
    });

    // ========== Signal breakdown ==========
    const signalResult = await query(
      `SELECT
        custom_fields->>'signal_type' as signal_type,
        custom_fields->>'impact' as impact,
        COUNT(*) as count
       FROM artefacts
       WHERE ${baseCondition} AND artefact_type = 'dwd_signal'
       GROUP BY custom_fields->>'signal_type', custom_fields->>'impact'`,
      baseParams
    );

    const signalsByType = {};
    const signalsByImpact = { high: 0, medium: 0, low: 0 };
    signalResult.rows.forEach(row => {
      const signalType = row.signal_type || 'other';
      const impact = row.impact || 'medium';
      const count = parseInt(row.count, 10);

      signalsByType[signalType] = (signalsByType[signalType] || 0) + count;
      signalsByImpact[impact] = (signalsByImpact[impact] || 0) + count;
    });

    // ========== Work item breakdown ==========
    const workItemResult = await query(
      `SELECT
        custom_fields->>'item_state' as state,
        custom_fields->>'volatility' as volatility,
        COUNT(*) as count
       FROM artefacts
       WHERE ${baseCondition} AND artefact_type = 'dwd_work_item'
       GROUP BY custom_fields->>'item_state', custom_fields->>'volatility'`,
      baseParams
    );

    const workItemsByState = {};
    const workItemsByVolatility = { high: 0, medium: 0, low: 0 };
    workItemResult.rows.forEach(row => {
      const state = row.state || 'open';
      const volatility = row.volatility || 'medium';
      const count = parseInt(row.count, 10);

      workItemsByState[state] = (workItemsByState[state] || 0) + count;
      workItemsByVolatility[volatility] = (workItemsByVolatility[volatility] || 0) + count;
    });

    // ========== Adjustment status breakdown ==========
    const adjustmentResult = await query(
      `SELECT custom_fields->>'adjustment_status' as status, COUNT(*) as count
       FROM artefacts
       WHERE ${baseCondition} AND artefact_type = 'dwd_adjustment'
       GROUP BY custom_fields->>'adjustment_status'`,
      baseParams
    );

    const adjustmentsByStatus = {};
    adjustmentResult.rows.forEach(row => {
      adjustmentsByStatus[row.status || 'proposed'] = parseInt(row.count, 10);
    });

    // ========== Recent activity ==========
    const recentResult = await query(
      `SELECT id, name, artefact_type, updated_at, created_at
       FROM artefacts
       WHERE ${baseCondition}
       ORDER BY updated_at DESC
       LIMIT 10`,
      baseParams
    );

    // ========== Total counts ==========
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM artefacts WHERE ${baseCondition}`,
      baseParams
    );

    // ========== Generate observations (heuristic insights) ==========
    // Fetch all artefacts for observation generation
    const allArtefactsResult = await query(
      `SELECT * FROM artefacts WHERE ${baseCondition}`,
      baseParams
    );

    const relationshipsResult = await query(
      `SELECT ar.* FROM artefact_relationships ar
       JOIN artefacts a ON a.id = ar.from_artefact_id
       WHERE a.project_id = $1 AND a.artefact_type LIKE 'dwd_%'`,
      [projectId]
    );

    const observations = generateObservations(allArtefactsResult.rows, relationshipsResult.rows);

    // ========== Response ==========
    return res.status(200).json({
      total: parseInt(totalResult.rows[0].total, 10),
      countsByType,
      countsByStage,
      cases: {
        total: countsByType['dwd_case'] || 0,
        byStatus: casesByStatus,
      },
      signals: {
        total: countsByType['dwd_signal'] || 0,
        byType: signalsByType,
        byImpact: signalsByImpact,
      },
      workItems: {
        total: countsByType['dwd_work_item'] || 0,
        byState: workItemsByState,
        byVolatility: workItemsByVolatility,
      },
      actors: {
        total: countsByType['dwd_actor'] || 0,
      },
      adjustments: {
        total: countsByType['dwd_adjustment'] || 0,
        byStatus: adjustmentsByStatus,
      },
      learnings: {
        total: countsByType['dwd_learning'] || 0,
      },
      observations,
      recentActivity: recentResult.rows,
    });
  } catch (err) {
    console.error('Error fetching DWD stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}
