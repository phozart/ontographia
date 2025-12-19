/**
 * Performance and Outcomes Studio - Type Definitions
 *
 * Defines artefact types, stages, relationships, and utilities for
 * modeling objectives, key results, KPIs, metrics, and targets.
 *
 * @module lib/perf-types
 *
 * Design Principles:
 * - OKRs cascade from strategic to operational levels
 * - KPIs measure what matters for business outcomes
 * - Metrics provide leading and lagging indicators
 * - Targets define success criteria
 */

// ============================================================================
// STAGES - Logical groupings of work in performance management
// ============================================================================

export const PERF_STAGES = {
  strategy: {
    id: 'strategy',
    name: 'Strategy & Objectives',
    description: 'Define strategic objectives and key results',
    color: '#6366f1',
    types: ['perf_objective', 'perf_key_result'],
  },
  measurement: {
    id: 'measurement',
    name: 'Measurement',
    description: 'Define KPIs, metrics, and targets',
    color: '#8b5cf6',
    types: ['perf_kpi', 'perf_metric', 'perf_target'],
  },
  tracking: {
    id: 'tracking',
    name: 'Tracking',
    description: 'Track actuals and performance',
    color: '#22c55e',
    types: ['perf_measurement', 'perf_review'],
  },
  outcomes: {
    id: 'outcomes',
    name: 'Outcomes',
    description: 'Document outcomes and learnings',
    color: '#f59e0b',
    types: ['perf_outcome', 'perf_insight'],
  },
};

// ============================================================================
// ENUMS AND OPTIONS
// ============================================================================

export const PERF_OBJECTIVE_STATUS = [
  { id: 'draft', label: 'Draft', description: 'Being defined', color: '#6b7280' },
  { id: 'active', label: 'Active', description: 'Currently in progress', color: '#3b82f6' },
  { id: 'on_track', label: 'On Track', description: 'Progressing as expected', color: '#22c55e' },
  { id: 'at_risk', label: 'At Risk', description: 'May not achieve target', color: '#f59e0b' },
  { id: 'off_track', label: 'Off Track', description: 'Unlikely to achieve target', color: '#ef4444' },
  { id: 'achieved', label: 'Achieved', description: 'Target met', color: '#10b981' },
  { id: 'closed', label: 'Closed', description: 'No longer active', color: '#6b7280' },
];

export const PERF_OBJECTIVE_TYPE = [
  { id: 'strategic', label: 'Strategic', description: 'Long-term organizational goal' },
  { id: 'annual', label: 'Annual', description: 'Yearly objective' },
  { id: 'quarterly', label: 'Quarterly', description: 'Quarterly OKR' },
  { id: 'team', label: 'Team', description: 'Team-level objective' },
  { id: 'individual', label: 'Individual', description: 'Personal objective' },
];

export const PERF_KPI_CATEGORY = [
  { id: 'financial', label: 'Financial', description: 'Revenue, cost, profit' },
  { id: 'customer', label: 'Customer', description: 'Satisfaction, retention, NPS' },
  { id: 'process', label: 'Process', description: 'Efficiency, quality, cycle time' },
  { id: 'people', label: 'People', description: 'Engagement, capability, culture' },
  { id: 'innovation', label: 'Innovation', description: 'New products, improvements' },
];

export const PERF_METRIC_TYPE = [
  { id: 'leading', label: 'Leading', description: 'Predictive of future outcomes' },
  { id: 'lagging', label: 'Lagging', description: 'Measures past performance' },
  { id: 'input', label: 'Input', description: 'Resources invested' },
  { id: 'output', label: 'Output', description: 'Direct deliverables' },
  { id: 'outcome', label: 'Outcome', description: 'Business impact' },
];

export const PERF_TREND = [
  { id: 'improving', label: 'Improving', color: '#22c55e' },
  { id: 'stable', label: 'Stable', color: '#3b82f6' },
  { id: 'declining', label: 'Declining', color: '#ef4444' },
  { id: 'unknown', label: 'Unknown', color: '#6b7280' },
];

export const PERF_FREQUENCY = [
  { id: 'real_time', label: 'Real-time' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'annually', label: 'Annually' },
];

// ============================================================================
// ARTEFACT TYPE DEFINITIONS
// ============================================================================

export const PERF_TYPE_DEFS = {
  // ========== STRATEGY STAGE ==========
  perf_objective: {
    id: 'perf_objective',
    name: 'Objective',
    namePlural: 'Objectives',
    description: 'A strategic goal to be achieved in a defined timeframe',
    color: '#6366f1',
    icon: 'Flag',
    stage: 'strategy',
    fields: [
      { key: 'objective_type', label: 'Objective Type', type: 'select', options: PERF_OBJECTIVE_TYPE },
      { key: 'status', label: 'Status', type: 'select', options: PERF_OBJECTIVE_STATUS },
      { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Who is accountable?' },
      { key: 'timeframe', label: 'Timeframe', type: 'text', placeholder: 'e.g., Q1 2025, FY2025' },
      { key: 'why', label: 'Why This Matters', type: 'textarea', placeholder: 'Strategic rationale' },
      { key: 'parent_objective', label: 'Parent Objective', type: 'reference', refType: 'perf_objective' },
      { key: 'progress', label: 'Progress %', type: 'text', placeholder: '0-100' },
    ],
    guidance: {
      good: [
        'Ambitious but achievable',
        'Inspires and motivates',
        'Time-bound and specific',
        'Aligns with strategy',
      ],
      poor: [
        'Too vague or generic',
        'Not measurable',
        'Conflicting with other objectives',
        'Too many objectives (focus is key)',
      ],
      example: {
        good: 'Become the market leader in customer satisfaction in our category by end of Q4',
        poor: 'Be better at customer service',
      },
    },
  },

  perf_key_result: {
    id: 'perf_key_result',
    name: 'Key Result',
    namePlural: 'Key Results',
    description: 'A measurable outcome that indicates progress toward an objective',
    color: '#8b5cf6',
    icon: 'TrendingUp',
    stage: 'strategy',
    fields: [
      { key: 'objective_id', label: 'Objective', type: 'reference', refType: 'perf_objective' },
      { key: 'status', label: 'Status', type: 'select', options: PERF_OBJECTIVE_STATUS },
      { key: 'target_value', label: 'Target Value', type: 'text', placeholder: 'e.g., 50%, $1M, 100' },
      { key: 'current_value', label: 'Current Value', type: 'text', placeholder: 'Current state' },
      { key: 'baseline_value', label: 'Baseline Value', type: 'text', placeholder: 'Starting point' },
      { key: 'unit', label: 'Unit of Measure', type: 'text', placeholder: 'e.g., %, $, count' },
      { key: 'confidence', label: 'Confidence Level', type: 'select', options: [
        { id: 'high', label: 'High (>70%)' },
        { id: 'medium', label: 'Medium (30-70%)' },
        { id: 'low', label: 'Low (<30%)' },
      ]},
    ],
    guidance: {
      good: [
        'Quantifiable and specific',
        'Has clear target value',
        'Measurable within timeframe',
        'Directly supports objective',
      ],
      poor: [
        'No numeric target',
        'Cannot be measured',
        'Too easy or too hard',
        'Not connected to objective',
      ],
      example: {
        good: 'Increase NPS score from 32 to 50',
        poor: 'Improve customer happiness',
      },
    },
  },

  // ========== MEASUREMENT STAGE ==========
  perf_kpi: {
    id: 'perf_kpi',
    name: 'KPI',
    namePlural: 'KPIs',
    description: 'A key performance indicator that measures business success',
    color: '#22c55e',
    icon: 'Speed',
    stage: 'measurement',
    fields: [
      { key: 'category', label: 'Category', type: 'select', options: PERF_KPI_CATEGORY },
      { key: 'metric_type', label: 'Metric Type', type: 'select', options: PERF_METRIC_TYPE },
      { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Who is responsible?' },
      { key: 'formula', label: 'Formula/Calculation', type: 'textarea', placeholder: 'How is this calculated?' },
      { key: 'data_source', label: 'Data Source', type: 'text', placeholder: 'Where does data come from?' },
      { key: 'frequency', label: 'Measurement Frequency', type: 'select', options: PERF_FREQUENCY },
      { key: 'target', label: 'Target Value', type: 'text' },
      { key: 'current', label: 'Current Value', type: 'text' },
      { key: 'trend', label: 'Trend', type: 'select', options: PERF_TREND },
    ],
    guidance: {
      good: [
        'Directly tied to business outcomes',
        'Actionable - can influence it',
        'Clear formula and data source',
        'Reviewed regularly',
      ],
      poor: [
        'Vanity metrics',
        'No clear ownership',
        'Cannot influence',
        'Measured but not acted upon',
      ],
      example: {
        good: 'Customer Retention Rate = (Customers at end - New customers) / Customers at start x 100',
        poor: 'Number of meetings held',
      },
    },
  },

  perf_metric: {
    id: 'perf_metric',
    name: 'Metric',
    namePlural: 'Metrics',
    description: 'An operational metric that tracks specific activities or outcomes',
    color: '#3b82f6',
    icon: 'Analytics',
    stage: 'measurement',
    fields: [
      { key: 'metric_type', label: 'Metric Type', type: 'select', options: PERF_METRIC_TYPE },
      { key: 'parent_kpi', label: 'Parent KPI', type: 'reference', refType: 'perf_kpi' },
      { key: 'formula', label: 'Formula/Calculation', type: 'textarea' },
      { key: 'data_source', label: 'Data Source', type: 'text' },
      { key: 'frequency', label: 'Measurement Frequency', type: 'select', options: PERF_FREQUENCY },
      { key: 'unit', label: 'Unit', type: 'text', placeholder: 'e.g., count, %, hours' },
    ],
    guidance: {
      good: [
        'Supports a KPI',
        'Easy to collect',
        'Provides early signals',
        'Drives behavior',
      ],
      poor: [
        'Not linked to outcomes',
        'Hard to collect',
        'Gamed easily',
        'Too many metrics',
      ],
    },
  },

  perf_target: {
    id: 'perf_target',
    name: 'Target',
    namePlural: 'Targets',
    description: 'A specific target value for a KPI or metric',
    color: '#f59e0b',
    icon: 'TrackChanges',
    stage: 'measurement',
    fields: [
      { key: 'kpi_id', label: 'KPI', type: 'reference', refType: 'perf_kpi' },
      { key: 'target_value', label: 'Target Value', type: 'text' },
      { key: 'timeframe', label: 'Timeframe', type: 'text', placeholder: 'e.g., Q1 2025' },
      { key: 'stretch_target', label: 'Stretch Target', type: 'text', placeholder: 'Aspirational value' },
      { key: 'minimum_acceptable', label: 'Minimum Acceptable', type: 'text', placeholder: 'Floor value' },
      { key: 'rationale', label: 'Rationale', type: 'textarea', placeholder: 'Why this target?' },
    ],
    guidance: {
      good: [
        'Based on data and benchmarks',
        'Challenging but achievable',
        'Clear timeframe',
        'Aligns with strategy',
      ],
      poor: [
        'Arbitrary numbers',
        'Too easy or impossible',
        'No rationale',
        'No ownership',
      ],
    },
  },

  // ========== TRACKING STAGE ==========
  perf_measurement: {
    id: 'perf_measurement',
    name: 'Measurement',
    namePlural: 'Measurements',
    description: 'An actual measured value for a KPI or metric',
    color: '#10b981',
    icon: 'Assessment',
    stage: 'tracking',
    fields: [
      { key: 'kpi_id', label: 'KPI', type: 'reference', refType: 'perf_kpi' },
      { key: 'metric_id', label: 'Metric', type: 'reference', refType: 'perf_metric' },
      { key: 'value', label: 'Actual Value', type: 'text' },
      { key: 'period', label: 'Period', type: 'text', placeholder: 'e.g., Jan 2025, Week 3' },
      { key: 'measurement_date', label: 'Measurement Date', type: 'date' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    guidance: {
      good: [
        'Accurate and timely',
        'Consistent methodology',
        'Documented source',
        'Reviewed for quality',
      ],
      poor: [
        'Delayed or inaccurate',
        'Inconsistent collection',
        'No audit trail',
        'Cherry-picked data',
      ],
    },
  },

  perf_review: {
    id: 'perf_review',
    name: 'Performance Review',
    namePlural: 'Performance Reviews',
    description: 'A periodic review of performance against objectives',
    color: '#8b5cf6',
    icon: 'RateReview',
    stage: 'tracking',
    fields: [
      { key: 'review_type', label: 'Review Type', type: 'select', options: [
        { id: 'weekly', label: 'Weekly Check-in' },
        { id: 'monthly', label: 'Monthly Review' },
        { id: 'quarterly', label: 'Quarterly Business Review' },
        { id: 'annual', label: 'Annual Review' },
      ]},
      { key: 'period', label: 'Period Covered', type: 'text' },
      { key: 'review_date', label: 'Review Date', type: 'date' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'achievements', label: 'Key Achievements', type: 'textarea' },
      { key: 'challenges', label: 'Challenges', type: 'textarea' },
      { key: 'actions', label: 'Actions', type: 'textarea' },
    ],
    guidance: {
      good: [
        'Regular cadence',
        'Focuses on learnings',
        'Drives action',
        'Involves stakeholders',
      ],
      poor: [
        'Blame-focused',
        'No follow-up actions',
        'Skipped or rushed',
        'One-way reporting',
      ],
    },
  },

  // ========== OUTCOMES STAGE ==========
  perf_outcome: {
    id: 'perf_outcome',
    name: 'Outcome',
    namePlural: 'Outcomes',
    description: 'A documented business outcome from achieving objectives',
    color: '#f59e0b',
    icon: 'EmojiEvents',
    stage: 'outcomes',
    fields: [
      { key: 'objective_id', label: 'Related Objective', type: 'reference', refType: 'perf_objective' },
      { key: 'outcome_type', label: 'Outcome Type', type: 'select', options: [
        { id: 'achieved', label: 'Objective Achieved' },
        { id: 'exceeded', label: 'Exceeded Target' },
        { id: 'partial', label: 'Partially Achieved' },
        { id: 'not_achieved', label: 'Not Achieved' },
        { id: 'pivoted', label: 'Pivoted/Changed' },
      ]},
      { key: 'impact', label: 'Business Impact', type: 'textarea' },
      { key: 'evidence', label: 'Evidence', type: 'textarea', placeholder: 'What proves this outcome?' },
      { key: 'date_achieved', label: 'Date Achieved', type: 'date' },
    ],
    guidance: {
      good: [
        'Clear causal link to objective',
        'Quantified where possible',
        'Evidence-based',
        'Celebrated and shared',
      ],
      poor: [
        'Vague claims',
        'No evidence',
        'Not connected to objectives',
        'Forgotten once achieved',
      ],
    },
  },

  perf_insight: {
    id: 'perf_insight',
    name: 'Insight',
    namePlural: 'Insights',
    description: 'A learning or insight from performance data',
    color: '#ec4899',
    icon: 'Lightbulb',
    stage: 'outcomes',
    fields: [
      { key: 'insight_type', label: 'Insight Type', type: 'select', options: [
        { id: 'success', label: 'Success Factor' },
        { id: 'failure', label: 'Failure Learning' },
        { id: 'pattern', label: 'Pattern Observed' },
        { id: 'opportunity', label: 'Opportunity Identified' },
        { id: 'risk', label: 'Risk Identified' },
      ]},
      { key: 'source', label: 'Source', type: 'text', placeholder: 'Where did this insight come from?' },
      { key: 'implications', label: 'Implications', type: 'textarea', placeholder: 'What does this mean for us?' },
      { key: 'recommendations', label: 'Recommendations', type: 'textarea' },
    ],
    guidance: {
      good: [
        'Based on data',
        'Actionable',
        'Shared widely',
        'Leads to improvement',
      ],
      poor: [
        'Opinion without data',
        'Not shared',
        'No action taken',
        'Forgotten',
      ],
    },
  },
};

// ============================================================================
// DERIVED CONSTANTS
// ============================================================================

export const PERF_ALL_TYPES = Object.keys(PERF_TYPE_DEFS);

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

export const PERF_RELATIONSHIP_TYPES = {
  // Objective relationships
  cascades_to: {
    id: 'cascades_to',
    name: 'Cascades To',
    description: 'Objective cascades to child objective',
    fromTypes: ['perf_objective'],
    toTypes: ['perf_objective'],
  },
  measured_by: {
    id: 'measured_by',
    name: 'Measured By',
    description: 'Objective measured by key result',
    fromTypes: ['perf_objective'],
    toTypes: ['perf_key_result'],
  },
  tracks: {
    id: 'tracks',
    name: 'Tracks',
    description: 'KPI tracks objective or key result',
    fromTypes: ['perf_kpi'],
    toTypes: ['perf_objective', 'perf_key_result'],
  },
  contributes_to: {
    id: 'contributes_to',
    name: 'Contributes To',
    description: 'Metric contributes to KPI',
    fromTypes: ['perf_metric'],
    toTypes: ['perf_kpi'],
  },
  supports_capability: {
    id: 'supports_capability',
    name: 'Supports Capability',
    description: 'KPI measures capability performance',
    fromTypes: ['perf_kpi'],
    toTypes: ['cap_capability'],
  },
  measures_service: {
    id: 'measures_service',
    name: 'Measures Service',
    description: 'KPI measures service performance',
    fromTypes: ['perf_kpi'],
    toTypes: ['bsm_service'],
  },
};

// ============================================================================
// WORKSPACE MODULES (UI Organization)
// ============================================================================

export const PERF_WORKSPACE_MODULES = {
  strategy: {
    id: 'strategy',
    name: 'Objectives & OKRs',
    description: 'Define strategic objectives and key results',
    icon: 'Flag',
    types: ['perf_objective', 'perf_key_result'],
    primaryView: 'tree',
  },
  measurement: {
    id: 'measurement',
    name: 'KPIs & Metrics',
    description: 'Define and manage performance indicators',
    icon: 'Speed',
    types: ['perf_kpi', 'perf_metric', 'perf_target'],
    primaryView: 'list',
  },
  tracking: {
    id: 'tracking',
    name: 'Tracking',
    description: 'Record actuals and conduct reviews',
    icon: 'Assessment',
    types: ['perf_measurement', 'perf_review'],
    primaryView: 'list',
  },
  outcomes: {
    id: 'outcomes',
    name: 'Outcomes & Insights',
    description: 'Document outcomes and learnings',
    icon: 'EmojiEvents',
    types: ['perf_outcome', 'perf_insight'],
    primaryView: 'list',
  },
};

// ============================================================================
// GUIDANCE CONTENT
// ============================================================================

export const PERF_GUIDANCE = {
  getting_started: {
    title: 'Getting Started with Performance Management',
    content: `Start by defining your top-level strategic objectives. Then cascade these into measurable key results (OKRs). Finally, identify the KPIs that will track your progress.

**Tip**: Limit objectives to 3-5 at each level. Focus beats breadth.`,
  },
  okr_principles: {
    title: 'OKR Principles',
    content: `**Objectives** answer "Where do we want to go?"
- Inspirational and qualitative
- Time-bound (quarterly or annual)
- Ambitious but achievable

**Key Results** answer "How do we know we're getting there?"
- Quantitative and measurable
- 2-5 per objective
- Stretch goals (aim for 70% achievement)`,
  },
  kpi_design: {
    title: 'Designing Good KPIs',
    content: `Good KPIs follow SMART criteria:
- **Specific**: Clear what is measured
- **Measurable**: Quantifiable
- **Achievable**: Can influence it
- **Relevant**: Matters to business
- **Time-bound**: Measured regularly

Balance leading (predictive) and lagging (outcome) indicators.`,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get type definition for a Performance artefact type
 * @param {string} type - The artefact type id
 * @returns {Object|null} The type definition or null
 */
export function getTypeDefinition(type) {
  return PERF_TYPE_DEFS[type] || null;
}

/**
 * Check if a type is a valid Performance type
 * @param {string} type - The type to check
 * @returns {boolean}
 */
export function isPerfType(type) {
  if (!type || typeof type !== 'string') return false;
  return type.startsWith('perf_') && PERF_ALL_TYPES.includes(type);
}

/**
 * Get the color for a Performance type
 * @param {string} type - The artefact type id
 * @returns {string} The hex color
 */
export function getTypeColor(type) {
  return PERF_TYPE_DEFS[type]?.color || '#6b7280';
}

/**
 * Get the stage for a type
 * @param {string} type - The artefact type id
 * @returns {string|null} The stage id
 */
export function getStageForType(type) {
  return PERF_TYPE_DEFS[type]?.stage || null;
}

/**
 * Get all types for a stage
 * @param {string} stageId - The stage id
 * @returns {string[]} Array of type ids
 */
export function getTypesForStage(stageId) {
  return PERF_STAGES[stageId]?.types || [];
}

/**
 * Calculate objective progress from key results
 * @param {Object} objective - The objective artefact
 * @param {Array} keyResults - Related key results
 * @returns {Object} Progress information
 */
export function calculateObjectiveProgress(objective, keyResults = []) {
  if (!keyResults.length) {
    return { progress: 0, status: 'no_data', keyResultCount: 0 };
  }

  let totalProgress = 0;
  let count = 0;

  keyResults.forEach(kr => {
    const target = parseFloat(kr.custom_fields?.target_value) || 0;
    const current = parseFloat(kr.custom_fields?.current_value) || 0;
    const baseline = parseFloat(kr.custom_fields?.baseline_value) || 0;

    if (target !== baseline) {
      const progress = ((current - baseline) / (target - baseline)) * 100;
      totalProgress += Math.min(100, Math.max(0, progress));
      count++;
    }
  });

  const avgProgress = count > 0 ? Math.round(totalProgress / count) : 0;

  let status = 'on_track';
  if (avgProgress < 25) status = 'off_track';
  else if (avgProgress < 50) status = 'at_risk';
  else if (avgProgress >= 100) status = 'achieved';

  return {
    progress: avgProgress,
    status,
    keyResultCount: keyResults.length,
    achievedCount: keyResults.filter(kr =>
      parseFloat(kr.custom_fields?.current_value) >= parseFloat(kr.custom_fields?.target_value)
    ).length,
  };
}

/**
 * Calculate KPI health based on target and current value
 * @param {Object} kpi - The KPI artefact
 * @returns {Object} Health assessment
 */
export function calculateKpiHealth(kpi) {
  const target = parseFloat(kpi.custom_fields?.target) || 0;
  const current = parseFloat(kpi.custom_fields?.current) || 0;
  const trend = kpi.custom_fields?.trend || 'unknown';

  if (!target) {
    return { health: 'unknown', percentage: 0, trend };
  }

  const percentage = Math.round((current / target) * 100);

  let health = 'on_track';
  if (percentage < 70) health = 'off_track';
  else if (percentage < 90) health = 'at_risk';
  else if (percentage >= 100) health = 'achieved';

  return { health, percentage, trend, current, target };
}

// ============================================================================
// DEFAULT PROJECT CONFIGURATION
// ============================================================================

export const PERF_DEFAULT_PROJECT_CONFIG = {
  enabledModules: ['strategy', 'measurement', 'tracking', 'outcomes'],
  defaultView: 'tree',
  showGuidance: true,
};
