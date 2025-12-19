/**
 * Decision Rights Matrix API
 * GET: Get decision rights matrix for visualization
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
      const matrix = await govRepository.getDecisionRightsMatrix(projectId);
      return res.status(200).json(matrix);
    } catch (err) {
      console.error('Error fetching decision rights matrix:', err);
      return res.status(500).json({ error: 'Failed to fetch matrix' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
