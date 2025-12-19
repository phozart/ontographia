// pages/api/philosophy/elements/[id].js
// API for single Philosophy element operations

import { philosophyRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const { id } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Element ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const element = await philosophyRepository.findElementById(id);

      if (!element) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(element);
    } catch (err) {
      console.error('Error fetching philosophy element:', err);
      return res.status(500).json({ error: 'Failed to fetch element' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        elementType,
        subtype,
        content,
        x,
        y,
        properties
      } = req.body;

      const element = await philosophyRepository.updateElement(id, {
        elementType,
        subtype,
        content,
        x,
        y,
        properties,
      });

      if (!element) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(element);
    } catch (err) {
      console.error('Error updating philosophy element:', err);
      return res.status(500).json({ error: 'Failed to update element' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await philosophyRepository.deleteElement(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting philosophy element:', err);
      return res.status(500).json({ error: 'Failed to delete element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
