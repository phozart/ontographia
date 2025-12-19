// pages/api/cm/[projectId]/stakeholders.js
// Change Management - Stakeholder Groups CRUD endpoint

import { cmRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const stakeholders = await cmRepository.findStakeholders(projectId);
      return res.status(200).json({ stakeholders });
    } catch (err) {
      console.error('Error listing stakeholder groups:', err);
      return res.status(500).json({ error: 'Failed to list stakeholder groups' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
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
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const stakeholder = await cmRepository.createStakeholder(projectId, {
        name,
        description,
        size,
        impactLevel,
        influenceLevel,
        currentState,
        desiredState,
        representative,
      }, user);

      return res.status(201).json(stakeholder);
    } catch (err) {
      console.error('Error creating stakeholder group:', err);
      return res.status(500).json({ error: 'Failed to create stakeholder group' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
