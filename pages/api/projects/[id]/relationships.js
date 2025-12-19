// pages/api/projects/[id]/relationships.js
// List and create artefact relationships for a project

import { artefactRepository } from '../../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../../lib/projectAccess';

export default async function handler(req, res) {
  const { id: projectId } = req.query;
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
      const relationships = await artefactRepository.findRelationshipsByProject(projectId);
      return res.status(200).json(relationships);
    } catch (err) {
      console.error('Error listing relationships:', err);
      return res.status(500).json({ error: 'Failed to list relationships' });
    }
  }

  if (req.method === 'POST') {
    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'create');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { type, from, to, metadata } = req.body;

    if (!type || !from || !to) {
      return res.status(400).json({ error: 'type, from, and to are required' });
    }

    try {
      const relationship = await artefactRepository.createProjectRelationship(
        projectId,
        { type, from, to, metadata },
        user
      );
      return res.status(201).json(relationship);
    } catch (err) {
      console.error('Error creating relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    const { relationshipId } = req.query;
    if (!relationshipId) {
      return res.status(400).json({ error: 'relationshipId required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'delete');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      await artefactRepository.deleteRelationshipById(relationshipId);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
