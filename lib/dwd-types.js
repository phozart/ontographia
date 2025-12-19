// lib/dwd-types.js
// Dynamic Work Design - Type definitions and constants
// Provides structure for work diagnosis, adjustment design, and learning capture

// ============================================================================
// STAGES - The DWD workflow stages
// ============================================================================

export const DWD_STAGES = {
  diagnose: {
    id: 'diagnose',
    name: 'Diagnose',
    description: 'Identify what is structurally causing work problems',
    color: '#f59e0b',
    types: ['dwd_case', 'dwd_work_item', 'dwd_actor', 'dwd_signal'],
  },
  design: {
    id: 'design',
    name: 'Design',
    description: 'Create small, reversible adjustments to work design',
    color: '#8b5cf6',
    types: ['dwd_adjustment', 'dwd_coordination_pattern'],
  },
  learn: {
    id: 'learn',
    name: 'Learn',
    description: 'Capture observations and build organizational knowledge',
    color: '#10b981',
    types: ['dwd_learning', 'dwd_outcome'],
  },
};

// ============================================================================
// STATUS OPTIONS
// ============================================================================

export const DWD_CASE_STATUS = [
  { value: 'draft', label: 'Draft', color: '#9ca3af' },
  { value: 'active', label: 'Active', color: '#3b82f6' },
  { value: 'observed', label: 'Observed', color: '#f59e0b' },
  { value: 'stabilised', label: 'Stabilised', color: '#10b981' },
  { value: 'archived', label: 'Archived', color: '#6b7280' },
];

export const DWD_ADJUSTMENT_STATUS = [
  { value: 'proposed', label: 'Proposed', color: '#9ca3af' },
  { value: 'trying', label: 'Trying', color: '#f59e0b' },
  { value: 'adopted', label: 'Adopted', color: '#10b981' },
  { value: 'reverted', label: 'Reverted', color: '#ef4444' },
];

export const DWD_WORK_ITEM_STATE = [
  { value: 'open', label: 'Open', color: '#3b82f6' },
  { value: 'in_review', label: 'In Review', color: '#f59e0b' },
  { value: 'waiting', label: 'Waiting', color: '#eab308' },
  { value: 'blocked', label: 'Blocked', color: '#ef4444' },
  { value: 'resolved', label: 'Resolved', color: '#10b981' },
  { value: 'reopened', label: 'Reopened', color: '#8b5cf6' },
];

// ============================================================================
// ENUM OPTIONS
// ============================================================================

export const DWD_VOLATILITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#10b981', description: 'Predictable, stable work' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', description: 'Some variability expected' },
  { value: 'high', label: 'High', color: '#ef4444', description: 'Unpredictable, rapidly changing' },
];

export const DWD_REVERSIBILITY_LEVELS = [
  { value: 'easy', label: 'Easy', color: '#10b981', description: 'Can undo quickly with minimal impact' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', description: 'Reversible with some effort' },
  { value: 'hard', label: 'Hard', color: '#ef4444', description: 'Difficult or costly to reverse' },
];

export const DWD_IMPACT_LEVELS = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

export const DWD_FREQUENCY_LEVELS = [
  { value: 'occasional', label: 'Occasional', color: '#10b981' },
  { value: 'frequent', label: 'Frequent', color: '#f59e0b' },
  { value: 'constant', label: 'Constant', color: '#ef4444' },
];

export const DWD_CONFIDENCE_LEVELS = [
  { value: 'low', label: 'Low', color: '#ef4444' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#10b981' },
];

export const DWD_AUTHORITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#ef4444', description: 'Limited decision rights' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', description: 'Some autonomy within bounds' },
  { value: 'high', label: 'High', color: '#10b981', description: 'Full authority to decide' },
];

// ============================================================================
// WORK ITEM TYPES
// ============================================================================

export const DWD_WORK_ITEM_TYPES = [
  { value: 'decision', label: 'Decision', icon: 'Gavel', description: 'A choice that needs to be made' },
  { value: 'risk', label: 'Risk', icon: 'Warning', description: 'An uncertainty that may affect outcomes' },
  { value: 'incident_cluster', label: 'Incident Cluster', icon: 'Report', description: 'A pattern of related incidents' },
  { value: 'customer_situation', label: 'Customer Situation', icon: 'Person', description: 'A customer-facing scenario' },
  { value: 'change_request', label: 'Change Request', icon: 'Edit', description: 'A request to modify something' },
  { value: 'other', label: 'Other', icon: 'More', description: 'Other work object type' },
];

// ============================================================================
// ACTOR TYPES
// ============================================================================

export const DWD_ACTOR_TYPES = [
  { value: 'person', label: 'Person', icon: 'Person' },
  { value: 'team', label: 'Team', icon: 'Group' },
  { value: 'system', label: 'System', icon: 'Computer' },
];

// ============================================================================
// CAPABILITY TYPES
// ============================================================================

export const DWD_CAPABILITY_TYPES = [
  { value: 'skill', label: 'Skill', description: 'Technical or domain expertise' },
  { value: 'decision_right', label: 'Decision Right', description: 'Authority to make decisions' },
  { value: 'access', label: 'Access', description: 'Access to systems or information' },
  { value: 'capacity', label: 'Capacity/Bandwidth', description: 'Available time and attention' },
];

// ============================================================================
// COORDINATION PATTERN TYPES
// ============================================================================

export const DWD_COORDINATION_PATTERN_TYPES = [
  {
    value: 'handover',
    label: 'Handover',
    icon: 'SwapHoriz',
    description: 'Work passed from one actor to another',
    risk: 'Information loss, delays, unclear ownership',
  },
  {
    value: 'collaboration',
    label: 'Collaboration',
    icon: 'Group',
    description: 'Actors work together simultaneously',
    risk: 'Coordination overhead, scheduling conflicts',
  },
  {
    value: 'escalation',
    label: 'Escalation',
    icon: 'ArrowUpward',
    description: 'Work elevated to higher authority',
    risk: 'Bottlenecks, decision delays',
  },
  {
    value: 'synchronisation',
    label: 'Synchronisation',
    icon: 'Sync',
    description: 'Actors align at specific points',
    risk: 'Waiting, scheduling complexity',
  },
  {
    value: 'async_update',
    label: 'Asynchronous Update',
    icon: 'Update',
    description: 'Information shared without real-time interaction',
    risk: 'Information staleness, missed updates',
  },
];

// ============================================================================
// SIGNAL TYPES (Tensions)
// ============================================================================

export const DWD_SIGNAL_TYPES = [
  {
    value: 'waiting',
    label: 'Waiting',
    icon: 'HourglassEmpty',
    color: '#eab308',
    description: 'Work blocked waiting for something',
    questions: ['What is being waited for?', 'Who controls the wait?'],
  },
  {
    value: 'rework',
    label: 'Rework',
    icon: 'Replay',
    color: '#ef4444',
    description: 'Work that needs to be done again',
    questions: ['What caused the rework?', 'How often does this happen?'],
  },
  {
    value: 'overload',
    label: 'Overload',
    icon: 'LocalFireDepartment',
    color: '#dc2626',
    description: 'Too much work for available capacity',
    questions: ['Who is overloaded?', 'What creates the overload?'],
  },
  {
    value: 'conflicting_priorities',
    label: 'Conflicting Priorities',
    icon: 'Compare',
    color: '#8b5cf6',
    description: 'Multiple demands competing for attention',
    questions: ['What is conflicting?', 'Who decides priority?'],
  },
  {
    value: 'decision_latency',
    label: 'Decision Latency',
    icon: 'Schedule',
    color: '#f59e0b',
    description: 'Decisions taking too long',
    questions: ['What decision is delayed?', 'Who needs to decide?'],
  },
  {
    value: 'quality_drift',
    label: 'Quality Drift',
    icon: 'TrendingDown',
    color: '#6366f1',
    description: 'Standards slipping over time',
    questions: ['What quality is affected?', 'When did it start?'],
  },
  {
    value: 'other',
    label: 'Other',
    icon: 'MoreHoriz',
    color: '#6b7280',
    description: 'Other type of tension or stress',
    questions: ['Describe the signal'],
  },
];

// ============================================================================
// ARTEFACT TYPE DEFINITIONS
// ============================================================================

export const DWD_TYPE_DEFS = {
  dwd_case: {
    id: 'dwd_case',
    name: 'Work Situation',
    namePlural: 'Work Situations',
    description: 'A concrete work situation under analysis',
    color: '#6366f1',
    icon: 'Folder',
    stage: 'diagnose',
    fields: [
      { key: 'summary', label: 'Summary', type: 'textarea', required: true, placeholder: 'Describe the work situation in plain language...' },
      { key: 'context', label: 'Context', type: 'textarea', placeholder: 'Where/when does this happen? What is the scope?' },
      { key: 'case_status', label: 'Status', type: 'select', options: DWD_CASE_STATUS, default: 'draft' },
      { key: 'tags', label: 'Tags', type: 'tags', placeholder: 'Add tags...' },
    ],
    guidance: {
      good: ['Describes situation and impact clearly', 'Focuses on what happens, not who to blame', 'Specific enough to investigate'],
      poor: ['Jumps to solution', 'Blames individuals', 'Too vague to act on'],
      example: {
        good: 'Customer refund requests take 5+ days because multiple handoffs and unclear ownership',
        poor: 'Refunds are slow. We need more staff.',
      },
    },
  },

  dwd_outcome: {
    id: 'dwd_outcome',
    name: 'Work Outcome',
    namePlural: 'Work Outcomes',
    description: 'The intended effect for a case or work item',
    color: '#22c55e',
    icon: 'Flag',
    stage: 'learn',
    fields: [
      { key: 'statement', label: 'Outcome Statement', type: 'textarea', required: true, placeholder: 'What changes if this is successful?' },
      { key: 'success_signals', label: 'Success Signals', type: 'tags', placeholder: 'What will we see if it works?' },
      { key: 'stress_signals', label: 'Stress Signals', type: 'tags', placeholder: 'What will we see if problems continue?' },
      { key: 'time_horizon', label: 'Time Horizon', type: 'text', placeholder: 'e.g., 2 weeks, 1 quarter' },
    ],
    guidance: {
      good: ['Observable and measurable', 'Focused on effect, not activity', 'Has clear signals'],
      poor: ['Vague aspirations', 'Activity-focused', 'No way to know if achieved'],
      example: {
        good: 'Refund decisions made within 24 hours without escalation',
        poor: 'Improve customer satisfaction',
      },
    },
  },

  dwd_work_item: {
    id: 'dwd_work_item',
    name: 'Work Item',
    namePlural: 'Work Items',
    description: 'An object of attention that people coordinate around (NOT a task)',
    color: '#3b82f6',
    icon: 'Assignment',
    stage: 'diagnose',
    fields: [
      { key: 'item_type', label: 'Type', type: 'select', options: DWD_WORK_ITEM_TYPES, required: true },
      { key: 'item_state', label: 'State', type: 'select', options: DWD_WORK_ITEM_STATE, default: 'open' },
      { key: 'volatility', label: 'Volatility', type: 'select', options: DWD_VOLATILITY_LEVELS, default: 'medium' },
      { key: 'reversibility', label: 'Reversibility', type: 'select', options: DWD_REVERSIBILITY_LEVELS, default: 'medium' },
      { key: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional context...' },
    ],
    guidance: {
      good: ['Represents something people coordinate around', 'Is an object, not an action', 'Has clear boundaries'],
      poor: ['Is actually a task ("send email")', 'Too granular', 'Describes process, not object'],
      example: {
        good: 'Outbound handover decision',
        poor: 'Finish email to customer',
      },
    },
  },

  dwd_actor: {
    id: 'dwd_actor',
    name: 'Actor',
    namePlural: 'Actors',
    description: 'A person, team, or system involved in the work',
    color: '#8b5cf6',
    icon: 'Person',
    stage: 'diagnose',
    fields: [
      { key: 'actor_type', label: 'Actor Type', type: 'select', options: DWD_ACTOR_TYPES, required: true },
      { key: 'authority_level', label: 'Authority Level', type: 'select', options: DWD_AUTHORITY_LEVELS, default: 'medium' },
      { key: 'constraints', label: 'Constraints', type: 'textarea', placeholder: 'What limits this actor?' },
    ],
    guidance: {
      good: ['Clearly identified', 'Authority level reflects reality', 'Constraints are noted'],
      poor: ['Too generic ("management")', 'Authority assumed, not verified', 'Ignores real constraints'],
    },
  },

  dwd_capability: {
    id: 'dwd_capability',
    name: 'Capability',
    namePlural: 'Capabilities',
    description: 'A capability that an actor has or needs',
    color: '#a855f7',
    icon: 'Star',
    stage: 'diagnose',
    fields: [
      { key: 'capability_type', label: 'Capability Type', type: 'select', options: DWD_CAPABILITY_TYPES, required: true },
      { key: 'level', label: 'Level', type: 'select', options: DWD_IMPACT_LEVELS, default: 'medium' },
    ],
  },

  dwd_coordination_pattern: {
    id: 'dwd_coordination_pattern',
    name: 'Coordination Pattern',
    namePlural: 'Coordination Patterns',
    description: 'How work moves between actors or around work items',
    color: '#f59e0b',
    icon: 'SwapHoriz',
    stage: 'design',
    fields: [
      { key: 'pattern_type', label: 'Pattern Type', type: 'select', options: DWD_COORDINATION_PATTERN_TYPES, required: true },
      { key: 'friction_level', label: 'Friction Level', type: 'select', options: DWD_IMPACT_LEVELS, default: 'medium' },
      { key: 'delay_risk', label: 'Delay Risk', type: 'select', options: DWD_IMPACT_LEVELS, default: 'medium' },
    ],
    guidance: {
      note: 'Consider whether the pattern matches the volatility of the work. High-volatility work often needs collaboration, not handover.',
    },
  },

  dwd_signal: {
    id: 'dwd_signal',
    name: 'Signal',
    namePlural: 'Signals',
    description: 'Evidence of stress or tension in the work',
    color: '#ef4444',
    icon: 'Warning',
    stage: 'diagnose',
    fields: [
      { key: 'signal_type', label: 'Signal Type', type: 'select', options: DWD_SIGNAL_TYPES, required: true },
      { key: 'frequency', label: 'Frequency', type: 'select', options: DWD_FREQUENCY_LEVELS, default: 'frequent' },
      { key: 'impact', label: 'Impact', type: 'select', options: DWD_IMPACT_LEVELS, default: 'medium' },
    ],
    guidance: {
      good: ['Observable evidence', 'Specific and concrete', 'Describes what happens'],
      poor: ['Blame-oriented', 'Vague feelings', 'Assumes cause'],
      example: {
        good: 'Waiting: handover confirmation often missing',
        poor: 'People are lazy',
      },
    },
  },

  dwd_adjustment: {
    id: 'dwd_adjustment',
    name: 'Adjustment',
    namePlural: 'Adjustments',
    description: 'A deliberate change to work design',
    color: '#10b981',
    icon: 'Tune',
    stage: 'design',
    fields: [
      { key: 'expected_effect', label: 'Expected Effect', type: 'textarea', required: true, placeholder: 'What do you expect this adjustment to achieve?' },
      { key: 'adjustment_reversibility', label: 'Reversibility', type: 'select', options: DWD_REVERSIBILITY_LEVELS, required: true },
      { key: 'adjustment_status', label: 'Status', type: 'select', options: DWD_ADJUSTMENT_STATUS, default: 'proposed' },
      { key: 'trigger_signal_ids', label: 'Trigger Signals', type: 'multiselect', placeholder: 'Which signals trigger this?' },
    ],
    guidance: {
      note: 'Prefer small, reversible adjustments. If an adjustment is hard to reverse, consider a smaller experiment first.',
      good: ['Small scope', 'Clear trigger', 'Reversible', 'Expected effect stated'],
      poor: ['Broad reorganization', 'No clear trigger', 'Hard to undo', 'Vague goals'],
    },
  },

  dwd_learning: {
    id: 'dwd_learning',
    name: 'Learning',
    namePlural: 'Learnings',
    description: 'Evidence or observation from an adjustment',
    color: '#06b6d4',
    icon: 'Lightbulb',
    stage: 'learn',
    fields: [
      { key: 'observation', label: 'Observation', type: 'textarea', required: true, placeholder: 'What did you observe?' },
      { key: 'outcome', label: 'Outcome', type: 'textarea', required: true, placeholder: 'What happened?' },
      { key: 'surprise', label: 'Surprise', type: 'textarea', placeholder: 'Was there anything unexpected?' },
      { key: 'implication', label: 'Implication', type: 'textarea', placeholder: 'What do we change next?' },
      { key: 'confidence', label: 'Confidence', type: 'select', options: DWD_CONFIDENCE_LEVELS, default: 'medium' },
    ],
    guidance: {
      note: 'Quick notes are fine. This should feel like a 2-minute capture, not a report.',
    },
  },
};

// ============================================================================
// ALL TYPES LIST
// ============================================================================

export const DWD_ALL_TYPES = Object.keys(DWD_TYPE_DEFS);

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

export const DWD_RELATIONSHIP_TYPES = {
  // Case relationships
  case_has_outcome: {
    id: 'case_has_outcome',
    label: 'Has Outcome',
    from: ['dwd_case'],
    to: ['dwd_outcome'],
  },
  case_involves_work_item: {
    id: 'case_involves_work_item',
    label: 'Involves',
    from: ['dwd_case'],
    to: ['dwd_work_item'],
  },
  case_involves_actor: {
    id: 'case_involves_actor',
    label: 'Involves',
    from: ['dwd_case'],
    to: ['dwd_actor'],
  },
  case_has_signal: {
    id: 'case_has_signal',
    label: 'Has Signal',
    from: ['dwd_case'],
    to: ['dwd_signal'],
  },
  case_has_adjustment: {
    id: 'case_has_adjustment',
    label: 'Has Adjustment',
    from: ['dwd_case'],
    to: ['dwd_adjustment'],
  },

  // Actor relationships
  actor_has_capability: {
    id: 'actor_has_capability',
    label: 'Has Capability',
    from: ['dwd_actor'],
    to: ['dwd_capability'],
  },
  actor_coordinates_with: {
    id: 'actor_coordinates_with',
    label: 'Coordinates With',
    from: ['dwd_actor'],
    to: ['dwd_actor'],
    via: ['dwd_coordination_pattern'],
  },

  // Signal relationships
  signal_affects_work_item: {
    id: 'signal_affects_work_item',
    label: 'Affects',
    from: ['dwd_signal'],
    to: ['dwd_work_item'],
  },
  signal_affects_actor: {
    id: 'signal_affects_actor',
    label: 'Affects',
    from: ['dwd_signal'],
    to: ['dwd_actor'],
  },

  // Work item relationships
  work_item_coordinated_by: {
    id: 'work_item_coordinated_by',
    label: 'Coordinated By',
    from: ['dwd_work_item'],
    to: ['dwd_coordination_pattern'],
  },

  // Adjustment relationships
  adjustment_targets: {
    id: 'adjustment_targets',
    label: 'Targets',
    from: ['dwd_adjustment'],
    to: ['dwd_work_item', 'dwd_actor', 'dwd_coordination_pattern'],
  },
  adjustment_produced_learning: {
    id: 'adjustment_produced_learning',
    label: 'Produced',
    from: ['dwd_adjustment'],
    to: ['dwd_learning'],
  },

  // Cross-studio relationship types
  // These allow DWD artefacts to link to other studios (EA, Requirements, Portfolio, Knowledge)
  relates_to: {
    id: 'relates_to',
    label: 'Relates To',
    description: 'General relationship to external artefact',
    from: DWD_ALL_TYPES,
    to: ['*'], // Any artefact type
    crossStudio: true,
  },
  implements: {
    id: 'implements',
    label: 'Implements',
    description: 'DWD artefact implements this external artefact',
    from: ['dwd_adjustment', 'dwd_coordination_pattern'],
    to: ['*'],
    crossStudio: true,
  },
  affects: {
    id: 'affects',
    label: 'Affects',
    description: 'DWD artefact affects this external artefact',
    from: ['dwd_signal', 'dwd_adjustment', 'dwd_work_item'],
    to: ['*'],
    crossStudio: true,
  },
  derived_from: {
    id: 'derived_from',
    label: 'Derived From',
    description: 'DWD artefact is derived from this external artefact',
    from: DWD_ALL_TYPES,
    to: ['*'],
    crossStudio: true,
  },
  supports: {
    id: 'supports',
    label: 'Supports',
    description: 'DWD artefact supports this external artefact',
    from: ['dwd_adjustment', 'dwd_learning', 'dwd_case'],
    to: ['*'],
    crossStudio: true,
  },
};

// ============================================================================
// WORKSPACE MODULES
// ============================================================================

export const DWD_WORKSPACE_MODULES = {
  diagnosis: {
    id: 'diagnosis',
    name: 'Diagnosis',
    description: 'Understand work structure problems',
    icon: 'Search',
    color: '#f59e0b',
    types: ['dwd_case', 'dwd_work_item', 'dwd_actor', 'dwd_signal'],
    enabled: true,
  },
  design: {
    id: 'design',
    name: 'Design',
    description: 'Create adjustments and patterns',
    icon: 'Build',
    color: '#8b5cf6',
    types: ['dwd_adjustment', 'dwd_coordination_pattern'],
    enabled: true,
  },
  learning: {
    id: 'learning',
    name: 'Learning',
    description: 'Capture outcomes and build knowledge',
    icon: 'School',
    color: '#10b981',
    types: ['dwd_learning', 'dwd_outcome'],
    enabled: true,
  },
};

// ============================================================================
// OBSERVATION HEURISTICS
// Each observation is linked to one of the 5 MIT DWD Principles
// ============================================================================

export const DWD_OBSERVATION_RULES = [
  // === EXISTING RULES (now with principle links) ===
  {
    id: 'high_volatility_handover',
    condition: (artefacts) => {
      const workItems = artefacts.filter(a => a.artefact_type === 'dwd_work_item' && a.custom_fields?.volatility === 'high');
      const patterns = artefacts.filter(a => a.artefact_type === 'dwd_coordination_pattern' && a.custom_fields?.pattern_type === 'handover');
      return workItems.length > 0 && patterns.length > 0;
    },
    message: 'High-volatility work is being coordinated primarily via handover. Consider collaboration instead.',
    severity: 'warning',
    suggestedAction: 'Create adjustment to change coordination pattern',
    principle: 'connect_human_chain', // Principle 3
    principleNote: 'Handover loses context; high-volatility work needs richer coordination.',
  },
  {
    id: 'multiple_actors_no_authority',
    condition: (artefacts, relationships) => {
      const actors = artefacts.filter(a => a.artefact_type === 'dwd_actor');
      const lowAuthority = actors.filter(a => a.custom_fields?.authority_level === 'low');
      return actors.length > 2 && lowAuthority.length > actors.length / 2;
    },
    message: 'Multiple actors involved with unclear authority distribution.',
    severity: 'warning',
    suggestedAction: 'Clarify decision rights',
    principle: 'connect_human_chain', // Principle 3
    principleNote: 'When authority is unclear, the human chain breaks down.',
  },
  {
    id: 'waiting_signals_cluster',
    condition: (artefacts) => {
      const waitingSignals = artefacts.filter(a =>
        a.artefact_type === 'dwd_signal' &&
        a.custom_fields?.signal_type === 'waiting' &&
        a.custom_fields?.frequency !== 'occasional'
      );
      return waitingSignals.length >= 2;
    },
    message: 'Multiple waiting signals detected. Work may be blocked by dependencies.',
    severity: 'info',
    suggestedAction: 'Map coordination patterns to find bottlenecks',
    principle: 'regulate_for_flow', // Principle 4
    principleNote: 'Waiting indicates flow is blocked somewhere in the system.',
  },
  {
    id: 'no_signals',
    condition: (artefacts) => {
      const signals = artefacts.filter(a => a.artefact_type === 'dwd_signal');
      const cases = artefacts.filter(a => a.artefact_type === 'dwd_case' && a.custom_fields?.case_status !== 'draft');
      return cases.length > 0 && signals.length === 0;
    },
    message: 'No signals captured. Add at least one signal to clarify what is currently failing.',
    severity: 'info',
    suggestedAction: 'Add signal',
    principle: 'solve_right_problem', // Principle 1
    principleNote: 'Signals help define the problem without assuming causes.',
  },
  {
    id: 'adjustment_needs_learning',
    condition: (artefacts) => {
      const adjustments = artefacts.filter(a =>
        a.artefact_type === 'dwd_adjustment' &&
        ['adopted', 'reverted'].includes(a.custom_fields?.adjustment_status)
      );
      const learnings = artefacts.filter(a => a.artefact_type === 'dwd_learning');
      return adjustments.length > learnings.length;
    },
    message: 'You have completed adjustments without captured learnings.',
    severity: 'reminder',
    suggestedAction: 'Capture learning',
    principle: 'structure_for_discovery', // Principle 2
    principleNote: 'Capture learnings so the organization improves over time.',
  },

  // === NEW OBSERVATION RULES (12 additional) ===

  // --- Fit Mismatches ---
  {
    id: 'high_volatility_low_authority',
    condition: (artefacts, relationships) => {
      const highVolWorkItems = artefacts.filter(a =>
        a.artefact_type === 'dwd_work_item' && a.custom_fields?.volatility === 'high'
      );
      const lowAuthActors = artefacts.filter(a =>
        a.artefact_type === 'dwd_actor' && a.custom_fields?.authority_level === 'low'
      );
      // Check if low authority actors are handling high volatility work
      return highVolWorkItems.length > 0 && lowAuthActors.length > 0 &&
        lowAuthActors.length >= highVolWorkItems.length;
    },
    message: 'High-volatility work is being handled by actors with low authority. This creates escalation bottlenecks.',
    severity: 'warning',
    suggestedAction: 'Push authority closer to the work',
    principle: 'connect_human_chain', // Principle 3
    principleNote: 'Authority should match work volatility for smooth information flow.',
  },
  {
    id: 'low_volatility_collaboration',
    condition: (artefacts) => {
      const lowVolWorkItems = artefacts.filter(a =>
        a.artefact_type === 'dwd_work_item' && a.custom_fields?.volatility === 'low'
      );
      const collaborationPatterns = artefacts.filter(a =>
        a.artefact_type === 'dwd_coordination_pattern' && a.custom_fields?.pattern_type === 'collaboration'
      );
      return lowVolWorkItems.length > 0 && collaborationPatterns.length > 0;
    },
    message: 'Low-volatility work is using collaboration patterns. This may be over-coordination.',
    severity: 'info',
    suggestedAction: 'Consider simpler coordination for routine work',
    principle: 'regulate_for_flow', // Principle 4
    principleNote: 'Match coordination overhead to work complexity.',
  },
  {
    id: 'many_actors_few_patterns',
    condition: (artefacts) => {
      const actors = artefacts.filter(a => a.artefact_type === 'dwd_actor');
      const patterns = artefacts.filter(a => a.artefact_type === 'dwd_coordination_pattern');
      return actors.length >= 3 && patterns.length === 0;
    },
    message: 'Multiple actors involved but no coordination patterns defined. How does work flow between them?',
    severity: 'warning',
    suggestedAction: 'Add coordination pattern',
    principle: 'connect_human_chain', // Principle 3
    principleNote: 'Explicit coordination patterns make the human chain visible.',
  },

  // --- Signal Patterns ---
  {
    id: 'rework_quality_cluster',
    condition: (artefacts) => {
      const reworkSignals = artefacts.filter(a =>
        a.artefact_type === 'dwd_signal' && a.custom_fields?.signal_type === 'rework'
      );
      const qualitySignals = artefacts.filter(a =>
        a.artefact_type === 'dwd_signal' && a.custom_fields?.signal_type === 'quality_drift'
      );
      return reworkSignals.length > 0 && qualitySignals.length > 0;
    },
    message: 'Rework and quality drift signals appear together. This often indicates structural problems, not people problems.',
    severity: 'warning',
    suggestedAction: 'Investigate root cause',
    principle: 'solve_right_problem', // Principle 1
    principleNote: 'Look for structural causes, not individual blame.',
  },
  {
    id: 'overload_single_actor',
    condition: (artefacts, relationships) => {
      const actors = artefacts.filter(a => a.artefact_type === 'dwd_actor');
      const overloadSignals = artefacts.filter(a =>
        a.artefact_type === 'dwd_signal' && a.custom_fields?.signal_type === 'overload'
      );
      // Check if multiple overload signals mention the same actor
      return overloadSignals.length >= 2;
    },
    message: 'Multiple overload signals detected. Check if one actor is a bottleneck.',
    severity: 'warning',
    suggestedAction: 'Map actor workload',
    principle: 'regulate_for_flow', // Principle 4
    principleNote: 'Overload indicates intake exceeds capacity somewhere.',
  },
  {
    id: 'conflicting_priorities_frequent',
    condition: (artefacts) => {
      const conflictSignals = artefacts.filter(a =>
        a.artefact_type === 'dwd_signal' &&
        a.custom_fields?.signal_type === 'conflicting_priorities' &&
        a.custom_fields?.frequency !== 'occasional'
      );
      return conflictSignals.length >= 1;
    },
    message: 'Frequent conflicting priorities signal unclear decision rights or intake discipline.',
    severity: 'warning',
    suggestedAction: 'Clarify priority ownership',
    principle: 'regulate_for_flow', // Principle 4
    principleNote: 'Flow requires clear, stable priorities.',
  },
  {
    id: 'escalation_cascade',
    condition: (artefacts) => {
      const escalationPatterns = artefacts.filter(a =>
        a.artefact_type === 'dwd_coordination_pattern' && a.custom_fields?.pattern_type === 'escalation'
      );
      const decisionLatencySignals = artefacts.filter(a =>
        a.artefact_type === 'dwd_signal' && a.custom_fields?.signal_type === 'decision_latency'
      );
      return escalationPatterns.length >= 2 || (escalationPatterns.length >= 1 && decisionLatencySignals.length >= 1);
    },
    message: 'Multiple escalation patterns or escalation with decision latency suggests authority is too centralized.',
    severity: 'warning',
    suggestedAction: 'Push authority down',
    principle: 'connect_human_chain', // Principle 3
    principleNote: 'Escalation adds links to the chain and slows decisions.',
  },

  // --- Progress Indicators ---
  {
    id: 'signals_without_adjustments',
    condition: (artefacts) => {
      const signals = artefacts.filter(a => a.artefact_type === 'dwd_signal');
      const adjustments = artefacts.filter(a => a.artefact_type === 'dwd_adjustment');
      const cases = artefacts.filter(a =>
        a.artefact_type === 'dwd_case' &&
        ['active', 'observed'].includes(a.custom_fields?.case_status)
      );
      return cases.length > 0 && signals.length >= 2 && adjustments.length === 0;
    },
    message: 'Signals identified but no adjustments proposed yet. What could you try?',
    severity: 'reminder',
    suggestedAction: 'Propose an adjustment',
    principle: 'structure_for_discovery', // Principle 2
    principleNote: 'Discovery requires experimenting, not just observing.',
  },
  {
    id: 'stale_case',
    condition: (artefacts) => {
      const now = new Date();
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const staleCases = artefacts.filter(a => {
        if (a.artefact_type !== 'dwd_case') return false;
        if (!['active', 'observed'].includes(a.custom_fields?.case_status)) return false;
        const updated = new Date(a.updated_at);
        return updated < twoWeeksAgo;
      });
      return staleCases.length > 0;
    },
    message: 'A case has been active for 2+ weeks without progress. Is it still relevant?',
    severity: 'info',
    suggestedAction: 'Review case status',
    principle: 'structure_for_discovery', // Principle 2
    principleNote: 'Stale cases indicate blocked discovery.',
  },
  {
    id: 'trying_too_long',
    condition: (artefacts) => {
      const now = new Date();
      const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
      const longTryingAdjustments = artefacts.filter(a => {
        if (a.artefact_type !== 'dwd_adjustment') return false;
        if (a.custom_fields?.adjustment_status !== 'trying') return false;
        const updated = new Date(a.updated_at);
        return updated < fourWeeksAgo;
      });
      return longTryingAdjustments.length > 0;
    },
    message: 'An adjustment has been "trying" for 4+ weeks. Time to evaluate: adopt or revert?',
    severity: 'reminder',
    suggestedAction: 'Evaluate adjustment',
    principle: 'structure_for_discovery', // Principle 2
    principleNote: 'Experiments need time limits to force learning.',
  },
  {
    id: 'reverted_pattern',
    condition: (artefacts) => {
      const revertedAdjustments = artefacts.filter(a =>
        a.artefact_type === 'dwd_adjustment' && a.custom_fields?.adjustment_status === 'reverted'
      );
      return revertedAdjustments.length >= 2;
    },
    message: 'Multiple adjustments have been reverted. Consider if a different approach is needed.',
    severity: 'info',
    suggestedAction: 'Review what reverted adjustments have in common',
    principle: 'solve_right_problem', // Principle 1
    principleNote: 'Repeated reversions may mean the wrong problem is being addressed.',
  },
  {
    id: 'learning_pattern',
    condition: (artefacts) => {
      const learnings = artefacts.filter(a => a.artefact_type === 'dwd_learning');
      // Simple heuristic: if there are 3+ learnings, check if any pattern
      return learnings.length >= 3;
    },
    message: 'Multiple learnings captured. Consider if common themes indicate systemic issues.',
    severity: 'info',
    suggestedAction: 'Look for patterns across learnings',
    principle: 'structure_for_discovery', // Principle 2
    principleNote: 'Patterns in learnings reveal structural insights.',
  },
];

// ============================================================================
// GUIDANCE CONTENT
// ============================================================================

export const DWD_GUIDANCE = {
  getting_started: {
    title: 'Getting Started',
    steps: [
      'Name the situation (title + 1-2 sentence summary)',
      'Add 1-3 signals (choose type, impact)',
      'Add work items (objects, not tasks)',
      'Add actors (who is involved)',
      'Optional: set outcome (what success changes)',
    ],
  },
  diagnosis_tips: [
    'Focus on structure, not people',
    'Look for patterns, not incidents',
    'Ask "what makes this hard?" not "who made this mistake?"',
  ],
  adjustment_principles: [
    'Small over big',
    'Reversible over permanent',
    'Clear trigger over vague aspiration',
    'Expected effect stated upfront',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTypeDefinition(type) {
  return DWD_TYPE_DEFS[type] || null;
}

export function isDWDType(type) {
  return type && type.startsWith('dwd_') && DWD_TYPE_DEFS.hasOwnProperty(type);
}

export function getTypeColor(type) {
  return DWD_TYPE_DEFS[type]?.color || '#6b7280';
}

export function getStageForType(type) {
  const typeDef = DWD_TYPE_DEFS[type];
  return typeDef?.stage || null;
}

export function getTypesForStage(stageId) {
  return DWD_STAGES[stageId]?.types || [];
}

export function validateRelationship(fromType, toType, relType) {
  const rel = DWD_RELATIONSHIP_TYPES[relType];
  if (!rel) return false;
  return rel.from.includes(fromType) && rel.to.includes(toType);
}

export function getCaseCompleteness(caseArtefact, relatedArtefacts) {
  const checks = {
    hasSignals: relatedArtefacts.some(a => a.artefact_type === 'dwd_signal'),
    hasWorkItems: relatedArtefacts.some(a => a.artefact_type === 'dwd_work_item'),
    hasActors: relatedArtefacts.some(a => a.artefact_type === 'dwd_actor'),
    hasOutcome: relatedArtefacts.some(a => a.artefact_type === 'dwd_outcome'),
    hasSummary: !!caseArtefact.custom_fields?.summary,
  };

  const score = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;

  return {
    checks,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    suggestions: [
      !checks.hasSignals && 'Add at least one signal to clarify what is failing',
      !checks.hasWorkItems && 'Add work items (objects people coordinate around)',
      !checks.hasActors && 'Add actors involved in this situation',
      !checks.hasOutcome && 'Define what success looks like',
      !checks.hasSummary && 'Add a summary describing the situation',
    ].filter(Boolean),
  };
}

export function generateObservations(artefacts, relationships = []) {
  return DWD_OBSERVATION_RULES
    .filter(rule => rule.condition(artefacts, relationships))
    .map(rule => ({
      id: rule.id,
      message: rule.message,
      severity: rule.severity,
      suggestedAction: rule.suggestedAction,
      principle: rule.principle || null,
      principleNote: rule.principleNote || null,
    }));
}

// ============================================================================
// DEFAULT PROJECT CONFIG
// ============================================================================

export const DWD_DEFAULT_PROJECT_CONFIG = {
  enabledModules: ['diagnosis', 'design', 'learning'],
  customSignalTypes: [],
  customWorkItemTypes: [],
  showGuidance: true,
};

// ============================================================================
// FIT ANALYSIS RULES
// ============================================================================

// Work-Coordination Fit Matrix
// Determines if coordination pattern matches work volatility
export const FIT_WORK_COORDINATION = {
  high: {
    handover: { fit: 'mismatch', message: 'High-volatility work coordinated via handover risks information loss and delays', suggestion: 'Consider collaboration instead of handover' },
    collaboration: { fit: 'good', message: 'Collaboration fits high-volatility work well' },
    escalation: { fit: 'warning', message: 'Escalation may create bottlenecks for high-volatility work', suggestion: 'Push authority closer to the work' },
    synchronisation: { fit: 'ok', message: 'Synchronisation can work but may add overhead' },
    async_update: { fit: 'mismatch', message: 'Async updates may not keep pace with high-volatility changes', suggestion: 'Add real-time coordination points' },
  },
  medium: {
    handover: { fit: 'ok', message: 'Handover can work for medium-volatility if handoffs are clean' },
    collaboration: { fit: 'ok', message: 'Collaboration may be more than needed but is not harmful' },
    escalation: { fit: 'ok', message: 'Escalation acceptable for exceptional cases' },
    synchronisation: { fit: 'good', message: 'Good fit for medium volatility' },
    async_update: { fit: 'good', message: 'Async updates fit medium volatility well' },
  },
  low: {
    handover: { fit: 'good', message: 'Handover is efficient for predictable, low-volatility work' },
    collaboration: { fit: 'warning', message: 'Collaboration may be over-engineered for simple work', suggestion: 'Consider simpler handover' },
    escalation: { fit: 'warning', message: 'Escalation adds unnecessary overhead for routine work', suggestion: 'Delegate decision rights' },
    synchronisation: { fit: 'ok', message: 'Synchronisation works but may not be needed' },
    async_update: { fit: 'good', message: 'Async updates are ideal for stable, predictable work' },
  },
};

// Actor-Authority Fit Matrix
// Determines if authority matches the volatility of work they handle
export const FIT_ACTOR_AUTHORITY = {
  high_volatility: {
    low: { fit: 'mismatch', message: 'Low authority handling high-volatility work causes escalation delays', suggestion: 'Increase decision rights at point of work' },
    medium: { fit: 'ok', message: 'May need occasional escalation for edge cases' },
    high: { fit: 'good', message: 'Authority matches volatility - can decide without delay' },
  },
  medium_volatility: {
    low: { fit: 'warning', message: 'May cause frequent escalations', suggestion: 'Consider expanding decision bounds' },
    medium: { fit: 'good', message: 'Authority appropriately matched to work' },
    high: { fit: 'ok', message: 'High authority available but may be underutilized' },
  },
  low_volatility: {
    low: { fit: 'good', message: 'Low authority sufficient for routine work' },
    medium: { fit: 'ok', message: 'Authority exceeds needs but not problematic' },
    high: { fit: 'warning', message: 'High authority on routine work may indicate wasted capacity', suggestion: 'Consider delegating to free up capacity' },
  },
};

// Fit assessment function
export function assessWorkCoordinationFit(volatility, patternType) {
  const volMatrix = FIT_WORK_COORDINATION[volatility];
  if (!volMatrix) return { fit: 'unknown', message: 'Unable to assess' };
  return volMatrix[patternType] || { fit: 'unknown', message: 'Pattern type not recognized' };
}

export function assessActorAuthorityFit(workVolatility, authorityLevel) {
  const volKey = `${workVolatility}_volatility`;
  const volMatrix = FIT_ACTOR_AUTHORITY[volKey];
  if (!volMatrix) return { fit: 'unknown', message: 'Unable to assess' };
  return volMatrix[authorityLevel] || { fit: 'unknown', message: 'Authority level not recognized' };
}

// Comprehensive fit analysis function
export function analyzeFit(artefacts, relationships = []) {
  const results = {
    overall: { score: 0, total: 0, issues: [] },
    workItems: [],
    actors: [],
    suggestions: [],
  };

  const workItems = artefacts.filter(a => a.artefact_type === 'dwd_work_item');
  const actors = artefacts.filter(a => a.artefact_type === 'dwd_actor');
  const patterns = artefacts.filter(a => a.artefact_type === 'dwd_coordination_pattern');

  // Analyze work item - coordination pattern fit
  workItems.forEach(wi => {
    const volatility = wi.custom_fields?.volatility || 'medium';
    const wiPatterns = patterns; // In real implementation, filter by relationships

    wiPatterns.forEach(pattern => {
      const patternType = pattern.custom_fields?.pattern_type || 'handover';
      const assessment = assessWorkCoordinationFit(volatility, patternType);

      results.workItems.push({
        workItem: wi,
        pattern,
        volatility,
        patternType,
        ...assessment,
      });

      results.overall.total++;
      if (assessment.fit === 'good') {
        results.overall.score++;
      } else if (assessment.fit === 'ok') {
        results.overall.score += 0.5;
      } else if (assessment.fit === 'mismatch') {
        results.overall.issues.push({
          type: 'work_coordination',
          workItem: wi.name,
          pattern: pattern.name,
          message: assessment.message,
          suggestion: assessment.suggestion,
        });
      } else if (assessment.fit === 'warning') {
        results.overall.issues.push({
          type: 'work_coordination_warning',
          workItem: wi.name,
          pattern: pattern.name,
          message: assessment.message,
          suggestion: assessment.suggestion,
        });
      }
    });
  });

  // Analyze actor - authority fit
  actors.forEach(actor => {
    const authority = actor.custom_fields?.authority_level || 'medium';

    // Get work items this actor handles (simplified - in real impl, use relationships)
    const handledWorkItems = workItems;

    // Find the highest volatility work this actor handles
    const volatilities = handledWorkItems.map(wi => wi.custom_fields?.volatility || 'medium');
    const hasHighVol = volatilities.includes('high');
    const hasMedVol = volatilities.includes('medium');
    const dominantVolatility = hasHighVol ? 'high' : hasMedVol ? 'medium' : 'low';

    const assessment = assessActorAuthorityFit(dominantVolatility, authority);

    results.actors.push({
      actor,
      authority,
      workVolatility: dominantVolatility,
      workItemCount: handledWorkItems.length,
      ...assessment,
    });

    results.overall.total++;
    if (assessment.fit === 'good') {
      results.overall.score++;
    } else if (assessment.fit === 'ok') {
      results.overall.score += 0.5;
    } else if (assessment.fit === 'mismatch') {
      results.overall.issues.push({
        type: 'actor_authority',
        actor: actor.name,
        message: assessment.message,
        suggestion: assessment.suggestion,
      });
    } else if (assessment.fit === 'warning') {
      results.overall.issues.push({
        type: 'actor_authority_warning',
        actor: actor.name,
        message: assessment.message,
        suggestion: assessment.suggestion,
      });
    }
  });

  // Calculate percentage
  results.overall.percentage = results.overall.total > 0
    ? Math.round((results.overall.score / results.overall.total) * 100)
    : 100;

  // Generate top suggestions
  results.suggestions = results.overall.issues
    .filter(i => i.suggestion)
    .slice(0, 5)
    .map(i => ({
      ...i,
      priority: i.type.includes('mismatch') || !i.type.includes('warning') ? 'high' : 'medium',
    }));

  return results;
}
