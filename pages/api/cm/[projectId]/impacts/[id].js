// pages/api/cm/[projectId]/impacts/[id].js
// Change Management - Individual Impact Assessment CRUD endpoint

import { cmRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId, id } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId || !id) {
    return res.status(400).json({ error: 'Project ID and Impact Assessment ID required' });
  }

  if (req.method === 'GET') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const impact = await cmRepository.findImpactById(projectId, id);

      if (!impact) {
        return res.status(404).json({ error: 'Impact assessment not found' });
      }

      return res.status(200).json(impact);
    } catch (err) {
      console.error('Error fetching impact assessment:', err);
      return res.status(500).json({ error: 'Failed to fetch impact assessment' });
    }
  }

  if (req.method === 'PUT') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { name, impacts, overallLevel, notes } = req.body;

    try {
      const impact = await cmRepository.updateImpact(projectId, id, {
        name,
        impacts,
        overallLevel,
        notes,
      });

      if (!impact) {
        return res.status(404).json({ error: 'Impact assessment not found' });
      }

      return res.status(200).json(impact);
    } catch (err) {
      console.error('Error updating impact assessment:', err);
      return res.status(500).json({ error: 'Failed to update impact assessment' });
    }
  }

  if (req.method === 'DELETE') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const deleted = await cmRepository.deleteImpact(projectId, id);

      if (!deleted) {
        return res.status(404).json({ error: 'Impact assessment not found' });
      }

      return res.status(200).json({ success: true, message: 'Impact assessment deleted' });
    } catch (err) {
      console.error('Error deleting impact assessment:', err);
      return res.status(500).json({ error: 'Failed to delete impact assessment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
