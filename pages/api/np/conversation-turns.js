// pages/api/np/conversation-turns.js
// API for managing N&P conversation turns (post-hoc analysis)

import { npRepository } from '../../../lib/repositories';

export default async function handler(req, res) {
  const { situation_id, speaker, effectiveness } = req.query;

  if (req.method === 'GET') {
    try {
      if (!situation_id) {
        return res.status(400).json({ error: 'situation_id is required' });
      }

      const result = await npRepository.findConversationTurns(situation_id, {
        speaker,
        effectiveness,
      });

      return res.status(200).json(result);
    } catch (err) {
      console.error('Error fetching conversation turns:', err);
      return res.status(500).json({ error: 'Failed to fetch conversation turns' });
    }
  }

  if (req.method === 'POST') {
    const {
      situation_id: sitId,
      speaker,
      content,
      tactic_used,
      emotional_tone,
      effectiveness,
      notes,
      timestamp_actual
    } = req.body;

    if (!sitId || !speaker || !content) {
      return res.status(400).json({
        error: 'situation_id, speaker, and content are required'
      });
    }

    try {
      const turn = await npRepository.createConversationTurn({
        situationId: sitId,
        speaker,
        content,
        tacticUsed: tactic_used,
        emotionalTone: emotional_tone,
        effectiveness,
        notes,
        timestampActual: timestamp_actual,
      });

      return res.status(201).json(turn);
    } catch (err) {
      console.error('Error creating conversation turn:', err);
      return res.status(500).json({ error: 'Failed to create conversation turn' });
    }
  }

  if (req.method === 'PUT') {
    const {
      id,
      speaker,
      content,
      tactic_used,
      emotional_tone,
      effectiveness,
      notes,
      timestamp_actual
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id is required in body' });
    }

    try {
      const turn = await npRepository.updateConversationTurn(id, {
        speaker,
        content,
        tacticUsed: tactic_used,
        emotionalTone: emotional_tone,
        effectiveness,
        notes,
        timestampActual: timestamp_actual,
      });

      if (!turn) {
        return res.status(404).json({ error: 'Conversation turn not found' });
      }

      return res.status(200).json(turn);
    } catch (err) {
      console.error('Error updating conversation turn:', err);
      return res.status(500).json({ error: 'Failed to update conversation turn' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'id query parameter is required' });
    }

    try {
      const deleted = await npRepository.deleteConversationTurn(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Conversation turn not found' });
      }

      return res.status(200).json({ success: true, deleted });
    } catch (err) {
      console.error('Error deleting conversation turn:', err);
      return res.status(500).json({ error: 'Failed to delete conversation turn' });
    }
  }

  if (req.method === 'PATCH') {
    const { action, situation_id: sitId, turn_order } = req.body;

    if (action === 'reorder' && sitId && Array.isArray(turn_order)) {
      try {
        const result = await npRepository.reorderConversationTurns(sitId, turn_order);
        return res.status(200).json({ success: true, ...result });
      } catch (err) {
        console.error('Error reordering turns:', err);
        return res.status(500).json({ error: 'Failed to reorder turns' });
      }
    }

    return res.status(400).json({ error: 'Invalid action or missing parameters' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
