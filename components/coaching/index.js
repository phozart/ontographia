/**
 * Coaching Components Index
 *
 * Export all coaching-related components for easy importing.
 *
 * The AI Coaching System provides:
 * - Context-aware trigger detection across all 18 spaces
 * - Experience-level adaptive messaging
 * - Cross-space awareness for connected guidance
 * - Achievement system integration
 *
 * Usage:
 *   import {
 *     CoachingPanel,
 *     CoachingIndicator,
 *     InlineCoachingTip,
 *     useCoaching,
 *   } from '@/components/coaching';
 *
 * @module components/coaching
 */

// =============================================================================
// NEW UNIFIED COACHING SYSTEM (V2)
// =============================================================================

// Main Panel Component
export {
  default as CoachingPanel,
  CoachingIndicator,
  InlineCoachingTip,
  CoachingTooltip,
} from './CoachingPanel';

// React Hook for coaching integration
export { useCoaching } from './useCoaching';

// Re-export from lib/coaching for convenience
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
  // Trigger system
  TRIGGER_TYPES as COACHING_TRIGGER_TYPES,
  UNIVERSAL_TRIGGERS,
  detectTriggers,
  // Catalogs
  getCatalog,
  getAllCatalogs,
  hasCatalog,
  getCoachingEnabledSpaces,
} from '../../lib/coaching';

// =============================================================================
// LEGACY RESEARCH PROMPTS (maintained for backward compatibility)
// =============================================================================

// Legacy Components (if they exist - safe optional export)
// export { default as PromptPanel, PromptPanelCompact } from './PromptPanel';

// Legacy Hooks (if they exist)
// export { useResearchPrompts } from './useResearchPrompts';

// Re-export legacy prompt service utilities (if available)
// These are kept for backward compatibility with existing code
try {
  // Dynamic re-exports handled via separate import if needed
} catch (e) {
  // Silently ignore if legacy prompts module doesn't exist
}
