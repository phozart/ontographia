// pages/api/philosophy/elements.js
// API for managing Philosophy elements

import { philosophyRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { inquiry_id, element_type } = req.query;

      if (!inquiry_id) {
        return res.status(400).json({ error: 'inquiry_id is required' });
      }

      const elements = await philosophyRepository.findElements(inquiry_id, {
        elementType: element_type,
      });

      return res.status(200).json(elements);
    } catch (err) {
      console.error('Error fetching philosophy elements:', err);
      return res.status(500).json({ error: 'Failed to fetch elements' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        inquiryId,
        elementType,
        subtype,
        content,
        x,
        y,
        properties
      } = req.body;

      if (!inquiryId || !elementType || !content) {
        return res.status(400).json({ error: 'inquiryId, elementType, and content are required' });
      }

      const element = await philosophyRepository.createElement({
        inquiryId,
        elementType,
        subtype,
        content,
        x,
        y,
        properties,
      });

      return res.status(201).json(element);
    } catch (err) {
      console.error('Error creating philosophy element:', err);
      return res.status(500).json({ error: 'Failed to create element' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
