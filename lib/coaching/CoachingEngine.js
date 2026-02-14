/**
 * CoachingEngine.js
 *
 * Shared AI Coaching Infrastructure for Ontographia V2
 *
 * Core Philosophy: "AI generates prompts, humans do thinking"
 *
 * This module provides:
 * - Context-aware trigger detection across all 18 spaces
 * - Experience-level adaptive messaging
 * - Cross-space awareness for connected guidance
 * - Achievement system integration
 * - Dismissal tracking per user
 *
 * @module lib/coaching/CoachingEngine
 */

import { detectTriggers, UNIVERSAL_TRIGGERS } from './triggers';

// =============================================================================
// EXPERIENCE LEVELS
// =============================================================================

export const EXPERIENCE_LEVELS = {
  novice: {
    id: 'novice',
    name: 'Novice',
    xpThreshold: 0,
    coachingIntensity: 'high',
    features: ['onboarding_wizards', 'inline_hints', 'frequent_suggestions'],
    triggerCooldownMultiplier: 0.5, // More frequent triggers
  },
  learner: {
    id: 'learner',
    name: 'Learner',
    xpThreshold: 50,
    coachingIntensity: 'moderate',
    features: ['tooltips', 'contextual_suggestions'],
    triggerCooldownMultiplier: 1.0,
  },
  practitioner: {
    id: 'practitioner',
    name: 'Practitioner',
    xpThreshold: 200,
    coachingIntensity: 'balanced',
    features: ['opt_in_suggestions', 'framework_tips'],
    triggerCooldownMultiplier: 1.5,
  },
  expert: {
    id: 'expert',
    name: 'Expert',
    xpThreshold: 500,
    coachingIntensity: 'minimal',
    features: ['critical_warnings_only', 'on_request_help'],
    triggerCooldownMultiplier: 3.0, // Much less frequent
  },
};

// =============================================================================
// MESSAGE TYPES & SEVERITIES
// =============================================================================

export const MESSAGE_TYPES = {
  tip: {
    id: 'tip',
    name: 'Tip',
    description: 'Helpful information to improve workflow',
    icon: 'Lightbulb',
    dismissable: true,
  },
  warning: {
    id: 'warning',
    name: 'Warning',
    description: 'Potential issue or anti-pattern detected',
    icon: 'Warning',
    dismissable: true,
  },
  suggestion: {
    id: 'suggestion',
    name: 'Suggestion',
    description: 'Recommended action based on context',
    icon: 'EmojiObjects',
    dismissable: true,
  },
  question: {
    id: 'question',
    name: 'Question',
    description: 'Thought-provoking prompt to guide thinking',
    icon: 'HelpOutline',
    dismissable: true,
  },
  success: {
    id: 'success',
    name: 'Success',
    description: 'Confirmation of good practice',
    icon: 'CheckCircle',
    dismissable: true,
    autoHide: 5000, // Auto-hide after 5 seconds
  },
  milestone: {
    id: 'milestone',
    name: 'Milestone',
    description: 'Achievement or progress marker reached',
    icon: 'Flag',
    dismissable: true,
  },
};

export const SEVERITIES = {
  info: {
    id: 'info',
    name: 'Info',
    color: '#3b82f6',
    background: '#eff6ff',
    border: '#93c5fd',
    icon: 'Info',
    priority: 1,
  },
  gentle_nudge: {
    id: 'gentle_nudge',
    name: 'Gentle Nudge',
    color: '#eab308',
    background: '#fefce8',
    border: '#fde047',
    icon: 'EmojiObjects',
    priority: 2,
  },
  important: {
    id: 'important',
    name: 'Important',
    color: '#f97316',
    background: '#fff7ed',
    border: '#fdba74',
    icon: 'PriorityHigh',
    priority: 3,
  },
  critical: {
    id: 'critical',
    name: 'Critical',
    color: '#ef4444',
    background: '#fef2f2',
    border: '#fca5a5',
    icon: 'Error',
    priority: 4,
  },
  success: {
    id: 'success',
    name: 'Success',
    color: '#10b981',
    background: '#ecfdf5',
    border: '#6ee7b7',
    icon: 'CheckCircle',
    priority: 0,
  },
};

// =============================================================================
// COACHING ENGINE CLASS
// =============================================================================

/**
 * CoachingEngine - Main class for managing coaching across spaces
 */
export class CoachingEngine {
  constructor(options = {}) {
    this.spaceId = options.spaceId || 'unknown';
    this.experienceLevel = options.experienceLevel || 'novice';
    this.userId = options.userId || null;
    this.dismissedTriggers = new Set(options.dismissedTriggers || []);
    this.triggerCooldowns = new Map(); // Track when triggers were last shown
    this.enabled = options.enabled !== false;
    this.catalogs = {}; // Will be populated with space-specific catalogs

    // Callbacks
    this.onTrigger = options.onTrigger || null;
    this.onAchievement = options.onAchievement || null;
    this.onDismiss = options.onDismiss || null;
  }

  /**
   * Register a space-specific trigger catalog
   * @param {string} spaceId - Space identifier
   * @param {Object} catalog - Catalog of triggers and content
   */
  registerCatalog(spaceId, catalog) {
    this.catalogs[spaceId] = catalog;
  }

  /**
   * Update experience level
   * @param {string} level - New experience level
   */
  setExperienceLevel(level) {
    if (EXPERIENCE_LEVELS[level]) {
      this.experienceLevel = level;
    }
  }

  /**
   * Get experience level from XP
   * @param {number} xp - User's experience points
   * @returns {string} Experience level id
   */
  static getExperienceLevelFromXP(xp) {
    if (xp >= EXPERIENCE_LEVELS.expert.xpThreshold) return 'expert';
    if (xp >= EXPERIENCE_LEVELS.practitioner.xpThreshold) return 'practitioner';
    if (xp >= EXPERIENCE_LEVELS.learner.xpThreshold) return 'learner';
    return 'novice';
  }

  /**
   * Check if a trigger is on cooldown
   * @param {string} triggerId - Trigger identifier
   * @returns {boolean}
   */
  isOnCooldown(triggerId) {
    const lastShown = this.triggerCooldowns.get(triggerId);
    if (!lastShown) return false;

    const cooldownMs = this.getCooldownMs(triggerId);
    return Date.now() - lastShown < cooldownMs;
  }

  /**
   * Get cooldown duration for a trigger
   * @param {string} triggerId - Trigger identifier
   * @returns {number} Cooldown in milliseconds
   */
  getCooldownMs(triggerId) {
    const level = EXPERIENCE_LEVELS[this.experienceLevel];
    const multiplier = level?.triggerCooldownMultiplier || 1.0;
    const baseCooldown = 5 * 60 * 1000; // 5 minutes base
    return baseCooldown * multiplier;
  }

  /**
   * Mark a trigger as shown
   * @param {string} triggerId - Trigger identifier
   */
  markTriggerShown(triggerId) {
    this.triggerCooldowns.set(triggerId, Date.now());
  }

  /**
   * Dismiss a trigger
   * @param {string} triggerId - Trigger identifier
   * @param {boolean} permanent - If true, add to permanent dismissals
   */
  dismissTrigger(triggerId, permanent = false) {
    if (permanent) {
      this.dismissedTriggers.add(triggerId);
    }
    // Always mark as shown to prevent immediate re-triggering
    this.markTriggerShown(triggerId);

    if (this.onDismiss) {
      this.onDismiss(triggerId, permanent);
    }
  }

  /**
   * Evaluate triggers for current context
   * @param {Object} context - Context object with space state
   * @returns {Array} Array of active triggers
   */
  evaluate(context) {
    if (!this.enabled) return [];

    const {
      spaceId = this.spaceId,
      elements = {},
      stats = {},
      sessionDuration = 0,
      currentView = null,
      currentAction = null,
      artefactState = null,
    } = context;

    // Build full context for trigger detection
    const fullContext = {
      spaceId,
      experienceLevel: this.experienceLevel,
      elements,
      stats,
      sessionDuration,
      currentView,
      currentAction,
      artefactState,
      userId: this.userId,
    };

    // Get triggers from detection engine
    const rawTriggers = detectTriggers(fullContext, this.catalogs[spaceId]);

    // Filter triggers
    const activeTriggers = rawTriggers.filter(trigger => {
      // Check if dismissed permanently
      if (this.dismissedTriggers.has(trigger.id)) return false;

      // Check cooldown
      if (this.isOnCooldown(trigger.id)) return false;

      // Check experience level filter
      if (trigger.experienceFilter &&
          !trigger.experienceFilter.includes(this.experienceLevel)) {
        return false;
      }

      return true;
    });

    // Mark shown triggers
    activeTriggers.forEach(t => this.markTriggerShown(t.id));

    // Sort by priority
    return activeTriggers.sort((a, b) => {
      const severityA = SEVERITIES[a.severity]?.priority || 0;
      const severityB = SEVERITIES[b.severity]?.priority || 0;
      return severityB - severityA;
    });
  }

  /**
   * Get contextual message with data substitution
   * @param {Object} trigger - Trigger object
   * @param {Object} data - Data for substitution
   * @returns {string} Formatted message
   */
  formatMessage(trigger, data = {}) {
    let message = trigger.message || '';

    // Substitute placeholders
    Object.entries(data).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });

    return message;
  }

  /**
   * Check for achievements based on context
   * @param {Object} context - Context with stats and history
   * @returns {Array} Newly earned achievements
   */
  checkAchievements(context) {
    // Achievement checking logic - delegated to achievement module
    // This is a placeholder for integration
    return [];
  }

  /**
   * Get coaching prompt for a specific action
   * @param {string} action - Action being performed (create, edit, delete)
   * @param {string} artefactType - Type of artefact
   * @returns {Object|null} Coaching prompt or null
   */
  getActionPrompt(action, artefactType) {
    const catalog = this.catalogs[this.spaceId];
    if (!catalog?.actionPrompts) return null;

    const key = `${action}_${artefactType}`;
    return catalog.actionPrompts[key] || catalog.actionPrompts[action] || null;
  }

  /**
   * Get field-level guidance
   * @param {string} fieldName - Field being edited
   * @param {string} artefactType - Type of artefact
   * @returns {string|null} Guidance text or null
   */
  getFieldGuidance(fieldName, artefactType) {
    const catalog = this.catalogs[this.spaceId];
    if (!catalog?.fieldGuidance) return null;

    const typeGuidance = catalog.fieldGuidance[artefactType];
    if (typeGuidance && typeGuidance[fieldName]) {
      return typeGuidance[fieldName];
    }

    // Fall back to generic field guidance
    return catalog.fieldGuidance[fieldName] || null;
  }

  /**
   * Get examples for an artefact type
   * @param {string} artefactType - Type of artefact
   * @returns {Object} Good and poor examples
   */
  getExamples(artefactType) {
    const catalog = this.catalogs[this.spaceId];
    return catalog?.examples?.[artefactType] || { good: [], poor: [] };
  }

  /**
   * Get anti-patterns for an artefact type
   * @param {string} artefactType - Type of artefact
   * @returns {Array} Anti-patterns to avoid
   */
  getAntiPatterns(artefactType) {
    const catalog = this.catalogs[this.spaceId];
    return catalog?.antiPatterns?.[artefactType] || [];
  }

  /**
   * Get cross-space suggestions
   * @param {Object} context - Current context
   * @returns {Array} Suggestions for related spaces
   */
  getCrossSpaceSuggestions(context) {
    const catalog = this.catalogs[this.spaceId];
    if (!catalog?.crossSpaceLinks) return [];

    return catalog.crossSpaceLinks.filter(link => {
      // Evaluate condition
      if (link.condition && typeof link.condition === 'function') {
        return link.condition(context);
      }
      return true;
    });
  }

  /**
   * Export dismissals for persistence
   * @returns {Array} Array of dismissed trigger IDs
   */
  exportDismissals() {
    return Array.from(this.dismissedTriggers);
  }

  /**
   * Import dismissals from storage
   * @param {Array} dismissals - Array of trigger IDs
   */
  importDismissals(dismissals) {
    this.dismissedTriggers = new Set(dismissals || []);
  }
}

// =============================================================================
// COACHING MESSAGE BUILDER
// =============================================================================

/**
 * Build a coaching message object
 * @param {Object} options - Message options
 * @returns {Object} Formatted coaching message
 */
export function buildCoachingMessage(options) {
  const {
    id,
    type = 'tip',
    severity = 'info',
    message,
    suggestedAction = null,
    frameworkReference = null,
    crossSpaceLink = null,
    data = {},
    experienceFilter = null,
    cooldownMinutes = 5,
  } = options;

  return {
    id: id || `coaching_${Date.now()}`,
    type,
    severity,
    message,
    suggestedAction,
    frameworkReference,
    crossSpaceLink,
    data,
    experienceFilter,
    cooldownMinutes,
    timestamp: Date.now(),
    typeConfig: MESSAGE_TYPES[type],
    severityConfig: SEVERITIES[severity],
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if coaching should be shown for experience level
 * @param {string} experienceLevel - Current experience level
 * @param {string} coachingType - Type of coaching
 * @returns {boolean}
 */
export function shouldShowCoaching(experienceLevel, coachingType) {
  const level = EXPERIENCE_LEVELS[experienceLevel];
  if (!level) return true;

  switch (coachingType) {
    case 'onboarding':
      return level.features.includes('onboarding_wizards');
    case 'inline_hint':
      return level.features.includes('inline_hints') ||
             level.features.includes('tooltips');
    case 'suggestion':
      return !level.features.includes('critical_warnings_only');
    case 'warning':
      return true; // Always show warnings
    case 'critical':
      return true; // Always show critical
    default:
      return level.coachingIntensity !== 'minimal';
  }
}

/**
 * Get coaching intensity for a space based on user stats
 * @param {Object} spaceStats - Stats for the space
 * @returns {string} Recommended coaching intensity
 */
export function getRecommendedIntensity(spaceStats) {
  const { elementCount = 0, sessionCount = 0, totalTimeMinutes = 0 } = spaceStats;

  // Very new to space
  if (elementCount < 5 && sessionCount < 3) {
    return 'high';
  }

  // Some experience
  if (elementCount < 20 && sessionCount < 10) {
    return 'moderate';
  }

  // Regular user
  if (totalTimeMinutes < 300) { // Less than 5 hours
    return 'balanced';
  }

  // Experienced user
  return 'minimal';
}

// =============================================================================
// CROSS-SPACE CONNECTION HELPERS
// =============================================================================

/**
 * Get related spaces for a given context
 * @param {string} currentSpace - Current space ID
 * @param {Object} context - Current context
 * @returns {Array} Related space suggestions
 */
export function getRelatedSpaces(currentSpace, context) {
  const connections = {
    ba: ['pds', 'ea', 'cap'],
    ea: ['ba', 'cap', 'sd'],
    pds: ['ba', 'portfolio', 'dwd'],
    cap: ['ea', 'perf', 'portfolio'],
    sd: ['ea', 'dwd', 'ba'],
    pdw: ['ba', 'pds', 'portfolio'],
    portfolio: ['pds', 'cap', 'ea'],
    cm: ['pds', 'ba', 'cap'],
    dwd: ['ba', 'pds', 'sd'],
    als: ['ba', 'pds'],
  };

  return connections[currentSpace] || [];
}

/**
 * Get cross-space prompts based on completion events
 * @param {string} eventType - Type of completion event
 * @param {Object} data - Event data
 * @returns {Object|null} Cross-space suggestion
 */
export function getCrossSpacePrompt(eventType, data) {
  const prompts = {
    requirement_approved: {
      targetSpace: 'pds',
      message: 'This requirement is approved. Consider creating a project to deliver it.',
      action: 'Create project',
    },
    decision_made: {
      targetSpace: 'pds',
      message: 'Decision made. Create a project to execute this decision.',
      action: 'Create project',
    },
    project_complete: {
      targetSpace: 'als',
      message: 'Project complete. Capture learnings in Learning Studio.',
      action: 'Open Learning Studio',
    },
    capability_defined: {
      targetSpace: 'ea',
      message: 'New capability defined. Consider mapping it in Enterprise Architecture.',
      action: 'Open EA Studio',
    },
    risk_identified: {
      targetSpace: 'sd',
      message: 'High-impact risk identified. Consider modeling in System Dynamics.',
      action: 'Open SD Studio',
    },
  };

  return prompts[eventType] || null;
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default CoachingEngine;
