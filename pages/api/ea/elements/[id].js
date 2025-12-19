// pages/api/ea/elements/[id].js
// Single EA element CRUD

import { eaRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Element ID required' });
  }

  if (req.method === 'GET') {
    try {
      const element = await eaRepository.findElementById(id);

      if (!element) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(element);
    } catch (err) {
      console.error('Error fetching EA element:', err);
      return res.status(500).json({ error: 'Failed to fetch EA element' });
    }
  }

  if (req.method === 'PUT') {
    const { name, description, properties, parentId, positionX, positionY } = req.body;

    try {
      const element = await eaRepository.updateElement(id, {
        name,
        description,
        properties,
        parentId,
        positionX,
        positionY,
      });

      if (!element) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(element);
    } catch (err) {
      console.error('Error updating EA element:', err);
      return res.status(500).json({ error: 'Failed to update EA element' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await eaRepository.deleteElement(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json({ success: true, id });
    } catch (err) {
      console.error('Error deleting EA element:', err);
      return res.status(500).json({ error: 'Failed to delete EA element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
