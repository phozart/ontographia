// pages/api/ea/elements.js
// CRUD API for EA elements

import { eaRepository, EA_ELEMENT_TYPES, ALL_EA_TYPES } from '../../../lib/repositories';

// Re-export types for backwards compatibility
export { EA_ELEMENT_TYPES, ALL_EA_TYPES };

export default async function handler(req, res) {
  const { domain } = req.query;

  if (req.method === 'GET') {
    try {
      const elements = await eaRepository.findAllElements({ domain });
      return res.status(200).json(elements);
    } catch (err) {
      console.error('Error fetching EA elements:', err);
      return res.status(500).json({ error: 'Failed to fetch EA elements' });
    }
  }

  if (req.method === 'POST') {
    const { elementType, layer, name, description, properties, parentId, domainName, userId } = req.body;

    if (!elementType || !layer || !name) {
      return res.status(400).json({ error: 'elementType, layer, and name are required' });
    }

    try {
      const element = await eaRepository.createElement({
        elementType,
        layer,
        name,
        description,
        properties,
        parentId,
        domainName,
        userId,
      });
      return res.status(201).json(element);
    } catch (err) {
      console.error('Error creating EA element:', err);
      return res.status(500).json({ error: 'Failed to create EA element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
