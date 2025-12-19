// pages/api/projects/[id]/artefacts.js
// List and create artefacts for a project

import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';
import { artefactRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id: projectId } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method === 'GET') {
    // List artefacts for project
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const { type, status, search } = req.query;
      const artefacts = await artefactRepository.findByProject(projectId, { type, status, search });
      return res.status(200).json(artefacts);
    } catch (err) {
      console.error('Error listing artefacts:', err);
      return res.status(500).json({ error: 'Failed to list artefacts' });
    }
  }

  if (req.method === 'POST') {
    // Create artefact
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const artefact = await artefactRepository.createArtefact(
        { ...req.body, projectId },
        user
      );
      return res.status(201).json(artefact);
    } catch (err) {
      if (err.message.includes('required')) {
        return res.status(400).json({ error: err.message });
      }
      console.error('Error creating artefact:', err);
      return res.status(500).json({ error: 'Failed to create artefact' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
