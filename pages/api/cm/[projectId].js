// pages/api/cm/[projectId].js
// Change Management - Main project data endpoint (GET all CM data for project)

import { cmRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { projectId } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
  if (!hasAccess) {
    return res.status(403).json({ error });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await cmRepository.getProjectData(projectId);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching CM data:', err);
    return res.status(500).json({ error: 'Failed to fetch change management data' });
  }
}
