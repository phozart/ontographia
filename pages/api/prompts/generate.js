/**
 * API: Generate Research Prompts
 *
 * POST /api/prompts/generate
 *
 * Generates research prompts for an artefact based on context and trigger.
 *
 * Request body:
 *   - artefactId: UUID of the artefact
 *   - trigger: Trigger type (create, update, link, review, etc.)
 *   - save: Whether to save generated prompts (default: false)
 *
 * Alternative mode (custom context):
 *   - promptId: Specific prompt template ID
 *   - context: Custom context object for interpolation
 *
 * Response:
 *   - prompts: Array of rendered prompts with suggested sources
 */

import { getUserFromRequest } from '../../../lib/projectAccess';
import {
  generatePromptsForArtefact,
  generateAndSavePrompt,
  generatePromptWithContext,
  getAvailablePrompts,
  AI_SOURCES
} from '../../../lib/prompts/prompt-service';

export default async function handler(req, res) {
  // GET - List available prompt templates
  if (req.method === 'GET') {
    try {
      const { space } = req.query;
      const prompts = getAvailablePrompts(space || null);

      return res.status(200).json({
        prompts,
        sources: Object.values(AI_SOURCES),
        count: prompts.length
      });
    } catch (error) {
      console.error('Error listing prompts:', error);
      return res.status(500).json({ error: 'Failed to list prompts' });
    }
  }

  // POST - Generate prompts
  if (req.method === 'POST') {
    const { user } = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const { artefactId, trigger, save, promptId, context } = req.body;

      // Mode 1: Generate prompts for an artefact
      if (artefactId) {
        // Generate all applicable prompts
        const prompts = await generatePromptsForArtefact(
          artefactId,
          trigger || null,
          user
        );

        // If save requested and we have a specific prompt, save it
        if (save && promptId) {
          const savedPrompt = await generateAndSavePrompt(
            promptId,
            artefactId,
            user,
            context || {}
          );

          return res.status(200).json({
            saved: true,
            prompt: savedPrompt,
            allPrompts: prompts
          });
        }

        return res.status(200).json({
          prompts,
          count: prompts.length,
          artefactId,
          trigger
        });
      }

      // Mode 2: Generate a single prompt with custom context
      if (promptId && context) {
        const prompt = generatePromptWithContext(promptId, context);

        return res.status(200).json({
          prompts: [prompt],
          count: 1
        });
      }

      return res.status(400).json({
        error: 'Either artefactId or (promptId + context) required'
      });

    } catch (error) {
      console.error('Error generating prompts:', error);

      if (error.message === 'Artefact not found') {
        return res.status(404).json({ error: 'Artefact not found' });
      }

      if (error.message?.includes('Prompt template not found')) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Failed to generate prompts' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
