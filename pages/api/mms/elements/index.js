// pages/api/mms/elements/index.js
// Mental Model Studio - Elements list and create API

import { mmsRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const userId = req.headers['x-user'];
  const userRole = req.headers['x-role'];

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { situation_id, element_type } = req.query;

      if (!situation_id) {
        return res.status(400).json({ error: 'situation_id is required' });
      }

      // Check access to situation
      const ownership = await mmsRepository.checkOwnership(situation_id);
      if (!ownership.found) {
        return res.status(404).json({ error: 'Situation not found' });
      }
      if (userRole !== 'admin' && ownership.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const elements = await mmsRepository.findElements(situation_id, { elementType: element_type });

      return res.status(200).json(elements);
    } catch (err) {
      console.error('Error fetching MMS elements:', err);
      return res.status(500).json({ error: 'Failed to fetch elements' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        situationId,
        elementType,
        content,
        properties,
        confidence,
        source,
        positionX,
        positionY
      } = req.body;

      if (!situationId) {
        return res.status(400).json({ error: 'situationId is required' });
      }
      if (!elementType) {
        return res.status(400).json({ error: 'elementType is required' });
      }
      if (!content) {
        return res.status(400).json({ error: 'content is required' });
      }

      // Check access to situation
      const ownership = await mmsRepository.checkOwnership(situationId);
      if (!ownership.found) {
        return res.status(404).json({ error: 'Situation not found' });
      }
      if (userRole !== 'admin' && ownership.userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const element = await mmsRepository.createElement({
        situationId,
        elementType,
        content,
        properties,
        confidence,
        source,
        positionX,
        positionY,
        userId,
      });

      return res.status(201).json(element);
    } catch (err) {
      console.error('Error creating MMS element:', err);
      return res.status(500).json({ error: 'Failed to create element' });
    }
  }

  // Support bulk create via PATCH
  if (req.method === 'PATCH') {
    try {
      const { action, situationId, elements } = req.body;

      if (action === 'bulk_create' && Array.isArray(elements)) {
        // Check access to situation
        const ownership = await mmsRepository.checkOwnership(situationId);
        if (!ownership.found) {
          return res.status(404).json({ error: 'Situation not found' });
        }
        if (userRole !== 'admin' && ownership.userId !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }

        const createdElements = await mmsRepository.bulkCreateElements(situationId, elements, userId);

        return res.status(201).json(createdElements);
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (err) {
      console.error('Error in MMS elements PATCH:', err);
      return res.status(500).json({ error: 'Failed to process request' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
