// pages/api/pdw/stats.js
// Product Design Workspace - Statistics and Health API
// Get counts, stage progress, and health metrics for PDW artefacts
// Domain-scoped

import { query } from '../../../lib/pg';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import {
  PDW_STAGES,
  PDW_WORKSPACE_MODULES,
  PDW_ALL_TYPES,
  PDW_TYPE_DEFS,
  PDW_CANVAS_DEFS,
  calculateStageHealth,
} from '../../../lib/pdw-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domainId } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'Domain ID required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    // Get all PDW artefacts for this domain
    const artefactsResult = await query(
      `SELECT
        artefact_type,
        status,
        custom_fields,
        created_at,
        updated_at
       FROM artefacts
       WHERE domain_id = $1
         AND artefact_type LIKE 'pdw_%'`,
      [domainId]
    );

    const artefacts = artefactsResult.rows;

    // Count by type
    const countsByType = {};
    for (const a of artefacts) {
      countsByType[a.artefact_type] = (countsByType[a.artefact_type] || 0) + 1;
    }

    // Count by stage
    const countsByStage = {};
    for (const [stageId, stageDef] of Object.entries(PDW_STAGES)) {
      const stageTypes = stageDef.types || [];
      countsByStage[stageId] = {
        name: stageDef.name,
        count: artefacts.filter(a => stageTypes.includes(a.artefact_type)).length,
        types: stageTypes,
      };
    }

    // Count by module
    const countsByModule = {};
    for (const [moduleId, moduleDef] of Object.entries(PDW_WORKSPACE_MODULES)) {
      const moduleTypes = [...(moduleDef.types || []), ...(moduleDef.canvases || [])];
      countsByModule[moduleId] = {
        name: moduleDef.name,
        count: artefacts.filter(a => moduleTypes.includes(a.artefact_type)).length,
        types: moduleTypes,
      };
    }

    // Count by PDW status (from custom_fields)
    const countsByStatus = {};
    for (const a of artefacts) {
      const pdwStatus = a.custom_fields?.pdw_status || 'draft';
      countsByStatus[pdwStatus] = (countsByStatus[pdwStatus] || 0) + 1;
    }

    // Count artefacts vs canvases
    const artefactCount = artefacts.filter(a => PDW_TYPE_DEFS[a.artefact_type]).length;
    const canvasCount = artefacts.filter(a => PDW_CANVAS_DEFS[a.artefact_type]).length;

    // Calculate stage health scores
    const stageHealth = {};
    for (const stageId of Object.keys(PDW_STAGES)) {
      stageHealth[stageId] = calculateStageHealth(artefacts, stageId);
    }

    // Calculate overall health score (average of stage scores)
    const stageScores = Object.values(stageHealth).map(h => h.score);
    const overallHealth = stageScores.length > 0
      ? stageScores.reduce((a, b) => a + b, 0) / stageScores.length
      : 0;

    // Get relationship counts
    const relResult = await query(
      `SELECT COUNT(*) as count
       FROM artefact_relationships r
       JOIN artefacts fa ON fa.id = r.from_artefact_id
       WHERE fa.domain_id = $1
         AND fa.artefact_type LIKE 'pdw_%'`,
      [domainId]
    );

    // Get recent activity (last 7 days)
    const recentResult = await query(
      `SELECT
        DATE(updated_at) as date,
        COUNT(*) as count
       FROM artefacts
       WHERE domain_id = $1
         AND artefact_type LIKE 'pdw_%'
         AND updated_at > NOW() - INTERVAL '7 days'
       GROUP BY DATE(updated_at)
       ORDER BY date DESC`,
      [domainId]
    );

    // Get validation metrics
    const validatedCount = artefacts.filter(a =>
      a.custom_fields?.pdw_status === 'validated' ||
      a.status === 'Approved'
    ).length;

    const invalidatedCount = artefacts.filter(a =>
      a.custom_fields?.pdw_status === 'invalidated'
    ).length;

    const inProgressCount = artefacts.filter(a =>
      a.custom_fields?.pdw_status === 'in_progress'
    ).length;

    // Get experiment outcomes
    const experiments = artefacts.filter(a => a.artefact_type === 'pdw_experiment');
    const experimentOutcomes = {
      total: experiments.length,
      validated: experiments.filter(e => e.custom_fields?.outcome === 'Validated').length,
      invalidated: experiments.filter(e => e.custom_fields?.outcome === 'Invalidated').length,
      inconclusive: experiments.filter(e => e.custom_fields?.outcome === 'Inconclusive').length,
      running: experiments.filter(e => e.custom_fields?.outcome === 'Running').length,
      notStarted: experiments.filter(e =>
        !e.custom_fields?.outcome || e.custom_fields?.outcome === 'Not Started'
      ).length,
    };

    // Get assumptions by risk level
    const assumptions = artefacts.filter(a => a.artefact_type === 'pdw_assumption');
    const assumptionsByRisk = {
      total: assumptions.length,
      high: assumptions.filter(a => a.custom_fields?.risk_level === 'High').length,
      medium: assumptions.filter(a => a.custom_fields?.risk_level === 'Medium').length,
      low: assumptions.filter(a => a.custom_fields?.risk_level === 'Low').length,
    };

    return res.status(200).json({
      summary: {
        total: artefacts.length,
        artefacts: artefactCount,
        canvases: canvasCount,
        relationships: parseInt(relResult.rows[0].count, 10),
        overallHealth: Math.round(overallHealth * 100),
      },
      countsByType,
      countsByStage,
      countsByModule,
      countsByStatus,
      stageHealth,
      validation: {
        validated: validatedCount,
        invalidated: invalidatedCount,
        inProgress: inProgressCount,
        validationRate: artefacts.length > 0
          ? Math.round((validatedCount / artefacts.length) * 100)
          : 0,
      },
      experimentOutcomes,
      assumptionsByRisk,
      recentActivity: recentResult.rows,
    });
  } catch (err) {
    console.error('Error fetching PDW stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}
