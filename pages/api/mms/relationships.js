// pages/api/mms/relationships.js
// Mental Model Studio - Relationships API

import { mmsRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { situation_id, element_id } = req.query;

      if (!situation_id) {
        return res.status(400).json({ error: 'situation_id is required' });
      }

      const ownership = await mmsRepository.checkOwnership(situation_id);
      if (!ownership.found) {
        return res.status(404).json({ error: 'Situation not found' });
      }
      if (userRole !== 'admin' && ownership.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const relationships = await mmsRepository.findRelationships(situation_id, { elementId: element_id });

      return res.status(200).json(relationships);
    } catch (err) {
      console.error('Error fetching MMS relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        situationId,
        fromElementId,
        toElementId,
        relationshipType,
        notes
      } = req.body;

      if (!situationId) {
        return res.status(400).json({ error: 'situationId is required' });
      }
      if (!fromElementId) {
        return res.status(400).json({ error: 'fromElementId is required' });
      }
      if (!toElementId) {
        return res.status(400).json({ error: 'toElementId is required' });
      }
      if (!relationshipType) {
        return res.status(400).json({ error: 'relationshipType is required' });
      }

      const ownership = await mmsRepository.checkOwnership(situationId);
      if (!ownership.found) {
        return res.status(404).json({ error: 'Situation not found' });
      }
      if (userRole !== 'admin' && ownership.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const relationship = await mmsRepository.createRelationship({
        situationId,
        fromElementId,
        toElementId,
        relationshipType,
        notes,
      });

      return res.status(201).json(relationship);
    } catch (err) {
      if (err.message === 'ELEMENTS_NOT_IN_SITUATION') {
        return res.status(400).json({ error: 'Elements must belong to the same situation' });
      }
      console.error('Error creating MMS relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Relationship ID is required' });
      }

      const access = await mmsRepository.checkRelationshipAccess(id);
      if (!access.found) {
        return res.status(404).json({ error: 'Relationship not found' });
      }
      if (userRole !== 'admin' && access.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await mmsRepository.deleteRelationship(id);

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting MMS relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
