// components/srs/index.js
// Export all SRS components

// Context and Types
export {
  SRSProvider,
  useSRS,
  SRS_SPACES,
  SPACE_ORDER,
  QUESTION_TYPES,
  QUESTION_MATURITY,
  FRAME_TYPES,
  FRAME_ELEMENT_TYPES,
  STATE_TYPES,
  STATE_CONFIDENCE_LEVELS,
  SYSTEM_NODE_TYPES,
  CAUSAL_POLARITIES,
  TIME_DELAYS,
  LOOP_TYPES,
  PERSPECTIVE_TYPES,
  PERSPECTIVE_ARCHETYPES,
  REVERSIBILITY_LEVELS,
  DECISION_OUTCOMES,
  READINESS_THRESHOLDS,
  CONNECTION_TYPES,
  COACHING_TRIGGERS,
  COACHING_SEVERITY,
  SESSION_MODES,
  SESSION_INTENTS,
  // Helper functions
  calculateReadinessScore,
  getReadinessLevel,
  getSuggestedNextSpace,
  detectCoachingTriggers,
  getSpaceSuggestionsForElement,
  formatDuration,
  getScoreColor,
  generateElementId,
} from './SRSContext';

// Main Workspace
export { default as SRSWorkspace } from './SRSWorkspace';
export { default as SRSNavigator } from './SRSNavigator';
export { default as CoachingPanel } from './CoachingPanel';

// Canvas Components
export * from './canvas';

// Entry Flow
export * from './entry';

// Space Views
export * from './spaces';
