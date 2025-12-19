// pages/api/cm/relationships.js
// Change Management - Relationships API

import { cmRepository, CM_RELATIONSHIP_TYPES } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    const { projectId, contextId, artefactId, type } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const result = await cmRepository.findRelationships(projectId, { contextId, artefactId, type });
      return res.status(200).json(result);
    } catch (err) {
      console.error('Error listing CM relationships:', err);
      return res.status(500).json({ error: 'Failed to list relationships' });
    }
  }

  if (req.method === 'POST') {
    const { fromArtefactId, toArtefactId, relationshipType, metadata } = req.body;

    if (!fromArtefactId || !toArtefactId) {
      return res.status(400).json({ error: 'Both fromArtefactId and toArtefactId are required' });
    }

    if (!relationshipType) {
      return res.status(400).json({ error: 'Relationship type is required' });
    }

    try {
      const result = await cmRepository.createRelationship({ fromArtefactId, toArtefactId, relationshipType, metadata }, user);

      const { hasAccess, error } = await checkProjectAccess(req, result.projectId, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      return res.status(201).json(result.relationship);
    } catch (err) {
      if (err.message === 'ARTEFACTS_NOT_FOUND') {
        return res.status(404).json({ error: 'One or both artefacts not found' });
      }
      if (err.message === 'NOT_CM_ARTEFACT') {
        return res.status(400).json({ error: 'At least one artefact must be a CM type' });
      }
      if (err.message === 'RELATIONSHIP_EXISTS') {
        return res.status(409).json({ error: 'Relationship already exists' });
      }
      console.error('Error creating CM relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    const { relationshipId } = req.query;

    if (!relationshipId) {
      return res.status(400).json({ error: 'Relationship ID required' });
    }

    try {
      const result = await cmRepository.deleteRelationship(relationshipId);

      if (!result) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, result.projectId, 'delete');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      return res.status(200).json({ success: true, message: 'Relationship deleted' });
    } catch (err) {
      console.error('Error deleting CM relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
