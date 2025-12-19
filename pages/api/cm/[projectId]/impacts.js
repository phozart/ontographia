// pages/api/cm/[projectId]/impacts.js
// Change Management - Impact Assessments CRUD endpoint

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

    const { stakeholderGroupId } = req.query;

    try {
      const impacts = await cmRepository.findImpacts(projectId, { stakeholderGroupId });
      return res.status(200).json({ impacts });
    } catch (err) {
      console.error('Error listing impact assessments:', err);
      return res.status(500).json({ error: 'Failed to list impact assessments' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const {
      name,
      stakeholderGroupId,
      impacts,
      overallLevel,
      notes,
    } = req.body;

    if (!stakeholderGroupId) {
      return res.status(400).json({ error: 'Stakeholder group ID is required' });
    }

    try {
      const impact = await cmRepository.createImpact(projectId, {
        name,
        stakeholderGroupId,
        impacts,
        overallLevel,
        notes,
      }, user);

      return res.status(201).json(impact);
    } catch (err) {
      if (err.message === 'IMPACT_EXISTS') {
        return res.status(400).json({
          error: 'An impact assessment already exists for this stakeholder group',
        });
      }
      console.error('Error creating impact assessment:', err);
      return res.status(500).json({ error: 'Failed to create impact assessment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
