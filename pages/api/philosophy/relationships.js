// pages/api/philosophy/relationships.js
// API for managing Philosophy relationships

import { philosophyRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { inquiry_id } = req.query;

      if (!inquiry_id) {
        return res.status(400).json({ error: 'inquiry_id is required' });
      }

      const relationships = await philosophyRepository.findRelationships(inquiry_id);

      return res.status(200).json(relationships);
    } catch (err) {
      console.error('Error fetching philosophy relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch relationships' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        inquiryId,
        fromElementId,
        toElementId,
        relationshipType,
        label,
        properties
      } = req.body;

      if (!inquiryId || !fromElementId || !toElementId || !relationshipType) {
        return res.status(400).json({ error: 'inquiryId, fromElementId, toElementId, and relationshipType are required' });
      }

      const relationship = await philosophyRepository.createRelationship({
        inquiryId,
        fromElementId,
        toElementId,
        relationshipType,
        label,
        properties,
      });

      return res.status(201).json(relationship);
    } catch (err) {
      console.error('Error creating philosophy relationship:', err);
      return res.status(500).json({ error: 'Failed to create relationship' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'id is required' });
      }

      const deleted = await philosophyRepository.deleteRelationship(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting philosophy relationship:', err);
      return res.status(500).json({ error: 'Failed to delete relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
