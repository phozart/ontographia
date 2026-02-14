/**
 * AI Prompts API - Individual prompt operations
 * GET/PUT/DELETE /api/admin/ai-prompts/[id]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), 'data', 'ai-prompts');
const PROMPTS_FILE = path.join(PROMPTS_DIR, 'prompts.json');

// Ensure directory exists
function ensureDir() {
  if (!existsSync(PROMPTS_DIR)) {
    mkdirSync(PROMPTS_DIR, { recursive: true });
  }
}

// Load prompts from file
function loadPrompts() {
  ensureDir();

  if (existsSync(PROMPTS_FILE)) {
    try {
      const data = readFileSync(PROMPTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Failed to load prompts:', err);
    }
  }

  return { prompts: [], lastUpdated: new Date().toISOString() };
}

// Save prompts to file
function savePrompts(prompts) {
  ensureDir();
  writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2));
}

export default async function handler(req, res) {
  // Admin check would go here in production
  // const session = await getSession({ req });
  // if (!session || session.user.role !== 'admin') {
  //   return res.status(403).json({ error: 'Forbidden' });
  // }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Prompt ID is required' });
  }

  // GET - Retrieve single prompt
  if (req.method === 'GET') {
    try {
      const data = loadPrompts();
      const prompt = data.prompts.find((p) => p.id === id);

      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      return res.status(200).json({ prompt });
    } catch (err) {
      console.error('Error loading prompt:', err);
      return res.status(500).json({ error: 'Failed to load prompt' });
    }
  }

  // PUT - Update prompt (creates new version)
  if (req.method === 'PUT') {
    try {
      const { content, name, description } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const data = loadPrompts();
      const promptIndex = data.prompts.findIndex((p) => p.id === id);

      if (promptIndex === -1) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      const currentPrompt = data.prompts[promptIndex];

      // Archive current version before updating
      const archivedVersion = {
        id: `${currentPrompt.id}-v${currentPrompt.version}`,
        version: currentPrompt.version,
        content: currentPrompt.content,
        created_at: currentPrompt.updated_at,
      };

      // Update prompt with new content
      const updatedPrompt = {
        ...currentPrompt,
        content,
        name: name || currentPrompt.name,
        description: description !== undefined ? description : currentPrompt.description,
        version: currentPrompt.version + 1,
        updated_at: new Date().toISOString(),
        versions: [...(currentPrompt.versions || []), archivedVersion],
      };

      // Keep only last 10 versions
      if (updatedPrompt.versions.length > 10) {
        updatedPrompt.versions = updatedPrompt.versions.slice(-10);
      }

      data.prompts[promptIndex] = updatedPrompt;
      data.lastUpdated = new Date().toISOString();
      savePrompts(data);

      return res.status(200).json({
        prompt: updatedPrompt,
        message: `Prompt updated to version ${updatedPrompt.version}`,
      });
    } catch (err) {
      console.error('Error updating prompt:', err);
      return res.status(500).json({ error: 'Failed to update prompt' });
    }
  }

  // DELETE - Remove prompt
  if (req.method === 'DELETE') {
    try {
      const data = loadPrompts();
      const promptIndex = data.prompts.findIndex((p) => p.id === id);

      if (promptIndex === -1) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      // Prevent deletion of the default prompt
      const prompt = data.prompts[promptIndex];
      if (prompt.id === 'blueprint-initiative-design') {
        return res.status(400).json({
          error: 'Cannot delete the default prompt',
        });
      }

      data.prompts.splice(promptIndex, 1);
      data.lastUpdated = new Date().toISOString();
      savePrompts(data);

      return res.status(200).json({
        message: 'Prompt deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting prompt:', err);
      return res.status(500).json({ error: 'Failed to delete prompt' });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
