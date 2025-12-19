/**
 * Business Service Management - Statistics API
 *
 * @route GET /api/bsm/stats - Get BSM statistics
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/bsm/stats
 */

import { bsmRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  try {
    const stats = await bsmRepository.getStats(projectId);
    return res.status(200).json(stats);
  } catch (err) {
    console.error('Error fetching BSM stats:', err);
    return res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
}
