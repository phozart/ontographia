/**
 * AI Prompts API - List all prompts
 * GET /api/admin/ai-prompts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

// Import the default prompt from the library
import { generateAIDesignPrompt } from '../../../../lib/blueprint/ai-design-prompt';

const PROMPTS_DIR = path.join(process.cwd(), 'data', 'ai-prompts');
const PROMPTS_FILE = path.join(PROMPTS_DIR, 'prompts.json');

// Ensure directory exists
function ensureDir() {
  if (!existsSync(PROMPTS_DIR)) {
    mkdirSync(PROMPTS_DIR, { recursive: true });
  }
}

// Load prompts from file or initialize with defaults
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

  // Initialize with default prompts
  const defaultPrompts = initializeDefaultPrompts();
  savePrompts(defaultPrompts);
  return defaultPrompts;
}

// Save prompts to file
function savePrompts(prompts) {
  ensureDir();
  writeFileSync(PROMPTS_FILE, JSON.stringify(prompts, null, 2));
}

// Initialize default prompts from the library
function initializeDefaultPrompts() {
  // Generate the default prompt template
  const defaultPromptContent = generateAIDesignPrompt({
    name: '{{name}}',
    problemStatement: '{{problemStatement}}',
    targetCustomer: '{{targetCustomer}}',
    description: '{{description}}',
    additionalContext: '{{additionalContext}}',
    industry: '{{industry}}',
    geography: '{{geography}}',
  });

  return {
    prompts: [
      {
        id: 'blueprint-initiative-design',
        name: 'Blueprint Initiative Design',
        type: 'initiative-design',
        description: 'Comprehensive AI-assisted initiative design prompt for Blueprint Studio',
        version: 1,
        content: defaultPromptContent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        versions: [],
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  // Admin check would go here in production
  // const session = await getSession({ req });
  // if (!session || session.user.role !== 'admin') {
  //   return res.status(403).json({ error: 'Forbidden' });
  // }

  if (req.method === 'GET') {
    try {
      const data = loadPrompts();
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error loading prompts:', err);
      return res.status(500).json({ error: 'Failed to load prompts' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, type, description, content } = req.body;

      if (!name || !content) {
        return res.status(400).json({ error: 'Name and content are required' });
      }

      const data = loadPrompts();
      const newPrompt = {
        id: `${type || 'custom'}-${Date.now()}`,
        name,
        type: type || 'custom',
        description: description || '',
        version: 1,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        versions: [],
      };

      data.prompts.push(newPrompt);
      data.lastUpdated = new Date().toISOString();
      savePrompts(data);

      return res.status(201).json({ prompt: newPrompt });
    } catch (err) {
      console.error('Error creating prompt:', err);
      return res.status(500).json({ error: 'Failed to create prompt' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
