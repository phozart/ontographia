/**
 * Objectives API
 * GET: List objectives with hierarchy support
 */

import { perfRepository } from '../../../lib/repositories/PerfRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    const { projectId, objectiveType, status, timeframe, hierarchy } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      // If hierarchy=true, return full nested tree
      if (hierarchy === 'true') {
        const tree = await perfRepository.getObjectiveHierarchy(projectId);
        return res.status(200).json({ hierarchy: tree });
      }

      // Otherwise return flat list
      const objectives = await perfRepository.findObjectives(projectId, {
        objectiveType,
        status,
        timeframe,
      });

      return res.status(200).json({ objectives });
    } catch (err) {
      console.error('Error fetching objectives:', err);
      return res.status(500).json({ error: 'Failed to fetch objectives' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
