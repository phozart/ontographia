// pages/api/ai/generate.js
// API endpoint for AI generation using OpenRouter

import { OpenRouterService, OPENROUTER_MODELS, DEFAULT_MODEL } from '../../../lib/services/OpenRouterService';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { prompt, model = DEFAULT_MODEL, temperature, maxTokens, type = 'general' } = req.body;

  // Validate request
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (model && !OPENROUTER_MODELS[model]) {
    return res.status(400).json({
      error: `Invalid model: ${model}`,
      availableModels: Object.keys(OPENROUTER_MODELS),
    });
  }

  // Create service instance
  const service = new OpenRouterService();

  // Check if configured
  if (!service.isConfigured()) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'OpenRouter API key not set. Add OPENROUTER_API_KEY to your .env file.',
    });
  }

  try {
    let result;

    if (type === 'initiative-analysis') {
      // Special handling for initiative analysis - expects JSON response
      result = await service.generateInitiativeAnalysis(prompt, model);
    } else {
      // General generation
      result = await service.generate({
        prompt,
        model,
        temperature,
        maxTokens,
      });
    }

    if (!result.success) {
      return res.status(500).json({
        error: result.error,
        statusCode: result.statusCode,
      });
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      content: result.content,
      json: result.json || null,
      usage: result.usage,
      model: result.model,
      finishReason: result.finishReason,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV !== 'production' && { message: error.message }),
    });
  }
}

// Increase body size limit for large prompts
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
