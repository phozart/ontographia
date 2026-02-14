// pages/api/blueprint/stats.js
// Funnel metrics and statistics for Blueprint Studio
// Related to BP-026

import { blueprintRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkDomainAccess } from '../../../lib/projectAccess';
import { BPS_STAGES, BPS_STAGE_INFO, BPS_HORIZONS } from '../../../lib/blueprint-types';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domainId } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  const { hasAccess, error } = await checkDomainAccess(req, domainId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error: error || 'Access denied' });
  }

  try {
    // Get funnel metrics
    const metrics = await blueprintRepository.getFunnelMetrics(domainId);

    // Build funnel visualization data
    const funnel = BPS_STAGES
      .filter(stage => !['approved', 'declined'].includes(stage))
      .map(stage => ({
        stage,
        ...BPS_STAGE_INFO[stage],
        count: metrics.byStage[stage] || 0,
      }));

    // Calculate conversion rates between stages
    const conversions = {};
    const activeStages = ['idea', 'explore', 'assess', 'case'];
    for (let i = 0; i < activeStages.length - 1; i++) {
      const from = activeStages[i];
      const to = activeStages[i + 1];
      const fromCount = metrics.byStage[from] || 0;
      const toCount = metrics.byStage[to] || 0;
      conversions[`${from}_to_${to}`] = fromCount > 0
        ? Math.round((toCount / fromCount) * 100)
        : 0;
    }

    // Build horizon distribution
    const horizonDistribution = Object.entries(BPS_HORIZONS).map(([key, info]) => ({
      horizon: key,
      ...info,
      count: metrics.byHorizon[key] || 0,
      percentage: metrics.total > 0
        ? Math.round((metrics.byHorizon[key] || 0) / metrics.total * 100)
        : 0,
    }));

    // Overall success rate
    const successRate = metrics.total > 0
      ? Math.round((metrics.byStage.approved || 0) / metrics.total * 100)
      : 0;

    return res.status(200).json({
      summary: {
        total: metrics.total,
        active: metrics.active,
        approved: metrics.byStage.approved || 0,
        declined: metrics.byStage.declined || 0,
        successRate,
      },
      byStage: metrics.byStage,
      byHorizon: metrics.byHorizon,
      funnel,
      conversions,
      horizonDistribution,
      stages: BPS_STAGE_INFO,
      horizons: BPS_HORIZONS,
    });
  } catch (err) {
    console.error('Error fetching blueprint stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}
