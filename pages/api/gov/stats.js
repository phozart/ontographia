/**
 * Governance Statistics API
 * GET: Get governance statistics for a project
 */

import { govRepository } from '../../../lib/repositories/GovRepository';
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
      const stats = await govRepository.getStats(projectId);
      return res.status(200).json(stats);
    } catch (err) {
      console.error('Error fetching governance stats:', err);
      return res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
