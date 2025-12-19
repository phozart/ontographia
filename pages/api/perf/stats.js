/**
 * Performance Statistics API
 * GET: Get comprehensive performance statistics
 */

import { perfRepository } from '../../../lib/repositories/PerfRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const stats = await perfRepository.getStats(projectId);
      return res.status(200).json(stats);
    } catch (err) {
      console.error('Error fetching performance stats:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
