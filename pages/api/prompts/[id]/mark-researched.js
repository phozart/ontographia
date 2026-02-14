/**
 * API: Mark Research Prompt as Researched
 *
 * POST /api/prompts/[id]/mark-researched
 *
 * Marks a generated research prompt as completed, optionally with notes.
 *
 * Request body:
 *   - notes: Optional research findings/notes (string)
 *
 * Response:
 *   - prompt: Updated prompt object
 */

import { getUserFromRequest } from '../../../../lib/projectAccess';
import {
  getPrompt,
  markPromptResearched,
  markPromptCopied,
  updatePromptNotes
} from '../../../../lib/prompts/prompt-service';

export default async function handler(req, res) {
  const { id } = req.query;
  const { user } = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Prompt ID required' });
  }

  // GET - Get single prompt
  if (req.method === 'GET') {
    try {
      const prompt = await getPrompt(id);

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      // Verify ownership
      if (prompt.user_id !== user) {
        return res.status(403).json({ error: 'Access denied' });
      }

      return res.status(200).json(prompt);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      return res.status(500).json({ error: 'Failed to fetch prompt' });
    }
  }

  // POST - Mark as researched
  if (req.method === 'POST') {
    try {
      // Verify prompt exists and user owns it
      const existingPrompt = await getPrompt(id);

      if (!existingPrompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      if (existingPrompt.user_id !== user) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { notes } = req.body || {};
      const prompt = await markPromptResearched(id, notes);

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      return res.status(200).json({
        success: true,
        prompt,
        message: 'Prompt marked as researched'
      });
    } catch (error) {
      console.error('Error marking prompt researched:', error);
      return res.status(500).json({ error: 'Failed to update prompt' });
    }
  }

  // PATCH - Update notes or mark as copied
  if (req.method === 'PATCH') {
    try {
      // Verify prompt exists and user owns it
      const existingPrompt = await getPrompt(id);

      if (!existingPrompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      if (existingPrompt.user_id !== user) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { action, notes } = req.body || {};

      let prompt;

      if (action === 'copied') {
        prompt = await markPromptCopied(id);
      } else if (action === 'notes' && notes !== undefined) {
        prompt = await updatePromptNotes(id, notes);
      } else {
        return res.status(400).json({ error: 'Invalid action. Use "copied" or "notes"' });
      }

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found or already updated' });
      }

      return res.status(200).json({
        success: true,
        prompt
      });
    } catch (error) {
      console.error('Error updating prompt:', error);
      return res.status(500).json({ error: 'Failed to update prompt' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
