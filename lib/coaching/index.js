/**
 * AI Coaching System - Main Entry Point
 *
 * This module provides the unified coaching infrastructure for Ontographia V2.
 * It exports all coaching-related functionality from a single entry point.
 *
 * Core Philosophy: "AI generates prompts, humans do thinking"
 *
 * Usage:
 * ```javascript
 * import {
 *   CoachingEngine,
 *   useCoaching,
 *   EXPERIENCE_LEVELS,
 * } from '@/lib/coaching';
 *
 * // Create engine instance
 * const engine = new CoachingEngine({
 *   spaceId: 'ba',
 *   experienceLevel: 'learner',
 *   userId: 'user123',
 * });
 *
 * // Register space catalog
 * import { BA_CATALOG } from '@/lib/coaching/catalogs';
 * engine.registerCatalog('ba', BA_CATALOG);
 *
 * // Evaluate triggers
 * const triggers = engine.evaluate(context);
 * ```
 *
 * @module lib/coaching
 */

// Core Engine
export {
  CoachingEngine,
  EXPERIENCE_LEVELS,
  MESSAGE_TYPES,
  SEVERITIES,
  buildCoachingMessage,
  shouldShowCoaching,
  getRecommendedIntensity,
  getRelatedSpaces,
  getCrossSpacePrompt,
} from './CoachingEngine';

// Trigger Detection
export {
  TRIGGER_TYPES,
  UNIVERSAL_TRIGGERS,
  detectTriggers,
  evaluateTrigger,
  // Condition builders
  countCondition,
  missingFieldCondition,
  timeCondition,
  actionCondition,
  patternCondition,
  andConditions,
  orConditions,
  // Element helpers
  countAllElements,
  countByType,
  findMissingField,
  findAntiPattern,
  findMissingRelationships,
  allSameValue,
  getDistribution,
} from './triggers';

// Catalogs
export {
  CATALOGS,
  getCatalog,
  getAllCatalogs,
  hasCatalog,
  getCoachingEnabledSpaces,
  SRS_CATALOG,
  BA_CATALOG,
  PDS_CATALOG,
  EA_CATALOG,
} from './catalogs';

// Achievements System
export {
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_TIERS,
  UNIVERSAL_ACHIEVEMENTS,
  SPACE_ACHIEVEMENTS,
  checkAchievements,
  getSpaceAchievements,
  getAllAchievements,
  calculateTotalXP,
  getAchievementProgress,
} from './achievements';

// AI Prompt Templates
export {
  PROMPT_TYPES,
  SPACE_SYSTEM_PROMPTS,
  buildResearchPrompt,
  buildCreatePrompt,
  buildCompletePrompt,
  buildRelatePrompt,
  buildLearnPrompt,
  buildReviewPrompt,
  buildAnalyzePrompt,
} from './prompts';

// Re-export default
export { default as CoachingEngine } from './CoachingEngine';
