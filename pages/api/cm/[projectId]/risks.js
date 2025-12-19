// pages/api/cm/[projectId]/risks.js
// Change Management - Risks CRUD endpoint

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

    const { status, category } = req.query;

    try {
      const risks = await cmRepository.findRisks(projectId, { status, category });
      return res.status(200).json({ risks });
    } catch (err) {
      console.error('Error listing risks:', err);
      return res.status(500).json({ error: 'Failed to list risks' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
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
      stakeholderGroupId,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    try {
      const risk = await cmRepository.createRisk(projectId, {
        title,
        description,
        category,
        probability,
        impact,
        mitigationStrategy,
        owner,
        stakeholderGroupId,
      }, user);

      return res.status(201).json(risk);
    } catch (err) {
      console.error('Error creating risk:', err);
      return res.status(500).json({ error: 'Failed to create risk' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
