// pages/api/np/journal/index.js
// API for managing N&P journal entries

import { npRepository } from '../../../../lib/repositories';

export default async function handler(req, res) {
  const { situation_id, entry_type, user_id } = req.query;

  if (req.method === 'GET') {
    try {
      if (!situation_id) {
        return res.status(400).json({ error: 'situation_id is required' });
      }

      const entries = await npRepository.findJournalEntries(situation_id, {
        entryType: entry_type,
        userId: user_id,
      });

      return res.status(200).json(entries);
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      return res.status(500).json({ error: 'Failed to fetch journal entries' });
    }
  }

  if (req.method === 'POST') {
    const {
      situation_id: sitId,
      user_id: userId,
      entry_type: entryType,
      title,
      content,
      mood,
      tags,
      is_private
    } = req.body;

    if (!sitId || !entryType || !content) {
      return res.status(400).json({
        error: 'situation_id, entry_type, and content are required'
      });
    }

    try {
      const entry = await npRepository.createJournalEntry({
        situationId: sitId,
        userId,
        entryType,
        title,
        content,
        mood,
        tags,
        isPrivate: is_private,
      });

      return res.status(201).json(entry);
    } catch (err) {
      console.error('Error creating journal entry:', err);
      return res.status(500).json({ error: 'Failed to create journal entry' });
    }
  }

  if (req.method === 'PUT') {
    const { id, title, content, mood, tags, is_private, entry_type } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id is required in body' });
    }

    try {
      const entry = await npRepository.updateJournalEntry(id, {
        entryType: entry_type,
        title,
        content,
        mood,
        tags,
        isPrivate: is_private,
      });

      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      return res.status(200).json(entry);
    } catch (err) {
      console.error('Error updating journal entry:', err);
      return res.status(500).json({ error: 'Failed to update journal entry' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'id query parameter is required' });
    }

    try {
      const deleted = await npRepository.deleteJournalEntry(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }

      return res.status(200).json({ success: true, deleted });
    } catch (err) {
      console.error('Error deleting journal entry:', err);
      return res.status(500).json({ error: 'Failed to delete journal entry' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
