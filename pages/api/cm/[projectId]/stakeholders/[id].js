// pages/api/cm/[projectId]/stakeholders/[id].js
// Change Management - Individual Stakeholder Group CRUD endpoint

import { cmRepository } from '../../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId, id } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId || !id) {
    return res.status(400).json({ error: 'Project ID and Stakeholder ID required' });
  }

  if (req.method === 'GET') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const stakeholder = await cmRepository.findStakeholderById(projectId, id);

      if (!stakeholder) {
        return res.status(404).json({ error: 'Stakeholder group not found' });
      }

      return res.status(200).json(stakeholder);
    } catch (err) {
      console.error('Error fetching stakeholder group:', err);
      return res.status(500).json({ error: 'Failed to fetch stakeholder group' });
    }
  }

  if (req.method === 'PUT') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      description,
      size,
      impactLevel,
      influenceLevel,
      currentState,
      desiredState,
      representative,
      readinessLevel,
    } = req.body;

    try {
      const stakeholder = await cmRepository.updateStakeholder(projectId, id, {
        name,
        description,
        size,
        impactLevel,
        influenceLevel,
        currentState,
        desiredState,
        representative,
        readinessLevel,
      });

      if (!stakeholder) {
        return res.status(404).json({ error: 'Stakeholder group not found' });
      }

      return res.status(200).json(stakeholder);
    } catch (err) {
      console.error('Error updating stakeholder group:', err);
      return res.status(500).json({ error: 'Failed to update stakeholder group' });
    }
  }

  if (req.method === 'DELETE') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const deleted = await cmRepository.deleteStakeholder(projectId, id);

      if (!deleted) {
        return res.status(404).json({ error: 'Stakeholder group not found' });
      }

      return res.status(200).json({ success: true, message: 'Stakeholder group deleted' });
    } catch (err) {
      console.error('Error deleting stakeholder group:', err);
      return res.status(500).json({ error: 'Failed to delete stakeholder group' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
