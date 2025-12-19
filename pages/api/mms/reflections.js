// pages/api/mms/reflections.js
// Mental Model Studio - Reflections API

import { mmsRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { situation_id } = req.query;

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

      const reflections = await mmsRepository.findReflections(situation_id);

      return res.status(200).json(reflections);
    } catch (err) {
      console.error('Error fetching MMS reflections:', err);
      return res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { situationId, content, insightType } = req.body;

      if (!situationId) {
        return res.status(400).json({ error: 'situationId is required' });
      }
      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }

      const ownership = await mmsRepository.checkOwnership(situationId);
      if (!ownership.found) {
        return res.status(404).json({ error: 'Situation not found' });
      }
      if (userRole !== 'admin' && ownership.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const reflection = await mmsRepository.createReflection({
        situationId,
        userId,
        content,
        insightType,
      });

      return res.status(201).json(reflection);
    } catch (err) {
      console.error('Error creating MMS reflection:', err);
      return res.status(500).json({ error: 'Failed to create reflection' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Reflection ID is required' });
      }

      const access = await mmsRepository.checkReflectionAccess(id);
      if (!access.found) {
        return res.status(404).json({ error: 'Reflection not found' });
      }
      if (userRole !== 'admin' && access.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await mmsRepository.deleteReflection(id);

      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting MMS reflection:', err);
      return res.status(500).json({ error: 'Failed to delete reflection' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
