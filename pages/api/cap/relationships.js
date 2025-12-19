/**
 * Capability Studio - Relationships API
 *
 * @route GET /api/cap/relationships - List relationships
 * @route POST /api/cap/relationships - Create relationship
 * @route DELETE /api/cap/relationships - Delete relationship
 *
 * @requires x-user header - User ID for authentication
 * @requires x-role header - User role for authorization
 *
 * @module pages/api/cap/relationships
 */

import { capRepository } from '../../../lib/repositories';
import { getUserFromRequest, checkProjectAccess } from '../../../lib/projectAccess';
import { CAP_RELATIONSHIP_TYPES, validateRelationship } from '../../../lib/cap-types';

export default async function handler(req, res) {
  const { user, role } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // ========== GET - List relationships ==========
  if (req.method === 'GET') {
    const { projectId, artefactId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }

    const { hasAccess, error } = await checkProjectAccess(req, projectId, 'view');
    if (!hasAccess) {
      return res.status(403).json({ error });
    }

    try {
      let relationships = await capRepository.findRelationships(projectId);

      // Filter by artefact if specified
      if (artefactId) {
        relationships = relationships.filter(
          r => r.from_artefact_id === artefactId || r.to_artefact_id === artefactId
        );
      }

      return res.status(200).json({ relationships });
    } catch (err) {
      console.error('Error fetching capability relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships', details: err.message });
    }
  }

  // ========== POST - Create relationship ==========
  if (req.method === 'POST') {
    const { fromArtefactId, toArtefactId, relationshipType, description } = req.body;

    if (!fromArtefactId || !toArtefactId || !relationshipType) {
      return res.status(400).json({ error: 'Missing required fields: fromArtefactId, toArtefactId, relationshipType' });
    }

    // Validate relationship type
    if (!CAP_RELATIONSHIP_TYPES[relationshipType]) {
      return res.status(400).json({ error: `Invalid relationship type: ${relationshipType}` });
    }

    try {
      // Fetch both artefacts to validate
      const fromArtefact = await capRepository.findById(fromArtefactId);
      const toArtefact = await capRepository.findById(toArtefactId);

      if (!fromArtefact) {
        return res.status(404).json({ error: 'Source artefact not found' });
      }
      if (!toArtefact) {
        return res.status(404).json({ error: 'Target artefact not found' });
      }

      // Validate relationship is allowed between these types
      if (!validateRelationship(fromArtefact.artefact_type, toArtefact.artefact_type, relationshipType)) {
        return res.status(400).json({
          error: `Relationship '${relationshipType}' is not allowed between ${fromArtefact.artefact_type} and ${toArtefact.artefact_type}`
        });
      }

      // Check project access
      const { hasAccess, error } = await checkProjectAccess(req, fromArtefact.project_id, 'create');
      if (!hasAccess) {
        return res.status(403).json({ error });
      }

      const relationship = await capRepository.createRelationship({
        projectId: fromArtefact.project_id,
        fromArtefactId,
        toArtefactId,
        relationshipType,
        metadata: description ? { description } : {},
        createdBy: user,
      });

      return res.status(201).json(relationship);
    } catch (err) {
      console.error('Error creating capability relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship', details: err.message });
    }
  }

  // ========== DELETE - Remove relationship ==========
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Relationship ID required' });
    }

    try {
      const deleted = await capRepository.deleteRelationship(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting capability relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
