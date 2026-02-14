// pages/api/ai/status.js
// Check AI service availability and available models

import { OpenRouterService, OPENROUTER_MODELS, DEFAULT_MODEL } from '../../../lib/services/OpenRouterService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const service = new OpenRouterService();

  // Check if API key is configured
  const configured = service.isConfigured();

  // Build model list with info
  const models = Object.entries(OPENROUTER_MODELS).map(([key, config]) => ({
    key,
    ...config,
    isDefault: key === DEFAULT_MODEL,
  }));

  return res.status(200).json({
    configured,
    defaultModel: DEFAULT_MODEL,
    models,
    message: configured
      ? 'AI service is configured and ready'
      : 'AI service not configured. Set OPENROUTER_API_KEY in .env',
  });
}
