/**
 * KPIs API
 * GET: List KPIs with health calculation
 */

import { perfRepository } from '../../../lib/repositories/PerfRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    const { projectId, category, metricType, tree } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // If tree=true, return KPI tree structure
      if (tree === 'true') {
        const kpiTree = await perfRepository.buildKpiTree(projectId);
        return res.status(200).json(kpiTree);
      }

      // Otherwise return flat list with health
      const kpis = await perfRepository.findKpis(projectId, {
        category,
        metricType,
      });

      return res.status(200).json({ kpis });
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      return res.status(500).json({ error: 'Failed to fetch KPIs' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
