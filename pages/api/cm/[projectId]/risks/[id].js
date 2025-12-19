// pages/api/cm/[projectId]/risks/[id].js
// Change Management - Individual Risk CRUD endpoint

import { cmRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId, id } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId || !id) {
    return res.status(400).json({ error: 'Project ID and Risk ID required' });
  }

  if (req.method === 'GET') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const risk = await cmRepository.findRiskById(projectId, id);

      if (!risk) {
        return res.status(404).json({ error: 'Risk not found' });
      }

      return res.status(200).json(risk);
    } catch (err) {
      console.error('Error fetching risk:', err);
      return res.status(500).json({ error: 'Failed to fetch risk' });
    }
  }

  if (req.method === 'PUT') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      title,
      description,
      category,
      probability,
      impact,
      mitigationStrategy,
      owner,
      status,
      stakeholderGroupId,
    } = req.body;

    try {
      const risk = await cmRepository.updateRisk(projectId, id, {
        title,
        description,
        category,
        probability,
        impact,
        mitigationStrategy,
        owner,
        status,
        stakeholderGroupId,
      });

      if (!risk) {
        return res.status(404).json({ error: 'Risk not found' });
      }

      return res.status(200).json(risk);
    } catch (err) {
      console.error('Error updating risk:', err);
      return res.status(500).json({ error: 'Failed to update risk' });
    }
  }

  if (req.method === 'DELETE') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const deleted = await cmRepository.deleteRisk(projectId, id);

      if (!deleted) {
        return res.status(404).json({ error: 'Risk not found' });
      }

      return res.status(200).json({ success: true, message: 'Risk deleted' });
    } catch (err) {
      console.error('Error deleting risk:', err);
      return res.status(500).json({ error: 'Failed to delete risk' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
