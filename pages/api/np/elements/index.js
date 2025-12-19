// pages/api/np/elements/index.js
// API for managing N&P elements

import { npRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { situation_id, element_type, category, party, confidence } = req.query;

  if (req.method === 'GET') {
    try {
      if (!situation_id) {
        return res.status(400).json({ error: 'situation_id is required' });
      }

      const elements = await npRepository.findElements(situation_id, {
        elementType: element_type,
        category,
        party,
        confidence,
      });

      return res.status(200).json(elements);
    } catch (err) {
      console.error('Error fetching elements:', err);
      return res.status(500).json({ error: 'Failed to fetch elements' });
    }
  }

  if (req.method === 'POST') {
    const {
      situation_id: sitId,
      element_type: elemType,
      category: cat,
      party: pty,
      content,
      confidence: conf,
      evidence,
      source,
      importance,
      properties,
      created_by
    } = req.body;

    if (!sitId || !elemType || !cat || !content) {
      return res.status(400).json({
        error: 'situation_id, element_type, category, and content are required'
      });
    }

    try {
      const element = await npRepository.createElement({
        situationId: sitId,
        elementType: elemType,
        category: cat,
        party: pty,
        content,
        confidence: conf,
        evidence,
        source,
        importance,
        properties,
        createdBy: created_by,
      });

      return res.status(201).json(element);
    } catch (err) {
      console.error('Error creating element:', err);
      return res.status(500).json({ error: 'Failed to create element' });
    }
  }

  if (req.method === 'PATCH') {
    const { action, situation_id: sitId, elements } = req.body;

    if (action === 'bulk_create' && Array.isArray(elements)) {
      try {
        const results = await npRepository.bulkCreateElements(sitId, elements, null);
        return res.status(201).json({ created: results.length, elements: results });
      } catch (err) {
        console.error('Error bulk creating elements:', err);
        return res.status(500).json({ error: 'Failed to bulk create elements' });
      }
    }

    return res.status(400).json({ error: 'Invalid action or missing elements array' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
