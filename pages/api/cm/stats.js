// pages/api/cm/stats.js
// Change Management - Statistics and dashboard data API

import { cmRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId, contextId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    const stats = await cmRepository.getStats(projectId, contextId);
    return res.status(200).json(stats);
  } catch (err) {
    console.error('Error fetching CM stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}
