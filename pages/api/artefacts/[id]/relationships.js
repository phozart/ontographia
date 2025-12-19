// pages/api/artefacts/[id]/relationships.js
// Manage relationships for an artefact

import { getUserFromRequest, checkArtefactAccess } from '../../../../lib/projectAccess';
import { artefactRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id: artefactId } = req.query;
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!artefactId) {
    return res.status(400).json({ error: 'Artefact ID required' });
  }

  if (req.method === 'GET') {
    // Get all relationships for artefact
    const { hasAccess, error } = await checkArtefactAccess(req, artefactId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      const relationships = await artefactRepository.getRelationships(artefactId);
      return res.status(200).json(relationships);
    } catch (err) {
      console.error('Error fetching relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships' });
    }
  }

  if (req.method === 'POST') {
    // Create relationship
    const { hasAccess, error } = await checkArtefactAccess(req, artefactId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { toArtefactId, relationshipType, metadata } = req.body;

    if (!toArtefactId) {
      return res.status(400).json({ error: 'Target artefact ID required' });
    }

    if (!relationshipType) {
      return res.status(400).json({ error: 'Relationship type required' });
    }

    try {
      const relationship = await artefactRepository.createRelationship(
        artefactId,
        toArtefactId,
        relationshipType,
        metadata,
        user
      );
      return res.status(201).json(relationship);
    } catch (err) {
      // Handle known error types
      if (err.message.includes('relationship to self') ||
          err.message.includes('same project') ||
          err.message.includes('already exists')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message });
      }
      console.error('Error creating relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete relationship
    const { hasAccess, error } = await checkArtefactAccess(req, artefactId, 'edit');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    const { relationshipId } = req.body;

    if (!relationshipId) {
      return res.status(400).json({ error: 'Relationship ID required' });
    }

    try {
      const deleted = await artefactRepository.deleteRelationship(relationshipId, artefactId);
      if (!deleted) {
        return res.status(404).json({ error: 'Relationship not found' });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error deleting relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
