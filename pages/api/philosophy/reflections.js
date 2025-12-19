// pages/api/philosophy/reflections.js
// API for managing Philosophy reflections

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

      const reflections = await philosophyRepository.findReflections(inquiry_id);

      return res.status(200).json(reflections);
    } catch (err) {
      console.error('Error fetching philosophy reflections:', err);
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        inquiryId,
        reflectionType,
        content,
        relatedElementIds,
        properties
      } = req.body;

      if (!inquiryId || !content) {
        return res.status(400).json({ error: 'inquiryId and content are required' });
      }

      const reflection = await philosophyRepository.createReflection({
        inquiryId,
        reflectionType,
        content,
        relatedElementIds,
        properties,
      });

      return res.status(201).json(reflection);
    } catch (err) {
      console.error('Error creating philosophy reflection:', err);
      return res.status(500).json({ error: 'Failed to create reflection' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
