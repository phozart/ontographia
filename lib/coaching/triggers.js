/**
 * triggers.js
 *
 * Trigger detection logic for the AI Coaching System
 *
 * Triggers are evaluated based on:
 * - State conditions (element counts, missing data)
 * - Action events (create, edit, delete)
 * - Time-based conditions (idle, session duration)
 * - Pattern detection (anti-patterns, missing relationships)
 * - Milestone events (achievements, completions)
 *
 * @module lib/coaching/triggers
 */

// =============================================================================
// TRIGGER TYPES
// =============================================================================

export const TRIGGER_TYPES = {
  state: {
    id: 'state',
    description: 'Triggered by current state of elements',
  },
  action: {
    id: 'action',
    description: 'Triggered by user actions',
  },
  time: {
    id: 'time',
    description: 'Triggered by time-based conditions',
  },
  pattern: {
    id: 'pattern',
    description: 'Triggered by detected patterns or anti-patterns',
  },
  milestone: {
    id: 'milestone',
    description: 'Triggered by reaching milestones',
  },
  cross_space: {
    id: 'cross_space',
    description: 'Triggered by opportunities across spaces',
  },
};

// =============================================================================
// UNIVERSAL TRIGGERS (Apply to all spaces)
// =============================================================================

export const UNIVERSAL_TRIGGERS = {
  // First visit to space
  first_visit: {
    id: 'first_visit',
    type: 'state',
    condition: (ctx) => {
      const totalElements = countAllElements(ctx.elements);
      return totalElements === 0 && ctx.sessionDuration < 1;
    },
    severity: 'info',
    message: 'Welcome to {spaceName}! Would you like a quick tour?',
    suggestedAction: 'Start guided tour',
    experienceFilter: ['novice', 'learner'],
    cooldownMinutes: 0, // Only once per session
  },

  // Idle prompt
  idle_prompt: {
    id: 'idle_prompt',
    type: 'time',
    condition: (ctx) => ctx.idleMinutes >= 5 && countAllElements(ctx.elements) > 0,
    severity: 'gentle_nudge',
    message: 'Here\'s a question that might help: {contextualQuestion}',
    experienceFilter: ['novice', 'learner', 'practitioner'],
    cooldownMinutes: 15,
  },

  // Long session reminder
  long_session: {
    id: 'long_session',
    type: 'time',
    condition: (ctx) => ctx.sessionDuration >= 60,
    severity: 'info',
    message: 'You\'ve been working for {duration}. Consider taking a break or capturing your progress.',
    suggestedAction: 'Take a snapshot',
    experienceFilter: ['novice', 'learner'],
    cooldownMinutes: 60,
  },

  // Empty state prompt
  empty_space: {
    id: 'empty_space',
    type: 'state',
    condition: (ctx) => countAllElements(ctx.elements) === 0 && ctx.sessionDuration >= 2,
    severity: 'gentle_nudge',
    message: 'Ready to get started? Create your first {elementType} to begin.',
    suggestedAction: 'Create element',
    cooldownMinutes: 10,
  },

  // Good progress celebration
  good_progress: {
    id: 'good_progress',
    type: 'milestone',
    condition: (ctx) => {
      const count = countAllElements(ctx.elements);
      return count > 0 && count % 10 === 0;
    },
    severity: 'success',
    message: 'Great progress! You\'ve created {count} elements.',
    cooldownMinutes: 30,
  },
};

// =============================================================================
// CONDITION EVALUATORS
// =============================================================================

/**
 * Count all elements in an elements object
 * @param {Object} elements - Elements by type
 * @returns {number} Total count
 */
export function countAllElements(elements) {
  if (!elements) return 0;

  if (Array.isArray(elements)) {
    return elements.length;
  }

  return Object.values(elements).reduce((total, arr) => {
    return total + (Array.isArray(arr) ? arr.length : 0);
  }, 0);
}

/**
 * Count elements by type
 * @param {Object} elements - Elements by type
 * @param {string} type - Type to count
 * @returns {number} Count
 */
export function countByType(elements, type) {
  if (!elements) return 0;
  const typeElements = elements[type];
  return Array.isArray(typeElements) ? typeElements.length : 0;
}

/**
 * Check if elements have missing required field
 * @param {Array} elements - Array of elements
 * @param {string} field - Field to check
 * @returns {Array} Elements missing the field
 */
export function findMissingField(elements, field) {
  if (!Array.isArray(elements)) return [];
  return elements.filter(e => !e[field] || e[field] === '' ||
    (Array.isArray(e[field]) && e[field].length === 0));
}

/**
 * Check if elements match an anti-pattern
 * @param {Array} elements - Array of elements
 * @param {Object} pattern - Pattern to match
 * @returns {Array} Matching elements
 */
export function findAntiPattern(elements, pattern) {
  if (!Array.isArray(elements) || !pattern) return [];

  return elements.filter(e => {
    // Text pattern matching
    if (pattern.textMatch && pattern.field) {
      const value = e[pattern.field];
      if (typeof value === 'string') {
        if (pattern.textMatch.some(term =>
          value.toLowerCase().includes(term.toLowerCase())
        )) {
          return true;
        }
      }
    }

    // Keyword pattern matching
    if (pattern.keywords) {
      const text = `${e.name || ''} ${e.description || ''} ${e.content || ''}`.toLowerCase();
      if (pattern.keywords.some(kw => text.includes(kw.toLowerCase()))) {
        return true;
      }
    }

    // Vague term detection
    if (pattern.vagueTerms) {
      const text = `${e.name || ''} ${e.description || ''}`.toLowerCase();
      if (pattern.vagueTerms.some(term => text.includes(term))) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Check for missing relationships
 * @param {Object} elements - All elements
 * @param {Array} relationships - Relationships array
 * @param {string} sourceType - Source element type
 * @param {string} relType - Required relationship type
 * @returns {Array} Elements missing the relationship
 */
export function findMissingRelationships(elements, relationships, sourceType, relType) {
  const sourceElements = elements[sourceType];
  if (!Array.isArray(sourceElements)) return [];

  const linkedIds = new Set(
    relationships
      .filter(r => r.type === relType)
      .map(r => r.from || r.source_id)
  );

  return sourceElements.filter(e => !linkedIds.has(e.id));
}

/**
 * Check if all elements of a type have the same value for a field
 * @param {Array} elements - Array of elements
 * @param {string} field - Field to check
 * @returns {boolean} True if all same
 */
export function allSameValue(elements, field) {
  if (!Array.isArray(elements) || elements.length < 2) return false;
  const values = elements.map(e => e[field]).filter(v => v != null);
  const unique = new Set(values);
  return unique.size === 1;
}

/**
 * Calculate element distribution across categories
 * @param {Array} elements - Array of elements
 * @param {string} categoryField - Field to categorize by
 * @returns {Object} Distribution object
 */
export function getDistribution(elements, categoryField) {
  if (!Array.isArray(elements)) return {};
  return elements.reduce((dist, e) => {
    const cat = e[categoryField] || 'unknown';
    dist[cat] = (dist[cat] || 0) + 1;
    return dist;
  }, {});
}

// =============================================================================
// TRIGGER CONDITION BUILDERS
// =============================================================================

/**
 * Create a count-based condition
 * @param {string} elementType - Type of element
 * @param {string} operator - Comparison operator
 * @param {number} value - Value to compare against
 * @returns {Function} Condition function
 */
export function countCondition(elementType, operator, value) {
  return (ctx) => {
    const count = countByType(ctx.elements, elementType);
    switch (operator) {
      case '==': return count === value;
      case '!=': return count !== value;
      case '>': return count > value;
      case '>=': return count >= value;
      case '<': return count < value;
      case '<=': return count <= value;
      default: return false;
    }
  };
}

/**
 * Create a missing field condition
 * @param {string} elementType - Type of element
 * @param {string} field - Field that should exist
 * @param {number} threshold - Minimum number of violations
 * @returns {Function} Condition function
 */
export function missingFieldCondition(elementType, field, threshold = 1) {
  return (ctx) => {
    const elements = ctx.elements?.[elementType];
    const missing = findMissingField(elements, field);
    return missing.length >= threshold;
  };
}

/**
 * Create a time-based condition
 * @param {string} timeField - Field to check (sessionDuration, idleMinutes)
 * @param {string} operator - Comparison operator
 * @param {number} minutes - Minutes to compare against
 * @returns {Function} Condition function
 */
export function timeCondition(timeField, operator, minutes) {
  return (ctx) => {
    const value = ctx[timeField] || 0;
    switch (operator) {
      case '>=': return value >= minutes;
      case '>': return value > minutes;
      case '<=': return value <= minutes;
      case '<': return value < minutes;
      default: return false;
    }
  };
}

/**
 * Create an action-based condition
 * @param {string} action - Action type (create, edit, delete)
 * @param {string} elementType - Optional element type filter
 * @returns {Function} Condition function
 */
export function actionCondition(action, elementType = null) {
  return (ctx) => {
    if (ctx.currentAction !== action) return false;
    if (elementType && ctx.artefactState?.type !== elementType) return false;
    return true;
  };
}

/**
 * Create a pattern detection condition
 * @param {string} elementType - Type to check
 * @param {Object} pattern - Pattern configuration
 * @returns {Function} Condition function
 */
export function patternCondition(elementType, pattern) {
  return (ctx) => {
    const elements = ctx.elements?.[elementType];
    const matches = findAntiPattern(elements, pattern);
    return matches.length > 0;
  };
}

/**
 * Combine multiple conditions with AND logic
 * @param {...Function} conditions - Condition functions
 * @returns {Function} Combined condition
 */
export function andConditions(...conditions) {
  return (ctx) => conditions.every(c => c(ctx));
}

/**
 * Combine multiple conditions with OR logic
 * @param {...Function} conditions - Condition functions
 * @returns {Function} Combined condition
 */
export function orConditions(...conditions) {
  return (ctx) => conditions.some(c => c(ctx));
}

// =============================================================================
// MAIN DETECTION ENGINE
// =============================================================================

/**
 * Detect all active triggers for a given context
 * @param {Object} context - Current context
 * @param {Object} spaceCatalog - Space-specific trigger catalog
 * @returns {Array} Array of active triggers
 */
export function detectTriggers(context, spaceCatalog = null) {
  const activeTriggers = [];

  // Evaluate universal triggers
  Object.values(UNIVERSAL_TRIGGERS).forEach(trigger => {
    if (evaluateTrigger(trigger, context)) {
      activeTriggers.push(formatTrigger(trigger, context));
    }
  });

  // Evaluate space-specific triggers
  if (spaceCatalog?.triggers) {
    Object.values(spaceCatalog.triggers).forEach(trigger => {
      if (evaluateTrigger(trigger, context)) {
        activeTriggers.push(formatTrigger(trigger, context, spaceCatalog));
      }
    });
  }

  return activeTriggers;
}

/**
 * Evaluate a single trigger against context
 * @param {Object} trigger - Trigger definition
 * @param {Object} context - Current context
 * @returns {boolean} Whether trigger is active
 */
export function evaluateTrigger(trigger, context) {
  if (!trigger.condition) return false;

  try {
    if (typeof trigger.condition === 'function') {
      return trigger.condition(context);
    }
    // Handle declarative condition objects
    return evaluateDeclarativeCondition(trigger.condition, context);
  } catch (e) {
    console.warn(`Error evaluating trigger ${trigger.id}:`, e);
    return false;
  }
}

/**
 * Evaluate a declarative condition object
 * @param {Object} condition - Declarative condition
 * @param {Object} context - Current context
 * @returns {boolean} Result
 */
function evaluateDeclarativeCondition(condition, context) {
  const { type, elementType, operator, value, field, pattern } = condition;

  switch (type) {
    case 'element_count':
      return countCondition(elementType, operator, value)(context);

    case 'missing_field':
      return missingFieldCondition(elementType, field, value || 1)(context);

    case 'time':
      return timeCondition(field, operator, value)(context);

    case 'action':
      return actionCondition(condition.action, elementType)(context);

    case 'pattern':
      return patternCondition(elementType, pattern)(context);

    case 'all_same':
      const elements = context.elements?.[elementType];
      return Array.isArray(elements) && elements.length > 2 && allSameValue(elements, field);

    default:
      return false;
  }
}

/**
 * Format a trigger with context data substituted
 * @param {Object} trigger - Trigger definition
 * @param {Object} context - Current context
 * @param {Object} catalog - Space catalog for additional data
 * @returns {Object} Formatted trigger
 */
export function formatTrigger(trigger, context, catalog = null) {
  // Build substitution data
  const data = {
    spaceName: catalog?.spaceName || context.spaceId || 'this space',
    elementType: getDefaultElementType(context.spaceId, catalog),
    count: countAllElements(context.elements),
    duration: formatDuration(context.sessionDuration || 0),
    contextualQuestion: getContextualQuestion(context, catalog),
    ...trigger.data,
  };

  // Substitute placeholders in message
  let message = trigger.message || '';
  Object.entries(data).forEach(([key, value]) => {
    message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });

  return {
    ...trigger,
    message,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Get default element type for a space
 * @param {string} spaceId - Space identifier
 * @param {Object} catalog - Space catalog
 * @returns {string} Default element type name
 */
function getDefaultElementType(spaceId, catalog) {
  if (catalog?.defaultElementType) return catalog.defaultElementType;

  const defaults = {
    ba: 'requirement',
    ea: 'element',
    pds: 'artefact',
    pdw: 'idea',
    cap: 'capability',
    sd: 'variable',
    portfolio: 'initiative',
    cm: 'impact',
    dwd: 'work item',
    als: 'learning session',
  };

  return defaults[spaceId] || 'element';
}

/**
 * Get a contextual question based on current state
 * @param {Object} context - Current context
 * @param {Object} catalog - Space catalog
 * @returns {string} Contextual question
 */
function getContextualQuestion(context, catalog) {
  if (catalog?.contextualQuestions?.length > 0) {
    // Pick a relevant question
    const questions = catalog.contextualQuestions;
    const index = Math.floor(Math.random() * questions.length);
    return questions[index];
  }

  // Default questions by space
  const defaultQuestions = {
    ba: 'Who is the primary stakeholder for this requirement?',
    ea: 'What capability does this element support or realize?',
    pds: 'What would success look like for this project?',
    pdw: 'What assumption, if wrong, would invalidate this idea?',
    cap: 'How does this capability contribute to business value?',
    sd: 'What feedback loops might affect this variable?',
    portfolio: 'What\'s the strategic value of this initiative?',
    cm: 'Who will be most affected by this change?',
    dwd: 'What makes this work item different from similar work?',
    als: 'What insight did you gain from this learning?',
  };

  return defaultQuestions[context.spaceId] || 'What\'s the next most important thing to capture?';
}

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
function formatDuration(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  TRIGGER_TYPES,
  UNIVERSAL_TRIGGERS,
  detectTriggers,
  evaluateTrigger,
  // Condition helpers
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
};
