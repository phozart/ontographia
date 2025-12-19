/**
 * Business Service Management - Dependency Map API
 *
 * @route GET /api/bsm/dependency-map - Get service dependency graph
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/bsm/dependency-map
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
    const dependencyMap = await bsmRepository.buildDependencyMap(projectId);
    return res.status(200).json(dependencyMap);
  } catch (err) {
    console.error('Error fetching dependency map:', err);
    return res.status(500).json({ error: 'Failed to fetch dependency map', details: err.message });
  }
}
