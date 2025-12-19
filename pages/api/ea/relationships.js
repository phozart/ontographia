// pages/api/ea/relationships.js
// CRUD API for EA relationships

import { eaRepository, EA_RELATIONSHIP_TYPES } from '../../../lib/repositories';

// Re-export types for backwards compatibility
export { EA_RELATIONSHIP_TYPES };

export default async function handler(req, res) {
  const { domain } = req.query;

  if (req.method === 'GET') {
    try {
      const relationships = await eaRepository.findAllRelationships({ domain });
      return res.status(200).json(relationships);
    } catch (err) {
      console.error('Error fetching EA relationships:', err);
      return res.status(500).json({ error: 'Failed to fetch EA relationships' });
    }
  }

  if (req.method === 'POST') {
    const { sourceId, targetId, relationshipType, label, properties, domainName, userId } = req.body;

    if (!sourceId || !targetId || !relationshipType) {
      return res.status(400).json({ error: 'sourceId, targetId, and relationshipType are required' });
    }

    try {
      const relationship = await eaRepository.createRelationship({
        sourceId,
        targetId,
        relationshipType,
        label,
        properties,
        domainName,
        userId,
      });
      return res.status(201).json(relationship);
    } catch (err) {
      console.error('Error creating EA relationship:', err);
      return res.status(500).json({ error: 'Failed to create EA relationship' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Relationship ID required' });
    }

    try {
      const deleted = await eaRepository.deleteRelationship(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Relationship not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA relationship:', err);
      return res.status(500).json({ error: 'Failed to delete EA relationship' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
