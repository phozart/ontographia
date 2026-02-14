/**
 * Prompts Library Index
 *
 * Central export for all prompt-related functionality.
 *
 * @module lib/prompts
 */

// Main service
export {
  default as promptService,
  generatePromptsForArtefact,
  generateAndSavePrompt,
  generatePromptWithContext,
  getUserPrompts,
  getArtefactPrompts,
  getPrompt,
  markPromptCopied,
  markPromptResearched,
  updatePromptNotes,
  getUserResearchStats,
  getAvailablePrompts,
  AI_SOURCES,
  TRIGGER_TYPES,
  getPromptById,
  getPromptsForSpace,
  getPromptsByTrigger,
  getPromptsForArtefactType,
  extractArtefactContext,
  buildRichContext,
  buildLinkContext
} from './prompt-service';

// Catalog
export {
  PROMPT_CATALOG,
  BA_PROMPTS,
  EA_PROMPTS,
  SRS_PROMPTS,
  PDS_PROMPTS,
  CAP_PROMPTS,
  DWD_PROMPTS,
  UNIVERSAL_PROMPTS
} from './prompt-catalog';

// Context builder
export {
  interpolate,
  renderPrompt,
  renderPromptWithContext
} from './context-builder';
