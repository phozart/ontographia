// lib/services/OpenRouterService.js
// OpenRouter API integration for AI-powered features
// https://openrouter.ai/docs

/**
 * Available models with their pricing and capabilities
 * Organized by tier: Free/Low-cost → Standard → Premium
 */
export const OPENROUTER_MODELS = {
  // === FREE / LOW-COST TIER (Good for testing & development) ===

  // GPT-4o Mini - Best free/cheap model for research and testing
  'gpt4o-mini': {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Free tier - excellent for testing and research',
    maxTokens: 16384,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    tier: 'free',
    recommended: true,
  },

  // Claude 3 Haiku - Fast and very low cost
  'haiku': {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Very fast and cost-effective, good for simple tasks',
    maxTokens: 4096,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
    tier: 'free',
  },

  // === STANDARD TIER (Best balance of quality and cost) ===

  // Claude 3.5 Sonnet - Best balanced model
  'sonnet': {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Best balance of quality and speed (Recommended)',
    maxTokens: 8192,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    tier: 'standard',
    recommended: true,
  },

  // GPT-4o - OpenAI's balanced model
  'gpt4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'OpenAI GPT-4o - fast and capable',
    maxTokens: 4096,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    tier: 'standard',
  },

  // GPT-4 Turbo
  'gpt4-turbo': {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'OpenAI GPT-4 Turbo - reliable',
    maxTokens: 4096,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    tier: 'standard',
  },

  // === PREMIUM TIER (Highest quality for complex analysis) ===

  // Claude Opus - Highest quality Anthropic model
  'opus': {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Highest quality for complex analysis',
    maxTokens: 4096,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    tier: 'premium',
  },

  // Claude Opus 4.5 - Latest and most capable
  'opus-4.5': {
    id: 'anthropic/claude-opus-4-5',
    name: 'Claude Opus 4.5',
    description: 'Latest Opus model - most advanced reasoning',
    maxTokens: 8192,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    tier: 'premium',
    recommended: true,
  },
};

// Default model for AI Design
export const DEFAULT_MODEL = 'sonnet';

/**
 * OpenRouter API Service
 */
export class OpenRouterService {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY;
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.appName = 'Ontographia Blueprint Studio';
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  }

  /**
   * Check if the service is configured
   * @returns {boolean}
   */
  isConfigured() {
    return Boolean(this.apiKey);
  }

  /**
   * Get available models
   * @returns {Object}
   */
  getModels() {
    return OPENROUTER_MODELS;
  }

  /**
   * Generate a completion using OpenRouter
   * @param {Object} options - Generation options
   * @param {string} options.prompt - The prompt to send
   * @param {string} [options.model='sonnet'] - Model key from OPENROUTER_MODELS
   * @param {number} [options.maxTokens] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Sampling temperature
   * @param {string} [options.systemPrompt] - Optional system prompt
   * @returns {Promise<{success: boolean, content?: string, error?: string, usage?: Object}>}
   */
  async generate({ prompt, model = DEFAULT_MODEL, maxTokens, temperature = 0.7, systemPrompt }) {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env',
      };
    }

    const modelConfig = OPENROUTER_MODELS[model];
    if (!modelConfig) {
      return {
        success: false,
        error: `Unknown model: ${model}. Available: ${Object.keys(OPENROUTER_MODELS).join(', ')}`,
      };
    }

    const messages = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.appUrl,
          'X-Title': this.appName,
        },
        body: JSON.stringify({
          model: modelConfig.id,
          messages,
          max_tokens: maxTokens || modelConfig.maxTokens,
          temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `API error: ${response.status} ${response.statusText}`,
          statusCode: response.status,
        };
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        return {
          success: false,
          error: 'No content in API response',
        };
      }

      return {
        success: true,
        content: data.choices[0].message.content,
        usage: data.usage,
        model: modelConfig.id,
        finishReason: data.choices[0].finish_reason,
      };
    } catch (error) {
      console.error('OpenRouter API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to OpenRouter API',
      };
    }
  }

  /**
   * Generate AI Design analysis for an initiative
   * @param {string} prompt - The full AI design prompt
   * @param {string} [model='sonnet'] - Model to use
   * @returns {Promise<{success: boolean, content?: string, json?: Object, error?: string}>}
   */
  async generateInitiativeAnalysis(prompt, model = DEFAULT_MODEL) {
    const result = await this.generate({
      prompt,
      model,
      temperature: 0.5, // Lower temperature for more consistent structured output
    });

    if (!result.success) {
      return result;
    }

    // Try to extract JSON from the response
    let json = null;
    try {
      // Try to find JSON in the response
      let content = result.content.trim();

      // Remove markdown code fence if present
      const jsonBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch) {
        content = jsonBlockMatch[1].trim();
      }

      // Find the JSON object
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        content = content.slice(jsonStart, jsonEnd + 1);
      }

      json = JSON.parse(content);
    } catch (parseError) {
      // JSON parsing failed, but we still have the raw content
      console.warn('Failed to parse JSON from AI response:', parseError.message);
    }

    return {
      success: true,
      content: result.content,
      json,
      usage: result.usage,
      model: result.model,
    };
  }

  /**
   * Estimate the cost of a request
   * @param {string} prompt - The prompt
   * @param {string} model - Model key
   * @param {number} [estimatedOutputTokens=4000] - Estimated output tokens
   * @returns {{inputTokens: number, outputTokens: number, estimatedCost: number}}
   */
  estimateCost(prompt, model = DEFAULT_MODEL, estimatedOutputTokens = 4000) {
    const modelConfig = OPENROUTER_MODELS[model];
    if (!modelConfig) {
      return { inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
    }

    // Rough estimation: ~4 characters per token
    const inputTokens = Math.ceil(prompt.length / 4);

    const inputCost = (inputTokens / 1000) * modelConfig.costPer1kInput;
    const outputCost = (estimatedOutputTokens / 1000) * modelConfig.costPer1kOutput;

    return {
      inputTokens,
      outputTokens: estimatedOutputTokens,
      estimatedCost: inputCost + outputCost,
    };
  }
}

// Singleton instance
export const openRouterService = new OpenRouterService();

export default OpenRouterService;
