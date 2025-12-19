// pages/api/np/relationships.js
// API for managing N&P element relationships

import { npRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { situation_id, from_element_id, to_element_id, relationship_type } = req.query;

  if (req.method === 'GET') {
    try {
      if (!situation_id) {
        return res.status(400).json({ error: 'situation_id is required' });
      }

      const relationships = await npRepository.findRelationships(situation_id, {
        fromElementId: from_element_id,
        toElementId: to_element_id,
        relationshipType: relationship_type,
      });

      return res.status(200).json(relationships);
    } catch (err) {
      console.error('Error fetching relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships' });
    }
  }

  if (req.method === 'POST') {
    const {
      situation_id: sitId,
      from_element_id: fromId,
      to_element_id: toId,
      relationship_type: relType,
      strength,
      notes
    } = req.body;

    if (!sitId || !fromId || !toId || !relType) {
      return res.status(400).json({
        error: 'situation_id, from_element_id, to_element_id, and relationship_type are required'
      });
    }

    if (fromId === toId) {
      return res.status(400).json({ error: 'Cannot create relationship to self' });
    }

    try {
      const relationship = await npRepository.createRelationship({
        situationId: sitId,
        fromElementId: fromId,
        toElementId: toId,
        relationshipType: relType,
        strength,
        notes,
      });

      return res.status(201).json(relationship);
    } catch (err) {
      if (err.message === 'ELEMENTS_INVALID') {
        return res.status(400).json({
          error: 'Both elements must exist and belong to the specified situation'
        });
      }
      if (err.message === 'RELATIONSHIP_EXISTS') {
        return res.status(409).json({ error: 'This relationship already exists' });
      }
      console.error('Error creating relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'PUT') {
    const { id, relationship_type, strength, notes } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id is required in body' });
    }

    try {
      const relationship = await npRepository.updateRelationship(id, {
        relationshipType: relationship_type,
        strength,
        notes,
      });

      if (!relationship) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json(relationship);
    } catch (err) {
      console.error('Error updating relationship:', err);
      return res.status(500).json({ error: 'Failed to update relationship' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'id query parameter is required' });
    }

    try {
      const deleted = await npRepository.deleteRelationship(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ success: true, deleted });
    } catch (err) {
      console.error('Error deleting relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
