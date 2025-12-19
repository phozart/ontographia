/**
 * Governance Relationships API
 * GET: Get relationships for project or artefact
 * POST: Create a relationship
 * DELETE: Delete a relationship
 */

import { govRepository } from '../../../lib/repositories/GovRepository';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';

export default async function handler(req, res) {
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - Get relationships ==========
  if (req.method === 'GET') {
    const { projectId, artefactId } = req.query;

    if (!projectId && !artefactId) {
      return res.status(400).json({ error: 'projectId or artefactId is required' });
    }

    try {
      if (artefactId) {
        const relationships = await govRepository.getRelationships(artefactId);
        return res.status(200).json({ relationships });
      }

      const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const relationships = await govRepository.getProjectRelationships(projectId);
      return res.status(200).json({ relationships });
    } catch (err) {
      console.error('Error fetching relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships' });
    }
  }

  // ========== POST - Create relationship ==========
  if (req.method === 'POST') {
    const { fromId, toId, relationshipType, properties } = req.body;

    if (!fromId || !toId || !relationshipType) {
      return res.status(400).json({ error: 'fromId, toId, and relationshipType are required' });
    }

    try {
      // Verify both artefacts exist
      const fromArtefact = await govRepository.findById(fromId);
      const toArtefact = await govRepository.findById(toId);

      if (!fromArtefact || !toArtefact) {
        return res.status(404).json({ error: 'One or both artefacts not found' });
      }

      const { hasAccess, error } = await checkProjectAccess(req, fromArtefact.project_id, 'edit');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const relationship = await govRepository.createRelationship({
        fromId,
        toId,
        relationshipType,
        properties,
      });

      return res.status(201).json(relationship);
    } catch (err) {
      console.error('Error creating relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
