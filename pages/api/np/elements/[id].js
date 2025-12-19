// pages/api/np/elements/[id].js
// API for single N&P element operations

import { npRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Element ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const element = await npRepository.findElementById(id);

      if (!element) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(element);
    } catch (err) {
      console.error('Error fetching element:', err);
      return res.status(500).json({ error: 'Failed to fetch element' });
    }
  }

  if (req.method === 'PUT') {
    const {
      element_type,
      category,
      party,
      content,
      confidence,
      evidence,
      source,
      importance,
      is_validated,
      properties
    } = req.body;

    try {
      const element = await npRepository.updateElement(id, {
        elementType: element_type,
        category,
        party,
        content,
        confidence,
        evidence,
        source,
        importance,
        isValidated: is_validated,
        properties,
      });

      if (!element) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json(element);
    } catch (err) {
      console.error('Error updating element:', err);
      return res.status(500).json({ error: 'Failed to update element' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await npRepository.deleteElement(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Element not found' });
      }

      return res.status(200).json({ success: true, deleted });
    } catch (err) {
      console.error('Error deleting element:', err);
      return res.status(500).json({ error: 'Failed to delete element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
