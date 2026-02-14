/**
 * Program Dashboard API
 * GET: Get dashboard statistics and recent activity
 */

import IntegrationRepository from '../../../lib/repositories/IntegrationRepository';
import { errorResponse } from '../../../lib/api/errorResponse';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { domainId } = req.query;

  if (!domainId) {
    return res.status(400).json({ error: 'domainId is required' });
  }

  try {
    const stats = await IntegrationRepository.getProgramDashboardStats(domainId);

    // Calculate health score (0-100)
    const pendingItems = parseInt(stats.pending_approvals || 0) + parseInt(stats.pending_handoffs || 0);
    const activeInitiatives = parseInt(stats.active_initiatives || 0);
    const healthScore = Math.max(0, Math.min(100,
      100 - (pendingItems * 5) + (activeInitiatives * 2)
    ));

    res.status(200).json({
      summary: {
        activeInitiatives: parseInt(stats.active_initiatives || 0),
        planningInitiatives: parseInt(stats.planning_initiatives || 0),
        pendingApprovals: parseInt(stats.pending_approvals || 0),
        pendingHandoffs: parseInt(stats.pending_handoffs || 0),
        recentDecisions: parseInt(stats.recent_decisions || 0),
        healthScore
      },
      bySpace: stats.bySpace || [],
      recentActivity: stats.recentActivity || []
    });

  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch dashboard', error);
  }
}
